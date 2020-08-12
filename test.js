const bokstavting = require("./bokstavting");
const brikker = require("./brikker");
const pos = bokstavting.lagPosisjon;
const brettStr = brett => brett.ruter.map(a => a.map(b => b === bokstavting.tom ? "\xa0" : b.bokstav).join("")).join("\n");

const brett = bokstavting.lagBrett("EREASDFG".split("").map(s => brikker.get(s)));
const brett2 = bokstavting.flytt(brett, pos(0,0), pos(0,1));
const brett3 = bokstavting.flytt(brett2, pos(2,2), pos(1,0));
const brett4 = bokstavting.flytt(brett3, pos(3,3), pos(3,4));
console.log(brettStr(brett4));

const ordliste = new Set();
ordliste.add("ER");
console.log(bokstavting.beregn(brett4, ordliste));
