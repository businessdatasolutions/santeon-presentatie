/* De harness en de kennis — extra materiaal bij 3a (station AI-agent).
   Naar de visualisaties in businessdatasolutions/architecture-of-scale ("Same problems, same architecture"
   en "Four ways to answer one question"), vertaald naar het VIM-proces en de huisstijl.
   Deel 1 (Three.js): één printplaat met zes onderdelen. Dezelfde onderdelen krijgen drie keer andere namen:
     computer → AI-agent → jouw ziekenhuis. Per lens beweegt er iets anders over de plaat (harness-dragers.js):
     enen en nullen, een botje, een poppetje dat loopt en werkt. Daarna brengt het botje melding 0501
     door de harness, met een logboek; bij de laatste regel staat er een mens bij de opdracht.
   Deel 2 (D3 + motion): vier manieren om kennis bij het taalmodel te krijgen (alleen het model, RAG,
     kennisgraaf, LLM-wiki), elk getest op drie VIM-vragen.
   Vast script, geen netwerkaanroepen. 0501 volgt CASES in vim-agent-animatie.html (één vraag, antwoord
   "onbekend", voorstel SAC 4 onzeker, escalatie). Spreker stuurt: → / ← / spatie / klikker, #stap-N. */

import * as THREE from "three";
import * as d3 from "d3";
import { animate, stagger } from "motion";
import { lichtAan, maakBits, maakBot, maakMens, lijn, opLijn } from "./harness-dragers.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const T = (s) => (reduce ? 0 : s);
const $ = (id) => document.getElementById(id);

// lucide "bot" en "user-round"
const BOT = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
const MENS = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';

/* ================= Deel 1: de onderdelen ================= */

const LENZEN = ["Computer", "AI-agent", "Jouw ziekenhuis"];

// pos = [x, y, breedte, diepte] in een raster van 740 × 540 (zoals de bron); h = hoogte van het blok.
// namen[lens] = [naam, korte uitleg]. Het taalmodel (lens 1) krijgt de AI-markering.
const DELEN = {
  app: { pos: [470, 30, 230, 70], h: 0.35, namen: [["Programma", "vraagt iets"], ["Opdracht", "de prompt"], ["Verzoek", "de vraag aan de professional"]] },
  os: { pos: [100, 130, 600, 80], h: 0.3, namen: [["Besturingssysteem", "regelt alles eromheen"], ["Harness", "regelt alles rond het model"], ["Kwaliteitssysteem", "regelt alles rond het werk"]] },
  ram: { pos: [50, 250, 200, 140], h: 0.45, namen: [["Werkgeheugen", "snel, maar beperkt"], ["Contextvenster", "wat de agent nu leest"], ["Dossier op tafel", "wat je nu voor je hebt"]] },
  cpu: { pos: [290, 240, 220, 160], h: 0.65, namen: [["Processor", "rekent, doet niets uit zichzelf"], ["Taalmodel", "leest en schrijft, onthoudt niets"], ["Professional", "kan veel, werkt met wat er ligt"]] },
  tools: { pos: [550, 250, 160, 140], h: 0.5, namen: [["Drivers", "praten met apparaten"], ["Tools", "doorvragen, tweede controle"], ["Telefoon, lab, collega", "navragen en laten controleren"]] },
  opslag: { pos: [50, 440, 320, 70], h: 0.3, namen: [["Schijf", "blijft bewaard"], ["Data lake en OKF", "meldingen en kennis"], ["EPD en archief", "blijft bewaard"]] },
};
const VERBINDINGEN = [["app", "os"], ["os", "ram"], ["os", "cpu"], ["os", "tools"], ["ram", "cpu"], ["os", "opslag"], ["opslag", "ram"], ["tools", "opslag"]];

// De taken van de harness (stap 8): taak van een besturingssysteem → in de demo → in jouw ziekenhuis.
const TAKEN = [
  ["Werkgeheugen beheren", "Context samenstellen: de melding en vier OKF-bestanden", "Het juiste dossier klaarleggen"],
  ["Planning", "De lus besturen: hooguit 3 vragen, dan een antwoord", "Werkafspraken en termijnen"],
  ["Hulpmiddelen inzetten", "Tools uitvoeren: doorvragen bij de melder", "Navragen bij een collega of het lab"],
  ["Afscherming", "Rechten: alleen lezen, geen echte meldingen", "Bevoegdheden en toegang tot het dossier"],
  ["Fouten opvangen", "Opnieuw proberen, terugval op vaste regels, escaleren", "Escalatie en de calamiteitenprocedure"],
];

// Melding 0501 door de harness: per punt van het pad één regel in het logboek.
const LOG_0501 = [
  ["app", "Opdracht", "Trieer melding VIM-2026-0501."],
  ["os", "Plan", "De harness kiest het draaiboek voor de triage."],
  ["opslag", "Lezen", "De melding uit het data lake, en vier OKF-bestanden."],
  ["ram", "Context", "Melding en bestanden staan in het contextvenster."],
  ["cpu", "Taalmodel", "Er ontbreekt een feit. Het model wil doorvragen."],
  ["os", "Grens", "Vraag 1 van hooguit 3."],
  ["tools", "Tool", "Aan de melder: is de dubbelcheck vooraf uitgevoerd?"],
  ["os", "Antwoord", "Onbekend: dit staat niet in de melding."],
  ["ram", "Context", "Het antwoord komt in het contextvenster."],
  ["cpu", "Taalmodel", "Voorstel: SAC 4, onzeker. De kernvraag blijft open."],
  ["tools", "Controle", "Een tweede AI toetst het voorstel tegen het draaiboek."],
  ["os", "Escalatie", "De kernvraag blijft open. De harness zet escalatie aan."],
  ["app", "Mens", "De kwaliteitsadviseur beslist."],
];
const PAD_ROND = ["app", "os", "ram", "cpu", "os", "tools", "opslag", "os", "app"];
const SEG = 1.5; // botje: seconden per stukje pad, landen en wachten inbegrepen
const RUST = 0.35; // deel van dat stukje dat het botje op het onderdeel blijft
const SNEL_BITS = 2.4; // binair signaal: eenheden per seconde

