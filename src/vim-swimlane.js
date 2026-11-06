/* Het VIM-proces als swimlane (2c): wie doet wat, van melding tot verbetering.
   d3      tekent het bord: banen (rollen), kolommen (fasen), vakken, pijlen.
   motion  regelt de overgangen: de baan waar je over praat groeit en toont de volledige
           tekst, de andere banen krimpen. Een stip (de melding) loopt door de stappen.
   De inhoud volgt background-material/vim-workflow.excalidraw. Wijzig je dat schema,
   werk dan BANEN en VAKKEN hier bij. Afwijking: "Calamiteit?" volgt de definitie uit de
   Wkkgz, niet de risicomatrix uit het schema.
   Dit is het proces van vandaag: mensen doen het werk. Daarom staat hier geen AI-markering. */

import * as d3 from "d3";
import { animate, stagger } from "motion";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const T = (s) => (reduce ? 0 : s);
const $ = (id) => document.getElementById(id);
const wacht = (s) => new Promise((r) => setTimeout(r, s * 1000));

/* ================= Inhoud ================= */

const FASEN = ["Zorg en melden", "Triage", "Analyse", "Verbeteren", "Terugkoppelen en leren"];

// Kolom 0–4 = fase, 5 = eindpunt. `vanaf` = de stap waarin de baan verschijnt.
const BANEN = [
  { naam: "Zorgverlener en melder", route: "Route 1 · individueel", vanaf: 1,
    cellen: [[0, ["eh", "dossier", "gesprek", "formulier"]], [1, ["calamiteit"]], [5, ["E"]]] },
  { naam: "Afdeling (PVC)", route: "Route 2 · decentraal", vanaf: 2,
    cellen: [[1, ["volledig", "risico", "overleg", "besluit"]], [2, ["dam", "aanschuiven"]], [3, ["smart"]],
      [4, ["terug", "week"]], [5, ["A", "B"]]] },
  { naam: "MIP-commissie", route: "Route 3 · centraal", vanaf: 3,
    cellen: [[1, ["mip"]], [2, ["trend", "sire"]], [3, ["advies"]], [4, ["delen"]], [5, ["C"]]] },
  { naam: "Raad van bestuur en IGJ", route: "Route 4 · calamiteit", vanaf: 4,
    cellen: [[1, ["rvb"]], [2, ["igj", "familie"]], [3, ["rapport", "bestuur"]], [5, ["D"]]] },
  { naam: "Kwaliteitssysteem", route: "Doorlopend", vanaf: 5,
    cellen: [[3, ["pdsa"]], [4, ["evaluatie"]]] },
];

