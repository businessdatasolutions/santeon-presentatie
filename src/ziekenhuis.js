/* Praatplaat bij blok 1 (Waarom): een maquette van een ziekenhuis met de cijfers uit de
   AI Monitor Ziekenhuizen 2026 (M&I/Partners, maart 2026) op de plek waar ze horen.
   Eerst de hele plaat. Daarna zoomt de camera per stap in op een ruimte: 1a in de bestuurskamer,
   1b langs de afdelingen, 1c bij kwaliteit en in de AI-regiegroep, 1d het patroon "AI selecteert,
   de mens beslist" op de radiologie en daarna bij de VIM-meldingen. Tot slot weer de hele plaat.
   Three.js tekent de maquette (ziekenhuis-maquette.js), D3 de grafieken, motion de overgangen.
   Vast script, geen netwerkaanroepen. Spreker stuurt: → / ← / spatie / klikker, #stap-N.
   AI-markering (zwart, geel, Bot-icoon) alleen voor wat AI doet; de cijfers zelf zijn mensenwerk.
   Paginanummers (p.) verwijzen naar background-material/2026-03-ai-monitor-ziekenhuizen-2026-mxi.pdf. */

import * as THREE from "three";
import * as d3 from "d3";
import "d3-transition"; // voor .transition(); zonder deze regel laat vite build het weg (d3: sideEffects false)
import { animate, stagger } from "motion";
import { bouwMaquette, zetNacht, KAMERS, NAMEN } from "./ziekenhuis-maquette.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const T = (s) => (reduce ? 0 : s);
const $ = (id) => document.getElementById(id);

// lucide "bot", "user-round" en "hand"
const BOT = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
const MENS = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
const HAND = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>';

/* ================= De cijfers (AI Monitor Ziekenhuizen 2026) ================= */

// [proces, %, ruimte in de maquette] (p. 27)
const PROCESSEN = [["Administratie en facturatie", 80, "admin"], ["Diagnostiek", 71, "radiologie"], ["Communicatie", 65, "balie"], ["Onderzoek", 53, "lab"], ["Zorglogistiek", 49, "gang"]];
const SCHAAL = [["Zeer klein of niet", 4], ["Klein", 42], ["Gemiddeld", 46], ["Groot", 8], ["Zeer groot", 0]]; // p. 25, grafiek 2026
const RADIOLOGIE = [["2024", 78], ["2025", 62], ["2026", 41]]; // p. 28, afgeleid uit 41% (-21 en -37)
const BELEID = [["2024", 30], ["2025", 50], ["2026", 76]]; // p. 16

// Label boven elke ruimte in het overzicht: [cijfer, wat het meet]. De naam van de ruimte staat op de vloer.
const KAMERLABEL = {
  bestuur: ["90%", "generatieve AI"],
  regie: ["60%", "heeft een AI-board"],
  radiologie: ["71%", "diagnostiek"],
  lab: ["53%", "onderzoek"],
  balie: ["65%", "communicatie"],
  poli: ["69%", "spraak: begonnen"],
  admin: ["80%", "administratie"],
  kwaliteit: ["–", "kwaliteit: niet gemeten"],
  gang: ["49%", "zorglogistiek"],
};

// Labels bij een ding in een ruimte. ai = AI-markering; mens = mens-icoon; aan = geel accent.
const ROEP = {
  ct: { tekst: "CT: fractuurdetectie" },
  aiRadio: { tekst: "AI: eerste selectie", ai: true },
  radioloog: { tekst: "Radioloog beslist", mens: true, aan: true },
  aiPoli: { tekst: "AI vat het consult samen", ai: true },
  balieAI: { tekst: "AI: chatbot", ai: true },
  adminAI: { tekst: "AI: ICD-10-codering", ai: true },
  kwStapel: { tekst: "VIM-meldingen" },
  aiKw: { tekst: "AI: signaal (prototype)", ai: true },
  kwAdviseur: { tekst: "Kwaliteitsadviseur beslist", mens: true, aan: true },
  regie0: { tekst: 'Manager Kwaliteit: alleen bij "anders"', aan: true },
  regie1: { tekst: "CMIO of CNIO · 82%" },
  regie2: { tekst: "CIO of ICT · 70%" },
  regie3: { tekst: "Klinisch fysicus · 50%" },
  regie4: { tekst: "Informatiemanager · 43%" },
};