// Het poppetje loopt een eigen rondje door de gangen tussen de onderdelen (raster 740 × 540).
// Per plek: onderdeel, handeling, duur in seconden. Het verhaal: verzoek lezen → protocol afvinken →
// dossier uit het archief → dossier doorlezen → nadenken → een collega bellen → terug.
const MENS_LUS = [["app", "lezen", 2.6], ["os", "afvinken", 2.6], ["opslag", "oppakken", 2.4], ["ram", "dossier", 2.8], ["cpu", "nadenken", 2.6], ["tools", "bellen", 2.8]];
const MENS_PLEK = { app: [440, 65], os: [75, 175], opslag: [22, 475], ram: [150, 420], cpu: [400, 420], tools: [630, 420] };
const MENS_GANG = { // de hoeken onderweg; elk stuk is recht
  "app-os": [[75, 65]], "os-opslag": [[75, 225], [22, 225], [22, 420]], "opslag-ram": [[22, 420]],
  "ram-cpu": [], "cpu-tools": [], "tools-app": [[736, 420], [736, 115], [440, 115]],
};
const SNEL_MENS = 1.5, PAS = 1.0; // eenheden per seconde; lengte van één looppas (twee stappen)

/* ================= Deel 2: vier manieren ================= */

const KOLOMMEN = [
  { id: "model", nr: "01", naam: "Alleen het model", voorwerk: "Geen voorwerk", wat: "Het model antwoordt uit wat het in de training zag." },
  { id: "rag", nr: "02", naam: "RAG", voorwerk: "Weinig voorwerk", wat: "De harness zoekt passende documenten en zet die in het contextvenster." },
  { id: "graaf", nr: "03", naam: "Kennisgraaf", voorwerk: "Veel voorwerk", wat: "Begrippen en relaties, vooraf vastgelegd. Zoals de ontologie." },
  { id: "wiki", nr: "04", naam: "LLM-wiki", voorwerk: "Doorlopend voorwerk", wat: "Kennis staat klaar als kaarten, met bron en datum. Zoals de OKF-bundel." },
];
const STATUS = {
  goed: "Goed antwoord", deels: "Deels goed", gok: "Gok", geen: "Geen antwoord",
};
const VRAGEN = [
  { soort: "Algemene vakkennis", tekst: "Wat is PRISMA?", antwoord: {
    model: { status: "goed", tekst: "Een methode om de oorzaken van een incident te analyseren.", les: "Algemene vakkennis zit al in het model. Het goedkoopste antwoord, maar zonder bron." },
    rag: { status: "goed", tekst: "Een methode voor oorzaakanalyse. [bron: praktijkgids-vim-nivel.pdf]", les: "Werkt, maar is hier overbodig: het model wist het al." },
    graaf: { status: "deels", tekst: "Basisoorzaak → PRISMA → T · O · H · PRF · X", les: "De graaf kent de categorieën, niet de uitleg. Het voorwerk betaalt zich hier niet terug." },
    wiki: { status: "goed", tekst: "PRISMA: methode voor oorzaakanalyse. Categorieën T, O, H, PRF, X.", les: "De kaart stond al klaar, met bron en datum." } } },
  { soort: "Eigen werkwijze", tekst: "Wat doen we bij een onvolledige melding?", antwoord: {
    model: { status: "gok", tekst: "Meestal neem je contact op met de melder … (niet uit jullie draaiboek)", les: "Het model kent jouw draaiboek niet. Het vult zelf in. Het antwoord klinkt goed, maar is een gok." },
    rag: { status: "goed", tekst: "Stel één gerichte vraag aan de melder. Neem niets aan. [bron: runbook-triage-vim.md, stap 5]", les: "Hier is RAG sterk: een eigen document vinden en citeren." },
    graaf: { status: "geen", tekst: "Geen werkwijze in de graaf.", les: "Een graaf kent begrippen, geen stappen. Voor een werkwijze heb je tekst nodig." },
    wiki: { status: "goed", tekst: "Triage, onvolledige melding: stel één gerichte vraag (stap 5).", les: "Werkt, als iemand de kaart bijhoudt." } } },
  { soort: "Meerdere stappen", tekst: "Welke andere valincidenten hadden dezelfde omstandigheid als 0418?", antwoord: {
    model: { status: "gok", tekst: "Waarschijnlijk andere vallen bij oudere patiënten … (niet gecontroleerd)", les: "Het model raadt op patronen. Zo ontstaat een antwoord dat op een feit lijkt." },
    rag: { status: "deels", tekst: "Gevonden: 0470 en 0435.", les: "RAG vindt teksten die erop lijken. 0435 gaat over decubitus: dat is fout." },
    graaf: { status: "goed", tekst: "VIM-2026-0470", les: "De graaf volgt de relaties. Het antwoord is berekend, niet geraden." },
    wiki: { status: "goed", tekst: "VIM-2026-0470", les: "Twee kaarten met dezelfde velden. De overeenkomst is te lezen." } } },
];

