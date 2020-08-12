var express = require("express")
  , app = express()
  , http = require("http")
  , server = http.createServer(app)
  , io = require("socket.io").listen(server)
  , path = require("path")
  , readline = require("readline")
  , fs = require("fs")
  , bokstavting = require("./bokstavting")
  , brikker = require("./brikker")
  , spill = require("./spill");

// Start server
const start = () => {
  server.listen(3000);

  // Set up 'public' folder
  app.use(express.static(path.join(__dirname, "public")));

  // Point / to index.html (could just put index.html in public but leaving for reference)
  //app.use('/', (req, res, next) => {
  //  res.sendFile("public/html/index.html", { root : __dirname })
  //});
};

const readInterface = readline.createInterface({
  input: fs.createReadStream("./nsf2020.txt"),
  crlfDelay: Infinity
});

const ordliste = new Set();

readInterface.on("line", ord => {
    ordliste.add(ord);
});
readInterface.on("close", start);

const id = Symbol("id");

var startBrett = bokstavting.lagBrett("ERERASDFG".split("").map(x => brikker.get(x)));

io.sockets.on("connection", socket => {

  socket.on("nySpiller", () => {
    const spillerId = spill.nySpiller("Gjest", startBrett);
    socket[id] = spillerId;
    socket.emit("spillerId", spillerId);
    socket.emit("brett", startBrett);
  });

  socket.on("eksisterendeSpiller", gammelId => {
    const spillerId = spill.eksisterendeSpiller(gammelId, "Gjest", startBrett);
    socket[id] = spillerId;
    socket.emit("spillerId", spillerId);
    socket.emit("brett", spill.brett(spillerId));
  });

  socket.on("flytt", (a, b) => {
    const brett = spill.flytt(socket[id], a, b);
    if (brett !== false) {
      socket.emit("brett", brett);
      socket.emit("beregning", bokstavting.beregn(brett, ordliste));
    }
  });

  socket.on("disconnect", () => {
  });
});
