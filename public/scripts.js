/* globals io */

var socket;

const lagPosisjon = (x, y) => ({ x: x, y: y });

const tdPos = td => lagPosisjon(parseInt(td.getAttribute("data-x")), parseInt(td.getAttribute("data-y")));

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
  socket.emit("flytt", tdPos(sourceElement), tdPos(ev.target));
};

const lagBrettTabell = (brett, aktiv) => {
  const tabell = document.createElement("table");
  var y = 0;
  brett.ruter.forEach(rad => {
    const tr = document.createElement("tr");
    tabell.appendChild(tr);
    var x = 0;
    rad.forEach(rute => {
      const td = document.createElement("td");
      td.classList.add(aktiv ? "larg" : "smol");
      td.innerText = rute === "tom" ? "\xa0" : rute.bokstav;
      if (rute !== "tom") {
        const sub = document.createElement("sub");
        sub.innerText = "" + rute.poeng;
        td.appendChild(sub);
      }
      if (aktiv) {
        td.id = x + "," + y;
        td.setAttribute("data-x", "" + x);
        td.setAttribute("data-y", "" + y);
        td.draggable = true;
        td.ondragstart = drag;
        td.ondragover = allowDrop;
        td.ondrop = drop;
      }
      tr.appendChild(td);
      x = x + 1;
    });
    y = y + 1;
  });
  return tabell;
};

const resultatHTML = resultat => {
  const div = document.createElement("div");
  const p = document.createElement("p");
  p.innerText =
    resultat.navn + ": "
    + (resultat.best ? resultat.best.poeng : ":(");
  div.appendChild(p);
  if (resultat.best) {
    for (const o of resultat.best.ord) {
      const ordP = document.createElement("p");
      ordP.innerText = o.tekst + ": " + o.poeng;
      div.appendChild(ordP);
    }
  }
  const tabell = lagBrettTabell(resultat.brett, false);
  div.appendChild(tabell);
  return div;
};

const settSpillerId = id => {
  document.cookie = ("spillerId=" + id + ";sameSite=Strict");
};

const hentSpillerId = () => {
  const str = document.cookie;
  const idx = str.indexOf("spillerId=");
  if (idx < 0) return false;
  return (str.substr(idx + 10, 36));
};

document.addEventListener("DOMContentLoaded", event => {
    socket = io.connect();

    document.getElementById("navn").onchange = ev => {
      const nyttNavn = document.getElementById("navn").value;
      socket.emit("nyttNavn", nyttNavn);
    }

    socket.on("hei", navn => {
      document.getElementById("navn").value = navn;
      document.getElementById("hei").innerText = "Hei " + navn + ".";
    });

    const kanskjeSpillerId = hentSpillerId();

    if (kanskjeSpillerId === false) {
      socket.emit("nySpiller");
    } else {
      socket.emit("eksisterendeSpiller", kanskjeSpillerId);
    }

    socket.on("spillerId", settSpillerId);

    socket.on("tid", tid => {
      document.getElementById("tid").innerText = "" + tid;
    });

    socket.on("updateUsers", data => {
    });

    socket.on("connect", () => {
    });

    socket.on("brett", brett => {
      setHtml(document.getElementById("greier"), [lagBrettTabell(brett, true)]);
    });
    socket.on("resultater", resultater => {
      setHtml(document.getElementById("greier"), resultater.map(resultatHTML));
      console.log(resultater);
    });
});