// Wat elk model "weet": tegels uit de training. mist = bij welke vraag (index) deze kennis ontbreekt.
const MODEL_TEGELS = [
  { t: "PRISMA · oorzaakanalyse", bij: [0] }, { t: "SAC · ernst × kans", bij: [] }, { t: "VIM · leren van meldingen", bij: [0] },
  { t: "valpreventie · algemeen", bij: [] }, { t: "Wkkgz · meldplicht", bij: [] }, { t: "medicatie · algemeen", bij: [] },
  { t: "??? draaiboek St. Machteld", mist: 1 }, { t: "??? meldingen juni 2026", mist: 2 }, { t: "??? omstandigheid 0418", mist: 2 },
];
// RAG: gelijkenis van elk document met de drie vragen. fout = gevonden, maar het hoort er niet bij.
const DOCS = [
  { naam: "praktijkgids-vim-nivel.pdf", score: [0.91, 0.22, 0.05] },
  { naam: "runbook-triage-vim.md", score: [0.18, 0.94, 0.07] },
  { naam: "knmg-veilig-melden.pdf", score: [0.31, 0.35, 0.04] },
  { naam: "VIM-2026-0470", score: [0.03, 0.1, 0.82] },
  { naam: "VIM-2026-0435", score: [0.02, 0.08, 0.58], fout: [2] },
  { naam: "VIM-2026-0485", score: [0.02, 0.05, 0.21] },
];
// Kennisgraaf: een klein stuk van de ontologie. pad[vraag] = de knopen en randen die oplichten.
const KNOPEN = [
  { id: "q", x: 150, y: 16, label: "Vraag", soort: "vraag" },
  { id: "basis", x: 62, y: 62, label: "Basisoorzaak" },
  { id: "prisma", x: 62, y: 112, label: "PRISMA" },
  { id: "m18", x: 150, y: 62, label: "0418" },
  { id: "m70", x: 262, y: 62, label: "0470" },
  { id: "val", x: 205, y: 112, label: "Val" },
  { id: "bed", x: 150, y: 128, label: "Bed te hoog", soort: "kruis" },
  { id: "ans", x: 150, y: 172, label: "Antwoord", soort: "uitkomst" },
];
const RANDEN = [
  { van: "q", naar: "basis" }, { van: "basis", naar: "prisma", type: "classificatie" },
  { van: "q", naar: "m18" }, { van: "m18", naar: "val", type: "categorie" }, { van: "m70", naar: "val", type: "categorie" },
  { van: "m18", naar: "bed", type: "omstandigheid" }, { van: "m70", naar: "bed", type: "omstandigheid" },
  { van: "prisma", naar: "ans" }, { van: "bed", naar: "ans" },
];
const GRAAF_PAD = [
  ["q", "basis", "prisma", "ans"],
  [],
  ["q", "m18", "bed", "m70", "ans"],
];
// LLM-wiki: kaarten met velden. bij = bij welke vraag de kaart gelezen wordt.
const KAARTEN = [
  { naam: "PRISMA", velden: ["methode: oorzaakanalyse", "T · O · H · PRF · X"], datum: "3 juni", bij: [0] },
  { naam: "Triage: onvolledig", velden: ["stap 5: één gerichte vraag", "bron: runbook triage"], datum: "16 juni", bij: [1] },
  { naam: "VIM-2026-0418", velden: ["categorie: Val", "omstandigheid: bed te hoog"], datum: "3 juni", bij: [2] },
  { naam: "VIM-2026-0470", velden: ["categorie: Val", "omstandigheid: bed te hoog"], datum: "12 juni", bij: [2] },
];

/* ================= Het script ================= */

// deel 0 = de printplaat. scene: lens, focus (onderdelen), pad ("rond" of "melding").
// deel 1 = de vier manieren. vraag = index in VRAGEN; slot = de conclusie.
const STAPPEN = [
  { deel: 0, scene: { lens: 0, pad: "rond" }, laag: "De vergelijking · 1 van 3", titel: "Een computer", lenzen: true,
    tekst: ["Een programma vraagt iets. Het besturingssysteem regelt de rest.", "De processor rekent. Het werkgeheugen houdt vast wat nu nodig is."] },
  { deel: 0, scene: { lens: 1, pad: "rond" }, laag: "De vergelijking · 2 van 3", titel: "Een AI-agent", lenzen: true,
    tekst: ["Dezelfde opbouw, andere namen.", "Het taalmodel is de processor. De harness is het besturingssysteem."] },
  { deel: 0, scene: { lens: 2, pad: "rond" }, laag: "De vergelijking · 3 van 3", titel: "Jouw ziekenhuis", lenzen: true,
    tekst: ["Ook hier dezelfde opbouw.", "De professional doet het werk. Het kwaliteitssysteem regelt alles eromheen."] },
  { deel: 0, scene: { lens: 1, focus: ["cpu"] }, laag: "Onderdeel · de kern", titel: "Leest en schrijft, maar doet niets alleen", kaart: "cpu",
    tekst: ["Een taalmodel leest tekst en schrijft een antwoord.", "Het onthoudt niets tussen twee meldingen. Het kent jouw regels niet."] },
  { deel: 0, scene: { lens: 1, focus: ["ram"] }, laag: "Onderdeel · het werkgeheugen", titel: "Snel, maar beperkt", kaart: "ram",
    tekst: ["Het contextvenster is wat de agent nu leest: de melding en de OKF-bestanden.", "Wat er niet in staat, weet de agent niet."] },
  { deel: 0, scene: { lens: 1, focus: ["tools"] }, laag: "Onderdeel · de hulpmiddelen", titel: "Iets doen buiten het model", kaart: "tools",
    tekst: ["Met tools kan de agent iets doen wat het model zelf niet kan.", "In de demo: doorvragen bij de melder, en een tweede controle."] },
  { deel: 0, scene: { lens: 1, focus: ["opslag"] }, laag: "Onderdeel · de opslag", titel: "Wat bewaard blijft", kaart: "opslag",
    tekst: ["Het data lake bewaart de meldingen. De OKF-bundel bewaart de kennis.", "De harness haalt eruit wat de agent nu nodig heeft."] },
  { deel: 0, scene: { lens: 1, focus: ["os"] }, laag: "Onderdeel · de regie", titel: "De harness regelt alles eromheen", breed: true, taken: true,
    tekst: ["Dezelfde vijf taken als een besturingssysteem."] },
  { deel: 0, scene: { lens: 1, pad: "melding" }, laag: "Voorbeeld", titel: "Melding 0501 door de harness", breed: true, log: true,
    tekst: ["De melding is onvolledig. Volg de agent langs de onderdelen."] },
  { deel: 0, scene: { lens: 1 }, laag: "Wat je ervan meeneemt", titel: "Het model is gehuurd. De harness is van jou.", breed: true,
    tegels: [
      ["Het model is de processor", "Een taalmodel doet in de praktijk niets zonder harness."],
      ["Een nieuw model is een wissel", "Je regels, je ontologie en je OKF-bestanden blijven. Daar bouw je op."],
      ["Daar zit jouw werk", "Wat de harness leest, schrijven mensen op: begrippen, drempels en draaiboeken."],
    ] },
  { deel: 1, vraag: null },
  { deel: 1, vraag: 0 },
  { deel: 1, vraag: 1 },
  { deel: 1, vraag: 2 },
  { deel: 1, slot: true },
];
const KOP = ["De harness: alles rond het taalmodel", "Waar haalt de agent zijn kennis vandaan?"];
const DEEL = ["Extra materiaal · Deel 1", "Extra materiaal · Deel 2"];

