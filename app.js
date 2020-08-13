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
var holderpa = false;
var resultater = false;

const sendTilstand = (socket, spiller) => {
  socket.emit("brett", spiller.brett);
  if (resultater !== false) {
    socket.emit("resultater", resultater);
  }
};

const erPosisjon = p => {
  return Number.isInteger(p.x) && Number.isInteger(p.y);
}

io.sockets.on("connection", socket => {

  socket.on("nySpiller", () => {
    const spiller = spill.nySpiller("Gjest", startBrett);
    socket[id] = spiller.id;
    socket.emit("spillerId", spiller.id);
    socket.emit("hei", spiller.navn);
    sendTilstand(socket, spiller);
  });

  socket.on("eksisterendeSpiller", gammelId => {
    const spiller = spill.eksisterendeSpiller(gammelId, "Gjest", startBrett);
    socket[id] = spiller.id;
    socket.emit("spillerId", spiller.id);
    socket.emit("hei", spiller.navn);
    sendTilstand(socket, spiller);
  });

  socket.on("nyttNavn", nyttNavn => {
    const spiller = spill.nyttNavn(socket[id], nyttNavn);
    if (spiller !== false) {
      socket.emit("hei", spiller.navn);
    }
  });

  socket.on("flytt", (a, b) => {
    if (!erPosisjon(a) || !erPosisjon(b)) {
      console.log({feil: "flytt", a: a, b: b});
      return;
    }
    if (holderpa) {
      const brett = spill.flytt(socket[id], a, b);
      if (brett !== false) {
        socket.emit("brett", brett);
      }
    }
  });

  socket.on("disconnect", () => {
  });
});

var tid;

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
  holderpa = true;
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
  holderpa = false;
  resultater =
    spill.spillere()
      .map(spiller => bokstavting.resultat(spiller, ordliste));
  resultater.sort((a, b) => {
    if (a.grupper.length === 0 || b.grupper.length === 0) {
      if (a.grupper.length === 0) {
        return 1;
      } else if (b.grupper.length === 0 !== false) {
        return -1;
      } else {
        return 0;
      }
    }
    return b.grupper[0].poeng - a.grupper[0].poeng;
  })
  io.sockets.emit("resultater", resultater);
  tid = 31;
  venter();
};

nyRunde();