/* ================= Het script ================= */

const kamerCam = (id, zoom) => {
  const k = KAMERS[id];
  return { tx: (k.x[0] + k.x[1]) / 2, tz: (k.z[0] + k.z[1]) / 2, ty: 0.8, zoom, az: 0.3, el: 0.86 };
};
const OVERZICHT = { tx: 0, tz: 0.3, ty: 0.8, zoom: "pas", az: 0.2, el: 0.92 };

const STAPPEN = [
  { plaat: true, cam: OVERZICHT, kamers: true,
    laag: "Blok 1 · Waarom", titel: "Een ziekenhuis in de AI Monitor 2026",
    tekst: ["52 ziekenhuizen deden mee, ook alle zeven Santeon-ziekenhuizen. Elke ruimte toont een cijfer uit de monitor."] },
  { focus: ["bestuur"], cam: { tx: -11.6, tz: -7.0, ty: 1.9, zoom: 2.35, az: 0.12, el: 0.78 }, actie: "scherm",
    laag: "1a · Hoe snel gaat het?", titel: "Van nieuw naar bijna overal",
    tekst: ["Het MT ziet de groei van generatieve AI.", "In drie jaar ging het van 57% naar 90% van de ziekenhuizen."], bron: "p. 30" },
  { focus: ["bestuur"], cam: { tx: -10.2, tz: -7.6, ty: 2.1, zoom: 2.9, az: 0.12, el: 0.78 }, actie: "bord", grafiek: "schaal",
    laag: "1a · Hoe snel gaat het?", titel: "Breed, maar nog niet diep",
    tekst: ["Een ziekenhuis heeft gemiddeld 18 AI-toepassingen. Eén is opgeschaald.", "Op welke schaal gebruikt het ziekenhuis AI? (2026)"],
    na: ["Opbrengst in drie jaar: in de meeste ziekenhuizen geen effect. 47% meldt hogere zorgkosten."], bron: "p. 25, 26 en 37" },
  { rondgang: true, cam: OVERZICHT, kamers: true, grafiek: "processen",
    laag: "1b · Waar zit AI al?", titel: "In bijna elk proces",
    tekst: ["Aandeel van de ziekenhuizen met AI in dit proces."], bron: "p. 27" },
  { focus: ["radiologie"], cam: { ...kamerCam("radiologie", 2.3), tx: 3.0 }, roep: ["ct", "aiRadio"], grafiek: "radiologie",
    laag: "1b · Waar zit AI al?", titel: "Van de radiologie naar het hele ziekenhuis",
    tekst: ["Aandeel van de ziekenhuizen dat de radiologie noemt bij de belangrijkste AI-toepassingen."],
    na: ["Een voorbeeld op de radiologie: fractuurdetectie."], bron: "p. 28 en 41" },
  { focus: ["poli", "balie"], cam: { tx: -8.2, tz: 5.8, ty: 0.8, zoom: 1.75, az: 0.3, el: 0.86 }, roep: ["aiPoli", "balieAI"], personen: true,
    laag: "1b · Waar zit AI al?", titel: "Begonnen, maar nog weinig gebruikt",
    tekst: ["Spraakgestuurd rapporteren: 69% van de ziekenhuizen is begonnen. Gemiddeld gebruikt 21% van de beoogde zorgverleners het echt."],
    na: ["Aan de balie: 48% verkent AI-agents. 16% zet concrete stappen, meestal in een pilot."], bron: "p. 31 en 32" },
  { focus: ["kwaliteit"], cam: { ...kamerCam("kwaliteit", 2.2), tz: 5.6 }, roep: ["kwStapel"],
    cijfers: [["88%", "wil met AI de kwaliteit van zorg verbeteren"], ["0", "categorieën voor kwaliteit of patiëntveiligheid"]],
    laag: "1c · Wat raakt het kwaliteitsmanagement?", titel: "Kwaliteit is de tweede reden voor AI",
    tekst: ["Toch staat het kwaliteitsproces niet in de monitor. Melden en leren komt niet voor."], bron: "p. 27 en 35" },
  { focus: ["regie"], cam: { ...kamerCam("regie", 2.6), tz: -5.2 }, roep: ["regie0", "regie1", "regie2", "regie3", "regie4"], grafiek: "beleid",
    vraag: "Wie zit in de AI-board van jouw ziekenhuis?",
    laag: "1c · Wat raakt het kwaliteitsmanagement?", titel: "Wie zit er aan tafel?",
    tekst: ['60% van de ziekenhuizen heeft een AI-board of AI-regiegroep. De manager Kwaliteit staat alleen bij "anders".', "Aandeel van de ziekenhuizen met AI-beleid:"],
    bron: "p. 16, 20 en 21" },
  { focus: ["radiologie"], nacht: true, cam: { tx: 1.6, tz: -5.6, ty: 0.8, zoom: 2.7, az: 0.3, el: 0.86 }, roep: ["aiRadio"], actie: "scans",
    laag: "1d · Het programma van vandaag", titel: "'s Avonds maakt AI een eerste selectie",
    tekst: ["Zo werkt fractuurdetectie in het Máxima MC.", "De AI maakt een eerste selectie van de beelden."], bron: "p. 41" },
  { focus: ["radiologie"], cam: { tx: 1.6, tz: -5.6, ty: 0.8, zoom: 2.7, az: 0.3, el: 0.86 }, roep: ["aiRadio", "radioloog"], actie: "radioloog",
    laag: "1d · Het programma van vandaag", titel: "De volgende dag beslist de radioloog",
    tekst: ["De radioloog beoordeelt de beelden.", "De radioloog hoeft 's nachts niet meer uit bed voor standaardbeoordelingen."], bron: "p. 41" },
  { focus: ["kwaliteit"], cam: { ...kamerCam("kwaliteit", 2.5), tz: 5.0 }, roep: ["aiKw", "kwAdviseur"], actie: "vim", route: true,
    laag: "1d · Het programma van vandaag", titel: "Vandaag: hetzelfde patroon op het VIM-proces",
    tekst: ["De AI geeft een signaal. De kwaliteitsadviseur beslist.", "Dit is een prototype. Het staat niet in de monitor."] },
  { plaat: true, cam: OVERZICHT, kamers: true,
    laag: "Blok 1 · Waarom", titel: "AI is al in je ziekenhuis",
    tekst: ["Of AI de zorg beter maakt, is een vraag voor jouw vak."] },
];
const STAP_SCANS = 8, STAP_RADIOLOOG = 9, STAP_VIM = 10;
const GEKOZEN = 2; // het beeld en de melding die de AI apart zet

