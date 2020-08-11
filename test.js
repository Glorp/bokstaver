const bokstaver = require('./bokstaver');
const pos = bokstaver.lagPosisjon;

const brett = bokstaver.lagBrett("ernsasdf");
console.log(brett);
const brett2 = bokstaver.flytt(brett, pos(0,0), pos(0,1));
const brett3 = bokstaver.flytt(brett2, pos(2,2), pos(1,0));
console.log(brett3);

console.log(bokstaver.finnGrupper(brett3));
console.log(bokstaver.alleOrd(brett3));
