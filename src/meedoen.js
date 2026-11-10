/* De zaal doet mee (3b en de evaluatie). Door de spreker bediend, met de stemtool uit de
   a-cluster-repo achter één QR-code.

   - De vragen staan in stemtool.json in de root van deze repo. De koppen in STAPPEN en de
     opties (OPTIES) komen daar rechtstreeks uit. De telefoons krijgen hun vragen van de
     uitgerolde stemtool. Die heeft een eigen kopie, die pas na verzamel.py en een nieuwe
     deploy in de a-cluster-repo meekomt. Wijkt die kopie af, dan zegt de statusregel het.
   - Het adres van de dienst staat in .env als VITE_STEMTOOL_URL, niet in git. Het dashboard
     van de stemtool heeft geen inlog, en deze repo is publiek.
   - De QR-code wijst naar /santeon/mee, niet naar /mee. Zo kan een HAN-vraag die nog
     openstaat de telefoons in de zaal niet overnemen.
   - Er staat nooit een verzonnen uitslag op het scherm. De vraag en de uitslag staan op
     dezelfde stap: voorbeeldbalken zouden de stemmers sturen. Zonder antwoorden blijven de
     staven leeg. Zonder verbinding zegt de pagina "steek je hand op"; dat is het plan B.
   - Toets D opent het dashboard (start, stop, wissen) in een nieuw tabblad. */

import QRCode from "qrcode";
import { TEGENSTRIJDIG } from "./meldingen.js";
import STEMTOOL from "../stemtool.json";

const BASIS = (import.meta.env.VITE_STEMTOOL_URL || "").replace(/\/+$/, "");
// Zonder adres. Lokaal: .env mist VITE_STEMTOOL_URL. Openbare versie (GitHub Pages): de build
// leest .env bewust niet, want het dashboard heeft geen inlog.
const ZONDER = import.meta.env.DEV
  ? { qr: "Zet VITE_STEMTOOL_URL in .env", status: "Stemtool: geen adres in .env", bron: "Geen adres van de stemtool · steek je hand op" }
  : { qr: "Geen stemtool in de openbare versie", status: "Stemtool: niet in de openbare versie", bron: "Geen stemtool · steek je hand op" };
const COLLEGE = "santeon";
const TIK = 2000;