// Klik op een ruimte in het overzicht: naar de eerste stap met die ruimte.
const STAP_VAN = { bestuur: 1, regie: 7, radiologie: 4, lab: 3, balie: 5, poli: 5, admin: 3, kwaliteit: 6, gang: 3 };

/* ================= De maquette (Three.js) ================= */

const doek = $("doek"), labelLaag = $("labels");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
doek.prepend(renderer.domElement);
const scene = new THREE.Scene();
const HALF = 12; // halve hoogte van het beeld bij zoom 1, in meters
const camera = new THREE.OrthographicCamera(-HALF, HALF, HALF, -HALF, 0.1, 400);
const maq = bouwMaquette(scene);

const cam = { tx: 0, tz: 0.3, ty: 0.8, zoom: 0.8, az: 0.2, el: 0.92 };
const toestand = { nacht: 0 };

function zetCamera(c) {
  const w = doek.clientWidth || 1, h = doek.clientHeight || 1, a = w / h, r = 90;
  camera.left = -HALF * a;
  camera.right = HALF * a;
  camera.top = HALF;
  camera.bottom = -HALF;
  camera.zoom = c.zoom;
  camera.position.set(c.tx + r * Math.sin(c.az) * Math.cos(c.el), c.ty + r * Math.sin(c.el), c.tz + r * Math.cos(c.az) * Math.cos(c.el));
  camera.lookAt(c.tx, c.ty, c.tz);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(); // project() leest de wereldmatrix; anders loopt die een beeld achter
}

