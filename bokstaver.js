
const nope = Symbol("nope");
const joker = Symbol("joker");
const tom = Symbol("tom");
const brikke = (s, n) => ({ bokstav: s, poeng: n});

const lagBrett = brikker => {
  const storelse = brikker.length;
  const brett = [];
  for (var y = 0; y < storelse; y++) {
    const rad = [];
    for (var x = 0; x < storelse; x++) {
      rad.push(x === y ? brikker[x] : tom);
    }
    brett.push(rad);
  }
  return {
    brett: brett,
    storelse: storelse
  };
};



const lagPosisjon = (x, y) => ({ x: x, y: y });
const posisjonTekst = pos => "(" + pos.x + ", " + pos.y + ")";

const brettInnenfor = (brett, pos) => pos.x >= 0 && pos.x < brett.storelse && pos.y >= 0 && pos.y < brett.storelse;

const brettLes = (brett, pos) => brett.brett[pos.y][pos.x];
const brettHarBrikke = (brett, pos) => brettInnenfor(brett, pos) && (brettLes(brett, pos) !== tom);
const sammePosisjon = (a, b) => a.x === b.x && a.y === b.y;

const flytt = (gammeltBrett, a, b) => {
  if (!brettInnenfor(gammeltBrett, a) || !brettInnenfor(gammeltBrett, b)) {
    return nope;
  }
  const storelse = gammeltBrett.storelse;
  const brett = [];
  for (var y = 0; y < storelse; y++) {
    if (y !== a.y && y !== b.y) {
      brett.push(gammeltBrett.brett[y]);
    } else {
      const rad = [];
      for (var x = 0; x < storelse; x++) {
        const pos = lagPosisjon(x, y);
        const brikke =
          sammePosisjon(pos, a)
          ? brettLes(gammeltBrett, b)
          : sammePosisjon(pos, b)
          ? brettLes(gammeltBrett, a)
          : brettLes(gammeltBrett, pos);
        rad.push(brikke);
      }
      brett.push(rad);
    }
  }
  return {
    brett: brett,
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
  return grupper;
};

const naboer = (a, b) => {
  if (a.x === b.x) {
    return Math.abs(a.y - b.y) === 1;
  } else if (a.y === b.y) {
    return Math.abs(a.x - b.x) === 1;
  } else return false;
};

const naboGruppe = (pos, gruppe) => gruppe.find(a => naboer(pos, a)) !== undefined;

const ordVannrett = brett => {
  const ord = [];
  for (var y = 0; y < brett.storelse; y++) {
    var nyttOrd = nope;
    for (var x = 0; x < brett.storelse; x++) {
      const pos = lagPosisjon(x, y);
      if (brettHarBrikke(brett, pos)) {
        if (nyttOrd === nope) {
          nyttOrd = {
            start: pos,
            retning: "vannrett",
            ord: [brettLes(brett, pos)]
          };
        } else {
          nyttOrd.ord.push(brettLes(brett, pos));
        }
      } else {
        if (nyttOrd !== nope) {
          if (nyttOrd.ord.length > 1) {
            ord.push(nyttOrd);
          }
          nyttOrd = nope;
        }
      }
    }
    if (nyttOrd !== nope && nyttOrd.ord.length > 1) {
      ord.push(nyttOrd);
    }
  }
  return ord;
};

const ordLoddrett = brett => {
  const ord = [];
  for (var x = 0; x < brett.storelse; x++) {
    var nyttOrd = nope;
    for (var y = 0; y < brett.storelse; y++) {
      const pos = lagPosisjon(x, y);
      if (brettHarBrikke(brett, pos)) {
        if (nyttOrd === nope) {
          nyttOrd = {
            start: pos,
            retning: "loddrett",
            ord: [brettLes(brett, pos)]
          };
        } else {
          nyttOrd.ord.push(brettLes(brett, pos));
        }
      } else {
        if (nyttOrd !== nope) {
          if (nyttOrd.ord.length > 1) {
            ord.push(nyttOrd);
          }
          nyttOrd = nope;
        }
      }
    }
    if ((nyttOrd !== nope) && nyttOrd.ord.length > 1) {
      ord.push(nyttOrd);
    }
  }
  return ord;
};

const alleOrd = brett => [... ordVannrett(brett), ... ordLoddrett(brett)];

module.exports = {
  lagBrett: lagBrett,
  flytt: flytt,
  brettLes: brettLes,
  posisjonTekst: posisjonTekst,
  finnGrupper: finnGrupper,
  lagPosisjon: lagPosisjon,
  alleOrd: alleOrd
};
