var express = require("express")
  , app = express()
  , http = require("http")
  , server = http.createServer(app)
  , io = require("socket.io").listen(server)
  , path = require("path")
  , bokstavting = require("./bokstavting")
  , brikker = require("./brikker")
  , spill = require("./spill")
  , lesord = require("./lesord");

// Start server
const start = () => {
  server.listen(3000);

  // Set up 'public' folder
  app.use(express.static(path.join(__dirname, "public")));

  // Point / to index.html (could just put index.html in public but leaving for reference)
  app.use('/spill/*', (req, res, next) => {
    res.sendFile("public/index.html", { root : __dirname })
  });
};

var ordliste;

const ordlister = {};
const no = "./nsf2020.txt";
const en =  "./sowpods.txt";
lesord([no, en], ordlister, () => {
  ordliste = ordlister[no];
  start();
});



const erPosisjon = p => {
  return Number.isInteger(p.x) && Number.isInteger(p.y);
}



io.sockets.on("connection", socket => {
  var mittSpill = false;
  var minId;
  socket.on("bli med", (rom, navn, gammelId) => {

    if (mittSpill !== false) {
      socket.leave(mittSpill.rom);
    }
    socket.join(rom);
    mittSpill = spill(io, rom, ordliste, brikker.kast);

    const spiller = mittSpill.hentSpiller(gammelId, navn);

    minId = spiller.id;
    socket.emit("spillerId", spiller.id);
    if (spiller.admin === true) {
      socket.emit("admin");
    }
    socket.emit("hei", spiller.navn);
    if (spiller.brett !== false) {
      socket.emit("brett", spiller.brett);
    }
    if (mittSpill.resultater() !== false) {
      socket.emit("resultater", mittSpill.resultater());
    }

  });

  socket.on("nytt navn", nyttNavn => {
    const spiller = mittSpill.nyttNavn(minId, nyttNavn);
    if (spiller !== false) {
      socket.emit("hei", spiller.navn);
    }
  });

  socket.on("start neste runde", () => mittSpill.startNesteRunde(minId));

  socket.on("flytt", (a, b) => {
    if (!erPosisjon(a) || !erPosisjon(b)) {
      console.log({feil: "flytt", a: a, b: b});
      return;
    }
    const brett = mittSpill.flytt(minId, a, b);
    if (brett !== false) {
      socket.emit("brett", brett);
    }
  });

  socket.on("konfigurer", konfigurasjon => {
    mittSpill.konfigurer(minId, konfigurasjon);
  });

  socket.on("disconnect", () => {
  });
});