/* ================= Deel 1: de printplaat (Three.js) ================= */

function maakBord(doek, labelLaag) {
  const INKT = 0x1a1a1a, GRIJS = 0x9ca3af, GEEL = 0xd4db3e, CREME = 0xf0ebe0;
  const X = (px) => (px / 740) * 10 - 5;
  const Z = (py) => (py / 540) * 7 - 3.5;
  const OPP = 0.07; // hoogte van de sporen op de plaat

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  doek.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1.5, 0.1, 100);
  // bijna recht van voren en van boven: de indeling van de bron blijft leesbaar
  const OVERZICHT = { x: 2.2, y: 12.5, z: 10.2, tx: 0.7, ty: 0, tz: 0.5 };
  const cam = { ...OVERZICHT }, doel = { ...OVERZICHT };
  let huidig = { lens: 0 }, lens = -1, loopt = false, t0 = performance.now();

  const rand = (mesh, kleur) => {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: kleur, transparent: true }));
    e.position.copy(mesh.position);
    scene.add(e);
    return e;
  };

  // de plaat
  const plaat = new THREE.Mesh(new THREE.BoxGeometry(10.6, 0.12, 7.6), new THREE.MeshBasicMaterial({ color: CREME }));
  scene.add(plaat);
  rand(plaat, GRIJS);
  // kleine onderdelen: alleen decor, zodat het een printplaat wordt
  [[-4.6, -3.1], [-4.1, -3.1], [4.6, 3.2], [4.1, 3.2], [3.4, 2.9], [-0.6, 3.2], [0.2, 3.2], [2.8, -0.35]].forEach(([x, z]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 16), new THREE.MeshBasicMaterial({ color: 0xe5e7eb }));
    c.position.set(x, 0.2, z);
    scene.add(c);
    rand(c, GRIJS);
  });

  // de zes onderdelen
  const delen = {};
  for (const [id, d] of Object.entries(DELEN)) {
    const [px, py, pw, pd] = d.pos;
    const w = (pw / 740) * 10, dd = (pd / 540) * 7;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, d.h, dd), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }));
    m.position.set(X(px) + w / 2, 0.06 + d.h / 2, Z(py) + dd / 2);
    scene.add(m);
    const el = document.createElement("div");
    el.className = "lbl deel";
    labelLaag.appendChild(el);
    delen[id] = { m, e: rand(m, INKT), el, top: new THREE.Vector3(m.position.x, 0.06 + d.h + 0.12, m.position.z), d };
  }

  // sporen tussen de onderdelen: van het midden, via een knik, naar het midden
  const knik = (a, b) => {
    const A = delen[a].m.position, B = delen[b].m.position;
    return [new THREE.Vector3(A.x, OPP, A.z), new THREE.Vector3(B.x, OPP, A.z), new THREE.Vector3(B.x, OPP, B.z)];
  };
  for (const [a, b] of VERBINDINGEN) {
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(knik(a, b)), new THREE.LineBasicMaterial({ color: GRIJS }));
    scene.add(l);
  }

  // wat over de plaat beweegt: per lens een andere drager (harness-dragers.js)
  lichtAan(scene);
  const bits = maakBits(scene), bot = maakBot(scene), mens = maakMens(scene);
  const midden = (id) => delen[id].m.position;
  const opp = (id) => 0.06 + delen[id].d.h; // bovenkant van een onderdeel
  const onderdeelOp = (p) => {
    for (const [id, q] of Object.entries(delen)) {
      const { width, depth } = q.m.geometry.parameters;
      if (Math.abs(p.x - q.m.position.x) < width / 2 && Math.abs(p.z - q.m.position.z) < depth / 2) return id;
    }
    return null;
  };
  const naarCamera = (p) => Math.atan2(camera.position.x - p.x, camera.position.z - p.z);

  // computer: het signaal loopt boven de sporen en duikt in elk onderdeel (op de plaat zelf vallen de bits achter de blokken)
  const BOVEN = 0.85;
  const BITLIJN = lijn(PAD_ROND.flatMap((id, i) => {
    const B = midden(id), duik = new THREE.Vector3(B.x, opp(id) - 0.12, B.z);
    if (i === 0) return [duik, new THREE.Vector3(B.x, BOVEN, B.z)];
    const A = midden(PAD_ROND[i - 1]);
    return [new THREE.Vector3(B.x, BOVEN, A.z), new THREE.Vector3(B.x, BOVEN, B.z), duik, ...(i < PAD_ROND.length - 1 ? [new THREE.Vector3(B.x, BOVEN, B.z)] : [])];
  }));

  // AI-agent: het botje stijgt op, vliegt boven het spoor en landt op het volgende onderdeel
  const VLIEG = 1.5;
  // landen links vóór op het onderdeel: het label staat in het midden
  const BOTPLEK = Object.fromEntries(Object.keys(DELEN).map((id) => {
    const { width, depth } = delen[id].m.geometry.parameters, m = midden(id);
    return [id, new THREE.Vector3(m.x - Math.min(width * 0.3, 1.1), opp(id) + 0.33, m.z + depth * 0.28)];
  }));
  const botPad = (ids) => ids.slice(0, -1).map((id, i) => {
    const A = BOTPLEK[id], B = BOTPLEK[ids[i + 1]];
    return lijn([BOTPLEK[id], new THREE.Vector3(A.x, VLIEG, A.z), new THREE.Vector3(B.x, VLIEG, A.z), new THREE.Vector3(B.x, VLIEG, B.z), BOTPLEK[ids[i + 1]]]);
  });
  const MELDING = LOG_0501.map((r) => r[0]);
  const BOTPADEN = { rond: botPad(PAD_ROND), melding: botPad(MELDING) };
  const botPos = new THREE.Vector3();
  const vliegRichting = (l, k) => {
    // tijdens stijgen en dalen kijkt het botje al naar het stuk dat horizontaal komt
    const [p, q] = k <= 1 ? [1, 2] : [2, 3];
    let dx = l.pts[q].x - l.pts[p].x, dz = l.pts[q].z - l.pts[p].z;
    if (Math.hypot(dx, dz) < 1e-3) { const [p2, q2] = k <= 1 ? [2, 3] : [1, 2]; dx = l.pts[q2].x - l.pts[p2].x; dz = l.pts[q2].z - l.pts[p2].z; }
    return Math.atan2(dx, dz);
  };

  // jouw ziekenhuis: het poppetje, met een rondje van zes plekken
  const wereld = ([px, py]) => new THREE.Vector3(X(px), 0.06, Z(py));
  const MENS_BENEN = MENS_LUS.map(([id], k) => {
    const naar = MENS_LUS[(k + 1) % MENS_LUS.length][0];
    return lijn([MENS_PLEK[id], ...MENS_GANG[`${id}-${naar}`], MENS_PLEK[naar]].map(wereld));
  });
  const RONDE = MENS_LUS.reduce((s, [, , duur], k) => s + duur + MENS_BENEN[k].totaal / SNEL_MENS, 0);
  const mensPos = new THREE.Vector3();
  // draagt = hoeveel het poppetje het dossier vasthoudt (0..1); van het archief tot terug bij de opdracht
  const draagtBij = (k, a, ronde) => [ronde > 0 ? 1 - Math.min(1, a / 0.2) : 0, 0, Math.min(1, Math.max(0, (a - 0.5) / 0.35)), 1, 1, 1][k];
  function mensOpTijd(tau) {
    if (tau == null) return { pos: MENS_BENEN[0].pts[0], handeling: "lezen", a: 0.5, t: 0, plek: "app" };
    const ronde = Math.floor(tau / RONDE);
    let r = tau - ronde * RONDE;
    for (let k = 0; k < MENS_LUS.length; k++) {
      const [id, handeling, duur] = MENS_LUS[k];
      if (r < duur) return { pos: MENS_BENEN[k].pts[0], handeling, a: r / duur, t: r, draagt: draagtBij(k, r / duur, ronde), plek: id };
      r -= duur;
      const L = MENS_BENEN[k], loop = L.totaal / SNEL_MENS;
      if (r < loop) {
        const s = r * SNEL_MENS, i = opLijn(L, s, mensPos);
        const kracht = Math.min(1, s / 0.25, (L.totaal - s) / 0.25); // optrekken en afremmen
        return { pos: mensPos, kijk: Math.atan2(L.pts[i + 1].x - L.pts[i].x, L.pts[i + 1].z - L.pts[i].z), fase: (s / PAS) * Math.PI * 2, kracht, draagt: k >= 2 ? 1 : 0 };
      }
      r -= loop;
    }
    return { pos: MENS_BENEN[0].pts[0], handeling: "lezen", a: 0, t: 0 };
  }
  let padStart = 0, bijPunt = null, vorige = performance.now();

  function labelsZetten() {
    for (const [id, p] of Object.entries(delen)) {
      const [naam, sub] = p.d.namen[huidig.lens];
      const ai = id === "cpu" && huidig.lens === 1;
      p.el.innerHTML = `<b>${ai ? BOT : ""}${naam}</b><span>${sub}</span>`;
      p.el.classList.toggle("ai", ai);
      animate(p.el, { opacity: [0, 1], scale: [0.92, 1] }, { duration: T(0.45), delay: T(0.05 * Object.keys(DELEN).indexOf(id)) });
    }
  }

  const v = new THREE.Vector3();
  function zet(el, p, w, h) {
    v.copy(p).project(camera);
    el.style.left = ((v.x + 1) / 2) * w + "px";
    el.style.top = ((1 - v.y) / 2) * h + "px";
  }

  function teken(nu) {
    if (!loopt) return;
    const t = (nu - t0) / 1000, k = reduce ? 1 : 0.06;
    for (const p in doel) cam[p] += (doel[p] - cam[p]) * k;
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(cam.tx, cam.ty, cam.tz);

    // de drager van deze lens
    const sc = huidig;
    const dt = Math.min(0.05, Math.max(0, (nu - vorige) / 1000));
    vorige = nu;
    // nu (van requestAnimationFrame) kan net vóór padStart liggen: nooit negatief
    const verlopen = Math.max(0, (nu - padStart) / 1000);
    let bij = null, actief = null;
    bits.groep.visible = Boolean(sc.pad) && sc.lens === 0;
    bot.zichtbaar(Boolean(sc.pad) && sc.lens === 1);
    if (bits.groep.visible) {
      const kop = bits.zet(BITLIJN, reduce ? 2.2 : verlopen * SNEL_BITS);
      if (kop.y < BOVEN - 0.1) actief = onderdeelOp(kop); // het signaal is in het onderdeel
    } else if (sc.pad && sc.lens === 1) {
      const ids = sc.pad === "melding" ? MELDING : PAD_ROND, pad = BOTPADEN[sc.pad];
      let n = reduce ? (sc.pad === "melding" ? pad.length : 0) : verlopen / SEG;
      if (sc.pad === "rond") n %= pad.length;
      const i = Math.floor(n), u = n - i;
      bij = Math.min(i, ids.length - 1); // melding: index van de regel in het logboek
      const rust = i >= pad.length || u < RUST;
      let kijk;
      if (rust) {
        actief = ids[bij];
        botPos.copy(BOTPLEK[actief]);
        kijk = naarCamera(botPos);
      } else {
        const f = (u - RUST) / (1 - RUST), e = f < 0.5 ? 2 * f * f : 1 - 2 * (1 - f) * (1 - f);
        kijk = vliegRichting(pad[i], opLijn(pad[i], e * pad[i].totaal, botPos));
      }
      const onder = onderdeelOp(botPos);
      bot.zet(botPos, { kijk, vliegt: !rust, t: nu / 1000, grond: onder ? opp(onder) : 0.06, dt });
    }
    // het poppetje: het hele rondje bij "Jouw ziekenhuis"; bij 0501 staat er aan het eind een mens bij de opdracht
    const mensAan = (sc.pad === "rond" && sc.lens === 2) || (sc.pad === "melding" && bij === MELDING.length - 1);
    mens.groep.visible = mensAan;
    if (mensAan) {
      const st = sc.lens === 2 ? mensOpTijd(reduce ? null : verlopen) : { pos: MENS_BENEN[0].pts[0], handeling: "lezen", a: 0.5, t: nu / 1000 };
      mens.zet({ ...st, kijk: st.kijk ?? naarCamera(st.pos), dt });
      if (st.plek) actief = st.plek;
    }
    if (sc.pad === "melding" && bij !== bijPunt) {
      bijPunt = bij;
      onLog?.(bij);
    }

    // onderdelen: focus, AI-markering, waar de drager nu is
    const focus = sc.focus || null;
    for (const [id, p] of Object.entries(delen)) {
      const ai = id === "cpu" && sc.lens === 1;
      const aan = focus ? focus.includes(id) : true;
      p.m.material.color.setHex(ai ? INKT : id === actief ? 0xe5e7eb : 0xffffff);
      p.e.material.color.setHex(ai ? GEEL : INKT);
      const op = aan ? 1 : 0.25;
      p.m.material.opacity += (op - p.m.material.opacity) * (reduce ? 1 : 0.1);
      p.e.material.opacity = p.m.material.opacity;
      p.el.classList.toggle("dim", !aan);
      p.el.classList.toggle("aan", Boolean(focus && aan) || id === actief);
    }

    const w = doek.clientWidth, h = doek.clientHeight;
    for (const p of Object.values(delen)) zet(p.el, p.top, w, h);
    renderer.render(scene, camera);
    requestAnimationFrame(teken);
  }

  function maat() {
    const w = doek.clientWidth, h = doek.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(maat).observe(doek);
  maat();

  let onLog = null;
  return {
    ga(sc, logFn) {
      const nieuweLens = sc.lens !== lens;
      huidig = sc;
      lens = sc.lens;
      onLog = logFn;
      bijPunt = null;
      padStart = performance.now();
      if (nieuweLens) labelsZetten();
      // camera: overzicht, of iets dichter bij het onderdeel in focus
      // de harness is de brede balk: daarvoor is het overzicht het beste beeld
      if (sc.focus && sc.focus[0] !== "os") {
        const c = delen[sc.focus[0]].m.position;
        Object.assign(doel, { x: c.x * 0.5 + 1.2, y: 9.5, z: c.z * 0.5 + 8.2, tx: c.x * 0.5, ty: 0, tz: c.z * 0.5 + 0.4 });
      } else {
        Object.assign(doel, OVERZICHT);
      }
      if (reduce) Object.assign(cam, doel);
    },
    start() {
      if (loopt) return;
      loopt = true;
      maat();
      requestAnimationFrame(teken);
    },
    stop() {
      loopt = false;
    },
  };
}