// kort = label in het overzicht; lang = de volledige tekst als de baan groot is.
const VAKKEN = {
  eh: { kort: "Eerste hulp", lang: "Arts of verpleegkundige helpt de patiënt direct." },
  dossier: { kort: "Dossier en behandelplan", lang: "Incident in het dossier. Behandelplan aangepast." },
  gesprek: { kort: "Gesprek met de patiënt", lang: "Het (bijna-)incident bespreken met de patiënt." },
  formulier: { kort: "Meldingsformulier", lang: "Iedereen mag melden. Laagdrempelig, waar mogelijk geanonimiseerd." },
  calamiteit: { kort: "Calamiteit?", lang: "Dood of ernstige schade? Dan is het een calamiteit (Wkkgz).", beslis: true },

  volledig: { kort: "Melding volledig?", lang: "Een PVC-lid controleert. Zo nodig vraagt het lid door bij de melder." },
  risico: { kort: "Risicomatrix", lang: "Voorlopige indeling: ernst × frequentie." },
  overleg: { kort: "Overleg hoofd zorgteam", lang: "Nu direct actie, of later systematisch?" },
  besluit: { kort: "Analyse nodig?", lang: "Geen analyse, analyse door de PVC, of direct naar de MIP.", beslis: true },
  dam: { kort: "Analyse: DAM of PRISMA", lang: "Oorzakenboom naar de basisoorzaak: technisch, organisatorisch of menselijk." },
  aanschuiven: { kort: "Melder mag aanschuiven", lang: "De melder kan meepraten over de eigen melding." },
  smart: { kort: "Maatregelen (SMART)", lang: "Gericht op het systeem, niet op de persoon." },
  terug: { kort: "Terugkoppeling", lang: "De melder hoort de uitkomst. Registratie in de database." },
  week: { kort: "Incident van de week", lang: "Bespreking in het afdelingsoverleg." },

  mip: { kort: "Melden bij de MIP", lang: "Registratie bij de centrale MIP-commissie." },
  trend: { kort: "Trendanalyse", lang: "Patronen over afdelingen heen: Pareto, vergelijking tussen units." },
  sire: { kort: "SIRE of RCA", lang: "Diepgaande analyse: dossier, interviews, 5 × waarom." },
  advies: { kort: "Advies aan RvB", lang: "Advies over structurele maatregelen." },
  delen: { kort: "Kennis delen", lang: "Met andere afdelingen en ziekenhuizen." },

  rvb: { kort: "Direct naar RvB", lang: "De raad van bestuur hoort het meteen." },
  igj: { kort: "Melding IGJ", lang: "Onverwijld melden (Wkkgz art. 11). Intern onderzoek start." },
  familie: { kort: "Patiënt en familie", lang: "Controle: zijn zij geïnformeerd?" },
  rapport: { kort: "Rapportage aan RvB", lang: "Het onderzoek rapporteert aan de raad van bestuur." },
  bestuur: { kort: "Maatregelen bestuur", lang: "Maatregelen op bestuursniveau." },

  pdsa: { kort: "PDSA-cyclus", lang: "Plan-Do-Study-Act (Nolan): klein testen, dan opschalen." },
  evaluatie: { kort: "Evaluatie VIM", lang: "Na 3, 6 en 12 maanden. Formulier en procedure bijstellen." },

  A: { kort: "A · Geen analyse", lang: "Geregistreerd en gearchiveerd. Laagste risico, geen actie nodig.", eind: true },
  B: { kort: "B · Maatregel afdeling", lang: "Ingevoerd en geëvalueerd. Met PDSA geborgd in het werkproces.", eind: true },
  C: { kort: "C · Structurele maatregel", lang: "Centraal ingevoerd. Andere afdelingen leren ervan.", eind: true },
  D: { kort: "D · Calamiteit afgehandeld", lang: "IGJ gemeld, onderzoek afgerond, bestuur nam maatregelen.", eind: true },
  E: { kort: "E · Melder hoort uitkomst", lang: "Geldt in bijna elk traject: route 2, 3 en 4.", eind: true, vanaf: 5 },
};

// modus: h = rechts uit, links in · omlaag = recht naar beneden · goot = via de linkerkant
// van de kolom · onder = langs de onderkant van de baan · lus = terug naar het meldingsformulier
const PIJLEN = [
  ["formulier", "calamiteit", "h"],
  ["calamiteit", "volledig", "omlaag", "nee"],
  ["calamiteit", "rvb", "goot", "ja"],
  ["besluit", "dam", "h", "analyse"],
  ["besluit", "mip", "omlaag", "naar MIP"],
  ["besluit", "A", "onder", "geen analyse"],
  ["aanschuiven", "smart", "h"],
  ["smart", "terug", "h"],
  ["week", "B", "h"],
  ["mip", "trend", "h"],
  ["sire", "advies", "h"],
  ["advies", "delen", "h"],
  ["delen", "C", "h"],
  ["rvb", "igj", "h"],
  ["familie", "rapport", "h"],
  ["bestuur", "D", "h"],
  ["terug", "E", "h", "", true],
  ["smart", "pdsa", "goot", "", true],
  ["advies", "pdsa", "goot", "", true],
  ["pdsa", "evaluatie", "h", "", true],
  ["evaluatie", "formulier", "lus", "formulier en procedure bijstellen", true],
].map(([van, naar, modus, label = "", grijs = false]) => ({ id: `${van}-${naar}`, van, naar, modus, label, grijs }));

const BRONNEN = [
  { naam: "Draaiboek Veilig Incident Melden", meta: "VMS Zorg, NVZ, Orde van Medisch Specialisten · 2007",
    tekst: "Kernbron: de vier routes, PRISMA en SIRE, de risicomatrix." },
  { naam: "Praktijkgids VIM", meta: "VMS Veiligheidsprogramma · 2009",
    tekst: "VIM op ziekenhuisniveau en op afdelingsniveau. Taken van het VIM-team." },
  { naam: "Wkkgz", meta: "Wet kwaliteit, klachten en geschillen zorg",
    tekst: "Art. 9: procedure voor incidenten. Art. 10: patiënt informeren. Art. 11: calamiteit melden bij de IGJ." },
  { naam: "Veilig melden", meta: "KNMG · dossier kwaliteit en veiligheid",
    tekst: "“Veilig” betekent: niemand mag de melding gebruiken tegen de melder." },
  { naam: "Rijnstate", meta: "praktijkvoorbeeld",
    tekst: "53 VIM-teams op de zorgafdelingen, 306 VIM-coördinatoren, ongeveer 5.000 meldingen per jaar." },
];