// Zoom waarbij het hele gebouw in beeld past, met ruimte boven voor de labels. De bomen mogen wegvallen.
const HOEKEN = [];
for (const x of [-16.4, 16.4]) for (const y of [0, 3.6]) for (const z of [-10.4, 11.2]) HOEKEN.push(new THREE.Vector3(x, y, z));
function pasZoom(c) {
  zetCamera({ ...c, zoom: 1 });
  let mx = 0, my = 0;
  const v = new THREE.Vector3();
  for (const p of HOEKEN) {
    v.copy(p).project(camera);
    mx = Math.max(mx, Math.abs(v.x));
    my = Math.max(my, Math.abs(v.y));
  }
  return 0.97 / Math.max(mx, my);
}

/* ---------- Labels ---------- */

const labels = []; // { el, anker, soort, id }
for (const [id, [n, wat]] of Object.entries(KAMERLABEL)) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = `lbl kamer weg${id === "kwaliteit" ? " leeg" : ""}`;
  el.innerHTML = `<b>${n}</b><span>${wat}</span>`;
  el.setAttribute("aria-label", `${NAMEN[id] || "Gang"}: ${n} ${wat}. Ga naar deze ruimte.`);
  el.addEventListener("click", () => ga(STAP_VAN[id]));
  labelLaag.appendChild(el);
  labels.push({ el, anker: maq.ankers[`kamer-${id}`], soort: "kamer", id });
}
for (const [id, r] of Object.entries(ROEP)) {
  const el = document.createElement("div");
  el.className = `lbl roep weg${r.ai ? " ai" : ""}${r.aan ? " aan" : ""}`;
  el.innerHTML = `${r.ai ? BOT : r.mens ? MENS : ""}<span>${r.tekst}</span>`;
  labelLaag.appendChild(el);
  labels.push({ el, anker: maq.ankers[id], soort: "roep", id });
}

const v = new THREE.Vector3();
function zetLabels() {
  const w = doek.clientWidth, h = doek.clientHeight;
  for (const l of labels) {
    if (l.el.classList.contains("weg")) continue;
    v.copy(l.anker).project(camera);
    l.el.style.left = `${((v.x + 1) / 2) * w}px`;
    l.el.style.top = `${((1 - v.y) / 2) * h}px`;
  }
}

/* ---------- Tekenen ---------- */

let stap = -1, stapStart = performance.now(), rondI = null, nachtNu = -1;
function teken(nu) {
  zetCamera(cam);
  if (toestand.nacht !== nachtNu) {
    nachtNu = toestand.nacht;
    zetNacht(scene, maq.licht, nachtNu);
  }
  if (!reduce) maq.stap(nu / 1000);
  const s = STAPPEN[stap];
  if (s?.rondgang && !reduce) {
    const i = Math.floor((nu - stapStart) / 1900) % PROCESSEN.length;
    if (i !== rondI) {
      rondI = i;
      licht(i);
    }
  }
  zetLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(teken);
}

function maat() {
  const w = doek.clientWidth, h = doek.clientHeight;
  if (w && h) renderer.setSize(w, h, false);
}
new ResizeObserver(maat).observe(doek);
maat();

/* ================= De uitleg (D3) ================= */

