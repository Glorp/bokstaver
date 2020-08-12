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

const lagTabell = brett => {
  const tabell = document.createElement("table");
  //const tds = [];
  var y = 0;
  brett.ruter.forEach(rad => {
    const tr = document.createElement("tr");
    tabell.appendChild(tr);
    var x = 0;
    rad.forEach(rute => {
      const td = document.createElement("td");
      td.id = x + "," + y;
      td.setAttribute("data-x", "" + x);
      td.setAttribute("data-y", "" + y);
      td.innerText = rute === "tom" ? "\xa0" : rute.bokstav;
      td.draggable = true;
      td.ondragstart = drag;
      td.ondragover = allowDrop;
      td.ondrop = drop;
      tr.appendChild(td);
      x = x + 1;
    });
    y = y + 1;
  });
  return tabell;
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

    const kanskjeSpillerId = hentSpillerId();

    //socket.emit("nySpiller");

    if (kanskjeSpillerId === false) {
      socket.emit("nySpiller");
    } else {
      socket.emit("eksisterendeSpiller", kanskjeSpillerId);
    }

    socket.on("spillerId", settSpillerId);

    socket.on("updateUsers", data => {
    });

    //create new socket connection
    socket.on("connect", () => {
    });

    socket.on("brett", brett => {
      setHtml(document.body, [lagTabell(brett)]);
    });
    socket.on("beregning", beregning => {
      console.log(beregning);
    });
});
