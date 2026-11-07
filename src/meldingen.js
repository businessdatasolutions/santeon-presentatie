/* Gedeelde meldingen voor architectuur.html, groeipad.html en vim-proces.html.
   Tekst en uitkomsten zijn gelijk aan vim-okf-simulatie.jsx (INCIDENTS) en
   vim-agent-animatie.html (CASES). Pas ze daar ook aan als je hier iets wijzigt. */

// inkt = tekstkleur op de SAC-kleur; wit is op het geel van SAC 3 niet leesbaar
export const SAC = {
  1: { label: "SAC 1 · Calamiteit", kleur: "#B23A2E", inkt: "#fff" },
  2: { label: "SAC 2 · Ernstig", kleur: "#D97A28", inkt: "#fff" },
  3: { label: "SAC 3 · Matig", kleur: "#D0A400", inkt: "#1a1a1a" },
  4: { label: "SAC 4 · Gering", kleur: "#2E8B72", inkt: "#fff" },
};

const OKF_BASIS = [
  "runbook-triage-vim.md",
  "taxonomy-incidentcategorie.md",
  "metric-severity-assessment-code.md",
  "taxonomy-prisma-basisoorzaak.md",
];

export const MELDINGEN = [
  {
    id: "VIM-2026-0470", kort: "0470", afdeling: "Geriatrie", melder: "Verzorgende", datum: "2026-06-12",
    tekst: "Bed in te hoge stand achtergelaten na verzorging. Patiënt gleed bij opstaan langs de rand naar beneden, opgevangen door familie. Geen letsel geconstateerd.",
    markeer: ["gleed bij opstaan langs de rand naar beneden", "Geen letsel geconstateerd"],
    begrippen: [["Categorie", "Val"], ["Afdeling", "Geriatrie"], ["Uitkomst", "Geen schade"]],
    okf: OKF_BASIS, extra: null,
    sac: 4, grens: "Bijna-incident / geen schade", citaat: "Geen letsel geconstateerd",
    basis: "PRF · Patiëntgerelateerd", toets: 90,
    mens: { kop: "De kwaliteitsadviseur beslist", acties: ["Registreren"], draaiboek: null },
    categorie: "Val",
  },
  {
    id: "VIM-2026-0485", kort: "0485", afdeling: "IC", melder: "Intensivist", datum: "2026-06-14",
    tekst: "Beademingsinstelling na overplaatsing niet gecontroleerd, verkeerde tidal volume ingesteld. Patiënt raakte respiratoir gedecompenseerd en is later overleden. Directe melding aan raad van bestuur.",
    markeer: ["Beademingsinstelling", "is later overleden"],
    begrippen: [["Categorie", "Medisch hulpmiddel"], ["Afdeling", "IC"], ["Uitkomst", "Overlijden"]],
    okf: OKF_BASIS, extra: "runbook-calamiteit-igj.md",
    sac: 1, grens: "Overlijden of ernstige blijvende schade", citaat: "is later overleden",
    basis: "O · Organisatorisch", toets: 95,
    mens: { kop: "Calamiteit: altijd naar een mens", acties: ["PRISMA-analyse", "Melden bij IGJ", "Raad van bestuur informeren"], draaiboek: "Draaiboek: meld een calamiteit binnen 3 werkdagen na vaststelling bij de IGJ." },
    categorie: "Medisch hulpmiddel",
  },
];

// De tegenstrijdige melding van "Mens tegen agent" (3b, meedoen.html). De tekst is gelijk aan
// INCIDENTS in vim-okf-simulatie.jsx, de escalatiereden aan CASES in vim-agent-animatie.html.
// Bewust gebrekkig: niet "verbeteren".
export const TEGENSTRIJDIG = {
  id: "VIM-2026-0505", afdeling: "Chirurgie", melder: "Coassistent", datum: "2026-06-18",
  tekst: "Volgens de verpleegkundige rapportage was sprake van een korte periode van bewusteloosheid na de ingreep; de dienstdoende arts noteert in hetzelfde dossier dat de patiënt 'alert en aanspreekbaar' bleef gedurende de hele opname. Geen vervolgonderzoek gedaan om dit te verifiëren, patiënt inmiddels ontslagen.",
  markeer: ["korte periode van bewusteloosheid", "'alert en aanspreekbaar'"],
  escalatie: "Verpleegkundige en arts noteren tegenstrijdige waarnemingen over het bewustzijn van de patiënt; geen vervolgonderzoek beschikbaar om dit op te helderen.",
};