// Liggende staven met het getal erachter; één reeks, dus geen legenda. accent = index met het geel.
function staafPad(w, h) {
  if (w <= 0) return "";
  const r = Math.min(4, w);
  return `M0,0H${w - r}Q${w},0 ${w},${r}V${h - r}Q${w},${h} ${w - r},${h}H0Z`;
}
function staven(houder, data, { accent = -1, max = 100 } = {}) {
  const RIJ = 38, BREED = 540, L = 228, R = 58, H = 20;
  const x = d3.scaleLinear().domain([0, max]).range([0, BREED - L - R]);
  const svg = d3.select(houder).append("svg")
    .attr("class", "staven").attr("viewBox", `0 0 ${BREED} ${data.length * RIJ}`)
    .attr("role", "img").attr("aria-label", data.map(([n, w]) => `${n}: ${w}%`).join(", "));
  const rij = svg.selectAll("g").data(data).join("g")
    .attr("transform", (_, i) => `translate(0,${i * RIJ})`)
    .classed("acc", (_, i) => i === accent);
  rij.append("text").attr("class", "naam").attr("x", L - 12).attr("y", RIJ / 2 + 6).attr("text-anchor", "end").text((d) => d[0]);
  rij.append("path").attr("class", "staaf").attr("transform", `translate(${L},${(RIJ - H) / 2})`)
    .transition().duration(T(0.8) * 1000).delay((_, i) => T(0.3 + i * 0.08) * 1000)
    .attrTween("d", (d) => (t) => staafPad(x(d[1]) * t, H));
  rij.append("text").attr("class", "waarde").attr("x", (d) => L + x(d[1]) + 9).attr("y", RIJ / 2 + 6).text((d) => `${d[1]}%`)
    .attr("opacity", 0).transition().duration(T(0.3) * 1000).delay((_, i) => T(0.9 + i * 0.08) * 1000).attr("opacity", 1);
  return { accent: (i) => rij.classed("acc", (_, j) => j === i) };
}

const GRAFIEK = {
  schaal: () => staven($("grafiek"), SCHAAL, { accent: 3 }),
  processen: () => staven($("grafiek"), PROCESSEN, { accent: -1 }),
  radiologie: () => staven($("grafiek"), RADIOLOGIE, { accent: 2 }),
  beleid: () => staven($("grafiek"), BELEID, { accent: 2 }),
};
let grafiek = null;

function uitlegTekenen(s) {
  const el = $("uitleg");
  let h = `<div class="laag">${s.laag}</div><h2>${s.titel}</h2>${(s.tekst || []).map((t) => `<p>${t}</p>`).join("")}`;
  if (s.grafiek) h += `<div class="grafiek" id="grafiek"></div>`;
  if (s.cijfers) h += `<div class="cijfers">${s.cijfers.map(([n, t]) => `<div class="cijfer"><b>${n}</b><span>${t}</span></div>`).join("")}</div>`;
  if (s.personen) {
    h += `<div class="personen" role="img" aria-label="Ongeveer 2 van de 10 beoogde zorgverleners gebruiken het">${
      Array.from({ length: 10 }, (_, i) => `<span class="${i < 2 ? "ja" : ""}">${MENS}</span>`).join("")}<small>ongeveer 2 van de 10 beoogde zorgverleners</small></div>`;
  }
  if (s.na) h += s.na.map((t) => `<p>${t}</p>`).join("");
  if (s.vraag) h += `<div class="vraag">${HAND}<span>${s.vraag}</span></div>`;
  if (s.route) {
    h += `<div class="route"><div class="klein">De rest van de sessie</div><ol>${
      ["Regels", "Groeimodel", "Veiligheid", "Demo", "Jouw oordeel"].map((t) => `<li>${t}</li>`).join("")}</ol></div>`;
  }
  if (s.bron) h += `<p class="bron">Bron: AI Monitor Ziekenhuizen 2026, ${s.bron}</p>`;
  el.innerHTML = h;
  grafiek = s.grafiek ? GRAFIEK[s.grafiek]() : null;
  animate([...el.children], { opacity: [0, 1] }, { duration: T(0.45), delay: stagger(T(0.07)) });
  if (s.route) animate(el.querySelectorAll(".route li"), { opacity: [0, 1] }, { duration: T(0.3), delay: stagger(T(0.18), { startDelay: T(0.6) }) });
}

