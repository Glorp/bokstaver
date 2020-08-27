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

  var tid;
  var holderpa;
  var resultater = false;
  var startBrett;

  var konfigurasjon = {
    rundeTid: 60,
    pauseTid: 30
  }

  const konfigurer = nyKonfigurasjon => {
    const num = (x, gammel) => {
      if (typeof 1 !== "number") return gammel;
      const num = Math.floor(x);
      return num > 4 ? num : gammel;
    };
    konfigurasjon.rundeTid = num(nyKonfigurasjon.rundeTid, konfigurasjon.rundeTid);

    konfigurasjon.pauseTid = num(nyKonfigurasjon.pauseTid, konfigurasjon.pauseTid);
  };

  const nySpiller = (navn, brett) => {
    var id = uuidv4();
    while (spillere.has(id)) {
      id = uuidv4();
    }
    const spiller = {
      navn: navn,
      id: id,
      inaktiv: 0,
      brett: brett
    };
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
      inaktiv: 0,
      brett: nyttBrett
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
    const spiller = spillere.get(id)
    const nySpiller = {
      navn: navn,
      id: spiller.id,
      inaktiv: 0,
      brett: spiller.brett
    };
    spillere.set(id, nySpiller);
    return nySpiller;
  }

  const brett = id =>
    spillere.has(id)
    ? spillere.get(id).brett
    : false;

  const spillerListe = () => {
    const res = [];
    for (const id of spillere.keys()) {
      const spiller = spillere.get(id);
      if (spiller.inaktiv < 2) {
        res.push(spiller);
      }
    }
    return res;
  };

  const nyRunde = () => {
    if (io.sockets.adapter.rooms[rom] === undefined) {
      alleSpillene.delete(rom);
      return;
    }
    startBrett = bokstavting.lagBrett(brikker.kast());
    var nyeSpillere = new Map();
    for (const id of spillere.keys()) {
      const spiller = spillere.get(id);
      nyeSpillere.set(id, {
        navn: spiller.navn,
        id: spiller.id,
        inaktiv: spiller.inaktiv >= 2 ? 2 : spiller.inaktiv + 1,
        brett: startBrett
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
    } else {
      setTimeout(tidengar, 1000);
    }
  };
  const venter = () => {
    tid = tid - 1;
    io.to(rom).emit("pausetid", tid);
    if (tid === 0) {
      nyRunde();
    } else {
      setTimeout(venter, 1000);
    }
  }

  const ferdig = () => {
    holderpa = false;
    resultater =
      spillerListe()
        .map(spiller => bokstavting.resultat(spiller, ordliste));
    resultater.sort((a, b) => {
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
    })
    io.to(rom).emit("resultater", resultater);
    tid = konfigurasjon.pauseTid + 1;
    venter();
  };


  const res = {
    rom: rom,
    nySpiller: nySpiller,
    hentSpiller: hentSpiller,
    flytt: flytt,
    nyttNavn: nyttNavn,
    startBrett: () => startBrett,
    resultater: () => resultater,
    konfigurer: konfigurer
  };

  //io.to(rom).emit("resultater", [1,2,3,4,5,6,7,8,9,0,1,2,3,4,4,5,6,7].map(x => nySpiller("mlep", bokstavting.lagBrett(brikker.kast()))).map(spiller => bokstavting.resultat(spiller, ordliste)));

  alleSpillene.set(rom, res);
  nyRunde();
  return res;
}

module.exports = (io, rom, ordliste) => {
  const eksisterende = alleSpillene.get(rom);
  return eksisterende === undefined
    ? lagSpill(io, rom, ordliste)
    : eksisterende;
};