const STAPPEN = [
  { focus: null, wat: "Het VIM-proces", titel: "Wie doet wat, en wanneer?",
    tekst: ["Elke baan is een rol in het ziekenhuis. Elke kolom is een fase, van melden tot leren."] },
  { focus: 0, wat: "Route 1 · individueel", titel: "Eerst de patiënt, dan de melding",
    tekst: ["De zorgverlener helpt eerst de patiënt. Daarna legt de zorgverlener het incident vast en bespreekt het met de patiënt.",
      "Dan volgt de melding. Iedereen mag melden. De eerste vraag is: is het een calamiteit?"],
    reis: ["eh", "dossier", "gesprek", "formulier", "calamiteit"] },
  { focus: 1, wat: "Route 2 · decentraal", titel: "De afdeling analyseert en verbetert zelf",
    tekst: ["De meeste meldingen blijven op de afdeling. De PVC beoordeelt de ernst met de risicomatrix.",
      "De PVC zoekt de basisoorzaak met DAM of PRISMA. De maatregel richt zich op het systeem, niet op de persoon."],
    reis: ["volledig", "risico", "overleg", "besluit", "dam", "aanschuiven", "smart", "terug", "week", "B"] },
  { focus: 2, wat: "Route 3 · centraal", titel: "De MIP-commissie kijkt over afdelingen heen",
    tekst: ["Ernstige meldingen gaan naar de centrale MIP-commissie. Die zoekt patronen over afdelingen heen.",
      "Na een diepgaande analyse adviseert de commissie de raad van bestuur."],
    reis: ["mip", "trend", "sire", "advies", "delen", "C"] },
  { focus: 3, wat: "Route 4 · calamiteit", titel: "Bij een calamiteit is de raad van bestuur aan zet",
    tekst: ["De raad van bestuur meldt een calamiteit onverwijld bij de IGJ. Zo staat het in artikel 11 van de Wkkgz.",
      "Een eigen onderzoek volgt. De patiënt of de familie hoort wat er is gebeurd."],
    reis: ["rvb", "igj", "familie", "rapport", "bestuur", "D"] },
  { focus: null, nadruk: ["terug", "E", "smart", "advies", "pdsa", "evaluatie", "formulier"], wat: "Leren", titel: "Het proces leert van zichzelf",
    tekst: ["De melder hoort de uitkomst. Zo blijft melden de moeite waard.",
      "Maatregelen gaan door de PDSA-cyclus. Na 3, 6 en 12 maanden evalueert het ziekenhuis het hele VIM-systeem."],
    reis: ["pdsa", "evaluatie", "formulier"] },
  { focus: null, eindpunten: true, wat: "Vijf eindpunten", titel: "Waar een melding eindigt" },
  { focus: null, bronnen: true, wat: "Onderbouwing", titel: "Waar dit schema op rust",
    tekst: ["Eén ziekenhuis is het voorbeeld. Bij jou kan het op punten anders gaan.",
      "KNMG: niemand mag een melding gebruiken tegen de melder."] },
];

/* ================= Maten ================= */

const VW = 1900, VH = 800;
const LBL = 206;                         // breedte van de baankop
const EIND_W = 240;                      // breedte van de eindpuntkolom
const COL0 = LBL + 18;
const EX = VW - EIND_W;
const COLW = (EX - 18 - COL0) / 5;
const KANT = 18;                         // ruimte links en rechts van een vak
const BW = COLW - 2 * KANT;
const Y0 = 44, LGAP = 8;
// Per modus: hoogte van een vak, ruimte tussen vakken, ruimte boven en onder in de baan.
const M = {
  normaal: { bh: 40, gap: 7, pad: 10 },
  mini: { bh: 10, gap: 3, pad: 6 },
  detail: { gap: 8, pad: 10 },
};
const PAD_X = 12, TITEL_LH = 25, LANG_LH = 24;
const KORT_PX = 20, TITEL_PX = 21, LANG_PX = 19, NAAM_PX = 22;

