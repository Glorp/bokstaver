const bokstaver = require('./bokstaver');

const brett = bokstaver.lagBrett("abcde");
console.log(brett);
const brett2 = bokstaver.flytt(brett, bokstaver.lagPosisjon(0,0), bokstaver.lagPosisjon(0,1));
const brett3 = bokstaver.flytt(brett2, bokstaver.lagPosisjon(2,2), bokstaver.lagPosisjon(2,1));
console.log(brett3);

console.log(bokstaver.finnGrupper(brett3));
console.log(bokstaver.alleOrd(brett3));
