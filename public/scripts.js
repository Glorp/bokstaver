/* globals io */

var socket;

const lagPosisjon = (x, y) => ({ x: x, y: y });

const elemPos = td =>
  lagPosisjon(
    parseInt(td.getAttribute("data-x")),
    parseInt(td.getAttribute("data-y"))
  );

const setHtml = (element, children) => {
  while (element.firstChild) element.removeChild(element.firstChild);
  children.forEach(c => element.appendChild(c));
};

const allowDrop = ev => {
  ev.preventDefault();
};

const token = "mlep: ";

const drag = ev => {
  ev.dataTransfer.setData("text", token + ev.target.id);
};

const drop = ev => {
  ev.preventDefault();
  const s = ev.dataTransfer.getData("text");
  if (!s.startsWith(token)) {
    return;
  }
  const sourceElement = document.getElementById(s.substring(token.length));
  socket.emit("flytt", elemPos(sourceElement), elemPos(ev.target));
};

const fargeKlasser = (farger, x, y, rute) => {
  if (farger !== false) {
    const farge = farger[y][x];
    if (farge !== ingen) {
      return [farge == riktig ? "riktig" : "feil"];
    }
  }
  return rute === "tom" ? [] : ["brikke"];
};

const lagBrettTabell = (brett, aktiv, farger) => {

  const tabell = document.createElement("table");
  var y = 0;
  brett.ruter.forEach(rad => {
    const tr = document.createElement("tr");
    tabell.appendChild(tr);
    var x = 0;
    rad.forEach(rute => {
      const td = document.createElement("td");
      tr.appendChild(td);
      const ruteDiv = document.createElement("div");
      td.appendChild(ruteDiv);
      ruteDiv.classList.add(aktiv ? "larg" : "smol");
      fargeKlasser(farger, x, y, rute).forEach(c => ruteDiv.classList.add(c));

      if (rute !== "tom") {
        ruteDiv.innerText = rute.bokstav;
        const sub = document.createElement("sub");
        sub.innerText = "" + rute.poeng;
        ruteDiv.appendChild(sub);
      }
      if (aktiv) {
        ruteDiv.id = x + "," + y;
        ruteDiv.setAttribute("data-x", "" + x);
        ruteDiv.setAttribute("data-y", "" + y);
        ruteDiv.draggable = true;
        ruteDiv.ondragstart = drag;
        ruteDiv.ondragover = allowDrop;
        ruteDiv.ondrop = drop;
      }

      x = x + 1;
    });
    y = y + 1;
  });
  return tabell;
};

const resultatHTML = resultat => {
  const res = document.createElement("table");

  const spillertr = document.createElement("tr");
  res.appendChild(spillertr);
  const spillertd = document.createElement("td");
  spillertd.setAttribute("colspan", "2");
  spillertr.appendChild(spillertd);

  const tr = document.createElement("tr");
  res.appendChild(tr);

  const brettTd = document.createElement("td");
  tr.appendChild(brettTd);
  const farger = velgFarger(resultat.brett.storelse, resultat.grupper);
  brettTd.appendChild(lagBrettTabell(resultat.brett, false, farger));

  const poengTd = document.createElement("td");
  poengTd.classList.add("poeng");
  tr.appendChild(poengTd);
  const p = document.createElement("p");
  p.classList.add('spillernavn');
  spillertd.appendChild(p);

  const best = resultat.grupper.length === 0 ? false : resultat.grupper[0];
  if (best) {
    p.innerText = resultat.navn + ": " + best.poeng;
    if (best.lovlig) {
      for (const o of best.ord) {
        const ordP = document.createElement("p");
        ordP.innerText = o.tekst + ": " + o.poeng;
        poengTd.appendChild(ordP);
      }
    }
  } else {
    p.innerText = resultat.navn + ": 0";
  }

  return res;
};

const ingen = Symbol("ingen");
const riktig = Symbol("riktig");
const feil = Symbol("feil");
const bortover = p => lagPosisjon(p.x + 1, p.y);
const nedover = p => lagPosisjon(p.x, p.y + 1);
const velgFarger = (storelse, grupper) => {
  const res = Array.from(Array(storelse).keys()).map(x =>
    Array(storelse).fill(ingen)
  );
  for (const gruppe of grupper) {
    for (const o of gruppe.ord) {
      var pos = o.rekke.start;
      const retning = o.rekke.retning === "vannrett" ? bortover : nedover;
      for (const b of o.rekke.brikker) {
        if (res[pos.y][pos.x] !== feil) {
          res[pos.y][pos.x] = o.lovlig ? riktig : feil;
        }
        pos = retning(pos);
      }
    }
  }
  return res;
};

const rom = window.location.pathname;

const settSpillerId = id => {
  Cookies.set("spillerId", id, { expires: 2, path: rom, sameSite: "strict"});
};

const hentSpillerId = () => {
  const res = Cookies.get("spillerId");
  return res === undefined ? false : res;
};

const setSpillerNavn = navn => {
  Cookies.set("spillerNavn", navn, { sameSite: "strict"});
};

const getSpillerNavn = navn => {
  const res = Cookies.get("spillerNavn");
  return res === undefined ? "Gjest" : res;
};

const oppdaterSpillerNavn = () => {
  const navn = getSpillerNavn();
  document.getElementById("navn").value = navn;
  document.getElementById("hei").innerText = "Hei, " + navn + "! :D";
};

document.addEventListener("DOMContentLoaded", event => {
  oppdaterSpillerNavn();
  socket = io.connect();

  socket.on("hei", navn => {
    setSpillerNavn(navn);
    oppdaterSpillerNavn();
  });

  document.getElementById("navn").onchange = ev => {
    const nyttNavn = document.getElementById("navn").value;
    socket.emit("nytt navn", nyttNavn);
  };

  const kanskjeSpillerId = hentSpillerId();

  socket.on("spillerId", settSpillerId);

  socket.on("tid", tid => {
    document.getElementById("tid").innerText = "" + tid;
    if (tid > 15) {
      document.getElementById("haster").textContent = 'Sett i gang! Du har fortsatt oseaner av tid';
      document.querySelector(".statusvindu").classList.remove('lite-tid');
    } else if (tid > 3) {
      document.getElementById("haster").textContent = 'Nei, nå haster det, altså!';
      document.querySelector(".statusvindu").classList.add('lite-tid');
    } else {
      document.getElementById("haster").textContent = 'UH OH! U DED!';
    }
  });

  socket.on("pausetid", tid => {
    document.getElementById("nedtelling-ny-runde").style.display = "flex";
    document.getElementById("nedtelling-spill").style.display = "none";
    document.querySelector(".statusvindu").classList.remove('lite-tid');

    document.getElementById("pausetid").innerText = "" + tid;
  });

  socket.on("updateUsers", data => {});

  socket.on("connect", () => {});

  socket.on("brett", brett => {
    document.getElementById("nedtelling-ny-runde").style.display = "none";
    document.getElementById("nedtelling-spill").style.display = "flex";

    setHtml(document.getElementById("brett"), [
      lagBrettTabell(brett, true, false)
    ]);
  });
  socket.on("resultater", resultater => {
    console.log(resultater);
    setHtml(
      document.getElementById("resultater"),
      resultater.map(resultatHTML)
    );

  });

  socket.emit("bli med", rom, getSpillerNavn(), kanskjeSpillerId);
});