const kolX = (k) => (k === 5 ? EX + 4 : COL0 + k * COLW + KANT);
const kolW = (k) => (k === 5 ? EIND_W - 4 : BW);

// Waar elk vak staat: baan, kolom, cel.
const PLEK = {};
BANEN.forEach((b, bi) => b.cellen.forEach(([k, ids]) => ids.forEach((id) => (PLEK[id] = { bi, k }))));
const vanafVak = (id) => VAKKEN[id].vanaf ?? BANEN[PLEK[id].bi].vanaf;
PIJLEN.forEach((p) => (p.vanaf = Math.max(vanafVak(p.van), vanafVak(p.naar))));

/* ================= Tekst afbreken ================= */

const FONT = getComputedStyle(document.body).fontFamily;
const ctx = document.createElement("canvas").getContext("2d");
function breed(tekst, px, gewicht = 400) {
  ctx.font = `${gewicht} ${px}px ${FONT}`;
  return ctx.measureText(tekst).width;
}
function breek(tekst, px, gewicht, max) {
  const regels = [];
  let r = "";
  for (const w of tekst.split(" ")) {
    const p = r ? `${r} ${w}` : w;
    if (r && breed(p, px, gewicht) > max) { regels.push(r); r = w; } else r = p;
  }
  if (r) regels.push(r);
  return regels;
}
for (const [id, v] of Object.entries(VAKKEN)) {
  const w = kolW(PLEK[id].k) - 2 * PAD_X;
  v.titelRegels = breek(v.kort, TITEL_PX, 700, w);
  v.langRegels = breek(v.lang, LANG_PX, 400, w);
  v.detailH = 10 + v.titelRegels.length * TITEL_LH + 4 + v.langRegels.length * LANG_LH + 8;
  v.kortPx = Math.min(KORT_PX, (KORT_PX * (w + 8)) / breed(v.kort, KORT_PX, v.beslis ? 700 : 400));
}
// Baannaam: afbreken, en kleiner als één woord niet in de kop past.
BANEN.forEach((b) => {
  b.naamRegels = breek(b.naam, NAAM_PX, 700, LBL - 40);
  b.naamPx = Math.min(NAAM_PX, (NAAM_PX * (LBL - 36)) / Math.max(...b.naamRegels.map((r) => breed(r, NAAM_PX, 700))));
});

/* ================= Indeling per stap ================= */

const vakH = (id, modus) => (modus === "detail" ? VAKKEN[id].detailH : M[modus].bh);

// Berekent waar alles staat als `focus` de baan is waar je over praat (of null: overzicht).
function indeling(focus) {
  const maat = BANEN.map((b, bi) => {
    const modus = focus == null ? "normaal" : bi === focus ? "detail" : "mini";
    const celH = b.cellen.map(([, ids]) => ids.reduce((s, id, i) => s + vakH(id, modus) + (i ? M[modus].gap : 0), 0));
    return { modus, celH, h: Math.max(...celH) + 2 * M[modus].pad };
  });
  const vrij = VH - Y0 - LGAP * (BANEN.length - 1) - maat.reduce((s, m) => s + m.h, 0);
  if (vrij < 0) console.warn(`Swimlane past niet: ${-vrij.toFixed(0)} te hoog (focus ${focus})`);
  if (focus == null) maat.forEach((m) => (m.h += vrij / BANEN.length));
  else maat[focus].h += vrij;

  const L = { banen: [], vakken: {} };
  let y = Y0;
  BANEN.forEach((b, bi) => {
    const m = maat[bi], md = M[m.modus];
    L.banen[bi] = { y, h: m.h, mini: m.modus === "mini" ? 1 : 0 };
    b.cellen.forEach(([k, ids], ci) => {
      let vy = y + (m.h - m.celH[ci]) / 2;
      ids.forEach((id) => {
        const h = vakH(id, m.modus);
        L.vakken[id] = { x: kolX(k), y: vy, w: kolW(k), h,
          kort: m.modus === "normaal" ? 1 : 0, detail: m.modus === "detail" ? 1 : 0 };
        vy += h + md.gap;
      });
    });
    y += m.h + LGAP;
  });
  return L;
}

