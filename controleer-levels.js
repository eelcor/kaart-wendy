// Ruwe bereikbaarheidscontrole voor levels.js: kan Wendy elk kaartje, de sleutel en de finish halen?
// Benadering op tegelniveau (geen echte physics): springt 3 tegels hoog (rennend 4) en 4 breed
// (rennend 6), vallen mag verder. Wind, springbloemen, ranken, bewegende takken en taart tellen mee.
// Schakelblokken worden als altijd begaanbaar gezien, dus schakelpuzzels zelf test dit niet.
// Kaartjes met { inSprong: true } pak je midden in een sprong; die slaat de controle over.
// Gebruik: node controleer-levels.js
const LEVELS = require("./levels.js");
const ROWS = 14;

function bouw(L) {
  const grid = Array.from({ length: ROWS }, () => Array(L.n).fill("."));
  const ents = [];
  const set = (x, y, c) => { if (x >= 0 && x < L.n && y >= 0 && y < ROWS) grid[y][x] = c; };
  const row = (x0, x1, y, c) => { for (let x = x0; x <= x1; x++) set(x, y, c); };
  const col = (x, y0, y1, c) => { for (let y = y0; y <= y1; y++) set(x, y, c); };
  const g = (x0, x1, top = 12) => { for (let y = top; y < ROWS; y++) row(x0, x1, y, "#"); };
  const e = (type, tx, ty, extra = {}) => ents.push({ type, tx, ty, ...extra });
  let start = null;
  L.bouw({ g, row, col, set, e, start: (tx, rij = 12) => { start = [tx, rij]; } });
  return { grid, ents, start };
}

function controleer(L) {
  const { grid, ents, start } = bouw(L);
  const N = L.n;
  const t = (x, y) => (x < 0 || x >= N ? "#" : y < 0 || y >= ROWS ? "." : grid[y][x]);
  const vast = (c, sleutel) => "#B?S".includes(c) || (c === "D" && !sleutel);
  const staanOp = (c, sleutel) => vast(c, sleutel) || "=~Aa".includes(c);

  // Extra knooppunten: ranken, bewegende takken en wind (zwevend)
  const extra = new Set();
  const k = (x, y) => x + "," + y;
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < N; x++) if (t(x, y) === "|") extra.add(k(x, y + 1));
  for (const o of ents) {
    if (o.type === "plat") {
      for (let dx = -Math.ceil(o.ax) - 1; dx <= Math.ceil(o.ax) + 1; dx++)
        for (let dy = -Math.floor(o.ay); dy <= Math.floor(o.ay); dy++) extra.add(k(o.tx + dx, o.ty + dy));
    }
    if (o.type === "wind") for (let x = o.tx; x < o.tx + o.w; x++) extra.add(k(x, o.ty + 1));
  }

  function knoop(x, y, s) {
    if (extra.has(k(x, y))) return true;
    return y >= 1 && y < ROWS && staanOp(t(x, y), s) && t(x, y) !== "^" && !vast(t(x, y - 1), s) && !vast(t(x, y - 2), s) && !"^".includes(t(x, y - 1));
  }
  const vrij = (x, y0, y1, s) => { for (let y = Math.max(0, y0); y <= y1; y++) if (vast(t(x, y), s)) return false; return true; };

  function boog(x1, y1, x2, y2, hMax, s) {
    const dx = Math.abs(x2 - x1);
    for (let h = Math.max(0, y1 - y2); h <= hMax; h++) {
      const top = y1 - h, stap = x2 > x1 ? 1 : -1;
      let ok = vrij(x1, top - 2, y1 - 1, s) && vrij(x2, top - 2, y2 - 1, s);
      for (let x = x1 + stap; ok && x !== x2; x += stap) ok = vrij(x, top - 2, Math.max(y1, y2) - 1, s);
      if (ok || dx === 0) return true;
    }
    return false;
  }

  const veren = ents.filter(o => o.type === "veer");
  const winden = ents.filter(o => o.type === "wind");
  const bereikt = new Set();
  const pakken = { taart: false, sleutel: false };

  function zoek(s, d) {
    const wacht = [...bereikt].map(z => z.split(",").map(Number));
    if (!wacht.length) { wacht.push(start); bereikt.add(k(...start)); }
    while (wacht.length) {
      const [x, y] = wacht.shift();
      const opRank = t(x, y - 1) === "|";
      let hMax = opRank ? 3 : 4, dMax = opRank ? 5 : 7;
      if (veren.some(v => v.tx === x && v.ty === y)) { hMax = 9; dMax = 7; }
      if (d) { hMax += 3; dMax += 2; }
      for (const w of winden) if (x >= w.tx - 2 && x < w.tx + w.w + 2 && y > w.ty) { hMax = Math.max(hMax, y - w.ty - 1); dMax = Math.max(dMax, 6); }
      for (let x2 = x - dMax - 4; x2 <= x + dMax + 4; x2++) for (let y2 = 0; y2 < ROWS; y2++) {
        if (bereikt.has(k(x2, y2)) || !knoop(x2, y2, s)) continue;
        const val = Math.max(0, y2 - y), lim = Math.min(dMax + Math.floor(val / 2), 10);
        if (Math.abs(x2 - x) > lim) continue;
        if (y - y2 > hMax) continue;
        if (!boog(x, y, x2, y2, hMax, s)) continue;
        bereikt.add(k(x2, y2)); wacht.push([x2, y2]);
      }
    }
  }
  function haalbaar(o, d) {
    for (const z of bereikt) {
      const [x, y] = z.split(",").map(Number);
      const hoog = (d ? 8 : 5) + (veren.some(v => v.tx === x && v.ty === y) ? 5 : 0) + (winden.some(w => x >= w.tx && x < w.tx + w.w) ? 9 : 0);
      if (Math.abs(o.tx - x) <= 2 && o.ty <= y && o.ty >= y - hoog) return true;
    }
    return false;
  }

  zoek(false, false);
  for (let ronde = 0; ronde < 3; ronde++) {
    const taart = ents.find(o => o.type === "taart"), sl = ents.find(o => o.type === "sleutel");
    if (taart && !pakken.taart && haalbaar(taart, false)) pakken.taart = true;
    if (sl && !pakken.sleutel && haalbaar(sl, pakken.taart)) pakken.sleutel = true;
    zoek(pakken.sleutel, pakken.taart);
  }

  const fout = [];
  for (const o of ents) if (["kaart", "sleutel", "taart", "doel"].includes(o.type) && !o.inSprong && !haalbaar(o, pakken.taart)) fout.push(`${o.type} (${o.tx},${o.ty})`);
  const kaarten = ents.filter(o => o.type === "kaart").length;
  if (kaarten !== 5) fout.push(`${kaarten} kaartjes in plaats van 5`);
  controleer.laatste = { bereikt, pakken };
  return fout;
}

if (require.main === module) {
  let slecht = 0;
  LEVELS.forEach((L, i) => {
    const fout = controleer(L);
    console.log(`${String(i + 1).padStart(2)}. ${L.naam.padEnd(24)} ${fout.length ? "NIET BEREIKBAAR: " + fout.join(", ") : "ok"}`);
    slecht += fout.length;
  });
  process.exit(slecht ? 1 : 0);
} else module.exports = controleer;
