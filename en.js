const lagBrikker = (n, s, v) => Array(n).fill({ bokstav: s, poeng: v});
const brikker =
[
  lagBrikker(9, "A", 1),
  lagBrikker(2, "B", 3),
  lagBrikker(2, "C", 2),
  lagBrikker(4, "D", 2),
  lagBrikker(12, "E", 1),
  lagBrikker(2, "F", 4),
  lagBrikker(3, "G", 2),
  lagBrikker(2, "H", 4),
  lagBrikker(9, "I", 1),
  lagBrikker(1, "J", 8),
  lagBrikker(1, "K", 5),
  lagBrikker(4, "L", 1),
  lagBrikker(2, "M", 3),
  lagBrikker(6, "N", 1),
  lagBrikker(8, "O", 1),
  lagBrikker(2, "P", 3),
  lagBrikker(1, "Q", 10),
  lagBrikker(6, "R", 1),
  lagBrikker(4, "S", 1),
  lagBrikker(6, "T", 1),
  lagBrikker(4, "U", 1),
  lagBrikker(2, "V", 4),
  lagBrikker(2, "W", 4),
  lagBrikker(1, "X", 8),
  lagBrikker(2, "Y", 4),
  lagBrikker(1, "Z", 10),
].flat();

const trekk = () => {
  const b = [...brikker];
  const res = [];
  for (var i = 0; i < 13; i++) {
    const pick = Math.floor(Math.random() * b.length);
    res.push(b[pick]);
    b.slice(pick, 1);
  }
  return res;
}

module.exports = trekk;
