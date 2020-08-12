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

var startBrett;

io.sockets.on("connection", socket => {

  socket.on("nySpiller", () => {
    const spiller = spill.nySpiller("Gjest", startBrett);
    socket[id] = spiller.id;
    socket.emit("spillerId", spiller.id);
    socket.emit("brett", startBrett);
    socket.emit("hei", spiller.navn)
  });

  socket.on("eksisterendeSpiller", gammelId => {
    const spiller = spill.eksisterendeSpiller(gammelId, "Gjest", startBrett);
    socket[id] = spiller.id;
    socket.emit("spillerId", spiller.id);
    socket.emit("brett", spill.brett(spiller.id));
    socket.emit("hei", spiller.navn);
  });

  socket.on("nyttNavn", nyttNavn => {
    const spiller = spill.nyttNavn(socket[id], nyttNavn);
    if (spiller !== false) {
      socket.emit("hei", spiller.navn);
    }
  });

  socket.on("flytt", (a, b) => {
    const brett = spill.flytt(socket[id], a, b);
    if (brett !== false) {
      socket.emit("brett", brett);
    }
  });

  socket.on("disconnect", () => {
  });
});

var tid;

var holderpa = false;

const tidengar = () => {
  tid = tid - 1;
  io.sockets.emit("tid", tid);
  if (tid === 0) {
    ferdig();
  } else {
    setTimeout(tidengar, 1000);
  }
};

const nyRunde = () => {
  tid = 61;
  startBrett = bokstavting.lagBrett(brikker.kast());
  spill.nyRunde(startBrett);
  io.sockets.emit("brett", startBrett);
  tidengar();
};

const venter = () => {
  tid = tid - 1;
  io.sockets.emit("tid", tid);
  if (tid === 0) {
    nyRunde();
  } else {
    setTimeout(venter, 1000);
  }
}

const ferdig = () => {
  io.sockets.emit("resultater", spill.spillere().map(spiller => bokstavting.resultat(spiller, ordliste)));
  tid = 31;
  venter();
};

nyRunde();
