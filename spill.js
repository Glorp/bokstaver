const bokstavting = require("./bokstavting");
const brikker = require("./brikker");

const alleSpillene = new Map();

const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

const lagSpill = (io, rom, ordliste) => {
  var spillere = new Map();
  var resultater = false;
  var startBrett = false;
  var admin = false;

  var konfigurasjon = {
    rundeTid: 60,
    pauseTid: "venter"
  };

  var holderpa = false;
  var tid = konfigurasjon.pauseTid;

  const konfigurer = (id, nyKonfigurasjon) => {
    if (id !== admin) return;
    const num = (x, gammel) => {
      if (typeof 1 !== "number") return gammel;
      const num = Math.floor(x);
      return num > 4 ? num : gammel;
    };
    konfigurasjon.rundeTid = num(nyKonfigurasjon.rundeTid, konfigurasjon.rundeTid);

    konfigurasjon.pauseTid =
      nyKonfigurasjon.pauseTid === "venter"
      ? "venter"
      : num(nyKonfigurasjon.pauseTid, konfigurasjon.pauseTid);
  };

  const nySpiller = (navn, brett) => {
    var id = uuidv4();
    while (spillere.has(id)) {
      id = uuidv4();
    }
    const spiller = {
      navn: navn,
      id: id,
      brett: brett,
      poeng: 0
    };
    if (admin === false) {
      admin = spiller.id;
      spiller.admin = true;
    }
    spillere.set(spiller.id, spiller);
    return spiller;
  };

  const flytt = (id, a, b) => {
    if (!holderpa) {
      return false;
    }
    const spiller = spillere.get(id);
    if (spiller === undefined) {
      return false;
    }
    const nyttBrett = bokstavting.flytt(spiller.brett, a, b);
    const nySpiller = {
      navn: spiller.navn,
      id: id,
      brett: nyttBrett,
      poeng: spiller.poeng
    };
    spillere.set(spiller.id, nySpiller);
    return nyttBrett;
  };

  const hentSpiller = (id, navn) =>
    (id !== false && spillere.has(id))
    ? spillere.get(id)
    : nySpiller(navn, startBrett);

  const nyttNavn = (id, navn) => {
    if (!spillere.has(id)) {
      return false;
    }
    const spiller = spillere.get(id);
    const nySpiller = {
      navn: navn,
      id: spiller.id,
      brett: spiller.brett,
      poeng: spiller.poeng
    };
    spillere.set(id, nySpiller);
    return nySpiller;
  }

  const brett = id =>
    spillere.has(id)
    ? spillere.get(id).brett
    : false;

  const nyRunde = () => {
    startBrett = bokstavting.lagBrett(brikker.kast());
    var nyeSpillere = new Map();
    for (const id of spillere.keys()) {
      const spiller = spillere.get(id);
      nyeSpillere.set(id, {
        navn: spiller.navn,
        id: spiller.id,
        brett: startBrett,
        poeng: spiller.poeng
      });
    }
    spillere = nyeSpillere;

    holderpa = true;
    tid = konfigurasjon.rundeTid + 1;

    io.to(rom).emit("brett", startBrett);
    tidengar();
  };

  const tidengar = () => {
    tid = tid - 1;
    io.to(rom).emit("tid", tid);
    if (tid === 0) {
      ferdig();
    }
  };

  const tikk = () => {
    if (io.sockets.adapter.rooms[rom] === undefined) {
      alleSpillene.delete(rom);
      return;
    }

    if (tid !== "venter") {
      if (holderpa) {
        tidengar();
      } else {
        venter();
      }
    }
    setTimeout(tikk, 1000);
  }

  const startNesteRunde = id => {
    if (holderpa || admin !== id) {
      return;
    }
    if (tid === "venter" || tid > 5) {
      tid = 5;
    }
  };

  const venter = () => {
    tid = tid - 1;
    io.to(rom).emit("pausetid", tid);
    if (tid === 0) {
      nyRunde();
    }
  };

  const ferdig = () => {
    holderpa = false;
    const res = [];
    const nyeSpillere = new Map();
    for (const spiller of spillere.values()) {
      const spillerRes = bokstavting.resultat(spiller, ordliste);

      nyeSpillere.set(spiller.id, {
        navn: spiller.navn,
        id: spiller.id,
        brett: spiller.brett,
        poeng: spillerRes.totalt
      });
      res.push(spillerRes);
    }
    res.sort((a, b) => {
      if (a.grupper.length === 0 || b.grupper.length === 0) {
        if (a.grupper.length === 0) {
          return 1;
        } else if (b.grupper.length === 0 !== false) {
          return -1;
        } else {
          return 0;
        }
      }
      return b.grupper[0].poeng - a.grupper[0].poeng;
    });

    spillere = nyeSpillere;
    resultater = res;

    io.to(rom).emit("resultater", resultater);
    tid = konfigurasjon.pauseTid;
  };


  const res = {
    rom: rom,
    nySpiller: nySpiller,
    hentSpiller: hentSpiller,
    startNesteRunde: startNesteRunde,
    flytt: flytt,
    nyttNavn: nyttNavn,
    startBrett: () => startBrett,
    resultater: () => resultater,
    konfigurer: konfigurer
  };

  //io.to(rom).emit("resultater", [1,2,3,4,5,6,7,8,9,0,1,2,3,4,4,5,6,7].map(x => nySpiller("mlep", bokstavting.lagBrett(brikker.kast()))).map(spiller => bokstavting.resultat(spiller, ordliste)));

  alleSpillene.set(rom, res);
  tikk();
  return res;
}

module.exports = (io, rom, ordliste) => {
  const eksisterende = alleSpillene.get(rom);
  return eksisterende === undefined
    ? lagSpill(io, rom, ordliste)
    : eksisterende;
};
