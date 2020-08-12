const lagBrikke = (s, n) => ({ bokstav: s, poeng: n});
const brikker = new Map();

[
  lagBrikke("A", 1),
  lagBrikke("B", 1),
  lagBrikke("C", 1),
  lagBrikke("D", 1),
  lagBrikke("E", 1),
  lagBrikke("F", 1),
  lagBrikke("G", 1),
  lagBrikke("H", 1),
  lagBrikke("I", 1),
  lagBrikke("J", 1),
  lagBrikke("K", 1),
  lagBrikke("L", 1),
  lagBrikke("M", 1),
  lagBrikke("N", 1),
  lagBrikke("O", 1),
  lagBrikke("P", 1),
  lagBrikke("Q", 1),
  lagBrikke("R", 1),
  lagBrikke("S", 1),
  lagBrikke("T", 1),
  lagBrikke("U", 1),
  lagBrikke("V", 1),
  lagBrikke("W", 1),
  lagBrikke("X", 1),
  lagBrikke("Y", 1),
  lagBrikke("Z", 1),
  lagBrikke("\u00C6", 1),
  lagBrikke("\u00D8", 1),
  lagBrikke("\u00C5", 1),
].forEach(b => brikker.set(b.bokstav, b));

module.exports = brikker;
