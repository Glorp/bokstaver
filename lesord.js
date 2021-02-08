const fs = require("fs")
  , readline = require("readline");

const les = (path, res, cont) => {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
  });
  const ordliste = new Set();

  readInterface.on("line", ord => {
      ordliste.add(ord);
  });
  readInterface.on("close", () => {
    res[path] = ordliste;
    cont();
  });
}

const leslister = (paths, res, cont) => {
  const halp = i => {
    if (i < paths.length) {
      les(paths[i], res, () => halp(i + 1));
    } else {
      cont();
    }
  };
  halp(0);
};

module.exports = leslister;
