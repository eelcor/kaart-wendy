// Bloesemland — 8-bit platformspel onderaan Wendy's kaart.
// Tien levels (levels.js), één per kernteamlid, met een wereldkaart ertussen.
// Poppetjes zijn nog getekende placeholders; de echte sprites volgen via Qwen + skeletanimatie.
(() => {
  "use strict";

  const LEVELS = window.BLOESEM_LEVELS || [];
  const scherm = document.getElementById("spelScherm");
  const cv = document.getElementById("spelCanvas");
  const ctx = cv.getContext("2d");
  const W = 256, H = 224, T = 16, ROWS = 14;
  const FONT = "8px 'Press Start 2P', monospace";
  const FONT_GROOT = "16px 'Press Start 2P', monospace";
  const aanraak = matchMedia("(pointer: coarse)").matches;

  const C = {
    trunk: "#7a5644", blossom: ["#f4a9c8", "#e98ab3", "#c3a6e6", "#fbd3e3", "#d68ac6"],
    grass: "#7fb069", grassHi: "#a6cf86", grassLo: "#5e8f4e",
    dirt: "#a06e4f", dirtLo: "#7d5238", dirtHi: "#bb8a66",
    bark: "#6b4a3a", barkLo: "#4e3428", barkHi: "#8c6650",
    pink: "#e98ab3", pinkLo: "#b8457a", pinkHi: "#fbd3e3",
    lilac: "#b99be3", lilacLo: "#7d55b8", lilacHi: "#ebe0fa",
    ink: "#3e2340", white: "#fffaf5", kraft: "#e9d4b5", kraftLo: "#cbb089",
    thorn: "#5e3a5e", thornHi: "#8a5a8a", leaf: "#6f9a58", leafHi: "#9cc77c",
    cloud: "#8d8aa6", cloudHi: "#b9b6cc", cloudLo: "#6d6a86", rain: "#86a7dc", gold: "#ffd36e",
    bee: "#f2c14e", beeLo: "#3e2a2a",
  };

  // Lucht en heuvels per thema
  const THEMA = {
    dag:    { sky: ["#fde3ee", "#e6d8fa"], hill: ["#dccaf2", "#cdb6ea"], zon: "#fff1c9" },
    middag: { sky: ["#fff0d9", "#fbd3e3"], hill: ["#f3c9d9", "#e7b3c9"], zon: "#ffe39a" },
    avond:  { sky: ["#ffb38a", "#a87ccc"], hill: ["#9b6fb8", "#7d55a0"], zon: "#ffd36e", laag: true },
    nacht:  { sky: ["#1d1b3a", "#3d3168"], hill: ["#2e2a55", "#252047"], maan: "#f4f0d8", sterren: true, boom: ["#8a6fb8", "#a07bc8", "#6e5aa0", "#b593d6", "#7d63ac"] },
    regen:  { sky: ["#cfc8de", "#a9a3c2"], hill: ["#9890b3", "#857da3"], regen: true },
    feest:  { sky: ["#fde3ee", "#d9eef2"], hill: ["#dccaf2", "#c9e3d6"], zon: "#fff1c9", slingers: true },
  };

  // ---------- Uiterlijk van de poppetjes (placeholders, op basis van de foto's) ----------
  const basis = { skin: "#f2c6a8", legs: "#3a3a4a", shoes: "#2a2030" };
  const WENDY = { ...basis, hair: "#8a6a45", hairHi: "#ad8a5c", top: "#c2557f", topLo: "#963c63", legs: "#4a5a8a", shoes: "#3e2340", stijl: "lang" };
  const LOOKS = {
    Mirjam: { ...basis, hair: "#cfccc6", hairHi: "#eeebe6", top: "#3a2e34", topLo: "#2a2026", stijl: "bob", bril: "#5a3a2a" },
    Eelco:  { ...basis, hair: "#9a8f86", hairHi: "#b3aaa2", top: "#8fb3dd", topLo: "#6f93c0", stijl: "kaal", baard: "#a39a92", bril: "#1f1a1f" },
    Sabine: { ...basis, hair: "#e8cf8e", hairHi: "#f6e4b4", top: "#7a2a45", topLo: "#5e2035", streep: "#bcd3e3", stijl: "lang" },
    Colin:  { ...basis, hair: "#7a5c45", hairHi: "#93745c", top: "#6b8fbf", topLo: "#52739f", stijl: "kort", bril: "#7d7a7a" },
    Renee:  { ...basis, hair: "#e6c98a", hairHi: "#f5e1ad", top: "#7a2f45", topLo: "#5e2335", stijl: "lang" },
    Chris:  { ...basis, hair: "#b8a98a", hairHi: "#d3c6a8", top: "#4a3f7a", topLo: "#382f60", stijl: "krul", baard: "#a8977a" },
    Jan:    { ...basis, hair: "#dcc08a", hairHi: "#efdcb2", top: "#6e2433", topLo: "#521a26", stijl: "halflang", bril: "#5a4a40" },
    Thomas: { ...basis, hair: "#9a7a55", hairHi: "#b39470", top: "#283350", topLo: "#1d253c", stijl: "kort", bril: "#2a2020" },
    David:  { ...basis, hair: "#a8a49e", hairHi: "#c4c0ba", top: "#2a2a2e", topLo: "#1c1c20", stijl: "kort" },
    Dave:   { ...basis, hair: "#7d5f40", hairHi: "#9a7a55", top: "#f0d6d2", topLo: "#d9bcb7", legs: "#2a3550", shoes: "#1f1f24", stijl: "kort", zonnebril: "#1a1a1e", shorts: true },
  };
  const TEAM = ["Mirjam", "Eelco", "Sabine", "Colin", "Renee", "Chris", "Jan", "Thomas", "David", "Dave"];
  const HOERA = ["Hoera, Wendy!", "Liefs!", "Knap gedaan!", "Taart voor jou!", "Sterkte, Wendy!", "Je kunt het!", "Dikke knuffel!", "Zo trots!", "Hiep hoi!", "Feest!"];

  // ---------- Level opbouwen ----------
  let lvl = 0, N = 160, grid, ents, start, thema = THEMA.dag, totaalKaarten = 5;

  function bouwLevel(i) {
    const L = LEVELS[i];
    N = L.n;
    thema = THEMA[L.thema] || THEMA.dag;
    grid = Array.from({ length: ROWS }, () => Array(N).fill("."));
    ents = [];
    const set = (x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < ROWS) grid[y][x] = c; };
    const row = (x0, x1, y, c) => { for (let x = x0; x <= x1; x++) set(x, y, c); };
    const col = (x, y0, y1, c) => { for (let y = y0; y <= y1; y++) set(x, y, c); };
    const g = (x0, x1, top = 12) => { for (let y = top; y < ROWS; y++) row(x0, x1, y, "#"); };
    const e = (type, tx, ty, extra = {}) => {
      if (type === "feest") {
        TEAM.forEach((naam, k) => ents.push({ type: "npc", tx: tx + k * 2, ty, naam, juich: true, tekst: [HOERA[k]] }));
      } else ents.push({ type, tx, ty, ...extra });
    };
    const startOp = (tx, rij = 12) => { start = { x: tx * T + 3, y: rij * T - 22 }; };
    L.bouw({ g, row, col, set, e, start: startOp });

    ents = ents.map((o, k) => {
      const x = o.tx * T + T / 2, y = o.ty * T + T / 2;
      return { ...o, id: k, x0: x, y0: y, x, y, vorigeY: y, dx: 0, dy: 0, weg: false, t: (k * 37) % 100, look: LOOKS[o.naam] };
    });
    totaalKaarten = ents.filter(o => o.type === "kaart").length;
  }

  const SOLID = new Set(["#", "B", "?", "u", "S", "D"]);
  let schakel = false, wiebel = new Map();
  function tile(tx, ty) {
    if (tx < 0 || tx >= N) return "#";
    if (ty < 0 || ty >= ROWS) return ".";
    const c = grid[ty][tx];
    if (c === "~" && wiebel.get(tx + "," + ty)?.weg) return ".";
    return c;
  }
  function solid(c) { return SOLID.has(c) || (c === "A" && !schakel) || (c === "a" && schakel); }

  // ---------- Toestand ----------
  const sp = { x: 0, y: 0, w: 10, h: 22, vx: 0, vy: 0, grond: false, kant: 1, coyote: 0, buf: 0, klim: false, klimPauze: 0, dubbel: false, taart: false, inv: 0, plat: null, anim: 0 };
  let staat = "titel", rustig = true, harten = 3, bloemen = 0, kaarten = new Set(), tijd = 0, frame = 0;
  let check = null, cam = 0, camLook = 0, deeltjes = [], banner = null, bumps = new Map(), pauze = false, inBeeld = true, sleutel = false;

  function startLevel(i) {
    lvl = i;
    bouwLevel(i);
    schakel = false; wiebel = new Map(); sleutel = false;
    harten = 3; bloemen = 0; kaarten = new Set(); tijd = 0;
    check = null; deeltjes = []; bumps = new Map();
    Object.assign(sp, { x: start.x, y: start.y, vx: 0, vy: 0, kant: 1, klim: false, klimPauze: 0, taart: false, dubbel: false, inv: 0, plat: null });
    cam = 0; camLook = 0;
    staat = "spel"; pauze = false;
    einde.hidden = true;
    toonBanner(`${i + 1}. ${LEVELS[i].naam}`);
    scherm.focus({ preventScroll: true });
  }

  // ---------- Voortgang (alleen in deze browser) ----------
  const OPSLAG = "bloesemland-voortgang";
  let voortgang = { klaar: {} };
  try { voortgang = JSON.parse(localStorage.getItem(OPSLAG)) || voortgang; } catch { /* geen opslag beschikbaar */ }
  if (!voortgang.klaar) voortgang.klaar = {};
  const bewaar = () => { try { localStorage.setItem(OPSLAG, JSON.stringify(voortgang)); } catch { /* geen opslag */ } };
  const open = i => i === 0 || voortgang.klaar[i - 1] != null;
  let kies = 0;
  function eersteOpen() { let i = 0; while (i < LEVELS.length - 1 && voortgang.klaar[i] != null) i++; return i; }

  // ---------- Invoer ----------
  const inp = { left: false, right: false, up: false, down: false, jump: false, run: false };
  let sprongDruk = false, omhoogSprong = false;
  const KEYS = {
    ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
    Space: "jump", KeyZ: "jump", KeyK: "jump",
    ShiftLeft: "run", ShiftRight: "run", KeyX: "run", KeyJ: "run",
  };
  function kaartKnop(k) {
    if (k === "left" || k === "right") {
      const d = k === "left" ? -1 : 1;
      const n = kies + d;
      if (n >= 0 && n < LEVELS.length && open(n)) { kies = n; sfx.tik(); }
    } else if (k === "jump" || k === "enter") startLevel(kies);
  }
  scherm.addEventListener("keydown", ev => {
    const k = KEYS[ev.code];
    if (k || ev.code === "Enter" || ev.code === "Escape" || ev.code === "KeyP") ev.preventDefault();
    if (staat === "titel" && (ev.code === "Space" || ev.code === "Enter")) { naarKaart(); return; }
    if (staat === "kaart") { if (!ev.repeat) kaartKnop(ev.code === "Enter" ? "enter" : k); return; }
    if (ev.code === "Escape" || ev.code === "KeyP") { if (staat === "spel") pauze = !pauze; return; }
    if (!k) return;
    if (k === "jump" && !ev.repeat) sprongDruk = true;
    // pijltje omhoog springt ook, behalve bij een klimrank
    if (k === "up" && !ev.repeat && !opRank() && !sp.klim) { sprongDruk = true; inp.jump = true; omhoogSprong = true; }
    inp[k] = true;
  });
  scherm.addEventListener("keyup", ev => {
    const k = KEYS[ev.code];
    if (!k) return;
    inp[k] = false;
    if (k === "up" && omhoogSprong) { inp.jump = false; omhoogSprong = false; }
  });
  scherm.addEventListener("blur", () => { for (const k in inp) inp[k] = false; });

  document.querySelectorAll("[data-knop]").forEach(b => {
    const k = b.dataset.knop;
    const aan = ev => {
      ev.preventDefault();
      b.setPointerCapture?.(ev.pointerId);
      ac?.resume?.();
      if (staat === "titel") { naarKaart(); return; }
      if (staat === "kaart") { kaartKnop(k); return; }
      if (k === "jump") sprongDruk = true;
      inp[k] = true; b.classList.add("in");
    };
    const uit = () => { inp[k] = false; b.classList.remove("in"); };
    b.addEventListener("pointerdown", aan);
    b.addEventListener("pointerup", uit);
    b.addEventListener("pointercancel", uit);
    b.addEventListener("lostpointercapture", uit);
  });
  cv.addEventListener("pointerdown", ev => {
    scherm.focus({ preventScroll: true });
    if (staat === "titel") { naarKaart(); return; }
    if (staat === "kaart") {
      const r = cv.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width * W, py = (ev.clientY - r.top) / r.height * H;
      const i = KAART_PUNTEN.findIndex(([x, y]) => Math.abs(px - x) < 14 && Math.abs(py - y) < 14);
      if (i >= 0 && open(i)) { if (i === kies) startLevel(i); else { kies = i; sfx.tik(); } }
      else if (py > 160) startLevel(kies);
    }
  });

  // ---------- Geluid ----------
  let ac = null, geluid = true;
  function toon(freq, dur = .08, type = "square", slide = 0, vol = .06, wacht = 0) {
    if (!ac || !geluid) return;
    const t0 = ac.currentTime + wacht;
    const o = ac.createOscillator(), gn = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
    gn.gain.setValueAtTime(vol, t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
    o.connect(gn).connect(ac.destination); o.start(t0); o.stop(t0 + dur + .02);
  }
  const sfx = {
    sprong: () => toon(392, .12, "square", 1.6, .045),
    dubbel: () => { toon(523, .1, "square", 1.5, .04); toon(784, .1, "triangle", 1.3, .04, .05); },
    boing: () => { toon(220, .18, "triangle", 3, .07); toon(330, .14, "square", 2, .03, .03); },
    bloem: () => { toon(988, .05, "square", 1, .035); toon(1319, .09, "square", 1, .035, .05); },
    kaart: () => [659, 784, 988, 1319].forEach((f, i) => toon(f, .1, "triangle", 1, .06, i * .07)),
    au: () => toon(330, .25, "sawtooth", .4, .05),
    bonk: () => toon(140, .08, "square", .7, .07),
    krak: () => toon(180, .12, "sawtooth", .5, .04),
    klik: () => { toon(220, .06, "square", 1, .06); toon(330, .08, "square", 1, .05, .06); },
    sleutel: () => [784, 988, 1175, 1568].forEach((f, i) => toon(f, .12, "triangle", 1, .06, i * .08)),
    taart: () => [523, 659, 784, 1047, 1319].forEach((f, i) => toon(f, .12, "square", 1, .05, i * .06)),
    hart: () => { toon(660, .08, "triangle", 1, .07); toon(880, .14, "triangle", 1, .07, .08); },
    vlag: () => [392, 523, 659, 784].forEach((f, i) => toon(f, .14, "triangle", 1, .06, i * .09)),
    tik: () => toon(660, .05, "square", 1, .04),
    klaar: () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => toon(f, .18, "square", 1, .05, i * .12)),
  };
  function geluidAan() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { ac = null; } }
    ac?.resume?.();
  }

  // ---------- Schermen ----------
  const einde = document.getElementById("spelEinde");
  function naarKaart() {
    geluidAan();
    staat = "kaart"; pauze = false; einde.hidden = true;
    kies = Math.min(kies, eersteOpen());
    if (!open(kies)) kies = eersteOpen();
    scherm.focus({ preventScroll: true });
  }
  document.getElementById("spelOpnieuw").addEventListener("click", () => startLevel(lvl));
  document.getElementById("spelNaarKaart").addEventListener("click", () => { kies = Math.min(lvl + 1, LEVELS.length - 1); naarKaart(); });
  document.getElementById("spelKaartKnop").addEventListener("click", naarKaart);
  document.querySelectorAll("[data-modus]").forEach(b => b.addEventListener("click", () => {
    rustig = b.dataset.modus === "rustig";
    document.querySelectorAll("[data-modus]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    scherm.focus({ preventScroll: true });
  }));
  const geluidKnop = document.getElementById("spelGeluid");
  geluidKnop.addEventListener("click", () => {
    geluid = !geluid;
    geluidKnop.textContent = geluid ? "Geluid aan" : "Geluid uit";
    geluidKnop.setAttribute("aria-pressed", String(geluid));
  });

  // ---------- Botsingen ----------
  function overlapTiles(x, y, w, h, fn) {
    const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 1) / T);
    const y0 = Math.floor(y / T), y1 = Math.floor((y + h - 1) / T);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (fn(tile(tx, ty), tx, ty)) return { tx, ty };
    return null;
  }
  function opRank() {
    const cx = Math.floor((sp.x + sp.w / 2) / T), cy = Math.floor((sp.y + sp.h / 2) / T);
    return tile(cx, cy) === "|";
  }

  function bots() {
    sp.x += sp.vx;
    const hx = overlapTiles(sp.x, sp.y, sp.w, sp.h, solid);
    if (hx) {
      if (sp.vx > 0) sp.x = hx.tx * T - sp.w; else if (sp.vx < 0) sp.x = (hx.tx + 1) * T;
      sp.vx = 0;
    }
    const vorigeOnder = sp.y + sp.h;
    sp.y += sp.vy;
    sp.grond = false;
    const x0 = Math.floor(sp.x / T), x1 = Math.floor((sp.x + sp.w - 1) / T);
    if (sp.vy > 0) {
      const ty = Math.floor((sp.y + sp.h) / T);
      for (let tx = x0; tx <= x1; tx++) {
        const c = tile(tx, ty);
        const eenrichting = (c === "=" || c === "~") && vorigeOnder <= ty * T + .01;
        if (solid(c) || eenrichting) {
          sp.y = ty * T - sp.h; sp.vy = 0; sp.grond = true; sp.plat = null;
          for (let k = x0; k <= x1; k++) if (tile(k, ty) === "~" && !wiebel.has(k + "," + ty)) wiebel.set(k + "," + ty, { t: 0, weg: false });
          break;
        }
      }
    } else if (sp.vy < 0) {
      const ty = Math.floor(sp.y / T);
      let raak = null;
      const mid = sp.x + sp.w / 2;
      for (let tx = x0; tx <= x1; tx++) if (solid(tile(tx, ty)) && (raak === null || Math.abs((tx + .5) * T - mid) < Math.abs((raak + .5) * T - mid))) raak = tx;
      if (raak !== null) { sp.y = (ty + 1) * T; sp.vy = .5; kop(raak, ty); }
    }
    if (sp.vy >= 0) for (const p of ents) {
      if (p.type !== "plat") continue;
      const px = p.x - 24, py = p.y - 4;
      if (sp.x + sp.w > px && sp.x < px + 48 && vorigeOnder <= p.vorigeY - 4 + 2 && sp.y + sp.h >= py) {
        sp.y = py - sp.h; sp.vy = 0; sp.grond = true; sp.plat = p;
      }
    }
    return vorigeOnder;
  }

  function kop(tx, ty) {
    const c = tile(tx, ty);
    bumps.set(tx + "," + ty, 10);
    if (c === "?") {
      grid[ty][tx] = "u";
      bloemen++; sfx.bloem();
      deeltjes.push({ x: tx * T + 8, y: ty * T - 4, vx: 0, vy: -2.4, life: 34, soort: "bloem" });
    } else if (c === "S") {
      schakel = !schakel; sfx.klik();
      for (let i = 0; i < 48 && overlapTiles(sp.x, sp.y, sp.w, sp.h, solid); i++) sp.y--;
      toonBanner(schakel ? "Lila aan, roze uit!" : "Roze aan, lila uit!");
    } else sfx.bonk();
  }

  function au(vanX) {
    if (sp.inv > 0) return;
    if (!rustig) harten--;
    sp.inv = 100; sp.vy = -3.2; sp.vx = (sp.x + sp.w / 2 < vanX ? -1 : 1) * 2.2; sp.klim = false; sp.plat = null;
    sfx.au();
    if (harten <= 0) opnieuwBijCheck(true);
  }
  function opnieuwBijCheck(leeg) {
    if (leeg) harten = 3;
    const p = check || start;
    Object.assign(sp, { x: p.x, y: p.y, vx: 0, vy: 0, klim: false, inv: 60, plat: null });
    toonBanner(leeg ? "Nog een keer!" : "Oeps!");
  }
  function toonBanner(tekst) { banner = { tekst, t: 110 }; }

  // ---------- Update ----------
  function update() {
    frame++; tijd++;
    for (const [k, v] of bumps) v <= 1 ? bumps.delete(k) : bumps.set(k, v - 1);
    for (const [k, w] of wiebel) {
      w.t++;
      if (w.t === 32) {
        w.weg = true; sfx.krak();
        const [tx, ty] = k.split(",").map(Number);
        deeltjes.push({ x: tx * T + 8, y: ty * T + 4, vx: 0, vy: 1, life: 40, soort: "tak" });
      }
      if (w.t > 260) wiebel.delete(k);
    }

    for (const o of ents) {
      o.t++;
      if (o.type === "plat") {
        o.vorigeY = o.y; const vx = o.x;
        const a = (o.t / o.per) * Math.PI * 2 + (o.fase || 0);
        o.x = o.x0 + Math.sin(a) * o.ax * T;
        o.y = o.y0 + Math.sin(a) * o.ay * T;
        o.dx = o.x - vx; o.dy = o.y - o.vorigeY;
      } else if (o.type === "wolk") {
        o.x = o.x0 + Math.sin(o.t / o.per * Math.PI * 2 + (o.fase || 0)) * o.ax * T;
        o.y = o.y0 + Math.sin(o.t / 40) * 3;
      } else if (o.type === "bij") {
        const a = o.t / o.per * Math.PI * 2 + (o.fase || 0);
        const nx = o.x0 + Math.sin(a) * o.ax * T;
        o.kant = nx >= o.x ? 1 : -1;
        o.x = nx; o.y = o.y0 + Math.sin(a * 2) * o.ay * T;
      } else if (o.type === "kaart") {
        o.x = o.x0 + Math.sin(o.t * .035) * 14;
        o.y = o.y0 + Math.sin(o.t * .07) * 6;
      } else if (o.type === "veer" && o.squash > 0) o.squash--;
    }

    if (sp.plat) { sp.x += sp.plat.dx; sp.y += sp.plat.dy; }

    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    if (dir) sp.kant = dir;
    if (sp.klimPauze > 0) sp.klimPauze--;

    // klimmen
    if (!sp.klim && sp.klimPauze <= 0 && opRank() && (inp.up || (inp.down && !sp.grond))) { sp.klim = true; sp.vx = 0; sp.vy = 0; sp.plat = null; }
    if (sp.klim) {
      if (!opRank()) sp.klim = false;
      else {
        sp.vx = dir * 1.1;
        sp.vy = ((inp.down ? 1 : 0) - (inp.up ? 1 : 0)) * 1.3;
        const cx = Math.floor((sp.x + sp.w / 2) / T), cyNieuw = Math.floor((sp.y + sp.h / 2 + sp.vy) / T);
        if (sp.vy < 0 && tile(cx, cyNieuw) !== "|") sp.vy = 0;
        if (sprongDruk) { sp.klim = false; sp.klimPauze = 14; sp.vy = -4.3; sp.vx = dir * 1.7; sfx.sprong(); }
        if (sp.vx || sp.vy) sp.anim++;
      }
    }

    if (!sp.klim) {
      const max = inp.run ? 2.6 : 1.5;
      const acc = sp.grond ? (inp.run ? .12 : .09) : .075;
      if (dir) {
        if (sp.vx * dir < 0 && sp.grond) sp.vx += dir * .2;
        sp.vx += dir * acc;
        if (Math.abs(sp.vx) > max) sp.vx = Math.sign(sp.vx) * Math.max(max, Math.abs(sp.vx) - .06);
      } else {
        const wr = sp.grond ? .12 : .02;
        sp.vx = Math.abs(sp.vx) <= wr ? 0 : sp.vx - Math.sign(sp.vx) * wr;
      }

      sp.coyote = sp.grond ? 6 : sp.coyote - 1;
      sp.buf = sprongDruk ? 6 : sp.buf - 1;
      if (sp.grond) sp.dubbel = sp.taart;
      if (sp.buf > 0 && sp.coyote > 0) {
        sp.vy = -(4.9 + Math.abs(sp.vx) * .22); sp.coyote = 0; sp.buf = 0; sp.plat = null; sfx.sprong();
      } else if (sprongDruk && !sp.grond && sp.coyote <= 0 && sp.dubbel) {
        sp.vy = -4.6; sp.dubbel = false; sp.buf = 0; sfx.dubbel();
        for (let i = 0; i < 8; i++) deeltjes.push({ x: sp.x + sp.w / 2, y: sp.y + sp.h, vx: Math.cos(i * .785) * 1.4, vy: Math.sin(i * .785) * .8 + .4, life: 22, soort: "blaadje", kl: C.blossom[i % 5] });
      }
      const g = sp.vy < 0 && inp.jump ? .19 : .36;
      sp.vy = Math.min(sp.vy + g, 5.2);
      // wind blaast omhoog
      for (const o of ents) {
        if (o.type !== "wind") continue;
        const cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2;
        if (cx > o.tx * T && cx < (o.tx + o.w) * T && cy > o.ty * T && cy < (o.ty + o.h) * T) {
          sp.vy = Math.max(sp.vy - .62, -3); sp.coyote = 0;
        }
      }
      sp.anim += Math.abs(sp.vx) * .5;
    }
    sprongDruk = false;

    const wasPlat = sp.plat;
    const vorigeOnder = bots();
    if (wasPlat && sp.plat === wasPlat && !sp.grond) sp.plat = null;
    if (sp.plat && (sp.x + sp.w < sp.plat.x - 24 || sp.x > sp.plat.x + 24)) sp.plat = null;
    if (sp.inv > 0) sp.inv--;

    // springbloemen
    for (const o of ents) {
      if (o.type !== "veer" || sp.vy < 0) continue;
      const top = o.ty * T - 12;
      if (Math.abs(sp.x + sp.w / 2 - o.x) < 11 && sp.y + sp.h >= top && vorigeOnder <= top + 6) {
        sp.y = top - sp.h; sp.vy = -7.4; sp.grond = false; sp.plat = null; sp.coyote = 0;
        sp.dubbel = sp.taart; o.squash = 10; sfx.boing();
      }
    }

    const br = overlapTiles(sp.x + 2, sp.y + 2, sp.w - 4, sp.h - 2, (c, tx, ty) => c === "^" && sp.y + sp.h > ty * T + 7);
    if (br) au(br.tx * T + 8);

    if (sp.y > ROWS * T + 30) {
      if (!rustig) harten--;
      sfx.au();
      opnieuwBijCheck(harten <= 0);
    }

    const cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2;
    for (const o of ents) {
      if (o.weg) continue;
      const dx = Math.abs(o.x - cx), dy = Math.abs(o.y - cy);
      switch (o.type) {
        case "bloem":
          if (dx < 10 && dy < 15) { o.weg = true; bloemen++; sfx.bloem(); deeltjes.push({ x: o.x, y: o.y, vx: 0, vy: -.6, life: 18, soort: "ster" }); }
          break;
        case "kaart":
          if (dx < 11 && dy < 16) {
            o.weg = true; kaarten.add(o.id); sfx.kaart();
            toonBanner(`Kaartje ${kaarten.size} van ${totaalKaarten}!`);
            for (let i = 0; i < 12; i++) deeltjes.push({ x: o.x, y: o.y, vx: Math.cos(i * .52) * 1.6, vy: Math.sin(i * .52) * 1.6, life: 30, soort: "blaadje", kl: C.blossom[i % 5] });
          }
          break;
        case "hart":
          if (dx < 10 && dy < 15) { o.weg = true; harten = Math.min(harten + 1, 5); sfx.hart(); }
          break;
        case "taart":
          if (dx < 11 && dy < 15) { o.weg = true; sp.taart = true; sp.dubbel = true; sfx.taart(); toonBanner("Taart! Dubbele sprong"); }
          break;
        case "sleutel":
          if (dx < 10 && dy < 15) {
            o.weg = true; sleutel = true; sfx.sleutel(); toonBanner("Het hek gaat open!");
            for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < N; tx++) if (grid[ty][tx] === "D") {
              grid[ty][tx] = ".";
              deeltjes.push({ x: tx * T + 8, y: ty * T + 8, vx: (Math.random() - .5) * 2, vy: -1.5, life: 30, soort: "blaadje", kl: C.barkHi });
            }
          }
          break;
        case "wolk":
          if (dx < 13 && dy < 14) au(o.x);
          break;
        case "bij":
          if (dx < 9 && dy < 9) au(o.x);
          break;
        case "check":
          if (!o.aan && dx < 12 && dy < 20) { o.aan = true; check = { x: o.x - sp.w / 2, y: o.y - 8 - sp.h }; sfx.vlag(); toonBanner("Taartje bewaard!"); }
          break;
        case "doel":
          if (dx < 14 && dy < 30) klaar();
          break;
      }
    }

    camLook += ((sp.kant * 28) - camLook) * .04;
    const doel = sp.x + sp.w / 2 - W / 2 + camLook;
    cam += (doel - cam) * .12;
    cam = Math.max(0, Math.min(N * T - W, cam));

    for (const d of deeltjes) { d.x += d.vx; d.y += d.vy; if (d.soort !== "bloem") d.vy += .05; d.life--; }
    deeltjes = deeltjes.filter(d => d.life > 0);
    if (banner && --banner.t <= 0) banner = null;
  }

  function klaar() {
    if (staat !== "spel") return;
    staat = "klaar"; sfx.klaar();
    const L = LEVELS[lvl];
    const vorig = voortgang.klaar[lvl];
    voortgang.klaar[lvl] = Math.max(vorig ?? 0, kaarten.size);
    bewaar();
    const laatste = lvl === LEVELS.length - 1;
    const sec = Math.round(tijd / 60);
    document.getElementById("spelTitel").textContent = laatste ? "Bloesemland uitgespeeld!" : `${L.naam} gehaald!`;
    document.getElementById("spelScore").textContent =
      `${bloemen} bloemen · ${kaarten.size} van ${totaalKaarten} kaartjes · ${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    const w = (typeof WENSEN !== "undefined" ? WENSEN : []).find(x => x.van === L.host && !x.wens.startsWith("Hier komt"));
    const label = document.getElementById("spelLabel");
    // Alleen een label als dit teamlid een wens op de kaart heeft.
    if (w) {
      document.getElementById("spelWens").textContent = w.wens;
      document.getElementById("spelVan").textContent = w.groet || "— " + w.van;
    }
    label.hidden = !w;
    let extra;
    if (laatste) {
      const totaal = Object.values(voortgang.klaar).reduce((a, b) => a + b, 0);
      extra = `Het hele kernteam juicht voor je, Wendy. Je vond ${totaal} van de ${LEVELS.length * 5} kaartjes.`;
    } else if (kaarten.size === totaalKaarten) extra = "Alle kaartjes gevonden. Knap gedaan!";
    else extra = `Er fladderen nog ${totaalKaarten - kaarten.size} kaartje${totaalKaarten - kaarten.size === 1 ? "" : "s"} rond. Durf je nog een keer?`;
    document.getElementById("spelExtra").textContent = extra;
    document.getElementById("spelNaarKaart").textContent = laatste ? "Naar de kaart" : "Volgend level";
    setTimeout(() => { if (staat === "klaar") einde.hidden = false; }, 900);
  }

  // ---------- Tekenen ----------
  function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function patroon(rows, x, y, kleuren, schaal = 1) {
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) {
      const k = kleuren[rows[j][i]];
      if (k) rect(x + i * schaal, y + j * schaal, Math.ceil(schaal), Math.ceil(schaal), k);
    }
  }
  const HART = [".XX.XX.", "XHXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."];
  const KELK = ["p.p.p", "pPpPp", "pPPPp", ".pPp.", "..g..", "..g.."];
  const TAART = ["....r....", "...rRr...", ".wwwwwww.", "wpwpwpwpw", "PPPPPPPPP", "ppppppppp", "PPPPPPPPP", ".bbbbbbb."];
  const SLEUTEL = [".ggg.......", "g...g......", "g...gggggg.", "g...g..g.g.", ".ggg..... ."];
  const taartKleur = (aan = true) => ({ r: "#d8304f", R: "#ff6f8a", w: C.white, p: aan ? C.pink : "#d9cbd3", P: aan ? C.pinkLo : "#b9a9b3", b: C.kraftLo });

  let luchtVoor = null, luchtGrad = null;
  function achtergrond(k = cam) {
    if (luchtVoor !== thema) {
      luchtGrad = ctx.createLinearGradient(0, 0, 0, H);
      luchtGrad.addColorStop(0, thema.sky[0]); luchtGrad.addColorStop(1, thema.sky[1]);
      luchtVoor = thema;
    }
    ctx.fillStyle = luchtGrad; ctx.fillRect(0, 0, W, H);
    if (thema.sterren) for (let i = 0; i < 40; i++) {
      const sx = (i * 73 - k * .05) % W, sy = (i * 37) % 110 + 18;
      rect((sx + W) % W, sy, 1, 1, (frame + i * 7) % 90 < 70 ? "#fff8e0" : "#8c84b8");
    }
    if (thema.zon) {
      const zy = thema.laag ? 108 : 30;
      rect(196, zy, 18, 18, thema.zon); rect(193, zy + 3, 24, 12, thema.zon); rect(199, zy - 3, 12, 24, thema.zon);
    }
    if (thema.maan) { rect(196, 30, 16, 16, thema.maan); rect(193, 33, 22, 10, thema.maan); rect(201, 31, 9, 9, thema.sky[0]); }
    const c1 = k * .15, c2 = k * .3;
    for (let x = 0; x < W; x += 2) {
      const h1 = 128 + Math.sin((x + c1) / 47) * 12 + Math.sin((x + c1) / 19) * 4;
      rect(x, h1, 2, H - h1, thema.hill[0]);
      const h2 = 150 + Math.sin((x + c2) / 37 + 2) * 10 + Math.sin((x + c2) / 13) * 3;
      rect(x, h2, 2, H - h2, thema.hill[1]);
    }
    const c3 = k * .5;
    const eerste = Math.floor(c3 / 90) - 1;
    for (let i = eerste; i < eerste + 5; i++) boom(i * 90 - c3 + ((i * 37) % 30), 172, i);
    if (thema.slingers) {
      const o = (k * .5) % 24;
      for (let x = -o; x < W; x += 12) {
        const y = 22 + Math.round(Math.sin((x + k * .5) / 30) * 3);
        rect(x, y, 12, 1, C.kraftLo);
        patroon(["XXXXX", ".XXX.", "..X.."], x + 3, y + 1, { X: C.blossom[Math.abs(Math.round((x + k * .5) / 12)) % 5] });
      }
    }
  }
  function boom(x, y, seed) {
    const kl = thema.boom || C.blossom;
    rect(x + 10, y - 30, 4, 34, thema.sterren ? "#4e3a50" : C.trunk);
    rect(x + 4, y - 26, 8, 2, thema.sterren ? "#4e3a50" : C.trunk); rect(x + 13, y - 34, 8, 2, thema.sterren ? "#4e3a50" : C.trunk);
    let s = Math.abs(seed * 9301 + 49297);
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let q = 0; q < 16; q++) {
      const bx = x + 12 + (r() - .5) * 34, by = y - 40 + (r() - .5) * 22;
      rect(bx - 4, by - 3, 8, 6, kl[q % kl.length]); rect(bx - 3, by - 4, 6, 8, kl[q % kl.length]);
    }
  }
  function voorgrondWeer() {
    if (thema.regen) for (let i = 0; i < 46; i++) {
      const x = ((i * 53 + frame * 1.5) % (W + 20)) - 10, y = ((i * 97 + frame * 5) % (H + 20)) - 10;
      rect(x, y, 1, 4, "rgba(120,140,200,.55)");
    }
    if (thema.sterren) for (let i = 0; i < 7; i++) {
      const x = ((i * 61 - cam * .8) % W + W) % W + Math.sin(frame / 50 + i) * 6, y = 60 + (i * 23) % 100 + Math.sin(frame / 37 + i * 2) * 5;
      if ((frame + i * 13) % 80 < 60) { rect(x, y, 2, 2, "#fff3a0"); rect(x - 1, y - 1, 4, 4, "rgba(255,243,160,.25)"); }
    }
  }

  function tekenTile(c, tx, ty) {
    const b = bumps.get(tx + "," + ty);
    const x = tx * T - Math.round(cam), y = ty * T - (b ? Math.round(Math.sin(b / 10 * Math.PI) * 4) : 0);
    const v = (tx * 7 + ty * 13) % 5;
    switch (c) {
      case "#":
        rect(x, y, T, T, C.dirt);
        rect(x + (v * 3) % 12 + 1, y + 6 + v, 2, 2, C.dirtLo);
        rect(x + (v * 5 + 7) % 13, y + 11, 2, 1, C.dirtHi);
        if (tile(tx, ty - 1) !== "#") {
          rect(x, y, T, 5, C.grass); rect(x, y, T, 1, C.grassHi); rect(x, y + 5, T, 1, C.grassLo);
          rect(x + 2 + v, y - 1, 1, 1, C.grassHi); rect(x + 9 + (v % 3), y - 2, 1, 2, C.grass);
          if (v === 2) { rect(x + 12, y - 3, 3, 2, C.pink); rect(x + 13, y - 1, 1, 1, C.grassLo); }
        }
        break;
      case "B":
        rect(x, y, T, T, C.barkLo); rect(x + 1, y + 1, T - 2, T - 2, C.bark);
        rect(x + 3, y + 4, 10, 1, C.barkHi); rect(x + 3, y + 10, 8, 1, C.barkHi); rect(x + 5, y + 7, 7, 1, C.barkLo);
        break;
      case "?": {
        rect(x, y, T, T, C.pinkLo); rect(x + 1, y + 1, T - 2, T - 2, C.pink);
        rect(x + 1, y + 1, T - 2, 1, C.pinkHi); rect(x + 1, y + 1, 1, T - 2, C.pinkHi);
        const knip = (frame >> 4) % 2 ? C.white : C.pinkHi;
        rect(x + 7, y + 3, 2, 3, knip); rect(x + 7, y + 10, 2, 3, knip); rect(x + 3, y + 7, 3, 2, knip); rect(x + 10, y + 7, 3, 2, knip);
        rect(x + 7, y + 7, 2, 2, C.gold);
        break;
      }
      case "u":
        rect(x, y, T, T, C.barkLo); rect(x + 1, y + 1, T - 2, T - 2, "#a27c6a");
        rect(x + 3, y + 3, 1, 1, C.barkLo); rect(x + 12, y + 3, 1, 1, C.barkLo); rect(x + 3, y + 12, 1, 1, C.barkLo); rect(x + 12, y + 12, 1, 1, C.barkLo);
        break;
      case "=":
        rect(x, y + 2, T, 5, C.bark); rect(x, y + 2, T, 1, C.barkHi); rect(x, y + 6, T, 1, C.barkLo);
        if (v === 1 || v === 3) { rect(x + 5, y - 1, 4, 3, C.leaf); rect(x + 6, y - 1, 2, 1, C.leafHi); }
        if (v === 0) { rect(x + 9, y - 2, 4, 3, C.blossom[tx % 5]); rect(x + 10, y - 3, 2, 1, C.blossom[(tx + 2) % 5]); }
        break;
      case "~": {
        const w = wiebel.get(tx + "," + ty);
        const tril = w && !w.weg ? ((frame >> 1) % 2 ? 1 : -1) : 0;
        const xx = x + tril;
        rect(xx, y + 2, T, 5, "#a37d5f"); rect(xx, y + 2, T, 1, "#c49c7a"); rect(xx, y + 6, T, 1, C.bark);
        rect(xx + 4, y + 3, 1, 3, C.bark); rect(xx + 10, y + 4, 1, 2, C.bark);
        if (v % 2) { rect(xx + 7, y, 3, 2, C.leafHi); }
        break;
      }
      case "^":
        for (let i = 0; i < 3; i++) {
          const bx = x + i * 5;
          rect(bx, y + 9, 6, 7, C.thorn); rect(bx + 1, y + 7, 4, 3, C.thorn);
          rect(bx + 2, y + 5, 1, 2, C.thornHi); rect(bx, y + 8, 1, 1, C.thornHi); rect(bx + 5, y + 8, 1, 1, C.thornHi);
        }
        rect(x + 4, y + 11, 2, 2, "#8c2f5a"); rect(x + 11, y + 12, 2, 2, "#8c2f5a");
        break;
      case "|":
        rect(x + 7, y, 2, T, C.leaf); rect(x + 7, y, 1, T, C.leafHi);
        if (ty % 2) { rect(x + 2, y + 4, 5, 3, C.leaf); rect(x + 3, y + 4, 2, 1, C.leafHi); }
        else { rect(x + 9, y + 9, 5, 3, C.leaf); rect(x + 11, y + 9, 2, 1, C.leafHi); }
        if (ty % 3 === 0) { rect(x + 10, y + 2, 3, 3, C.lilac); rect(x + 11, y + 3, 1, 1, C.white); }
        break;
      case "S": {
        const k = schakel ? [C.lilacLo, C.lilac, C.lilacHi] : [C.pinkLo, C.pink, C.pinkHi];
        rect(x, y, T, T, k[0]); rect(x + 1, y + 1, T - 2, T - 2, k[1]); rect(x + 1, y + 1, T - 2, 1, k[2]);
        rect(x + 7, y + 3, 2, 7, C.white); rect(x + 7, y + 11, 2, 2, C.white);
        break;
      }
      case "A": case "a": {
        const k = c === "A" ? [C.pinkLo, C.pink] : [C.lilacLo, C.lilac];
        if (solid(c)) {
          rect(x, y, T, T, k[0]); rect(x + 1, y + 1, T - 2, T - 2, k[1]);
          rect(x + 4, y + 4, 8, 8, k[0]); rect(x + 5, y + 5, 6, 6, k[1]);
        } else {
          for (let i = 0; i < T; i += 4) { rect(x + i, y, 2, 1, k[0]); rect(x + i, y + T - 1, 2, 1, k[0]); rect(x, y + i, 1, 2, k[0]); rect(x + T - 1, y + i, 1, 2, k[0]); }
        }
        break;
      }
      case "D":
        rect(x + 1, y, 3, T, C.barkHi); rect(x + 6, y, 3, T, C.barkHi); rect(x + 11, y, 3, T, C.barkHi);
        rect(x, y + 3, T, 2, C.bark); rect(x, y + 11, T, 2, C.bark);
        if (tile(tx, ty + 2) === "D" && tile(tx, ty + 3) !== "D") { rect(x + 5, y + 6, 6, 5, C.gold); rect(x + 7, y + 8, 2, 2, C.barkLo); }
        break;
    }
  }

  // Getekend placeholder-poppetje, 16x22. Wordt later vervangen door de sprites.
  function persoon(x, y, L, pose, f, kant) {
    x = Math.round(x); y = Math.round(y);
    const r = (lx, ly, w, h, c) => rect(kant > 0 ? x + lx : x + 16 - lx - w, y + ly, w, h, c);
    let la = 0, lb = 0, ta = 0, tb = 0, arm = 0;
    if (pose === "loop" || pose === "ren") {
      const s = pose === "ren" ? 2 : 1;
      const fase = [[1, -1], [0, 0], [-1, 1], [0, 0]][f % 4];
      la = fase[0] * s; lb = fase[1] * s; ta = fase[0] < 0 ? 1 : 0; tb = fase[1] < 0 ? 1 : 0; arm = -fase[0] * s;
    }
    if (pose === "spring") { la = 2; lb = -1; ta = 2; }
    if (pose === "val") { la = -1; lb = 2; tb = 1; }

    if (pose === "klim") { const o = f % 2; r(3, 2 + o * 3, 2, 7, L.topLo); r(3, 1 + o * 3, 2, 1, L.skin); }
    else if (pose === "juich" || pose === "zwaai") { r(4, 4, 2, 6, L.topLo); r(4, 3, 2, 1, L.skin); }
    else { r(5 - arm, 10, 2, 5, L.topLo); r(5 - arm, 15, 2, 1, L.skin); }
    r(6 + lb, 16, 2, 5 - tb, L.legs); r(6 + lb, 21 - tb, 3, 1, L.shoes);
    r(5, 9, 6, 7, L.top); r(5, 9, 1, 7, L.topLo); r(7, 8, 2, 1, L.skin);
    if (L.streep) { r(5, 10, 6, 1, L.streep); r(5, 12, 6, 1, L.streep); r(5, 14, 6, 1, L.streep); }
    r(8 + la, 16, 2, 5 - ta, L.legs); r(8 + la, 21 - ta, 3, 1, L.shoes);
    if (L.shorts) { r(6 + lb, 19, 2, 2 - tb, L.skin); r(8 + la, 19, 2, 2 - ta, L.skin); }
    r(5, 2, 6, 6, L.skin);
    r(9, 4, 1, 1, C.ink); r(10, 6, 1, 1, "#c9677f"); r(10, 5, 1, 1, "#f3a7b5");
    if (L.baard) { r(6, 6, 5, 2, L.baard); r(10, 6, 1, 1, "#c9677f"); }
    if (L.zonnebril) { r(7, 4, 4, 2, L.zonnebril); r(6, 4, 1, 1, L.zonnebril); r(8, 4, 1, 1, "#4a4a55"); }
    if (L.bril) { r(8, 3, 3, 1, L.bril); r(8, 5, 3, 1, L.bril); r(8, 3, 1, 3, L.bril); r(10, 3, 1, 3, L.bril); r(6, 4, 2, 1, L.bril); }
    switch (L.stijl) {
      case "lang":
        r(4, 0, 7, 2, L.hair); r(5, 0, 4, 1, L.hairHi); r(3, 1, 3, 9, L.hair); r(4, 9, 2, 1, L.hairHi);
        r(5, 2, 4, 1, L.hair); r(10, 1, 1, 2, L.hair); r(3, 3, 1, 1, L.hairHi); r(3, 6, 1, 1, L.hairHi);
        break;
      case "bob":
        r(4, 0, 7, 2, L.hair); r(5, 0, 4, 1, L.hairHi); r(3, 1, 3, 7, L.hair); r(5, 2, 5, 1, L.hair); r(10, 1, 1, 3, L.hair);
        break;
      case "kort":
        r(4, 0, 7, 2, L.hair); r(4, 2, 2, 3, L.hair); r(5, 0, 3, 1, L.hairHi);
        break;
      case "halflang":
        r(4, 0, 7, 2, L.hair); r(5, 0, 4, 1, L.hairHi); r(3, 1, 3, 5, L.hair); r(10, 1, 1, 3, L.hair); r(6, 2, 3, 1, L.hair);
        break;
      case "kaal":
        r(5, 1, 6, 1, L.skin); r(6, 1, 3, 1, "#f8d8c0"); r(4, 3, 2, 3, L.hair);
        break;
      case "krul":
        r(3, 0, 9, 3, L.hair); r(3, 3, 3, 5, L.hair); r(11, 1, 1, 3, L.hair);
        r(4, 0, 1, 1, L.hairHi); r(7, 1, 1, 1, L.hairHi); r(10, 0, 1, 1, L.hairHi); r(3, 5, 1, 1, L.hairHi);
        break;
    }
    if (pose === "klim") { const o = (f + 1) % 2; r(11, 2 + o * 3, 2, 7, L.top); r(11, 1 + o * 3, 2, 1, L.skin); }
    else if (pose === "spring") { r(9, 5, 2, 5, L.top); r(9, 4, 2, 1, L.skin); }
    else if (pose === "juich" || (pose === "zwaai" && (f >> 1) % 2)) { r(10, 3, 2, 6, L.top); r(10, 2, 2, 1, L.skin); }
    else { r(8 + arm, 10, 2, 5, L.top); r(8 + arm, 15, 2, 1, L.skin); }
  }

  function tekenEntiteiten() {
    const k = Math.round(cam);
    const mid = sp.x + sp.w / 2;
    let praat = null, praatD = 46;
    for (const o of ents) if (o.type === "npc" && Math.abs(o.x - mid) < praatD) { praat = o; praatD = Math.abs(o.x - mid); }

    for (const o of ents) {
      if (o.weg) continue;
      const x = Math.round(o.x) - k, y = Math.round(o.y);
      if (o.type !== "wind" && (x < -60 || x > W + 60)) continue;
      switch (o.type) {
        case "bloem": {
          const p = o.id % 2 ? { p: C.pink, P: C.pinkLo, g: C.leaf } : { p: C.lilac, P: C.lilacLo, g: C.leaf };
          patroon(KELK, x - 3, y - 4 + Math.round(Math.sin(o.t / 12) * 1.5), p, 1.4);
          break;
        }
        case "kaart": {
          const w = (o.t >> 3) % 2 ? 7 : 9;
          rect(x - w / 2, y - 5, w, 11, C.kraftLo); rect(x - w / 2 + 1, y - 4, w - 2, 9, C.kraft);
          rect(x - 1, y - 3, 2, 2, C.white); rect(x - 2, y + 1, 4, 1, C.pinkLo); rect(x - 2, y + 3, 3, 1, C.pinkLo);
          rect(x, y - 9, 1, 4, C.kraftLo);
          if ((o.t >> 4) % 3 === 0) rect(x + 5, y - 7, 1, 1, C.white);
          break;
        }
        case "hart":
          patroon(HART, x - 5, y - 4, { X: "#e0457b", H: "#ffb3cb" }, 1.4 * (1 + ((o.t >> 4) % 2) * .2));
          break;
        case "taart":
          patroon(TAART, x - 9, y - 6, taartKleur(), 2);
          if ((o.t >> 3) % 2) rect(x + 8, y - 10, 2, 2, C.gold);
          break;
        case "sleutel":
          patroon(SLEUTEL, x - 11, y - 5 + Math.round(Math.sin(o.t / 10) * 2), { g: C.gold }, 2);
          if ((o.t >> 3) % 3 === 0) rect(x + 9, y - 8, 2, 2, C.white);
          break;
        case "plat":
          rect(x - 24, y - 4, 48, 6, C.bark); rect(x - 24, y - 4, 48, 1, C.barkHi); rect(x - 24, y + 1, 48, 1, C.barkLo);
          rect(x - 27, y - 6, 5, 4, C.leaf); rect(x + 21, y - 7, 6, 4, C.leaf); rect(x - 4, y - 7, 4, 3, C.blossom[o.id % 5]);
          break;
        case "wolk":
          rect(x - 13, y - 3, 26, 8, C.cloud); rect(x - 9, y - 7, 10, 6, C.cloud); rect(x - 1, y - 9, 10, 8, C.cloud);
          rect(x - 9, y - 7, 6, 2, C.cloudHi); rect(x - 1, y - 9, 6, 2, C.cloudHi); rect(x - 13, y + 4, 26, 1, C.cloudLo);
          rect(x - 5, y - 1, 2, 2, C.ink); rect(x + 4, y - 1, 2, 2, C.ink); rect(x - 1, y + 2, 4, 1, C.ink);
          for (let i = 0; i < 3; i++) { const dy = (o.t * 2 + i * 9) % 26; rect(x - 8 + i * 8, y + 7 + dy, 1, 3, C.rain); }
          break;
        case "bij": {
          const f = (o.t >> 2) % 2, kk = o.kant || 1;
          if (thema.sterren) rect(x - 7, y - 6, 14, 12, "rgba(255,230,120,.25)");
          rect(x - 4, y - 2, 8, 6, C.bee); rect(x - 2, y - 2, 2, 6, C.beeLo); rect(x + 1, y - 2, 1, 6, C.beeLo);
          rect(kk > 0 ? x + 3 : x - 4, y - 1, 1, 1, C.ink);
          rect(kk > 0 ? x - 6 : x + 4, y + 1, 2, 1, C.beeLo);
          rect(x - 3, y - 5 - f, 3, 3, "rgba(255,255,255,.85)"); rect(x + 1, y - 5 - f, 3, 3, "rgba(255,255,255,.7)");
          break;
        }
        case "veer": {
          const top = o.ty * T - 12, base = o.ty * T, s = o.squash > 0 ? 3 : 0;
          rect(x - 1, top + 6, 2, base - top - 6, C.leaf);
          rect(x - 7, base - 4, 5, 3, C.leaf); rect(x + 2, base - 5, 5, 3, C.leaf);
          rect(x - 10, top + s, 20, 6 - s, C.pinkLo); rect(x - 9, top - 1 + s, 18, 5 - s, C.pink);
          rect(x - 6, top + s, 12, 2, C.pinkHi); rect(x - 2, top + 1 + s, 4, 2, C.gold);
          break;
        }
        case "wind": {
          const wx = o.tx * T - k, wy = o.ty * T, ww = o.w * T, wh = o.h * T;
          if (wx > W || wx + ww < 0) break;
          rect(wx, wy, ww, wh, "rgba(255,255,255,.12)");
          for (let i = 0; i < o.w * 3; i++) {
            const lx = wx + 3 + i * 5 + Math.sin((o.t + i * 20) / 15) * 2;
            const ly = wy + wh - ((o.t * 2.4 + i * 37) % wh);
            rect(lx, ly, 1, 6, "rgba(255,255,255,.75)");
          }
          break;
        }
        case "npc": {
          const ly = y - 30 - (o.juich && (o.t + o.id * 9) % 50 < 10 ? 3 : 0);
          const pose = o.juich ? "juich" : praat === o ? "zwaai" : "staan";
          persoon(x - 8, ly, o.look || LOOKS.Dave, pose, o.t >> 3, sp.x < o.x ? -1 : 1);
          break;
        }
        case "check": {
          const gy = y - 8;
          rect(x - 1, gy - 20, 2, 20, C.barkLo); rect(x - 5, gy - 2, 10, 2, C.barkLo);
          patroon(TAART, x - 9, gy - 34, taartKleur(!!o.aan), 2);
          if (o.aan) { rect(x - 1, gy - 40, 2, 6, C.white); rect(x - 1, gy - 43 + ((o.t >> 3) % 2), 2, 3, C.gold); }
          break;
        }
        case "doel": {
          rect(x - 2, y - 56, 5, 64, C.bark); rect(x - 2, y - 56, 1, 64, C.barkHi);
          rect(x - 2, y - 56, 34, 4, C.bark);
          rect(x + 26, y - 61, 6, 5, C.blossom[0]); rect(x + 8, y - 60, 5, 4, C.blossom[2]); rect(x - 7, y - 59, 6, 5, C.blossom[1]);
          const zw = Math.round(Math.sin(o.t / 25) * 2);
          rect(x + 22 + zw, y - 52, 1, 8, C.kraftLo);
          rect(x + 17 + zw, y - 44, 12, 22, C.kraftLo); rect(x + 18 + zw, y - 43, 10, 20, C.kraft);
          rect(x + 22 + zw, y - 41, 2, 2, C.white);
          rect(x + 20 + zw, y - 36, 6, 1, C.pinkLo); rect(x + 20 + zw, y - 33, 5, 1, C.pinkLo); rect(x + 20 + zw, y - 30, 6, 1, C.pinkLo);
          break;
        }
      }
    }
    if (praat && staat === "spel") ballon(Math.round(praat.x) - k, Math.round(praat.y) - 36, praat.naam, praat.tekst);
  }

  function tekstSchaduw(t, x, y, kleur = C.ink, align = "left", font = FONT) {
    ctx.font = font; ctx.textAlign = align; ctx.textBaseline = "top";
    ctx.fillStyle = C.white; ctx.fillText(t, x + 1, y + 1);
    ctx.fillStyle = kleur; ctx.fillText(t, x, y);
  }
  function ballon(x, y, naam, regels) {
    const w = Math.max(...regels.map(r => r.length), naam.length) * 8 + 10, h = regels.length * 11 + 18;
    const bx = Math.max(4, Math.min(W - w - 4, x - w / 2)), by = Math.max(20, y - h);
    rect(bx, by, w, h, C.ink); rect(bx + 1, by + 1, w - 2, h - 2, C.white);
    rect(x - 2, by + h, 5, 2, C.ink); rect(x - 1, by + h, 3, 1, C.white); rect(x - 1, by + h + 2, 3, 2, C.ink);
    ctx.font = FONT; ctx.textBaseline = "top"; ctx.textAlign = "left";
    ctx.fillStyle = C.pinkLo; ctx.fillText(naam, bx + 5, by + 5);
    ctx.fillStyle = C.ink; regels.forEach((r, i) => ctx.fillText(r, bx + 5, by + 17 + i * 11));
  }

  function hud() {
    rect(0, 0, W, 17, "rgba(62,35,64,.35)");
    for (let i = 0; i < Math.max(harten, 3); i++) {
      const vol = rustig || i < harten;
      patroon(HART, 6 + i * 11, 5, { X: vol ? "#e0457b" : "#8a6a7a", H: vol ? "#ffb3cb" : "#a58898" }, 1.3);
    }
    patroon(KELK, 70, 4, { p: C.pink, P: C.pinkLo, g: C.leaf }, 1.6);
    tekstSchaduw("x" + String(bloemen).padStart(2, "0"), 81, 5, C.white);
    for (let i = 0; i < totaalKaarten; i++) {
      const heb = i < kaarten.size;
      rect(150 + i * 10, 4, 7, 10, heb ? C.kraftLo : "rgba(255,255,255,.35)");
      if (heb) { rect(151 + i * 10, 5, 5, 8, C.kraft); rect(153 + i * 10, 6, 1, 1, C.pinkLo); }
    }
    if (sleutel) patroon(SLEUTEL, 126, 6, { g: C.gold }, 1);
    if (!rustig) {
      const sec = Math.floor(tijd / 60);
      tekstSchaduw(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`, W - 6, 5, C.white, "right");
    } else if (sp.taart) patroon(TAART, W - 24, 4, taartKleur(), 1);
  }

  function tekenSpeler() {
    if (sp.inv > 0 && (sp.inv >> 2) % 2) return;
    let pose = "staan";
    if (sp.klim) pose = "klim";
    else if (!sp.grond) pose = sp.vy < 0 ? "spring" : "val";
    else if (Math.abs(sp.vx) > 2) pose = "ren";
    else if (Math.abs(sp.vx) > .1) pose = "loop";
    const f = sp.klim ? (sp.anim >> 3) : Math.floor(sp.anim / 6);
    persoon(sp.x - 3 - Math.round(cam), sp.y, WENDY, staat === "klaar" ? "juich" : pose, f, sp.kant);
  }

  function tekenTegels() {
    const t0 = Math.floor(cam / T);
    for (let ty = 0; ty < ROWS; ty++) for (let tx = t0; tx <= t0 + 17; tx++) {
      const c = tile(tx, ty);
      if (c !== ".") tekenTile(c, tx, ty);
    }
  }

  function teken() {
    achtergrond();
    tekenTegels();
    tekenEntiteiten();
    tekenSpeler();
    for (const d of deeltjes) {
      const x = d.x - Math.round(cam);
      if (d.soort === "bloem") patroon(KELK, x - 3, d.y, { p: C.pink, P: C.pinkLo, g: C.leaf }, 1.4);
      else if (d.soort === "ster") { rect(x - 1, d.y - 3, 2, 6, C.white); rect(x - 3, d.y - 1, 6, 2, C.white); }
      else if (d.soort === "tak") { rect(x - 8, d.y, 16, 4, "#a37d5f"); rect(x - 8, d.y, 16, 1, "#c49c7a"); }
      else rect(x, d.y, 2, 2, d.kl);
    }
    voorgrondWeer();
    hud();
    if (banner) {
      const y = 44 + Math.max(0, banner.t - 100) * 2;
      ctx.font = FONT;
      const w = ctx.measureText(banner.tekst).width + 16;
      rect(W / 2 - w / 2, y - 4, w, 16, "rgba(62,35,64,.75)");
      tekstSchaduw(banner.tekst, W / 2, y, C.gold, "center");
    }
    if (pauze) {
      rect(0, 0, W, H, "rgba(62,35,64,.45)");
      tekstSchaduw("PAUZE", W / 2, 96, C.white, "center", FONT_GROOT);
      tekstSchaduw(aanraak ? "Tik om verder te gaan" : "P: verder spelen", W / 2, 122, C.white, "center");
    }
  }

  function titel() {
    thema = THEMA.dag;
    if (!grid) bouwLevel(0);
    cam = (frame * .3) % (N * T - W);
    achtergrond();
    tekenTegels();
    rect(0, 0, W, H, "rgba(253,227,238,.55)");
    tekstSchaduw("BLOESEMLAND", W / 2 + 1, 58, C.pinkLo, "center", FONT_GROOT);
    tekstSchaduw("10 tuinen van het kernteam", W / 2, 84, C.lilacLo, "center");
    persoon(W / 2 - 8, 104, WENDY, (frame >> 5) % 2 ? "zwaai" : "staan", frame >> 3, 1);
    if ((frame >> 5) % 2) tekstSchaduw(aanraak ? "TIK OM TE BEGINNEN" : "TIK OF DRUK SPATIE", W / 2, 148, C.ink, "center");
    if (aanraak) {
      tekstSchaduw("A: springen", W / 2, 178, C.ink, "center");
      tekstSchaduw("B: rennen", W / 2, 190, C.ink, "center");
    } else {
      tekstSchaduw("Pijltjes: lopen", W / 2, 172, C.ink, "center");
      tekstSchaduw("Spatie: springen", W / 2, 184, C.ink, "center");
      tekstSchaduw("Shift: rennen", W / 2, 196, C.ink, "center");
    }
  }

  // ---------- Wereldkaart ----------
  const KAART_PUNTEN = [[28, 66], [72, 54], [116, 68], [160, 54], [206, 68], [226, 116], [182, 130], [138, 116], [94, 130], [48, 120]];
  function lijn(x0, y0, x1, y1, d, kl) {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
    for (let i = 0; i <= n; i++) rect(x0 + (x1 - x0) * i / n - d / 2, y0 + (y1 - y0) * i / n - d / 2, d, d, kl);
  }
  function wereldkaart() {
    thema = THEMA.dag;
    frame++;
    achtergrond(frame * .2);
    rect(0, 0, W, H, "rgba(253,240,246,.45)");
    tekstSchaduw("BLOESEMLAND", W / 2, 12, C.pinkLo, "center", FONT_GROOT);
    for (let i = 0; i < KAART_PUNTEN.length - 1; i++) {
      const [x0, y0] = KAART_PUNTEN[i], [x1, y1] = KAART_PUNTEN[i + 1];
      lijn(x0, y0 + 3, x1, y1 + 3, 5, C.barkLo);
      lijn(x0, y0 + 2, x1, y1 + 2, 3, C.bark);
    }
    KAART_PUNTEN.forEach(([x, y], i) => {
      const klaar = voortgang.klaar[i] != null, isOpen = open(i);
      if (klaar) {
        for (let p = 0; p < 5; p++) {
          const a = p * 1.2566 + frame / 120;
          rect(x + Math.cos(a) * 5 - 3, y + Math.sin(a) * 5 - 3, 6, 6, C.blossom[(i + p) % 5]);
        }
        rect(x - 2, y - 2, 4, 4, C.gold);
        tekstSchaduw(`${voortgang.klaar[i]}/5`, x, y + 18, C.pinkLo, "center");
      } else if (isOpen) {
        const s = (frame >> 4) % 2;
        rect(x - 4 - s, y - 6 - s, 8 + s * 2, 10 + s * 2, C.pink); rect(x - 2, y - 7 - s, 4, 2, C.pinkHi); rect(x - 1, y + 4, 2, 3, C.leaf);
      } else {
        rect(x - 3, y - 4, 6, 7, "#b9a9b3"); rect(x - 1, y + 3, 2, 2, C.leaf);
      }
      ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = isOpen ? C.ink : "#a58898";
      ctx.fillText(String(i + 1), x, y + 8);
    });
    const [kx, ky] = KAART_PUNTEN[kies];
    persoon(kx - 8, ky - 30 + Math.round(Math.sin(frame / 10)), WENDY, "zwaai", frame >> 3, 1);
    const L = LEVELS[kies];
    rect(10, 164, W - 20, 50, "rgba(62,35,64,.82)");
    tekstSchaduw(`${kies + 1}. ${L.naam}`, W / 2, 172, C.gold, "center");
    const k = voortgang.klaar[kies];
    tekstSchaduw(k != null ? `Gehaald - ${k} van 5 kaartjes` : `Tuin van ${L.host}`, W / 2, 186, C.white, "center");
    if ((frame >> 5) % 2) tekstSchaduw(aanraak ? "A: spelen" : "Spatie: spelen", W / 2, 200, C.pinkHi, "center");
  }

  // ---------- Lus ----------
  let vorige = performance.now(), acc = 0;
  function lus(nu) {
    requestAnimationFrame(lus);
    const dt = Math.min(100, nu - vorige); vorige = nu;
    if (!inBeeld || document.hidden) return;
    if (staat === "titel") { frame++; titel(); return; }
    if (staat === "kaart") { wereldkaart(); return; }
    if (!pauze && staat === "spel") {
      acc += dt;
      let n = 0;
      while (acc >= 1000 / 60 && n < 5) { update(); acc -= 1000 / 60; n++; }
    } else if (staat === "klaar") {
      frame++;
      for (const o of ents) o.t++;
      for (const d of deeltjes) { d.x += d.vx; d.y += d.vy; d.life--; }
    }
    teken();
  }
  cv.addEventListener("pointerdown", () => { if (pauze && staat === "spel") pauze = false; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { inBeeld = es[0].isIntersecting; if (!inBeeld && staat === "spel") pauze = true; }, { threshold: .25 }).observe(scherm);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden && staat === "spel") pauze = true; });

  ctx.imageSmoothingEnabled = false;
  kies = eersteOpen();
  const go = () => requestAnimationFrame(lus);
  if (document.fonts?.load) document.fonts.load(FONT).then(go, go); else go();
})();