/* ================= Deel 2: vier manieren (D3) ================= */

function maakKennis() {
  const kolommen = d3.select("#kolommen").selectAll("div.kolom").data(KOLOMMEN).join("div").attr("class", (k) => `kolom k-${k.id}`);
  kolommen.html((k) => `
    <div class="kol-kop"><span class="nr">${k.nr}</span><b>${k.naam}</b><span class="voorwerk">${k.voorwerk}</span></div>
    <svg class="substraat" viewBox="0 0 300 190" role="img" aria-label="${k.naam}"></svg>
    <p class="wat">${k.wat}</p>
    <div class="antwoord"><span class="status"></span><p class="tekst"></p></div>
    <p class="les"></p>`);

  // 01 · alleen het model: tegels uit de training
  const sModel = d3.select(".k-model svg");
  const tegel = sModel.selectAll("g.tegel").data(MODEL_TEGELS).join("g").attr("class", "tegel")
    .attr("transform", (_, i) => `translate(${8 + (i % 3) * 97},${10 + Math.floor(i / 3) * 60})`);
  tegel.append("rect").attr("width", 90).attr("height", 50).attr("rx", 5);
  tegel.append("foreignObject").attr("width", 90).attr("height", 50)
    .html((d) => `<div xmlns="http://www.w3.org/1999/xhtml" class="tegel-tekst">${d.t}</div>`);

  // 02 · RAG: gelijkenis per document
  const sRag = d3.select(".k-rag svg");
  const doc = sRag.selectAll("g.doc").data(DOCS).join("g").attr("class", "doc").attr("transform", (_, i) => `translate(0,${8 + i * 30})`);
  doc.append("text").attr("x", 4).attr("y", 12).attr("class", "doc-naam").text((d) => d.naam);
  doc.append("rect").attr("class", "spoor").attr("x", 4).attr("y", 17).attr("width", 250).attr("height", 7).attr("rx", 3);
  doc.append("rect").attr("class", "balk").attr("x", 4).attr("y", 17).attr("width", 0).attr("height", 7).attr("rx", 3);
  doc.append("text").attr("class", "pct").attr("x", 296).attr("y", 24).attr("text-anchor", "end").text("");

  // 03 · kennisgraaf
  const sGraaf = d3.select(".k-graaf svg");
  const knoop = Object.fromEntries(KNOPEN.map((n) => [n.id, n]));
  const rand = sGraaf.selectAll("line.rand").data(RANDEN).join("line").attr("class", "rand")
    .attr("x1", (r) => knoop[r.van].x).attr("y1", (r) => knoop[r.van].y).attr("x2", (r) => knoop[r.naar].x).attr("y2", (r) => knoop[r.naar].y);
  const gloed = sGraaf.append("circle").attr("class", "gloed").attr("cx", knoop.bed.x).attr("cy", knoop.bed.y).attr("r", 0);
  const kn = sGraaf.selectAll("g.knoop").data(KNOPEN).join("g").attr("class", (n) => `knoop ${n.soort || ""}`)
    .attr("transform", (n) => `translate(${n.x},${n.y})`);
  kn.append("rect").attr("x", (n) => -n.label.length * 3.4 - 7).attr("y", -10).attr("width", (n) => n.label.length * 6.8 + 14).attr("height", 20).attr("rx", 6);
  kn.append("text").attr("text-anchor", "middle").attr("dy", 4).text((n) => n.label);

  // 04 · LLM-wiki: kaarten
  const sWiki = d3.select(".k-wiki svg");
  const kaart = sWiki.selectAll("g.kaart").data(KAARTEN).join("g").attr("class", "kaart")
    .attr("transform", (_, i) => `translate(${4 + (i % 2) * 148},${6 + Math.floor(i / 2) * 92})`);
  kaart.append("rect").attr("width", 142).attr("height", 84).attr("rx", 6);
  kaart.append("text").attr("class", "kaart-naam").attr("x", 8).attr("y", 18).text((d) => d.naam);
  kaart.append("text").attr("class", "kaart-datum").attr("x", 8).attr("y", 76).text((d) => `↻ bijgewerkt ${d.datum}`);
  kaart.selectAll("text.veld").data((d) => d.velden).join("text").attr("class", "veld").attr("x", 8).attr("y", (_, i) => 38 + i * 16).text((v) => v);

  const vraagbalk = $("vraagbalk"), as = $("as");
  as.innerHTML = `<span class="as-label">← Minder voorwerk</span>
    <div class="as-punten">${KOLOMMEN.map((k) => `<div class="as-punt" data-k="${k.id}"><i></i><span>${k.naam}</span></div>`).join("")}</div>
    <span class="as-label">Meer voorwerk →</span>`;

  let typTimer = null;
  function typ(el, tekst) {
    clearTimeout(typTimer);
    if (reduce) { el.textContent = tekst; return; }
    let i = 0;
    const stap = () => { el.textContent = tekst.slice(0, ++i); if (i < tekst.length) typTimer = setTimeout(stap, 28); };
    stap();
  }

  return {
    ga(s) {
      const slot = Boolean(s.slot);
      $("kolommen").hidden = slot;
      as.hidden = slot;
      vraagbalk.hidden = slot;
      $("kennis-slot").hidden = !slot;
      clearTimeout(typTimer);
      if (slot) {
        $("kennis-slot").innerHTML = `<h3>Wat je ervan meeneemt</h3><div class="tegels">${[
          ["Geen vorm wint altijd", "Kies per vraag de eenvoudigste vorm die werkt."],
          ["Voorwerk is jouw vak", "Een graaf of een wiki werkt alleen als iemand de begrippen en de kaarten bijhoudt."],
          ["In de demo van St. Machteld", "De melding staat in het contextvenster. De OKF-bundel lijkt op een wiki, door mensen geschreven. De ontologie is een kleine graaf."],
        ].map(([kop, tekst]) => `<div class="tegel"><b>${kop}</b><span>${tekst}</span></div>`).join("")}</div>`;
        animate($("kennis-slot").querySelectorAll("h3, .tegel"), { opacity: [0, 1], y: [12, 0] }, { duration: T(0.45), delay: stagger(T(0.12)) });
        return;
      }

      const q = s.vraag;
      if (q === null) {
        vraagbalk.innerHTML = `<span class="vraag-label">Vier manieren</span><span class="vraag-tekst">Hoe komt de kennis bij het taalmodel? Elke manier krijgt zo drie vragen.</span>`;
      } else {
        vraagbalk.innerHTML = `<span class="vraag-label">Vraag ${q + 1} van 3 · ${VRAGEN[q].soort}</span><span class="vraag-tekst"></span>`;
        typ(vraagbalk.querySelector(".vraag-tekst"), VRAGEN[q].tekst);
      }

      // 01 · model
      tegel.classed("raak", (d) => q !== null && (d.bij || []).includes(q)).classed("mist", (d) => q !== null && d.mist === q);
      // 02 · RAG: balken groeien; de beste drie worden zwart
      const top3 = q === null ? [] : DOCS.map((d, i) => [d.score[q], i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map((x) => x[1]);
      doc.classed("top", (_, i) => top3.includes(i)).classed("fout", (d) => q !== null && (d.fout || []).includes(q));
      doc.select("rect.balk").transition().duration(T(0.8) * 1000).delay((_, i) => T(0.6 + i * 0.08) * 1000)
        .attr("width", (d) => (q === null ? 0 : d.score[q] * 250));
      doc.select("text.pct").text((d) => (q === null ? "" : `${Math.round(d.score[q] * 100)}%`));
      // 03 · graaf: het pad licht op; bij vraag 3 gloeit de gedeelde knoop
      const pad = q === null ? [] : GRAAF_PAD[q];
      const inPad = (r) => pad.includes(r.van) && pad.includes(r.naar);
      rand.classed("aan", inPad);
      kn.classed("aan", (n) => pad.includes(n.id)).classed("leeg", (n) => q === 1 && n.id === "q");
      gloed.interrupt().attr("r", 0).attr("opacity", 0);
      if (q === 2) gloed.transition().delay(T(1.2) * 1000).duration(T(0.8) * 1000).attr("r", 34).attr("opacity", 1);
      // 04 · wiki: de gelezen kaarten
      kaart.classed("raak", (d) => q !== null && d.bij.includes(q));

      // antwoorden en lessen
      kolommen.each(function (k) {
        const a = q === null ? null : VRAGEN[q].antwoord[k.id];
        const kol = d3.select(this);
        kol.select(".status").attr("class", `status ${a ? a.status : ""}`).text(a ? STATUS[a.status] : "");
        kol.select(".antwoord .tekst").text(a ? a.tekst : "—");
        kol.select(".les").text(a ? a.les : "");
      });
      if (q !== null) {
        animate(document.querySelectorAll("#kolommen .antwoord, #kolommen .les"), { opacity: [0, 1], y: [8, 0] },
          { duration: T(0.4), delay: stagger(T(0.1), { startDelay: T(1.4) }) });
      }

      // de as: de eenvoudigste vorm die werkt
      const eerste = q === null ? null : KOLOMMEN.find((k) => VRAGEN[q].antwoord[k.id].status === "goed")?.id;
      as.querySelectorAll(".as-punt").forEach((p) => p.classList.toggle("aan", p.dataset.k === eerste));
      as.dataset.tekst = eerste ? `De eenvoudigste vorm die werkt: ${KOLOMMEN.find((k) => k.id === eerste).naam}` : "";
    },
  };
}

/* ================= Regie ================= */

const bord = maakBord($("doek"), $("labels"));
const kennis = maakKennis();
let stap = -1;
let logTimer = null;

function uitlegTekenen(s) {
  const el = $("uitleg");
  clearTimeout(logTimer);
  $("bord").classList.toggle("breed", Boolean(s.breed));
  const lens = s.scene.lens;
  let extra = "";
  if (s.lenzen) {
    extra += `<div class="lenzen">${LENZEN.map((l, i) => `<span class="${i === lens ? "aan" : ""}">${l}</span>`).join("")}</div>`;
  }
  if (s.kaart) {
    const d = DELEN[s.kaart];
    extra += `<table class="drie"><tbody>${LENZEN.map((l, i) => `<tr class="${i === 1 ? "agent" : ""}"><th>${l}</th><td><b>${i === 1 && s.kaart === "cpu" ? BOT : ""}${d.namen[i][0]}</b><span>${d.namen[i][1]}</span></td></tr>`).join("")}</tbody></table>`;
  }
  if (s.taken) {
    extra += `<table class="taken"><thead><tr><th>Taak</th><th>In de demo</th><th>In jouw ziekenhuis</th></tr></thead><tbody>${
      TAKEN.map(([taak, demo, zh]) => `<tr><th>${taak}</th><td>${demo}</td><td>${zh}</td></tr>`).join("")}</tbody></table>`;
  }
  if (s.log) extra += `<ol class="logboek" id="logboek"></ol>`;
  if (s.tegels) extra += `<div class="tegels">${s.tegels.map(([kop, tekst]) => `<div class="tegel"><b>${kop}</b><span>${tekst}</span></div>`).join("")}</div>`;

  el.innerHTML = `<div class="laag">${s.laag}</div><h2>${s.titel}</h2>${s.tekst ? s.tekst.map((t) => `<p>${t}</p>`).join("") : ""}${extra}`;
  animate([...el.children], { opacity: [0, 1], y: [10, 0] }, { duration: T(0.4), delay: stagger(T(0.08)) });
  if (s.taken) animate(el.querySelectorAll(".taken tbody tr"), { opacity: [0, 1], x: [16, 0] }, { duration: T(0.35), delay: stagger(T(0.25), { startDelay: T(0.4) }) });
}

// Logboek bij melding 0501: één regel per onderdeel waar het botje landt. Taalmodel = AI-markering, mens = mens-icoon.
let getoond = 0;
function logTot(n) {
  const lijst = $("logboek");
  if (!lijst) return;
  for (; getoond < Math.min(n + 1, LOG_0501.length); getoond++) {
    const [deel, soort, tekst] = LOG_0501[getoond];
    const li = document.createElement("li");
    // het taalmodel en de tweede AI (controle) krijgen de AI-markering
    const ai = deel === "cpu" || soort === "Controle";
    li.className = ai ? "ai" : soort === "Mens" || soort === "Escalatie" ? "mens" : "";
    li.innerHTML = `<span class="soort">${ai ? BOT : soort === "Mens" ? MENS : ""}${soort}</span><span>${tekst}</span>`;
    lijst.appendChild(li);
    animate(li, { opacity: [0, 1], x: [12, 0] }, { duration: T(0.3) });
  }
}

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  const oud = stap >= 0 ? STAPPEN[stap].deel : -1;
  stap = n;
  const s = STAPPEN[n];

  $("deel").textContent = DEEL[s.deel];
  $("kop").textContent = KOP[s.deel];
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);

  if (s.deel !== oud) {
    const naar = s.deel === 0 ? $("bord") : $("kennis");
    const van = s.deel === 0 ? $("kennis") : $("bord");
    van.hidden = true;
    naar.hidden = false;
    animate(naar, { opacity: [0, 1] }, { duration: T(0.5) });
    if (s.deel === 0) bord.start();
    else bord.stop();
  }

  if (s.deel === 0) {
    uitlegTekenen(s);
    getoond = 0;
    bord.ga(s.scene, s.log ? logTot : null);
  } else {
    kennis.ga(s);
  }
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
ga(stapUitHash());
