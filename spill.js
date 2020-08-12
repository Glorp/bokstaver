const bokstavting = require("./bokstavting");

const uuidv4 = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

var spillere = new Map();

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

const eksisterendeSpiller = (id, navn, brett) =>
  spillere.has(id)
  ? spillere.get(id)
  : nySpiller(navn, brett);

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

const nyRunde = brett => {
  var nyeSpillere = new Map();
  for (const id of spillere.keys()) {
    const spiller = spillere.get(id);
    nyeSpillere.set(id, {
      navn: spiller.navn,
      id: spiller.id,
      inaktiv: spiller.inaktiv + 1,
      brett: brett
    });
  }
  spillere = nyeSpillere;
};

const brett = id =>
  spillere.has(id)
  ? spillere.get(id).brett
  : false;

const spillerListe = () => {
  const res = [];
  for (const id of spillere.keys()) {
    res.push(spillere.get(id));
  }
  return res;
};

module.exports = {
  nySpiller: nySpiller,
  eksisterendeSpiller: eksisterendeSpiller,
  flytt: flytt,
  nyRunde: nyRunde,
  brett: brett,
  spillere: spillerListe,
  nyttNavn: nyttNavn
};
