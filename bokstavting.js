
const tom = "tom";

const lagBrett = brikker => {
  const storelse = brikker.length;
  const ruter = [];
  for (var y = 0; y < storelse; y++) {
    const rad = [];
    for (var x = 0; x < storelse; x++) {
      rad.push(x === y ? brikker[x] : tom);
    }
    ruter.push(rad);
  }
  return {
    ruter: ruter,
    storelse: storelse
  };
};

const lagPosisjon = (x, y) => ({ x: x, y: y });

const brettInnenfor = (brett, pos) => pos.x >= 0 && pos.x < brett.storelse && pos.y >= 0 && pos.y < brett.storelse;

const brettLes = (brett, pos) => brett.ruter[pos.y][pos.x];
const brettHarBrikke = (brett, pos) => brettInnenfor(brett, pos) && (brettLes(brett, pos) !== tom);
const sammePosisjon = (a, b) => a.x === b.x && a.y === b.y;

const flytt = (brett, a, b) => {
  if (!brettInnenfor(brett, a) || !brettInnenfor(brett, b)) {
    return false;
  }
  const storelse = brett.storelse;
  const ruter = [];
  for (var y = 0; y < storelse; y++) {
    if (y !== a.y && y !== b.y) {
      ruter.push(brett.ruter[y]);
    } else {
      const rad = [];
      for (var x = 0; x < storelse; x++) {
        const pos = lagPosisjon(x, y);
        const brikke =
          sammePosisjon(pos, a)
          ? brettLes(brett, b)
          : sammePosisjon(pos, b)
          ? brettLes(brett, a)
          : brettLes(brett, pos);
        rad.push(brikke);
      }
      ruter.push(rad);
    }
  }
  return {
    ruter: ruter,
    storelse: storelse
  };
};

const finnGrupper = brett => {
  var grupper = [];
  for (var y = 0; y < brett.storelse; y++) {
    for (var x = 0; x < brett.storelse; x++) {
      const pos = lagPosisjon(x, y);
      if (brettHarBrikke(brett, pos)) {
        const nyeGrupper = [];
        var gruppe = [pos];
        grupper.forEach(gr => {
          if (naboGruppe(pos, gr)) {
            gruppe = gruppe.concat(gr);
          } else {
            nyeGrupper.push(gr);
          }
        });
        nyeGrupper.push(gruppe);
        grupper = nyeGrupper;
      }
    }
  }
  return grupper.filter(g => g.length > 1);
};

const naboer = (a, b) => {
  if (a.x === b.x) {
    return Math.abs(a.y - b.y) === 1;
  } else if (a.y === b.y) {
    return Math.abs(a.x - b.x) === 1;
  } else return false;
};

const naboGruppe = (pos, gruppe) => gruppe.find(a => naboer(pos, a)) !== undefined;

const loddrett = Symbol("loddrett");
const vannrett = Symbol("vannrett");
const bortover = p => lagPosisjon(p.x + 1, p.y);
const nedover = p => lagPosisjon(p.x, p.y + 1);
const vannretning = {
  retning: "vannrett",
  nestelinje: nedover,
  nesterute: bortover
};
const loddretning = {
  retning: "loddrett",
  nestelinje: bortover,
  nesterute: nedover
};

const rekkerIRetning = (brett, retning) => {
  const rekker = [];
  const ret = retning === loddrett ? loddretning : vannretning;
  for (var startPos = lagPosisjon(0, 0); brettInnenfor(brett, startPos); startPos = ret.nestelinje(startPos)) {
    var nyRekke = false;
    for (var pos = startPos; brettInnenfor(brett, pos); pos = ret.nesterute(pos)) {
      if (brettHarBrikke(brett, pos)) {
        if (nyRekke === false) {
          nyRekke = {
            start: pos,
            retning: ret.retning,
            brikker: [brettLes(brett, pos)]
          };
        } else {
          nyRekke.brikker.push(brettLes(brett, pos));
        }
      } else {
        if (nyRekke !== false) {
          if (nyRekke.brikker.length > 1) {
            rekker.push(nyRekke);
          }
          nyRekke = false;
        }
      }
    }
    if ((nyRekke !== false) && nyRekke.brikker.length > 1) {
      rekke.push(nyRekke);
    }
  }
  return rekker;
};

const alleRekker = brett => [... rekkerIRetning(brett, vannrett), ... rekkerIRetning(brett, loddrett)];

const brettGruppeFiltrer = (brett, gruppe) => {
  const storelse = brett.storelse;
  const ruter = [];
  for (var y = 0; y < storelse; y++) {
    const rad = [];
    for (var x = 0; x < storelse; x++) {
      const pos = lagPosisjon(x, y);
      const brikke =
        gruppe.find(p => sammePosisjon(p, pos)) === undefined
        ? tom
        :  brettLes(brett, pos);
      rad.push(brikke);
    }
    ruter.push(rad);
  }

  return {
    ruter: ruter,
    storelse: storelse
  };
};

const sjekkOrdliste = (rekke, ordliste) => {
  const ord = rekke.brikker.map(b => b.bokstav).join("");
  const lovlig = ordliste.has(ord.toLowerCase());
  const poeng =
    lovlig
    ? rekke.brikker.reduce((res, b) => res + b.poeng, 0)
    : 0;
  return {
    lovlig: lovlig,
    tekst: ord,
    poeng: poeng,
    rekke: rekke
  };
};

const poengForFlereOrd = ord => {
  var sum = 0;
  for (const o of ord) {
    if (!o.lovlig) {
      return {
        lovlig: false,
        poeng: 0,
        ord: ord
      };
    }
    sum = sum + o.poeng;
  }
  return {
    lovlig: true,
    poeng: sum,
    ord: ord
  };
};

const beregn = (brett, ordliste) =>
  finnGrupper(brett)
    .map(g => brettGruppeFiltrer(brett, g))
    .map(b => alleRekker(b))
    .map(rekker => rekker.map(rekke => sjekkOrdliste(rekke, ordliste)))
    .map(poengForFlereOrd);

const resultat = (spiller, ordliste) => {
  var res = false;
  for (const x of beregn(spiller.brett, ordliste)) {
    if (x.lovlig && (res === false || res.poeng < x.poeng)) {
      res = x;
    }
  }
  return {
    navn: spiller.navn,
    brett: spiller.brett,
    best: res
  };
};

module.exports = {
  lagBrett: lagBrett,
  flytt: flytt,
  lagPosisjon: lagPosisjon,
  beregn: beregn,
  resultat: resultat
};