// Tussenbeeld tussen twee indelingen (t van 0 tot 1).
function meng(a, b, t) {
  const n = (x, y) => x + (y - x) * t;
  const obj = (p, q) => Object.fromEntries(Object.keys(q).map((k) => [k, n(p[k], q[k])]));
  return {
    banen: b.banen.map((q, i) => obj(a.banen[i], q)),
    vakken: Object.fromEntries(Object.entries(b.vakken).map(([id, q]) => [id, obj(a.vakken[id], q)])),
  };
}

/* ================= Tekenen ================= */

const svg = d3.select("#schema");
const defs = svg.append("defs");
for (const id of ["punt", "punt-grijs"]) {
  defs.append("marker").attr("id", id).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5)
    .attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto-start-reverse")
    .append("path").attr("d", "M0,1 L9,5 L0,9 z");
}

// Fasekoppen
const koppen = svg.append("g");
[...FASEN, "Eindpunt"].forEach((f, k) => {
  koppen.append("text").attr("class", "fase").attr("x", kolX(k === 5 ? 5 : k) + 2).attr("y", 26).text(f.toUpperCase());
});

// Banen
const banenG = svg.append("g");
const baan = banenG.selectAll("g.baan").data(BANEN).join("g").attr("class", "baan");
baan.append("rect").attr("class", "baan-vlak").attr("x", 0).attr("width", VW).attr("rx", 10);
baan.append("rect").attr("class", "baan-kop").attr("x", 0).attr("width", LBL - 14).attr("rx", 10);
const baanNaam = baan.append("text").attr("class", "baan-naam");
baanNaam.selectAll("tspan").data((b) => b.naamRegels).join("tspan").attr("x", 18).text((r) => r);
const baanRoute = baan.append("text").attr("class", "baan-route").attr("x", 18).text((b) => b.route);

// Pijlen onder de vakken; verbinders tussen vakken in één cel.
const pijlenG = svg.append("g");
const pijl = pijlenG.selectAll("g.pijl-g").data(PIJLEN).join("g").attr("class", "pijl-g").style("opacity", 0);
pijl.append("path").attr("class", (p) => `pijl${p.grijs ? " grijs" : ""}`).attr("pathLength", (p) => (p.grijs ? null : 1))
  .attr("marker-end", (p) => `url(#${p.grijs ? "punt-grijs" : "punt"})`);
pijl.append("text").attr("class", (p) => `pijl-label${p.grijs ? " grijs" : ""}`).text((p) => p.label);

const CELPAREN = BANEN.flatMap((b) => b.cellen.flatMap(([, ids]) => ids.slice(1).map((id, i) => ({ van: ids[i], naar: id }))));
const verbinder = pijlenG.selectAll("line.verbinder").data(CELPAREN).join("line").attr("class", "verbinder").style("opacity", 0);

// Vakken
const vakkenG = svg.append("g");
const IDS = Object.keys(VAKKEN);
const vak = vakkenG.selectAll("g.vak").data(IDS).join("g")
  .attr("class", (id) => `vak${VAKKEN[id].beslis ? " beslis" : ""}${VAKKEN[id].eind ? " eind" : ""}`)
  .style("opacity", 0);
const binnen = vak.append("g").attr("class", "vak-binnen");
binnen.append("rect").attr("class", "vak-halo");
binnen.append("rect").attr("class", "vak-rand");
binnen.append("text").attr("class", "kort").attr("font-size", (id) => VAKKEN[id].kortPx).text((id) => VAKKEN[id].kort);
const detail = binnen.append("g").attr("class", "detail");
detail.append("text").attr("class", "titel").selectAll("tspan").data((id) => VAKKEN[id].titelRegels).join("tspan")
  .attr("x", PAD_X).attr("y", (_, i) => 10 + 19 + i * TITEL_LH).text((r) => r);
detail.append("text").attr("class", "lang").selectAll("tspan")
  .data((id) => VAKKEN[id].langRegels.map((r) => [id, r])).join("tspan")
  .attr("x", PAD_X).attr("y", ([id], i) => 10 + VAKKEN[id].titelRegels.length * TITEL_LH + 4 + 18 + i * LANG_LH)
  .text(([, r]) => r);

const stip = svg.append("circle").attr("class", "melding").attr("r", 10).style("opacity", 0);

