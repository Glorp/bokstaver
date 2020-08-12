const lagBrikke = (s, n) => ({ bokstav: s, poeng: n});
const brikker = new Map();

[
  lagBrikke("A", 1),
  lagBrikke("B", 3),
  lagBrikke("C", 2),
  lagBrikke("D", 1),
  lagBrikke("E", 1),
  lagBrikke("F", 3),
  lagBrikke("G", 2),
  lagBrikke("H", 2),
  lagBrikke("I", 1),
  lagBrikke("J", 5),
  lagBrikke("K", 3),
  lagBrikke("L", 2),
  lagBrikke("M", 3),
  lagBrikke("N", 1),
  lagBrikke("O", 2),
  lagBrikke("P", 4),
  lagBrikke("Q", 7),
  lagBrikke("R", 1),
  lagBrikke("S", 1),
  lagBrikke("T", 2),
  lagBrikke("U", 2),
  lagBrikke("V", 4),
  lagBrikke("W", 3),
  lagBrikke("X", 6),
  lagBrikke("Y", 7),
  lagBrikke("Z", 5),
  lagBrikke("\u00C6", 3),
  lagBrikke("\u00D8", 5),
  lagBrikke("\u00C5", 2),
].forEach(b => brikker.set(b.bokstav, b));

const joker = "E";
const terninger = [
  ["E", "D", "U", "T", "L", "I"],
  ["S", "G", "N", "P", "L", "E"],
  ["E", "H", "C", "R", "U", "O"],
  ["M", "G", "N", "E", "S", "J"],
  ["I", "D", "M", "S", "\u00C6", "E"],
  ["A", "B", "U", "H", "\u00D8", "Y"],
  ["L", "R", "E", "N", "F", joker],
  ["R", "W", "D", "A", "T", "I"],
  ["\u00C5", "H", "I", "S", "A", "Q"],
  ["H", "A", "R", "F", "M", "I"],
  ["D", "N", "X", "G", "E", "K"],
  ["B", "V", "Z", "E", "N", "S"],
  ["A", "N", "K", "R", "O", "D"]
].map(a => a.map(s => brikker.get(s)));

const kast = () => terninger.map(a => a[Math.floor(Math.random() * a.length)]);

module.exports = {
  brikker: brikker,
  kast: kast
};
