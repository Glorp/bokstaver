const bokstaver = require('./bokstaver');
const pos = bokstaver.lagPosisjon;
const brettStr = brett => brett.brett.map(a => a.map(c => c === bokstaver.tom ? " " : c).join(""));


const brett = bokstaver.lagBrett("ERNASDFG");
console.log(brettStr(brett));
const brett2 = bokstaver.flytt(brett, pos(0,0), pos(0,1));
const brett3 = bokstaver.flytt(brett2, pos(2,2), pos(1,0));
console.log(brettStr(brett3));

const grupper = bokstaver.finnGrupper(brett3);
console.log(grupper);
console.log(brettStr(bokstaver.brettGruppeFiltrer(brett3, grupper[0])));
console.log(bokstaver.alleOrd(brett3));