// Pijlen volgen de vakken; ze worden elk beeld opnieuw berekend.
function pijlPad(p, V, B) {
  const a = V[p.van], b = V[p.naar];
  const r = 7;
  const haaks = (pts) => { // lijn door hoekpunten met afgeronde hoeken
    const pad = d3.path();
    pad.moveTo(...pts[0]);
    for (let i = 1; i < pts.length - 1; i++) {
      const [p0, c, p1] = [pts[i - 1], pts[i], pts[i + 1]];
      const l1 = Math.hypot(c[0] - p0[0], c[1] - p0[1]) || 1, l2 = Math.hypot(p1[0] - c[0], p1[1] - c[1]) || 1;
      const rr = Math.min(r, l1 / 2, l2 / 2);
      pad.lineTo(c[0] + ((p0[0] - c[0]) / l1) * rr, c[1] + ((p0[1] - c[1]) / l1) * rr);
      pad.quadraticCurveTo(c[0], c[1], c[0] + ((p1[0] - c[0]) / l2) * rr, c[1] + ((p1[1] - c[1]) / l2) * rr);
    }
    pad.lineTo(...pts.at(-1));
    return pad.toString();
  };
  const mid = (v) => v.y + v.h / 2;
  let pts, lab;
  if (p.modus === "omlaag") {
    const x = p.naar === "mip" ? a.x + a.w / 2 - 40 : a.x + a.w / 2;
    pts = [[x, a.y + a.h], [x, b.y]];
    lab = [x + 7, a.y + a.h + 17, "start"];
  } else if (p.modus === "goot") {
    const gx = a.x - 11;
    pts = [[a.x, mid(a)], [gx, mid(a)], [gx, mid(b)], [b.x, mid(b)]];
    lab = [gx - 5, mid(a) + 24, "end"];
  } else if (p.modus === "onder") {
    const baan = B[PLEK[p.van].bi], x = a.x + a.w / 2 + 40, yb = baan.y + baan.h - 7, gx = b.x - 12;
    pts = [[x, a.y + a.h], [x, yb], [gx, yb], [gx, mid(b)], [b.x, mid(b)]];
    lab = [kolX(2) + 4, yb - 6, "start"];
  } else if (p.modus === "lus") {
    const baan = B[PLEK[p.van].bi], yb = baan.y + baan.h - 6, gx = COL0 + 6;
    pts = [[a.x + a.w / 2, a.y + a.h], [a.x + a.w / 2, yb], [gx, yb], [gx, mid(b)], [b.x, mid(b)]];
    lab = [kolX(1), yb - 6, "start"];
  } else {
    const x1 = a.x + a.w, x2 = b.x, mx = (x1 + x2) / 2;
    pts = Math.abs(mid(a) - mid(b)) < 0.5 ? [[x1, mid(a)], [x2, mid(b)]]
      : [[x1, mid(a)], [mx, mid(a)], [mx, mid(b)], [x2, mid(b)]];
    lab = [x1 + 4, mid(a) - 7, "start"];
  }
  return { d: haaks(pts), lab };
}

function teken(L) {
  baan.each(function (_, bi) {
    const g = d3.select(this), b = L.banen[bi];
    g.select(".baan-vlak").attr("y", b.y).attr("height", b.h);
    g.select(".baan-kop").attr("y", b.y).attr("height", b.h);
    const px = BANEN[bi].naamPx - 7 * b.mini, n = BANEN[bi].naamRegels.length;
    const blok = n * px * 1.2 + (1 - b.mini) * 24;
    const top = b.y + b.h / 2 - blok / 2 + px * 0.85;
    g.select(".baan-naam").attr("font-size", px).selectAll("tspan").attr("y", (_, i) => top + i * px * 1.2);
    g.select(".baan-route").attr("y", top + (n - 1) * px * 1.2 + 24).style("opacity", 1 - b.mini);
  });
  vak.each(function (id) {
    const v = L.vakken[id], g = d3.select(this);
    const rx = VAKKEN[id].beslis ? Math.min(v.h / 2, 19) : Math.min(6, v.h / 2);
    g.attr("transform", `translate(${v.x},${v.y})`);
    g.select(".vak-rand").attr("width", v.w).attr("height", v.h).attr("rx", rx);
    g.select(".vak-halo").attr("x", -2).attr("y", -2).attr("width", v.w + 4).attr("height", v.h + 4).attr("rx", rx + 2);
    g.select(".kort").attr("x", v.w / 2).attr("y", v.h / 2).style("opacity", v.kort ** 3);
    g.select(".detail").style("opacity", v.detail ** 4);
  });
  verbinder.each(function (c) {
    const a = L.vakken[c.van], b = L.vakken[c.naar], x = a.x + a.w / 2;
    d3.select(this).attr("x1", x).attr("y1", a.y + a.h).attr("x2", x).attr("y2", b.y);
  });
  pijl.each(function (p) {
    const { d, lab } = pijlPad(p, L.vakken, L.banen);
    const g = d3.select(this);
    g.select("path").attr("d", d);
    const klein = Math.max(L.banen[PLEK[p.van].bi].mini, L.banen[PLEK[p.naar].bi].mini);
    g.select("text").attr("x", lab[0]).attr("y", lab[1]).attr("text-anchor", lab[2]).style("opacity", 1 - klein);
  });
}