/* ================= Wat er per stap gebeurt ================= */

let versie = 0, lopend = [];
const speel = (a) => (lopend.push(a), a);

// De gele rand rond een ruimte; ook het label van die ruimte licht op.
function randen(aan) {
  for (const [id, k] of Object.entries(maq.kamers)) {
    const doel = aan.includes(id) ? 1 : 0;
    if (reduce) k.rand.opacity = doel;
    else speel(animate(k.rand, { opacity: doel }, { duration: 0.45 }));
  }
  for (const l of labels) if (l.soort === "kamer") l.el.classList.toggle("aan", aan.includes(l.id));
}
// Rondgang: één proces tegelijk (of alle, zonder beweging).
function licht(i) {
  randen(i < 0 ? PROCESSEN.map((p) => p[2]) : [PROCESSEN[i][2]]);
  grafiek?.accent(i);
}

const RADIO = { bron: [3.6, 1.2, -6.2], ai: [1.3, 1.45, -4.9], bak: (i) => [-1.0 + i * 0.4, 0.8, -3.0], bureau: (i) => [0.82, 0.8, -8.25 + i * 0.4] };
const KW = { stapel: [9.35, 1.0, 5.25], ai: [10.8, 1.25, 5.2], bak: (i) => [12.78 + i * 0.42, 0.79, 5.1], adviseur: [10.05, 0.79, 5.15] };
const kwPlek = (i) => (i === GEKOZEN ? KW.adviseur : KW.bak(i));

// De stand aan het begin van stap n: alles wat eerdere stappen hebben verplaatst, staat al op zijn plek.
function zetBegin(n) {
  maq.scans.forEach((s, i) => {
    s.g.visible = n > STAP_SCANS;
    s.markeer(n > STAP_SCANS && i === GEKOZEN);
    s.g.position.set(...(n > STAP_RADIOLOOG ? RADIO.bureau(i) : RADIO.bak(i)));
  });
  maq.vims.forEach((s, i) => {
    s.g.visible = n > STAP_VIM;
    s.markeer(n > STAP_VIM && i === GEKOZEN);
    s.g.position.set(...kwPlek(i));
  });
  maq.aiKw.visible = n > STAP_VIM;
  maq.aiKw.scale.setScalar(1);
  maq.scherm(1);
  maq.bord(1);
}

// Een vel van A via de AI naar B. Bij de AI kleurt het gekozen vel zwart met geel.
function viaAI(items, van, ai, naar, v) {
  items.forEach((it, i) => {
    it.g.visible = true;
    it.markeer(false);
    it.g.position.set(...van);
    if (reduce) {
      it.g.position.set(...naar(i));
      it.markeer(i === GEKOZEN);
      return;
    }
    const heen = speel(animate(it.g.position, { x: [van[0], ai[0]], y: [van[1], ai[1] + 0.5, ai[1]], z: [van[2], ai[2]] },
      { duration: 0.9, delay: 0.5 + i * 0.55, ease: "easeInOut" }));
    heen.then(() => {
      if (v !== versie) return;
      if (i === GEKOZEN) it.markeer(true);
      const p = naar(i);
      speel(animate(it.g.position, { x: [ai[0], p[0]], y: [ai[1], p[1] + 0.45, p[1]], z: [ai[2], p[2]] }, { duration: 0.8, delay: 0.15, ease: "easeInOut" }));
    });
  });
}