const $ = (id) => document.getElementById(id);
const tekst = (t) => String(t ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

const VRAGEN = ["veilig-gegevens", "veilig-patient", "veilig-melder"];

const ACTIVITEIT = Object.fromEntries(STEMTOOL.activiteiten.map((a) => [a.code, a]));
const vraag = (code) => ACTIVITEIT[code].vraag;

// kop = de vraag zoals de telefoon hem toont, behalve op de stappen zonder eigen vraag
const STAPPEN = [
  { naam: "start", kop: "Pak je telefoon", codes: [] },
  { naam: "sac", kop: vraag("sac-0505"), codes: ["sac-0505"] },
  { naam: "agent", kop: "Wat doet de AI-agent met deze melding?", codes: ["sac-0505"] },
  { naam: "gegevens", kop: vraag("veilig-gegevens"), codes: ["veilig-gegevens"] },
  { naam: "patient", kop: vraag("veilig-patient"), codes: ["veilig-patient"] },
  { naam: "melder", kop: vraag("veilig-melder"), codes: ["veilig-melder"] },
  { naam: "overzicht", kop: "Bij welke vraag weet de zaal het minst?", codes: VRAGEN },
  { naam: "wie", kop: vraag("wie"), codes: ["wie"] },
  { naam: "evaluatie", kop: vraag("evaluatie"), codes: [] },
];

// de klasse kleurt de staaf: A weet het, B weet wie het weet, C weet het niet
const KLASSE = { A: "weet", B: "wie", C: "niet" };
const OPTIES = {
  sac: ACTIVITEIT["sac-0505"].opties,
  weet: ACTIVITEIT["veilig-gegevens"].opties.map((o) => ({ ...o, klasse: KLASSE[o.sleutel] })),
};

// live[code] = de laatste uitslag die de dienst gaf, ook als die nog 0 antwoorden telt
const live = {};
const heeftAntwoorden = (code) => Boolean(live[code] && live[code].aantal > 0);
let verbonden = null;   // null = nog niet geprobeerd
let openTitel = null;
let afwijkend = [];     // codes waarvan de telefoon een andere vraag toont dan stemtool.json
let gemeld = "";
let stap = -1;

/* ---------------------------------------------------------------- de uitslag van één vraag */

function aantallen(code, n) {
  const d = live[code];
  return d && d.opties ? d.opties.map((o) => o.aantal) : Array(n).fill(0);
}

function woorden(code) {
  const d = live[code];
  return d && d.woorden ? d.woorden.map((w) => [w.woord, w.aantal]) : [];
}

function bronTekst(code) {
  if (!BASIS) return ZONDER.bron;
  if (verbonden === false) return "Geen verbinding · steek je hand op";
  const d = live[code];
  if (!d || !d.aantal) return "Nog geen antwoorden";
  return `${d.aantal} ${d.aantal === 1 ? "antwoord" : "antwoorden"}`;
}

/* ---------------------------------------------------------------- tekenen */

function tekenBalken(el) {
  const code = el.dataset.code;
  const opties = OPTIES[el.dataset.soort];
  const n = aantallen(code, opties.length);
  const totaal = n.reduce((a, b) => a + b, 0);
  if (el.children.length !== opties.length) {
    el.innerHTML = opties.map((o) =>
      `<div class="rij ${el.dataset.soort}-${o.klasse || o.sleutel}"><span class="naam">${tekst(o.tekst)}</span>`
      + `<span class="spoor"><i></i></span><span class="pct"></span></div>`).join("");
  }
  [...el.children].forEach((rij, i) => {
    const deel = totaal ? Math.round((n[i] / totaal) * 100) : 0;
    rij.querySelector("i").style.inlineSize = `${deel}%`;
    rij.querySelector(".pct").textContent = totaal ? `${deel}%` : "";
  });
}

function tekenStapel(el) {
  const code = el.dataset.stapel;
  const n = aantallen(code, 3);
  const totaal = n.reduce((a, b) => a + b, 0);
  if (el.children.length !== 3) {
    el.innerHTML = OPTIES.weet.map((o) => `<i class="${o.klasse}"><b></b></i>`).join("");
  }
  [...el.children].forEach((deel, i) => {
    const pct = totaal ? Math.round((n[i] / totaal) * 100) : 0;
    deel.style.blockSize = `${pct}%`;
    deel.querySelector("b").textContent = pct >= 8 ? `${pct}%` : "";
  });
}

// de vraag met het grootste deel C ("nee, en ik weet niet wie het weet") krijgt een vlag; zonder antwoorden geen vlag
function markeerMeeste() {
  const deel = (code) => {
    const n = aantallen(code, 3);
    const totaal = n.reduce((a, b) => a + b, 0);
    return totaal ? n[2] / totaal : -1;
  };
  const kandidaten = VRAGEN.filter(heeftAntwoorden);
  const meeste = kandidaten.length
    ? kandidaten.reduce((a, b) => (deel(b) > deel(a) ? b : a))
    : null;
  document.querySelectorAll("[data-kolom]").forEach((k) =>
    k.classList.toggle("meest", k.dataset.kolom === meeste));
}

function tekenWolk(el) {
  const code = el.dataset.wolk;
  const lijst = woorden(code).slice(0, 24);
  const maten = ["xl", "xl", "l", "l", "l", "m", "m", "m", "m", "m"];
  const nieuw = lijst.map(([w], i) => `<span class="${maten[i] || "s"}">${tekst(w)}</span>`).join("");
  if (el.innerHTML !== nieuw) el.innerHTML = nieuw;
}

function tekenBronnen() {
  document.querySelectorAll("[data-bron]").forEach((el) => {
    el.textContent = bronTekst(el.dataset.bron);
    el.classList.toggle("live", heeftAntwoorden(el.dataset.bron));
  });
}

function tekenVerbinding() {
  const el = $("verbinding");
  if (!BASIS) { el.textContent = ZONDER.status; el.className = "verbinding uit"; return; }
  if (verbonden === null) { el.textContent = "Stemtool: verbinden…"; el.className = "verbinding"; return; }
  if (!verbonden) { el.textContent = "Stemtool: geen verbinding"; el.className = "verbinding uit"; return; }
  if (afwijkend.length) { el.textContent = "Stemtool: andere vragen dan op deze pagina"; el.className = "verbinding uit"; return; }
  el.textContent = `Stemtool: verbonden · ${openTitel ? `open: ${openTitel}` : "geen vraag open"}`;
  el.className = "verbinding aan";
}

function tekenAlles() {
  document.querySelectorAll(".balken[data-code]").forEach(tekenBalken);
  document.querySelectorAll("[data-stapel]").forEach(tekenStapel);
  document.querySelectorAll("[data-wolk]").forEach(tekenWolk);
  markeerMeeste();
  tekenBronnen();
  tekenVerbinding();
}

/* ---------------------------------------------------------------- de melding */

function tekenMelding() {
  let t = tekst(TEGENSTRIJDIG.tekst);
  for (const m of TEGENSTRIJDIG.markeer) t = t.replace(tekst(m), `<mark>${tekst(m)}</mark>`);
  const html = `<p class="id">${TEGENSTRIJDIG.id}</p>`
    + `<p class="meta">${TEGENSTRIJDIG.afdeling} · ${TEGENSTRIJDIG.melder} · ${TEGENSTRIJDIG.datum}</p>`
    + `<p class="tekst">${t}</p>`;
  document.querySelectorAll("[data-melding]").forEach((el) => { el.innerHTML = html; });
  $("reden").textContent = TEGENSTRIJDIG.escalatie;
}

/* ---------------------------------------------------------------- de stemtool */

// Vergelijk de vragen van de dienst met stemtool.json. Een verschil betekent: de vragen zijn
// aangepast, maar de stemtool is daarna niet opnieuw uitgerold.
function vergelijk(lijst) {
  const opDienst = Object.fromEntries(lijst.map((a) => [a.code, a.vraag]));
  afwijkend = STEMTOOL.activiteiten.filter((a) => opDienst[a.code] !== a.vraag).map((a) => a.code);
  const sleutel = afwijkend.join(",");
  if (sleutel && sleutel !== gemeld) {
    console.warn(`De stemtool toont andere vragen dan stemtool.json: ${sleutel}.`
      + " Draai in de a-cluster-repo python3 stemtool/verzamel.py en rol de stemtool opnieuw uit.");
  }
  gemeld = sleutel;
}

async function haal(pad) {
  const r = await fetch(`${BASIS}/api/${COLLEGE}${pad}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`${r.status} op ${pad}`);
  return r.json();
}

async function tik() {
  if (!BASIS) return;
  const codes = STAPPEN[stap]?.codes || [];
  try {
    const [lijst, ...uitslagen] = await Promise.all([
      haal("/activiteiten"),
      ...codes.map((c) => haal(`/resultaten/${c}`)),
    ]);
    const open = lijst.activiteiten.find((a) => a.open);
    openTitel = open ? open.titel : null;
    vergelijk(lijst.activiteiten);
    for (const d of uitslagen) live[d.code] = d;   // ook na Wissen op het dashboard: dan weer leeg
    verbonden = true;
  } catch {
    verbonden = false;
  }
  tekenAlles();
}

function maakQr() {
  const vakken = document.querySelectorAll(".qr");
  if (!BASIS) {
    vakken.forEach((el) => { el.innerHTML = `<p class="geen-qr">${ZONDER.qr}</p>`; });
    return;
  }
  QRCode.toString(`${BASIS}/${COLLEGE}/mee`, {
    type: "svg", margin: 1, errorCorrectionLevel: "M",
    color: { dark: "#1a1a1aff", light: "#ffffffff" },
  }).then((svg) => vakken.forEach((el) => { el.innerHTML = svg; }));
}

/* ---------------------------------------------------------------- stappen */

const SECTIES = [...document.querySelectorAll(".stap")];

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  stap = n;
  const s = STAPPEN[n];
  document.body.dataset.stap = s.naam;
  $("kop").textContent = s.kop;
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);
  for (const sec of SECTIES) sec.classList.toggle("aan", sec.dataset.naam === s.naam);
  tik();
}

addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const volgende = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"];
  const vorige = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"];
  if (volgende.includes(e.key)) { e.preventDefault(); ga(stap + 1); }
  else if (vorige.includes(e.key)) { e.preventDefault(); ga(stap - 1); }
  else if (e.key === "Home") ga(0);
  else if (e.key === "End") ga(STAPPEN.length - 1);
  else if ((e.key === "d" || e.key === "D") && BASIS) window.open(`${BASIS}/docent/${COLLEGE}`, "_blank", "noopener");
});
$("verder").addEventListener("click", () => ga(stap + 1));
$("terug").addEventListener("click", () => ga(stap - 1));

const stapUitHash = () => {
  const n = parseInt((location.hash.match(/stap-(\d+)/) || [])[1], 10);
  return Number.isFinite(n) ? n - 1 : 0;
};
addEventListener("hashchange", () => ga(stapUitHash()));

tekenMelding();
maakQr();
tekenAlles();
ga(stapUitHash());
setInterval(tik, TIK);