/* ================= De melding die meeloopt ================= */

let reisNr = 0;
const halo = (id, aan) => vak.filter((x) => x === id).classed("aan", aan);
const zet = ([x, y]) => stip.attr("cx", x).attr("cy", y);

async function loop(punten, duur) { // stip langs een lijst punten of langs een pad
  await animate(0, 1, { duration: T(duur), ease: "easeInOut", onUpdate: (t) => zet(punten(t)) });
}

// De stip is alleen te zien als de melding onderweg is. In een vak licht het vak op.
async function reizen(ids, nr) {
  vak.classed("aan", false);
  if (reduce) { ids.forEach((id) => halo(id, true)); return; }
  for (let i = 0; i < ids.length; i++) {
    if (nr !== reisNr) return;
    const id = ids[i], volgende = ids[i + 1];
    halo(id, true);
    await wacht(0.5);
    if (nr !== reisNr || !volgende) return;
    halo(id, false);
    const p = PIJLEN.find((x) => x.van === id && x.naar === volgende);
    let punt, duur;
    if (p) {
      const el = pijl.filter((x) => x === p).select("path").node(), L = el.getTotalLength();
      punt = (t) => { const q = el.getPointAtLength(t * L); return [q.x, q.y]; };
      duur = 0.45 + L / 1400;
    } else { // naar het volgende vak in dezelfde cel
      const a = indelingNu.vakken[id], b = indelingNu.vakken[volgende], x = a.x + a.w / 2;
      punt = (t) => [x, a.y + a.h + (b.y - a.y - a.h) * t];
      duur = 0.3;
    }
    zet(punt(0));
    stip.style("opacity", 1);
    await loop(punt, duur);
    stip.style("opacity", 0);
  }
}

/* ================= Bijschrift ================= */

function bijschriftTekenen(s) {
  const el = $("bijschrift");
  const station = s.eindpunten ? `<div class="station"><div class="wat">${s.wat} · ${s.titel}</div></div>`
    : `<div class="station"><div class="wat">${s.wat}</div><h2>${s.titel}</h2>
    ${(s.tekst || []).map((t, i) => `<p${s.bronnen && i ? ' class="klein"' : ""}>${t}</p>`).join("")}</div>`;
  let rechts = "";
  if (s.eindpunten) {
    rechts = `<div class="kaarten">${["A", "B", "C", "D", "E"].map((l) => {
      const v = VAKKEN[l];
      return `<div class="kaartje"><b><span class="letter">${l}</span>${v.kort.slice(4)}</b>${v.lang}</div>`;
    }).join("")}</div>`;
  }
  el.classList.toggle("eind", Boolean(s.eindpunten));
  el.innerHTML = station + rechts;
  animate([...el.children], { opacity: [0, 1], y: [10, 0] }, { duration: T(0.4), delay: stagger(T(0.08)) });
}

/* ================= Regie ================= */

let stap = -1;
let indelingNu = indeling(null);
let overgang = null;