const ACTIE = {
  scherm() {
    const st = { p: 0 };
    maq.scherm(reduce ? 1 : 0);
    if (!reduce) speel(animate(st, { p: 1 }, { duration: 1.8, delay: 0.9, ease: "easeOut", onUpdate: () => maq.scherm(st.p) }));
  },
  bord() {
    const st = { p: 0 };
    maq.bord(reduce ? 1 : 0);
    if (!reduce) speel(animate(st, { p: 1 }, { duration: 1.5, delay: 0.9, ease: "easeOut", onUpdate: () => maq.bord(st.p) }));
  },
  scans(v) {
    viaAI(maq.scans, RADIO.bron, RADIO.ai, RADIO.bak, v);
  },
  radioloog() {
    maq.scans.forEach((s, i) => {
      if (reduce) s.g.position.set(...RADIO.bureau(i));
      else speel(animate(s.g.position, { x: RADIO.bureau(i)[0], y: [s.g.position.y, 1.3, RADIO.bureau(i)[1]], z: RADIO.bureau(i)[2] }, { duration: 1.0, delay: 1.0 + i * 0.25, ease: "easeInOut" }));
    });
  },
  vim(v) {
    maq.aiKw.visible = true;
    maq.aiKw.scale.setScalar(reduce ? 1 : 0.01);
    if (!reduce) speel(animate(maq.aiKw.scale, { x: 1, y: 1, z: 1 }, { duration: 0.6, delay: 1.0, type: "spring", bounce: 0.3 }));
    viaAI(maq.vims, KW.stapel, KW.ai, kwPlek, v);
  },
};

/* ================= Stappen ================= */

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  stap = n;
  versie++;
  lopend.forEach((a) => a.stop());
  lopend = [];
  stapStart = performance.now();
  rondI = null;
  const s = STAPPEN[n];

  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);

  // de hele plaat: doek over de volle breedte, uitleg als onderschrift
  $("maquette").classList.toggle("plaat", Boolean(s.plaat));
  maat();
  uitlegTekenen(s);

  // camera
  const doel = { ...s.cam };
  if (doel.zoom === "pas") doel.zoom = pasZoom(doel);
  if (reduce) Object.assign(cam, doel);
  else speel(animate(cam, doel, { duration: 1.6, ease: [0.45, 0, 0.2, 1] }));

  // dag of nacht
  const nacht = s.nacht ? 1 : 0;
  if (reduce) toestand.nacht = nacht;
  else speel(animate(toestand, { nacht }, { duration: 1.2, delay: s.nacht ? 0.8 : 0 }));

  // labels
  const roep = new Set(s.roep || []);
  for (const l of labels) {
    const zien = l.soort === "kamer" ? Boolean(s.kamers) : roep.has(l.id);
    const was = !l.el.classList.contains("weg");
    l.el.classList.toggle("weg", !zien);
    if (zien && !was) animate(l.el, { opacity: [0, 1] }, { duration: T(0.4), delay: T(l.soort === "kamer" ? 0.6 : 1.2) });
  }

  randen(s.focus || []);
  if (s.rondgang && reduce) licht(-1);

  zetBegin(n);
  ACTIE[s.actie]?.(versie);
}

addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const volgende = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"];
  const vorige = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"];
  if (volgende.includes(e.key)) { e.preventDefault(); ga(stap + 1); }
  else if (vorige.includes(e.key)) { e.preventDefault(); ga(stap - 1); }
  else if (e.key === "Home") ga(0);
  else if (e.key === "End") ga(STAPPEN.length - 1);
});
$("verder").addEventListener("click", () => ga(stap + 1));
$("terug").addEventListener("click", () => ga(stap - 1));

const stapUitHash = () => {
  const n = parseInt((location.hash.match(/stap-(\d+)/) || [])[1], 10);
  return Number.isFinite(n) ? n - 1 : 0;
};
addEventListener("hashchange", () => ga(stapUitHash()));

const eerste = STAPPEN[stapUitHash()] || STAPPEN[0];
$("maquette").classList.toggle("plaat", Boolean(eerste.plaat));
maat();
Object.assign(cam, { ...eerste.cam, zoom: eerste.cam.zoom === "pas" ? pasZoom(eerste.cam) : eerste.cam.zoom });
ga(stapUitHash());
requestAnimationFrame(teken);