function zichtbaarheid(n, vooruit) {
  // Vakken: nieuw zichtbare vakken verschijnen per kolom, van links naar rechts.
  const nieuw = [];
  vak.each(function (id) {
    const aan = vanafVak(id) <= n, was = this.dataset.aan === "1";
    this.dataset.aan = aan ? "1" : "0";
    if (aan && !was) nieuw.push(this);
    else if (!aan && was) animate(this, { opacity: 0 }, { duration: T(0.2) });
  });
  nieuw.sort((a, b) => indelingNu.vakken[a.__data__].x - indelingNu.vakken[b.__data__].x || indelingNu.vakken[a.__data__].y - indelingNu.vakken[b.__data__].y);
  nieuw.forEach((el, i) => {
    animate(el, { opacity: [0, 1] }, { duration: T(0.4), delay: T((vooruit ? 0.35 : 0) + i * 0.05) });
  });
  verbinder.each(function (c) {
    animate(this, { opacity: vanafVak(c.naar) <= n ? 1 : 0 }, { duration: T(0.4), delay: T(vooruit ? 0.5 : 0) });
  });
  // Pijlen: doorgetrokken pijlen tekenen zich, grijze pijlen komen op.
  pijl.each(function (p) {
    const aan = p.vanaf <= n, was = this.dataset.aan === "1";
    this.dataset.aan = aan ? "1" : "0";
    const pad = this.querySelector("path");
    if (aan && !was) {
      animate(this, { opacity: 1 }, { duration: T(0.3), delay: T(0.6) });
      if (!p.grijs) {
        pad.style.strokeDasharray = "1 1";
        animate(pad, { strokeDashoffset: [1, 0] }, { duration: T(0.7), delay: T(0.6), ease: "easeOut",
          onComplete: () => { pad.style.strokeDasharray = ""; } });
      }
    } else if (!aan && was) animate(this, { opacity: 0 }, { duration: T(0.2) });
  });
}

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  const vooruit = n > stap;
  stap = n;
  const s = STAPPEN[n];
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);

  // Lopende melding stoppen.
  reisNr++;
  stip.interrupt().style("opacity", 0);
  vak.classed("aan", false);

  // Opmaak per stap: welke baan groot is, wat vervaagt.
  const mini = (bi) => s.focus != null && bi !== s.focus;
  baan.classed("focus", (_, bi) => bi === s.focus).classed("mini", (_, bi) => mini(bi));
  vak.classed("mini", (id) => mini(PLEK[id].bi));
  // Eindpunten: alleen de eindpunten scherp. Leren: alleen de lussen en hun vakken scherp.
  const nadruk = s.nadruk ? new Set(s.nadruk) : null;
  const vakStil = (id) => (s.eindpunten && !VAKKEN[id].eind) || (nadruk && !nadruk.has(id));
  vak.select(".vak-binnen").classed("stil", vakStil);
  verbinder.classed("stil", (c) => Boolean(vakStil(c.van) || vakStil(c.naar)));
  pijl.classed("stil", (p) => (s.eindpunten && !VAKKEN[p.naar].eind) || (nadruk && !p.grijs));

  // Overgang van de huidige indeling naar die van deze stap.
  overgang?.stop();
  const van = indelingNu, naar = indeling(s.focus);
  const nr = reisNr;
  overgang = animate(0, 1, {
    duration: T(0.8), ease: [0.65, 0, 0.35, 1],
    onUpdate: (t) => { indelingNu = meng(van, naar, t); teken(indelingNu); },
    onComplete: () => {
      indelingNu = naar; teken(naar);
      if (s.reis && nr === reisNr) wacht(T(0.5)).then(() => nr === reisNr && reizen(s.reis, nr));
    },
  });

  // Bronnen: grote kaarten over het gedimde bord.
  svg.classed("achter", Boolean(s.bronnen));
  $("bronnen").classList.toggle("aan", Boolean(s.bronnen));
  if (s.bronnen) animate("#bronnen .bron", { opacity: [0, 1], y: [16, 0] }, { duration: T(0.45), delay: stagger(T(0.09), { startDelay: T(0.2) }) });

  zichtbaarheid(n, vooruit);
  bijschriftTekenen(s);
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

// #stap-N in de adresbalk: handig om te oefenen vanaf een bepaalde stap.
const stapUitHash = () => {
  const n = parseInt((location.hash.match(/stap-(\d+)/) || [])[1], 10);
  return Number.isFinite(n) ? n - 1 : 0;
};
addEventListener("hashchange", () => ga(stapUitHash()));

$("bronnen").innerHTML = `<div class="kop">Gebaseerd op</div><div class="rij">${BRONNEN.map((b) =>
  `<div class="bron"><b>${b.naam}</b><span class="meta">${b.meta}</span><p>${b.tekst}</p></div>`).join("")}</div>`;
teken(indelingNu);
// De banen schuiven bij het openen één voor één in beeld.
animate(baan.nodes(), { opacity: [0, 1], x: [-30, 0] }, { duration: T(0.5), delay: stagger(T(0.08)) });
animate(koppen.node(), { opacity: [0, 1] }, { duration: T(0.6), delay: T(0.3) });
ga(stapUitHash());
