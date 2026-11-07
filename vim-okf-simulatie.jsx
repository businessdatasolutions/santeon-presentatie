import React, { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, RadialBarChart, RadialBar,
} from "recharts";
import {
  Database, Network, BookOpen, Bot, FileBarChart, Layers,
  ChevronRight, Play, AlertTriangle, ShieldAlert, CheckCircle2,
  Loader2, ArrowRight, FileText, Hospital, RotateCcw,
  HelpCircle, MessageSquare, Scale,
} from "lucide-react";

/* ============================================================
   Ziekenhuis St. Machteld (fictief) — VIM-triage & rapportage
   Data Lake  →  Semantische laag / Ontologie  →  OKF  →  Agent
   ============================================================ */

// Huisstijl Business Data Solutions (brand-project/stylebook): warm zwart, cream en
// chartreuse-geel als enige accent. AI herken je aan warm zwart met geel licht plus het
// Bot-icoon (Tag met `ai`, AiMark) — als het licht van de vuurtoren. Geel als vlak is het merkaccent.
const C = {
  paper: "#f9f8f4",
  card: "#FFFFFF",
  ink: "#1a1a1a",
  dark: "#1a1a1a",
  darkSoft: "#4b5563",
  line: "#e5e7eb",
  muted: "#4b5563",
  mutedSoft: "#6b7280",
  cream: "#f5f0e6",
  cream2: "#f0ebe0",
  accent: "#d4db3e",     // merkaccent: knoppen, actief menu, voortgang. Nooit als tekstkleur op licht, nooit onder witte tekst.
  accentSoft: "#fafbf0",
  agent: "#1a1a1a",      // AI-vlak (altijd met agentInk en het Bot-icoon)
  agentInk: "#d4db3e",   // tekst en icoon op het AI-vlak
  sac1: "#B23A2E",
  sac2: "#D97A28",
  sac3: "#D0A400",
  sac4: "#2E8B72",
};


const SAC = {
  1: { label: "SAC 1 · Calamiteit", color: C.sac1, note: "Overlijden of ernstige blijvende schade" },
  2: { label: "SAC 2 · Ernstig", color: C.sac2, note: "Matige/tijdelijke schade of hoog risico" },
  3: { label: "SAC 3 · Matig", color: C.sac3, note: "Geringe schade" },
  4: { label: "SAC 4 · Gering", color: C.sac4, note: "Bijna-incident / geen schade" },
};

const CAT = {
  Medicatie: "Medicatie", Val: "Val", Decubitus: "Decubitus", Agressie: "Agressie",
  MedischHulpmiddel: "Medisch hulpmiddel", Transfusie: "Transfusie",
  IdentificatieVerwisseling: "Identificatie / verwisseling",
  OverdrachtCommunicatie: "Overdracht / communicatie", Infectie: "Infectie",
  Diagnostiek: "Diagnostiek", Documentatie: "Documentatie", Overig: "Overig",
};

const PRISMA = {
  T: "Technisch (T)", O: "Organisatorisch (O)", H: "Menselijk (H)",
  PRF: "Patiëntgerelateerd (PRF)", X: "Onclassificeerbaar (X)",
};

/* ---------- Boundary conditions: SAC-drempels als auditeerbare velden ----------
   i.p.v. dat de agent alleen gevolg/kans-getallen verzint, geeft hij per voorwaarde
   een true/false + citaat terug. Zie OKF-concept metric-severity-assessment-code.md. */
const BOUNDARY_CONDITIONS = [
  { key: "overlijden_of_ernstige_blijvende_schade", sac: 1, label: "Overlijden of ernstige blijvende schade" },
  { key: "matige_tijdelijke_schade", sac: 2, label: "Matige of tijdelijke schade" },
  { key: "hoog_risico_bijna_incident", sac: 2, label: "Onderschept bijna-incident met hoog potentieel gevolg" },
  { key: "geringe_schade", sac: 3, label: "Geringe schade" },
  { key: "bijna_incident_geen_schade", sac: 4, label: "Bijna-incident / geen schade" },
];

const MAX_ASK_TURNS = 3;      // turn-budget voor de ASK/ANSWER-lus (Prompt C.4-patroon)
const MAX_VERIFY_RETRIES = 2; // max. pogingen in de verificatie-/retry-lus

/* ---------- Data lake: ruwe VIM-meldingen (vrije tekst) ---------- */
const INCIDENTS = [
  { id: "VIM-2026-0412", datum: "2026-06-03", afdeling: "IC", melder: "IC-verpleegkundige",
    tekst: "Patiënt kreeg tweemaal een dosis nadroparine 5700 IE binnen het uur. Dubbele aftekening niet zichtbaar in EPD, wisseling van dienst. Patiënt vertoonde nadien lichte hematoomvorming, arts geïnformeerd, extra controle stolling ingezet." },
  { id: "VIM-2026-0414", datum: "2026-06-03", afdeling: "Orthopedie", melder: "Verpleegkundige",
    tekst: "Patiënt opgenomen zonder identificatiebandje. Opgemerkt bij de ochtendronde, identiteit mondeling gecontroleerd met naam en geboortedatum. Bandje binnen een uur aangebracht. Geen gevolgen voor de patiënt." },
  { id: "VIM-2026-0418", datum: "2026-06-03", afdeling: "Geriatrie", melder: "Verpleegkundige",
    tekst: "Mevrouw wilde zelfstandig naar het toilet, bel niet gebruikt. Gevonden op de grond naast het bed. Klaagt over pijn heup, röntgen bevestigt heupfractuur. Bed stond hoog, remmen niet gecontroleerd." },
  { id: "VIM-2026-0421", datum: "2026-06-04", afdeling: "Interne", melder: "Laborant",
    tekst: "Twee buisjes bloed binnengekomen met sticker van verkeerde patiënt. Bij inscannen kwam ID-mismatch naar voren, analyse gestopt vóór uitgifte. Geen uitslag verstrekt. Nieuwe afname aangevraagd." },
  { id: "VIM-2026-0425", datum: "2026-06-04", afdeling: "Kindergeneeskunde", melder: "Kinderverpleegkundige",
    tekst: "Geplande medicatie (paracetamol) om 9.15 uur gegeven in plaats van om 8.00 uur. Drukte door twee spoedopnames. Kind had geen pijnklachten." },
  { id: "VIM-2026-0427", datum: "2026-06-05", afdeling: "Interne", melder: "Verpleegkundige",
    tekst: "Perifeer infuus vier dagen niet gewisseld, het protocol zegt drie dagen. Lokale reactie: roodheid en zwelling rond de insteekplaats. Infuus verwijderd, arm gekoeld. Klachten na twee dagen verdwenen." },
  { id: "VIM-2026-0430", datum: "2026-06-05", afdeling: "Cardiologie", melder: "Verpleegkundige",
    tekst: "Infuuspomp gaf geen occlusie-alarm, batterij bleek leeg en netvoeding niet aangesloten. Antibiotica liep 3 uur niet door. Geen directe schade, arts akkoord met inhalen dosis." },
  { id: "VIM-2026-0435", datum: "2026-06-06", afdeling: "Interne", melder: "Wondverpleegkundige",
    tekst: "Tijdens opname decubitus categorie 3 ontstaan op de hiel. Wisselligging niet consequent uitgevoerd volgens protocol, geen antidecubitusmatras aangevraagd bij opname." },
  { id: "VIM-2026-0440", datum: "2026-06-07", afdeling: "SEH", melder: "SEH-verpleegkundige",
    tekst: "Verwarde patiënt sloeg tijdens fixatiepoging een collega tegen de arm. Collega heeft kneuzing, kort uit roulatie. Beveiliging ingeschakeld, de-escalatie te laat gestart." },
  { id: "VIM-2026-0447", datum: "2026-06-08", afdeling: "Chirurgie", melder: "Zaalarts",
    tekst: "Bekende penicilline-allergie niet meegenomen in mondelinge overdracht. Patiënt kreeg amoxicilline, ontwikkelde binnen 20 min anafylactische reactie. Adrenaline toegediend, opname IC. Allergie stond wél in oud dossier." },
  { id: "VIM-2026-0452", datum: "2026-06-09", afdeling: "OK", melder: "Anesthesiemedewerker",
    tekst: "Bloedproduct met afwijkend bloedgroeplabel klaargezet. Bij verplichte dubbelcheck aan bed viel de mismatch op, transfusie niet gestart. Product retour bloedbank." },
  { id: "VIM-2026-0458", datum: "2026-06-10", afdeling: "SEH", melder: "Radiodiagnostisch laborant",
    tekst: "Aanvraag röntgen linkerpols, patiënt had klachten rechts. Fout ontdekt bij positioneren, geen opname gemaakt van verkeerde zijde. Aanvraag gecorrigeerd." },
  { id: "VIM-2026-0463", datum: "2026-06-11", afdeling: "Apotheek", melder: "Apothekersassistent",
    tekst: "Voorschrift insuline met kommafout: 100 E i.p.v. 10 E. Onderschept bij medicatiebewaking vóór aflevering. Voorschrijver gebeld, dosering aangepast. Patiënt heeft niets ontvangen." },
  { id: "VIM-2026-0466", datum: "2026-06-11", afdeling: "Interne", melder: "Voedingsassistent",
    tekst: "Patiënt met een lactosearm dieet kreeg bij de lunch een broodje kaas. Patiënt zag het zelf en at er niet van. Ander broodje gebracht, keuken geïnformeerd." },
  { id: "VIM-2026-0470", datum: "2026-06-12", afdeling: "Geriatrie", melder: "Verzorgende",
    tekst: "Bed in te hoge stand achtergelaten na verzorging. Patiënt gleed bij opstaan langs de rand naar beneden, opgevangen door familie. Geen letsel geconstateerd." },
  { id: "VIM-2026-0474", datum: "2026-06-12", afdeling: "Orthopedie", melder: "Arts-assistent",
    tekst: "Na heupoperatie overgeplaatst van Chirurgie naar Orthopedie. Voorschrift nadroparine niet meegekomen bij de overplaatsing, tromboseprofylaxe niet gestart. Op dag 5 longembolie, patiënt gereanimeerd en opgenomen op de IC. Neuroloog stelt ernstige blijvende hersenschade vast." },
  { id: "VIM-2026-0478", datum: "2026-06-13", afdeling: "Chirurgie", melder: "Zaalarts",
    tekst: "Postoperatieve wondinfectie na darmresectie, kweek positief. Perioperatieve antibioticaprofylaxe volgens dossier te laat toegediend. Patiënt langere opname, IV-antibiotica gestart." },
  { id: "VIM-2026-0482", datum: "2026-06-13", afdeling: "Chirurgie", melder: "Verpleegkundige",
    tekst: "Patiënt liep met infuuspaal over de gang en is gevallen over een losliggend snoer. Kneuzing aan de knie, arts ziet geen reden voor een foto. Snoer weggehaald en gang gecontroleerd." },
  { id: "VIM-2026-0485", datum: "2026-06-14", afdeling: "IC", melder: "Intensivist",
    tekst: "Beademingsinstelling na overplaatsing niet gecontroleerd, verkeerde tidal volume ingesteld. Patiënt raakte respiratoir gedecompenseerd en is later overleden. Directe melding aan raad van bestuur." },
  { id: "VIM-2026-0488", datum: "2026-06-14", afdeling: "Dagbehandeling", melder: "Verpleegkundige",
    tekst: "Na bloedafname een gewone pleister geplakt, terwijl een pleisterallergie in het EPD stond. Lichte huidreactie rond de pleister, na een dag verdwenen. Pleister vervangen door een hypoallergeen type." },
  { id: "VIM-2026-0491", datum: "2026-06-15", afdeling: "Cardiologie", melder: "Verpleegkundige",
    tekst: "Bekende jodiumallergie niet geregistreerd in EPD bij opname. Ontdekt vóór contrastonderzoek door navraag familie, onderzoek uitgesteld. Geen toediening geweest." },
  { id: "VIM-2026-0496", datum: "2026-06-16", afdeling: "Kindergeneeskunde", melder: "Kinderverpleegkundige",
    tekst: "Medicatie bedoeld voor orale toediening per abuis intraveneus gegeven aan kind. Direct gestopt, kinderarts en apotheker betrokken, kind onder observatie, milde reactie." },
  // Bewust onvolledige melding: ontbrekend feit is de directe trigger voor de ASK/ANSWER-lus (#1, #6).
  { id: "VIM-2026-0501", datum: "2026-06-17", afdeling: "Interne", melder: "Verpleegkundige",
    tekst: "Patiënt kreeg subcutaan een dosis laagmoleculaire heparine toegediend. Onbekend of de voorgeschreven dubbelcheck bij hoogrisicomedicatie vooraf heeft plaatsgevonden — dit is niet vastgelegd in het EPD en de verpleegkundige die de dienst overnam kan het niet bevestigen. Patiënt heeft geen klachten en geen bijwerkingen getoond." },
  // Bewust tegenstrijdige melding: geen enkele boundary condition is eenduidig vast te stellen — moet escalatie=true opleveren (#2).
  { id: "VIM-2026-0505", datum: "2026-06-18", afdeling: "Chirurgie", melder: "Coassistent",
    tekst: "Volgens de verpleegkundige rapportage was sprake van een korte periode van bewusteloosheid na de ingreep; de dienstdoende arts noteert in hetzelfde dossier dat de patiënt 'alert en aanspreekbaar' bleef gedurende de hele opname. Geen vervolgonderzoek gedaan om dit te verifiëren, patiënt inmiddels ontslagen." },
];

/* ---------- OKF-bundel: knowledge atoms (Markdown + YAML) ---------- */
const OKF = {
  "dataset-vim-meldingen.md": {
    type: "Dataset", title: "VIM-meldingen (data lake)",
    description: "Ruwe, vrije-tekst incidentmeldingen zoals aangeleverd door melders.",
    resource: "s3://stmachteld-lake/vim/meldingen/", tags: ["vim", "data-lake", "ruw"],
    timestamp: "2026-06-16",
    body: `# Bron
Landingszone in het data lake met onbewerkte VIM-meldingen. Eén record per melding met vrije tekst, afdeling, melderrol en datum.

# Belangrijk
Meldingen zijn **niet** geclassificeerd. Structuur en betekenis komen uit de [semantische tabel](table-vim-incident.md).
Interpreteer nooit direct op ruwe tekst zonder de [triage-runbook](runbook-triage-vim.md).`,
  },
  "table-vim-incident.md": {
    type: "Table", title: "vim_incident (semantische laag)",
    description: "Gemodelleerde incidenttabel bovenop het lake, gekoppeld aan de VIM-ontologie.",
    resource: "warehouse.vim.incident", tags: ["semantisch", "ontologie"],
    timestamp: "2026-06-16",
    body: `# Kolommen
- \`incident_id\` — unieke sleutel
- \`categorie\` — zie [incidentcategorie](taxonomy-incidentcategorie.md)
- \`uitkomst\` — bijna-incident … overlijden
- \`gevolg\` (1–5) en \`kans\` (1–5) → [SAC](metric-severity-assessment-code.md)
- \`basisoorzaak\` — zie [PRISMA-classificatie](taxonomy-prisma-basisoorzaak.md)
- \`afdeling\`, \`vervolgacties\`, \`igj_melding\`

# Ontologie
Elke rij is een instantie van klasse \`Incident\` uit [vim-ontologie](ontology-vim-kern.md).`,
  },
  "ontology-vim-kern.md": {
    type: "Ontology", title: "VIM-ontologie (kern)",
    description: "Klassen en relaties waarmee een incident betekenis krijgt.",
    resource: "warehouse.vim.ontology", tags: ["ontologie", "owl"],
    timestamp: "2026-06-16",
    body: `# Klassen
- \`Incident\` — kerngebeurtenis
- \`Categorie\` → [taxonomie](taxonomy-incidentcategorie.md)
- \`Uitkomst\`, \`Ernstniveau (SAC)\` → [metric](metric-severity-assessment-code.md)
- \`Basisoorzaak\` → [PRISMA](taxonomy-prisma-basisoorzaak.md)
- \`Afdeling\`, \`Vervolgactie\`, \`Betrokkene\`

# Relaties (object properties)
- Incident **heeftCategorie** Categorie
- Incident **heeftErnst** Ernstniveau
- Incident **vondPlaatsOp** Afdeling
- Incident **heeftBasisoorzaak** Basisoorzaak
- Incident **vereistVervolgactie** Vervolgactie`,
  },
  "taxonomy-incidentcategorie.md": {
    type: "Taxonomy", title: "Incidentcategorieën",
    description: "Gecontroleerde lijst van VIM-categorieën.",
    resource: "warehouse.vim.dim_categorie", tags: ["taxonomie"],
    timestamp: "2026-06-16",
    body: `# Waarden
Medicatie · Val · Decubitus · Agressie · Medisch hulpmiddel · Transfusie ·
Identificatie/verwisseling · Overdracht/communicatie · Infectie · Diagnostiek ·
Documentatie · Overig

Kies precies één primaire categorie per incident.`,
  },
  "metric-severity-assessment-code.md": {
    type: "Metric", title: "Severity Assessment Code (SAC)",
    description: "Risicoprioriteit uit gevolg × kans, bepaalt de vervolgroute.",
    resource: "warehouse.vim.metric_sac", tags: ["metric", "risico"],
    timestamp: "2026-06-16",
    body: `# Definitie
Bepaal \`gevolg\` (1–5) en \`kans\` (1–5). De hoogste ernst wint. Elke drempel is een **boundary condition**
die de agent expliciet met true/false + citaat moet onderbouwen, niet alleen een getal:
- **SAC 1** — \`overlijden_of_ernstige_blijvende_schade\` → **calamiteit**, volg [IGJ-runbook](runbook-calamiteit-igj.md)
- **SAC 2** — \`matige_tijdelijke_schade\` óf \`hoog_risico_bijna_incident\` → PRISMA-analyse + VIM-commissie
- **SAC 3** — \`geringe_schade\` → bespreken in VIM-commissie
- **SAC 4** — \`bijna_incident_geen_schade\` → registreren, trend bewaken

Een onderschept bijna-incident met hoog potentieel gevolg krijgt minimaal SAC 2.

# Onzeker? Niet gokken
Is geen enkele boundary condition met zekerheid uit de melding vast te stellen, of spreken feiten
elkaar tegen? Zet dan \`escalatie=true\` met een concrete \`escalatie_reden\` in plaats van een SAC te raden.`,
  },
  "taxonomy-prisma-basisoorzaak.md": {
    type: "Taxonomy", title: "PRISMA / Eindhoven-basisoorzaken",
    description: "Hoofdcategorieën voor basisoorzaakclassificatie.",
    resource: "warehouse.vim.dim_basisoorzaak", tags: ["prisma", "oorzaak"],
    timestamp: "2026-06-16",
    body: `# Hoofdcategorieën
- **T — Technisch**: apparatuur, ontwerp, materiaal
- **O — Organisatorisch**: protocollen, kennisoverdracht, prioriteiten, cultuur
- **H — Menselijk**: kennis-, regel- of vaardigheidsgebonden handelen
- **PRF — Patiëntgerelateerd**: factoren buiten beïnvloeding zorgteam
- **X — Onclassificeerbaar**

Kies de meest dominante basisoorzaak op basis van de melding.`,
  },
  "runbook-triage-vim.md": {
    type: "Runbook", title: "Triage-procedure VIM",
    description: "Stapsgewijze werkwijze die de triage-agent volgt.",
    resource: "confluence/kwaliteit/vim-triage", tags: ["runbook", "triage"],
    timestamp: "2026-06-16",
    body: `# Stappen
1. Lees de ruwe melding uit [dataset](dataset-vim-meldingen.md).
2. Bepaal **categorie** via [taxonomie](taxonomy-incidentcategorie.md).
3. Bepaal **uitkomst** (bijna-incident … overlijden).
4. Toets elke **boundary condition** uit de [metric](metric-severity-assessment-code.md) expliciet: waar/niet-waar + citaat uit de melding.
5. Ontbreekt een feit om een boundary condition te beoordelen? Stel dan één gerichte vraag (\`actie=ASK\`) aan de InfoProvider in plaats van aan te nemen.
6. Leid **SAC** af uit de boundary conditions die "waar" zijn. Laten de feiten geen eenduidig antwoord toe? Zet **escalatie**=true en leg de tegenstrijdigheid vast.
7. Bepaal dominante **basisoorzaak** via [PRISMA](taxonomy-prisma-basisoorzaak.md).
8. Kies **vervolgacties**. Bij SAC 1 → altijd [IGJ-runbook](runbook-calamiteit-igj.md).
9. Leg een korte, navolgbare motivering vast met concrete feiten — geen vage labels.`,
  },
  "runbook-calamiteit-igj.md": {
    type: "Runbook", title: "Escalatie calamiteit naar IGJ",
    description: "Wat te doen bij een vermoedelijke calamiteit (SAC 1).",
    resource: "confluence/kwaliteit/igj-melding", tags: ["runbook", "igj", "calamiteit"],
    timestamp: "2026-06-16",
    body: `# Regel
Een calamiteit wordt binnen **3 werkdagen** gemeld bij de IGJ en onderzocht met PRISMA of SIRE.
Zet \`igj_melding = true\`, informeer raad van bestuur en de klachten-/kwaliteitsfunctionaris.
Alleen incidenten met SAC 1 (overlijden of ernstige blijvende schade) volgen dit pad.`,
  },
  "metric-calamiteitenratio.md": {
    type: "Metric", title: "Calamiteitenratio",
    description: "Aandeel SAC 1-incidenten binnen het totaal, voor het bestuursrapport.",
    resource: "warehouse.vim.metric_calamiteit", tags: ["metric", "rapportage"],
    timestamp: "2026-06-16",
    body: `# Definitie
\`calamiteitenratio = aantal SAC 1 / totaal aantal getriageerde meldingen\`.
Gebruikt in de [rapportagelaag]; hoge waarde vraagt bestuurlijke aandacht.`,
  },
};

/* ---------- Regelgebaseerde fallback (als API onbereikbaar is) ---------- */
function ruleBasedTriage(inc) {
  const t = inc.tekst.toLowerCase();
  let categorie = "Overig";
  if (/medicat|nadroparine|insuline|antibiot|amoxicill|dosis|toedien|heparine/.test(t)) categorie = "Medicatie";
  if (/gevallen|gevonden op de grond|gleed|val\b|toilet/.test(t)) categorie = "Val";
  if (/decubitus|wisselligging|matras/.test(t)) categorie = "Decubitus";
  if (/sloeg|agress|fixatie|verward/.test(t)) categorie = "Agressie";
  if (/pomp|apparat|batterij|occlusie/.test(t)) categorie = "MedischHulpmiddel";
  if (/bloedproduct|transfusie|bloedgroep/.test(t)) categorie = "Transfusie";
  if (/verkeerde patiënt|id-mismatch|sticker|label|verwissel/.test(t)) categorie = "IdentificatieVerwisseling";
  if (/overdracht|allergie niet meegenomen|mondeling|rapportage.*noteert|tegenstrijdig/.test(t)) categorie = "OverdrachtCommunicatie";
  if (/infectie|wondinfectie|kweek/.test(t)) categorie = "Infectie";
  // Een val blijft een val, ook als de melding een röntgenfoto noemt (0418: "röntgen bevestigt heupfractuur").
  if (/röntgen|contrast|onderzoek|zijde/.test(t) && categorie !== "Val") categorie = "Diagnostiek";
  if (/niet geregistreerd|epd|dossier/.test(t) && categorie === "Overig") categorie = "Documentatie";

  const overleden = /overleden/.test(t);
  const blijvend = /(?<!geen )blijvende/.test(t);
  const bijna = /gestopt|onderschept|niet gestart|geen opname|geen toediening|niets ontvangen|niet ontvangen|uitgesteld|opgevangen/.test(t);
  const schade = /fractuur|anafyla|hematoom|kneuzing|infectie|decubitus|reactie/.test(t);
  const onbekend = /onbekend|niet vastgelegd|kan het niet bevestigen/.test(t);
  const tegenstrijdig = /volgens.*(maar|terwijl|noteert)|tegenstrijdig/.test(t);

  let uitkomst = "GeenSchade", gevolg = 2, kans = 3;
  if (overleden) { uitkomst = "Overlijden"; gevolg = 5; }
  else if (blijvend) { uitkomst = "BlijvendeSchade"; gevolg = 5; }
  else if (bijna) { uitkomst = "BijnaIncident"; gevolg = 3; }
  else if (/anafyla|heupfractuur|fractuur/.test(t)) { uitkomst = "TijdelijkeSchade"; gevolg = 4; }
  else if (schade) { uitkomst = "TijdelijkeSchade"; gevolg = 3; }
  else if (/geen letsel|geen schade|geen direct|geen klachten en geen bijwerkingen/.test(t)) { uitkomst = "GeenSchade"; gevolg = 1; }

  let sac = 4;
  if (gevolg >= 5) sac = 1;
  else if (gevolg === 4) sac = 2;
  else if (gevolg === 3) sac = bijna ? 2 : 3;
  else sac = 4;

  let basisoorzaak = "H";
  if (categorie === "MedischHulpmiddel") basisoorzaak = "T";
  if (/protocol|overdracht|profylaxe te laat|niet aangevraagd/.test(t)) basisoorzaak = "O";
  if (/verward|patiënt wilde|zelfstandig/.test(t)) basisoorzaak = "PRF";

  const vervolgacties = ["Registreren"];
  if (sac <= 3) vervolgacties.push("BesprekenVIMcommissie");
  if (sac <= 2) vervolgacties.push("PRISMAanalyse");
  if (sac === 1) vervolgacties.push("MeldenIGJ");

  const boundary_conditions = {};
  BOUNDARY_CONDITIONS.forEach((b) => { boundary_conditions[b.key] = { waar: b.sac === sac, citaat: "" }; });

  return normalizeTriage({
    categorie, uitkomst, gevolg, kans, sac, basisoorzaak, boundary_conditions,
    escalatie: tegenstrijdig || (onbekend && sac <= 2),
    escalatie_reden: tegenstrijdig
      ? "Melding bevat tegenstrijdige waarnemingen die de regelgebaseerde fallback niet kan oplossen."
      : (onbekend && sac <= 2 ? "Een feit dat nodig is voor de boundary condition ontbreekt in de melding." : ""),
    vervolgacties, igj_melding: sac === 1,
    rationale: "Regelgebaseerde fallback op basis van trefwoorden (API niet gebruikt).",
    okf_geraadpleegd: ["runbook-triage-vim.md", "metric-severity-assessment-code.md", "taxonomy-incidentcategorie.md"],
  }, true);
}

/* ---------- Generieke Claude-call helpers ---------- */
// Soms zet het model een citaat tussen "…" binnen een tekstwaarde. Dan is de JSON ongeldig.
// Daarom één nieuwe poging bij een parsefout. Een HTTP-fout stopt direct (dan volgt de fallback).
async function callClaudeJSON(system, messages) {
  let parseFout;
  for (let poging = 0; poging < 2; poging++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(`API ${res.status}: ${data?.error?.message || "onbekende fout"}`);
    let text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    try {
      return JSON.parse(text);
    } catch (e) {
      parseFout = e;
    }
  }
  throw parseFout;
}

async function callClaudeText(system, userText, max_tokens = 300) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens, system, messages: [{ role: "user", content: userText }] }),
  });
  const data = await res.json();
  return data.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
}

/* ---------- InfoProvider (A_info): stateless feiten-orakel, kent alléén de meldingtekst ---------- */
async function infoProviderAnswer(inc, vraag) {
  const system = `Je bent de "InfoProvider" — een stateless feiten-orakel voor VIM-melding ${inc.id}. Je kent UITSLUITEND de letterlijke tekst van de melding hieronder.

Regels:
1. Gebruik alléén feiten die letterlijk in de melding staan.
2. Verzin nooit informatie die er niet in staat, ook niet als die aannemelijk lijkt.
3. Is het antwoord niet uit de melding af te leiden? Antwoord dan EXACT: "Onbekend — dit is niet vermeld in de melding."
4. Antwoord in maximaal twee zinnen, geen JSON, geen opmaak.

MELDING:
"${inc.tekst}"`;
  try {
    return await callClaudeText(system, `Vraag van de triage-agent: ${vraag}`, 150);
  } catch {
    return "Onbekend — InfoProvider onbereikbaar.";
  }
}

/* ---------- Verificatie-/retry-lus: tweede, goedkope check tegen de OKF-runbook ---------- */
async function verifyTriage(inc, candidate) {
  const runbook = OKF["metric-severity-assessment-code.md"].body;
  const boundaryDef = BOUNDARY_CONDITIONS.map((b) => `- ${b.key} (SAC ${b.sac}): ${b.label}`).join("\n");
  const system = `Je bent een verificatie-agent (tweede paar ogen) voor VIM-triage. Controleer het kandidaat-antwoord tegen de OKF-runbook en de boundary conditions. Antwoord UITSLUITEND met JSON: {"ok": true|false, "issues": ["...", ...]}.

Controleer:
1. Klopt de gekozen SAC met de boundary conditions die de agent zelf op "waar":true heeft gezet?
2. Is bij SAC 1-3 minstens één boundary condition op "waar":true gezet (SAC 4 mag zonder)?
3. Is de rationale specifiek (concrete feiten uit de melding) en niet vaag (bv. "leek ernstig", "waarschijnlijk")?
4. Als escalatie=false: bevat de melding geen tegenstrijdigheid die escalatie had gerechtvaardigd?
Geef bij "ok":false minimaal één concreet, navolgbaar issue in het Nederlands.

OKF-RUNBOOK:
${runbook}

BOUNDARY CONDITIONS:
${boundaryDef}`;
  const user = `Melding: "${inc.tekst}"\n\nKandidaat-antwoord:\n${JSON.stringify(candidate, null, 2)}`;
  try {
    const v = await callClaudeJSON(system, [{ role: "user", content: user }]);
    return { ok: v.ok === true, issues: Array.isArray(v.issues) ? v.issues : [] };
  } catch {
    return { ok: true, issues: [] }; // verifier zelf onbereikbaar: niet blokkeren
  }
}

/* ---------- LLM-as-judge: beoordeelt of de rationale de boundary conditions echt raakt ---------- */
async function judgeRationale(inc, candidate) {
  const system = `Je bent een onafhankelijke "judge". Je beoordeelt NIET of de SAC correct is, maar of de rationale van de triage-agent de boundary conditions die op "waar":true staan daadwerkelijk en concreet onderbouwt (geen vage taal, wél verband met het citaat). Antwoord UITSLUITEND met JSON:
{"per_conditie": [{"key": "...", "klopt": true|false, "toelichting": "max 20 woorden"}], "score": geheel getal 0-100}`;
  const user = `Melding: "${inc.tekst}"\n\nRationale: "${candidate.rationale}"\nBoundary conditions:\n${JSON.stringify(candidate.boundary_conditions, null, 2)}`;
  return callClaudeJSON(system, [{ role: "user", content: user }]);
}

/* ---------- De AI-agent: leest OKF-bundel, triageert via ASK/ANSWER-lus + verificatie ---------- */
async function agentTriage(inc) {
  const okfContext = Object.entries(OKF)
    .filter(([k]) => ["runbook-triage-vim.md", "runbook-calamiteit-igj.md",
      "taxonomy-incidentcategorie.md", "metric-severity-assessment-code.md",
      "taxonomy-prisma-basisoorzaak.md"].includes(k))
    .map(([k, v]) => `### OKF-concept: ${k}\ntype: ${v.type}\n${v.body}`)
    .join("\n\n");

  const boundaryList = BOUNDARY_CONDITIONS.map((b) => `- "${b.key}" (SAC ${b.sac}): ${b.label}`).join("\n");

  const baseSystem = `Je bent een VIM-triage-agent voor een Nederlands ziekenhuis. Je classificeert één incidentmelding strikt volgens de meegeleverde OKF-kennisbundel.

OKF-KENNISBUNDEL:
${okfContext}

BOUNDARY CONDITIONS (beoordeel ELK apart met true/false + citaat uit de melding):
${boundaryList}

GEDRAGSREGELS (verplicht, in volgorde van belang):
1. Baseer gevolg, kans en boundary conditions uitsluitend op expliciet genoemde feiten in de melding; verzin geen aannames.
2. Ontbreekt een feit dat je nodig hebt om een boundary condition te beoordelen? Gebruik dan "actie":"ASK" met één concrete, gesloten vraag in "vraag" — vraag naar de InfoProvider, niet naar jezelf.
3. Je hebt maximaal ${MAX_ASK_TURNS} vragen in dit gesprek. Krijg je de instructie dat je het maximum hebt bereikt, dan MOET je "actie":"ANSWER" geven op basis van de nu bekende feiten.
4. Is een veld ook na eventuele vragen niet met zekerheid af te leiden uit de melding + OKF, of spreken feiten elkaar tegen? Zet dan "escalatie":true en leg in "escalatie_reden" uit welke tegenstrijdigheid of onduidelijkheid je tegenhoudt — kies geen SAC op basis van een gok.
5. Gebruik uitsluitend de taxonomiewaarden uit de OKF-bundel; geen vrije tekst in enum-velden.
6. Gebruik in "rationale" concrete feiten/citaten uit de melding, geen vage labels zoals "leek ernstig" of "waarschijnlijk".

Antwoord UITSLUITEND met geldige JSON, zonder uitleg, zonder markdown, zonder backticks.
Een "citaat" bevat alleen letterlijke tekst uit de melding, zonder eigen toelichting. Gebruik binnen een tekstwaarde geen dubbele aanhalingstekens.

Schema bij "actie":"ASK":
{ "actie": "ASK", "vraag": "één concrete, gesloten vraag aan de InfoProvider" }

Schema bij "actie":"ANSWER":
{
 "actie": "ANSWER",
 "categorie": één van [Medicatie,Val,Decubitus,Agressie,MedischHulpmiddel,Transfusie,IdentificatieVerwisseling,OverdrachtCommunicatie,Infectie,Diagnostiek,Documentatie,Overig],
 "uitkomst": één van [BijnaIncident,GeenSchade,TijdelijkeSchade,BlijvendeSchade,Overlijden],
 "gevolg": geheel getal 1-5,
 "kans": geheel getal 1-5,
 "sac": geheel getal 1-4,
 "boundary_conditions": { "<key>": { "waar": true|false, "citaat": "citaat of leeg" }, ... voor elke boundary condition hierboven ... },
 "basisoorzaak": één van [T,O,H,PRF,X],
 "escalatie": true of false,
 "escalatie_reden": "leeg als escalatie=false, anders concrete uitleg",
 "vervolgacties": subset van [Registreren,BesprekenVIMcommissie,PRISMAanalyse,SIRE,MeldenIGJ],
 "igj_melding": true of false,
 "rationale": korte motivering in max 25 woorden, met concrete feiten,
 "okf_geraadpleegd": lijst van OKF-bestandsnamen die je gebruikte
}`;

  const messages = [{
    role: "user",
    content: `Melding ${inc.id} — afdeling ${inc.afdeling}, gemeld door ${inc.melder}:\n"${inc.tekst}"\n\nTriageer volgens de OKF-runbook. Vraag actief door (actie=ASK) als een boundary condition niet met zekerheid is vast te stellen.`,
  }];

  const transcript = [];
  let askCount = 0;
  let candidate = null;

  // ASK/ANSWER-lus (#1) met hard turn-budget en force-answer-directief (Prompt C.4-patroon)
  for (let turn = 0; turn <= MAX_ASK_TURNS; turn++) {
    const forced = askCount >= MAX_ASK_TURNS;
    const sys = forced
      ? `${baseSystem}\n\nLET OP: je hebt het maximum van ${MAX_ASK_TURNS} vragen bereikt. Je MOET nu "actie":"ANSWER" geven op basis van de nu bekende feiten (escaleer zo nodig i.p.v. te gokken).`
      : baseSystem;
    const parsed = await callClaudeJSON(sys, messages);
    if (parsed.actie === "ASK" && !forced) {
      askCount++;
      const antwoord = await infoProviderAnswer(inc, parsed.vraag);
      transcript.push({ vraag: parsed.vraag, antwoord });
      messages.push({ role: "assistant", content: JSON.stringify(parsed) });
      messages.push({ role: "user", content: `InfoProvider-antwoord: ${antwoord}` });
      continue;
    }
    candidate = parsed;
    break;
  }

  // Verificatie-/retry-lus (#4): genereer → verifieer → bij fail feedback terug → retry
  let verified = false, verifyIssues = [];
  for (let attempt = 0; attempt <= MAX_VERIFY_RETRIES; attempt++) {
    const verdict = await verifyTriage(inc, candidate);
    if (verdict.ok) { verified = true; verifyIssues = []; break; }
    verifyIssues = verdict.issues;
    if (attempt === MAX_VERIFY_RETRIES) break;
    messages.push({ role: "assistant", content: JSON.stringify(candidate) });
    messages.push({
      role: "user",
      content: `Retry Feedback — je vorige antwoord voldoet niet aan de OKF-runbook:\n${verdict.issues.map((i) => "- " + i).join("\n")}\nCorrigeer je JSON-antwoord (actie:"ANSWER") met inachtneming van deze punten.`,
    });
    const corrected = await callClaudeJSON(baseSystem, messages);
    if (corrected.actie === "ANSWER") candidate = corrected;
  }

  return normalizeTriage(candidate, false, { transcript, verified, verifyIssues, askCount });
}

/* Maak de triage-output veilig: geldige SAC 1-4, getallen, arrays en boundary-conditionvelden. */
function normalizeTriage(r, fallback, meta = {}) {
  let sac = parseInt(r.sac, 10);
  if (![1, 2, 3, 4].includes(sac)) sac = 4;
  const gevolg = Math.min(5, Math.max(1, parseInt(r.gevolg, 10) || 1));
  const kans = Math.min(5, Math.max(1, parseInt(r.kans, 10) || 1));
  const basisoorzaak = PRISMA[r.basisoorzaak] ? r.basisoorzaak : "X";
  const boundary_conditions = {};
  BOUNDARY_CONDITIONS.forEach((b) => {
    const v = (r.boundary_conditions && r.boundary_conditions[b.key]) || {};
    boundary_conditions[b.key] = { waar: v.waar === true, citaat: v.citaat || "" };
  });
  return {
    categorie: r.categorie || "Overig",
    uitkomst: r.uitkomst || "GeenSchade",
    gevolg, kans, sac, basisoorzaak, boundary_conditions,
    escalatie: r.escalatie === true,
    escalatie_reden: r.escalatie_reden || "",
    vervolgacties: Array.isArray(r.vervolgacties) ? r.vervolgacties : ["Registreren"],
    igj_melding: r.igj_melding === true || sac === 1,
    rationale: r.rationale || "",
    okf_geraadpleegd: Array.isArray(r.okf_geraadpleegd) ? r.okf_geraadpleegd : [],
    _fallback: fallback,
    _transcript: meta.transcript || [],
    _verified: meta.verified === undefined ? null : meta.verified,
    _verifyIssues: meta.verifyIssues || [],
    _askCount: meta.askCount || 0,
    _judge: null,
    _judging: false,
  };
}

/* ================= UI-bouwstenen ================= */

// AI-markering: warm zwart blokje met geel Bot-icoon. Herkenbaar zonder op kleur te leunen.
function AiMark({ size = 18 }) {
  return (
    <span title="AI" aria-label="AI" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: 5, background: C.agent, flexShrink: 0 }}>
      <Bot size={Math.round(size * 0.67)} color={C.agentInk} />
    </span>
  );
}

function Tag({ children, color = C.dark, bg = C.cream, mono, ai }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      color: ai ? C.agentInk : color, background: ai ? C.agent : bg, border: `1px solid ${ai ? C.agent : color + "22"}`,
      padding: "2px 8px", borderRadius: 999, fontSize: 11.5,
      fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : "inherit",
      fontWeight: 600, whiteSpace: "nowrap",
    }}>{ai && <Bot size={11} />}{children}</span>
  );
}

// Vuurtoren-logo van Business Data Solutions (brand-project/stylebook/logo.svg).
function BrandMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Logo Business Data Solutions">
      <g fill={C.ink}>
        <polygon points="9,29 11,10 17,10 19,29" />
        <polygon points="8,8.5 20,8.5 19,10 9,10" />
        <rect x="11" y="5" width="6" height="3.5" />
        <path d="M10.5 5 Q10.5 1.5 14 1.5 Q17.5 1.5 17.5 5 Z" />
        <rect x="13.5" y="0" width="1" height="1.8" />
      </g>
      <rect x="13" y="6" width="2" height="2" fill={C.accent} />
      <g stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M21 4 L26 7 L21 10" />
        <path d="M26 4 L31 7 L26 10" />
      </g>
    </svg>
  );
}

function SacBadge({ sac }) {
  const s = SAC[sac] || SAC[4];
  return <Tag color="#fff" bg={s.color}>{s.label}</Tag>;
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
      padding: 18, ...style,
    }}>{children}</div>
  );
}

function Eyebrow({ children }) {
  return <div style={{
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase",
    color: C.mutedSoft, marginBottom: 6,
  }}>{children}</div>;
}

/* mini-markdownrenderer met klikbare OKF-links */
function MD({ text, onLink }) {
  const lines = text.split("\n");
  const renderInline = (s, key) => {
    const parts = [];
    const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
    let last = 0, m, i = 0;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) parts.push(s.slice(last, m.index));
      if (m[1]) {
        const target = m[2];
        parts.push(
          <button key={key + "-" + i++} onClick={() => onLink && onLink(target)}
            style={{ color: C.ink, background: "none", border: "none", padding: 0,
              cursor: "pointer", fontWeight: 600, textDecoration: "underline",
              textDecorationColor: C.accent, textDecorationThickness: 2,
              textUnderlineOffset: 3, font: "inherit" }}>{m[1]}</button>
        );
      } else if (m[3]) {
        parts.push(<strong key={key + "-" + i++} style={{ color: C.ink }}>{m[3]}</strong>);
      } else if (m[4]) {
        parts.push(<code key={key + "-" + i++} style={{
          fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5,
          background: C.cream2, padding: "1px 5px", borderRadius: 5 }}>{m[4]}</code>);
      }
      last = re.lastIndex;
    }
    if (last < s.length) parts.push(s.slice(last));
    return parts;
  };
  return (
    <div style={{ fontSize: 13.5, lineHeight: 1.65, color: C.muted }}>
      {lines.map((ln, i) => {
        if (ln.startsWith("# "))
          return <div key={i} style={{ fontWeight: 700, color: C.ink, fontSize: 14, margin: "12px 0 4px" }}>{ln.slice(2)}</div>;
        if (ln.startsWith("- "))
          return <div key={i} style={{ paddingLeft: 14, position: "relative" }}>
            <span style={{ position: "absolute", left: 2, color: C.mutedSoft }}>·</span>
            {renderInline(ln.slice(2), i)}</div>;
        if (ln.trim() === "") return <div key={i} style={{ height: 6 }} />;
        return <div key={i}>{renderInline(ln, i)}</div>;
      })}
    </div>
  );
}

/* ================= Laag-panelen ================= */

const LAYERS = [
  { id: "arch", label: "Architectuur", icon: Layers, sub: "Overzicht van de stack" },
  { id: "lake", label: "Data Lake", icon: Database, sub: "Ruwe VIM-meldingen" },
  { id: "onto", label: "Semantische laag", icon: Network, sub: "Ontologie & taxonomieën" },
  { id: "okf", label: "OKF-kennisbundel", icon: BookOpen, sub: "Knowledge atoms" },
  { id: "agent", label: "AI-agent triage", icon: Bot, sub: "Classificatie & routing" },
  { id: "report", label: "Rapportage", icon: FileBarChart, sub: "Bestuursdashboard" },
];

function ArchPanel({ go }) {
  const rows = [
    { n: "05", t: "Rapportagelaag", d: "Bestuursdashboard, KPI's, calamiteitenratio, IGJ-signaal.", to: "report", icon: FileBarChart, accent: C.dark },
    { n: "04", t: "AI-agent (triage)", d: "Leest de OKF-bundel, classificeert elke melding en bepaalt de vervolgroute.", to: "agent", icon: Bot, accent: C.dark, ai: true },
    { n: "03", t: "OKF-kennislaag", d: "Google Open Knowledge Format (v0.1): curated Markdown-concepten — metrics, tabellen, taxonomieën, runbooks — die de agent 'beloopt' als graaf.", to: "okf", icon: BookOpen, accent: C.darkSoft },
    { n: "02", t: "Semantische laag / ontologie", d: "Klassen en relaties (Incident, Categorie, SAC, PRISMA-basisoorzaak) geven de ruwe data betekenis.", to: "onto", icon: Network, accent: C.darkSoft },
    { n: "01", t: "Data Lake", d: "Onbewerkte, vrije-tekst VIM-meldingen in de landingszone.", to: "lake", icon: Database, accent: C.darkSoft },
  ];
  return (
    <div>
      <Eyebrow>Referentiearchitectuur</Eyebrow>
      <h2 style={{ margin: "0 0 6px", color: C.ink, fontSize: 24, letterSpacing: -0.3 }}>
        Van ruwe melding naar bestuurbaar signaal
      </h2>
      <p style={{ color: C.muted, marginTop: 0, maxWidth: 680, fontSize: 14, lineHeight: 1.6 }}>
        Vijf lagen. Onderin de ruwe data, bovenop een dunne kennislaag in Google OKF
        die de agent leesbaar en navigeerbaar maakt zonder dat hij documenten steeds opnieuw hoeft te interpreteren.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {rows.map((r) => (
          <button key={r.n} onClick={() => go(r.to)} style={{
            display: "grid", gridTemplateColumns: "56px 1fr auto", alignItems: "center",
            gap: 14, textAlign: "left", background: C.card, border: `1px solid ${C.line}`,
            borderLeft: `3px solid ${r.accent}`, borderRadius: 12, padding: "16px 18px", cursor: "pointer",
          }}>
            <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 20, color: r.accent, fontWeight: 700 }}>{r.n}</span>
            <span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <r.icon size={16} color={r.accent} />
                <span style={{ fontWeight: 700, color: C.ink, fontSize: 15 }}>{r.t}</span>
                {r.ai && <Tag ai>AI</Tag>}
              </span>
              <span style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, display: "block", marginTop: 3 }}>{r.d}</span>
            </span>
            <ChevronRight size={18} color={C.mutedSoft} />
          </button>
        ))}
      </div>
    </div>
  );
}

function LakePanel() {
  return (
    <div>
      <Eyebrow>Laag 01 · Data Lake</Eyebrow>
      <h2 style={{ margin: "0 0 4px", color: C.ink, fontSize: 22 }}>Ruwe VIM-meldingen</h2>
      <p style={{ color: C.muted, marginTop: 0, fontSize: 14 }}>
        {INCIDENTS.length} onbewerkte meldingen, vrije tekst. Nog geen structuur of classificatie.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {INCIDENTS.map((i) => (
          <Card key={i.id} style={{ padding: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
              <Tag mono>{i.id}</Tag>
              <Tag color={C.darkSoft} bg={C.cream}>{i.afdeling}</Tag>
              <span style={{ fontSize: 12, color: C.mutedSoft }}>{i.melder} · {i.datum}</span>
            </div>
            <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>{i.tekst}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OntoPanel() {
  const block = (title, items, color) => (
    <Card style={{ padding: 14 }}>
      <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((x) => <Tag key={x} color={color} bg={`${color}14`}>{x}</Tag>)}
      </div>
    </Card>
  );
  return (
    <div>
      <Eyebrow>Laag 02 · Semantische laag</Eyebrow>
      <h2 style={{ margin: "0 0 4px", color: C.ink, fontSize: 22 }}>VIM-ontologie</h2>
      <p style={{ color: C.muted, marginTop: 0, fontSize: 14 }}>
        Klassen, taxonomieën en relaties die betekenis geven aan een ruwe melding.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 14 }}>
        {block("Categorie", Object.values(CAT), C.dark)}
        {block("Uitkomst", ["Bijna-incident", "Geen schade", "Tijdelijke schade", "Blijvende schade", "Overlijden"], C.darkSoft)}
        {block("Ernstniveau (SAC)", Object.values(SAC).map((s) => s.label), C.sac2)}
        {block("Basisoorzaak (PRISMA)", Object.values(PRISMA), C.darkSoft)}
        {block("Vervolgactie", ["Registreren", "Bespreken VIM-commissie", "PRISMA-analyse", "SIRE", "Melden IGJ"], C.dark)}
      </div>
      <Card style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5, marginBottom: 10 }}>Relaties</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {[
            ["Incident", "heeftCategorie", "Categorie"],
            ["Incident", "heeftErnst", "Ernstniveau (SAC)"],
            ["Incident", "vondPlaatsOp", "Afdeling"],
            ["Incident", "heeftUitkomst", "Uitkomst"],
            ["Incident", "heeftBasisoorzaak", "Basisoorzaak"],
            ["Incident", "vereistVervolgactie", "Vervolgactie"],
          ].map(([a, r, b], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <Tag color={C.ink} bg={C.cream}>{a}</Tag>
              <span style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12, color: C.ink, fontWeight: 600 }}>{r}</span>
              <ArrowRight size={13} color={C.mutedSoft} />
              <Tag color={C.dark} bg={C.cream}>{b}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OkfPanel() {
  const [active, setActive] = useState("runbook-triage-vim.md");
  const file = OKF[active];
  const typeColor = { Runbook: C.dark, Metric: C.sac2, Taxonomy: C.dark, Table: C.darkSoft, Dataset: C.darkSoft, Ontology: C.dark };
  return (
    <div>
      <Eyebrow>Laag 03 · Google Open Knowledge Format</Eyebrow>
      <h2 style={{ margin: "0 0 4px", color: C.ink, fontSize: 22 }}>OKF-kennisbundel</h2>
      <p style={{ color: C.muted, marginTop: 0, fontSize: 14 }}>
        Eén Markdown-concept per bestand. Links maken er een graaf van die de agent kan belopen.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 12, marginTop: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(OKF).map(([k, v]) => (
            <button key={k} onClick={() => setActive(k)} style={{
              textAlign: "left", background: active === k ? C.accentSoft : C.card,
              border: `1px solid ${active === k ? C.accent : C.line}`, borderRadius: 10,
              padding: "9px 11px", cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <FileText size={13} color={typeColor[v.type] || C.muted} />
                <span style={{ fontSize: 10.5, fontFamily: "ui-monospace, Menlo, monospace",
                  color: typeColor[v.type] || C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{v.type}</span>
              </div>
              <div style={{ fontSize: 12.5, color: C.ink, fontWeight: 600, lineHeight: 1.3 }}>{v.title}</div>
            </button>
          ))}
        </div>
        <Card>
          <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11.5,
            background: C.dark, color: C.cream, borderRadius: 8, padding: "10px 12px", marginBottom: 12, lineHeight: 1.7 }}>
            <div style={{ opacity: 0.6 }}>---</div>
            <div><span style={{ color: C.agentInk }}>type:</span> {file.type}</div>
            <div><span style={{ color: C.agentInk }}>title:</span> {file.title}</div>
            <div><span style={{ color: C.agentInk }}>description:</span> {file.description}</div>
            <div><span style={{ color: C.agentInk }}>resource:</span> {file.resource}</div>
            <div><span style={{ color: C.agentInk }}>tags:</span> [{file.tags.join(", ")}]</div>
            <div><span style={{ color: C.agentInk }}>timestamp:</span> {file.timestamp}</div>
            <div style={{ opacity: 0.6 }}>---</div>
          </div>
          <MD text={file.body} onLink={(t) => OKF[t] && setActive(t)} />
        </Card>
      </div>
    </div>
  );
}

/* ---------- Agent-paneel ---------- */
function AgentPanel({ results, setResults, running, runAll, runOne }) {
  async function judgeOne(inc) {
    const r = results[inc.id];
    if (!r || r._loading) return;
    setResults((p) => ({ ...p, [inc.id]: { ...p[inc.id], _judging: true } }));
    try {
      const judge = await judgeRationale(inc, r);
      setResults((p) => ({ ...p, [inc.id]: { ...p[inc.id], _judge: judge, _judging: false } }));
    } catch {
      setResults((p) => ({ ...p, [inc.id]: { ...p[inc.id], _judge: { error: true }, _judging: false } }));
    }
  }

  return (
    <div>
      <Eyebrow>Laag 04 · AI-agent</Eyebrow>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: "0 0 4px", color: C.ink, fontSize: 22 }}>Triage-agent</h2>
          <p style={{ color: C.muted, margin: 0, fontSize: 14, maxWidth: 560 }}>
            De agent leest de OKF-runbook + taxonomieën en classificeert elke melding: categorie,
            SAC, basisoorzaak en vervolgroute — met citaten per boundary condition. Ontbreekt een feit,
            dan vraagt hij door bij de InfoProvider; blijft het onduidelijk, dan escaleert hij liever dan te gokken.
          </p>
        </div>
        <button onClick={runAll} disabled={running} style={{
          display: "flex", alignItems: "center", gap: 8, background: running ? C.line : C.accent,
          color: C.ink, border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 14,
          fontWeight: 700, cursor: running ? "default" : "pointer",
        }}>
          {running ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
          {running ? "Bezig met triage…" : "Draai triage op alle meldingen"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
        {INCIDENTS.map((inc) => {
          const r = results[inc.id];
          return (
            <Card key={inc.id} style={{ padding: 14, borderLeft: `3px solid ${r && !r._loading && SAC[r.sac] ? SAC[r.sac].color : C.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                    <Tag mono>{inc.id}</Tag>
                    <Tag color={C.darkSoft} bg={C.cream}>{inc.afdeling}</Tag>
                  </div>
                  <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{inc.tekst}</div>
                </div>
                {!r && !running && (
                  <button onClick={() => runOne(inc)} style={{
                    alignSelf: "flex-start", background: "#fff", color: C.ink, border: `1px solid ${C.accent}`,
                    borderRadius: 8, padding: "6px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Triageer
                  </button>
                )}
                {r?._loading && <Loader2 size={18} className="spin" color={C.ink} style={{ alignSelf: "center" }} />}
              </div>

              {r && !r._loading && (
                <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {!r._fallback && <Tag ai>AI-voorstel</Tag>}
                    <SacBadge sac={r.sac} />
                    <Tag color={C.dark} bg={C.cream}>{CAT[r.categorie] || r.categorie}</Tag>
                    <Tag color={C.darkSoft} bg={C.cream}>{r.uitkomst}</Tag>
                    <Tag color={C.dark} bg={C.cream}>{PRISMA[r.basisoorzaak] || r.basisoorzaak}</Tag>
                    <Tag color={C.muted} bg={C.cream2} mono>gevolg {r.gevolg} · kans {r.kans}</Tag>
                    {r.igj_melding && <Tag color="#fff" bg={C.sac1}>⚠ Melden IGJ</Tag>}
                    {r.escalatie && <Tag color="#fff" bg={C.sac2}>❓ Escalatie — onzeker</Tag>}
                    {r._verified === true && <Tag color="#fff" bg={SAC[4].color}>✓ Geverifieerd</Tag>}
                    {r._verified === false && <Tag color="#fff" bg={C.sac1}>⚠ Verificatie faalt nog</Tag>}
                    {r._askCount > 0 && <Tag ai>{r._askCount}× doorgevraagd</Tag>}
                    {r._fallback && <Tag color={C.muted} bg={C.cream2}>fallback</Tag>}
                  </div>

                  <div style={{ fontSize: 12.5, color: C.muted, fontStyle: "italic", marginBottom: 8 }}>
                    "{r.rationale}"
                  </div>

                  {r.escalatie && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "#FDF3E7",
                      border: `1px solid ${C.sac2}44`, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
                      <HelpCircle size={15} color={C.sac2} style={{ flexShrink: 0, marginTop: 1 }} />
                      <div style={{ fontSize: 12.5, color: C.ink }}>
                        <strong>Onzeker verdict.</strong> {r.escalatie_reden || "Geen eenduidig antwoord mogelijk uit de melding."}
                      </div>
                    </div>
                  )}

                  {r._verifyIssues && r._verifyIssues.length > 0 && (
                    <div style={{ background: "#FBECEA", border: `1px solid ${C.sac1}33`, borderRadius: 8,
                      padding: "8px 10px", marginBottom: 8 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sac1, marginBottom: 3 }}>
                        Verificatie-issues (na {MAX_VERIFY_RETRIES} retries nog niet opgelost):
                      </div>
                      {r._verifyIssues.map((iss, i) => (
                        <div key={i} style={{ fontSize: 12, color: C.ink }}>· {iss}</div>
                      ))}
                    </div>
                  )}

                  <details style={{ marginBottom: 8 }}>
                    <summary style={{ cursor: "pointer", fontSize: 12, color: C.muted, fontWeight: 600 }}>
                      Boundary conditions
                    </summary>
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 5 }}>
                      {BOUNDARY_CONDITIONS.map((b) => {
                        const v = r.boundary_conditions?.[b.key] || { waar: false, citaat: "" };
                        return (
                          <div key={b.key} style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
                            {v.waar
                              ? <CheckCircle2 size={13} color={SAC[b.sac].color} style={{ flexShrink: 0, marginTop: 1.5 }} />
                              : <span style={{ width: 13, textAlign: "center", color: C.mutedSoft, flexShrink: 0 }}>–</span>}
                            <span>
                              <span style={{ color: v.waar ? C.ink : C.mutedSoft, fontWeight: v.waar ? 600 : 400 }}>{b.label}</span>
                              {v.waar && v.citaat && (
                                <span style={{ color: C.muted, fontStyle: "italic" }}> — "{v.citaat}"</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </details>

                  {r._transcript && r._transcript.length > 0 && (
                    <details style={{ marginBottom: 8 }}>
                      <summary style={{ cursor: "pointer", fontSize: 12, color: C.ink, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        <MessageSquare size={12} /> Dialoog met InfoProvider ({r._transcript.length})
                      </summary>
                      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
                        {r._transcript.map((t, i) => (
                          <div key={i} style={{ fontSize: 12, background: C.cream, borderLeft: `3px solid ${C.agent}`, borderRadius: 8, padding: "7px 10px" }}>
                            <div style={{ color: C.ink, fontWeight: 600, display: "flex", gap: 6, alignItems: "flex-start" }}><AiMark size={16} /><span>Agent vraagt: {t.vraag}</span></div>
                            <div style={{ color: C.ink, marginTop: 2 }}>InfoProvider: {t.antwoord}</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.mutedSoft, fontFamily: "ui-monospace, Menlo, monospace" }}>OKF-walk:</span>
                    {(r.okf_geraadpleegd || []).map((f) => (
                      <span key={f} style={{ fontSize: 10.5, fontFamily: "ui-monospace, Menlo, monospace",
                        color: C.agentInk, background: C.agent, padding: "2px 6px", borderRadius: 5 }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {(r.vervolgacties || []).map((a) => (
                      <Tag key={a} color={C.ink} bg={C.cream}>→ {a}</Tag>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${C.line}` }}>
                    {!r._judge && (
                      <button onClick={() => judgeOne(inc)} disabled={r._judging} style={{
                        display: "flex", alignItems: "center", gap: 6, background: "#fff",
                        color: C.dark, border: `1px solid ${C.dark}44`, borderRadius: 8,
                        padding: "5px 11px", fontSize: 12, fontWeight: 700, cursor: r._judging ? "default" : "pointer" }}>
                        {r._judging ? <Loader2 size={12} className="spin" /> : <Scale size={12} />}
                        {r._judging ? "Judge beoordeelt…" : "Beoordeel rationale (judge)"}
                      </button>
                    )}
                    {r._judge && !r._judge.error && (
                      <div style={{ fontSize: 12, color: C.ink }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <AiMark size={16} />
                          <strong>Judge-score: {r._judge.score}/100</strong>
                        </div>
                        {(r._judge.per_conditie || []).map((p, i) => (
                          <div key={i} style={{ fontSize: 11.5, color: p.klopt ? C.muted : C.sac1, marginLeft: 19 }}>
                            {p.klopt ? "✓" : "✗"} {p.key}: {p.toelichting}
                          </div>
                        ))}
                      </div>
                    )}
                    {r._judge?.error && (
                      <div style={{ fontSize: 12, color: C.sac1 }}>Judge onbereikbaar — probeer opnieuw.</div>
                    )}
                  </div>
                </div>
              )}
              {r?._error && (
                <div style={{ marginTop: 10, fontSize: 12.5, color: C.sac1 }}>
                  Geen bruikbaar antwoord van de live-agent. De regelgebaseerde fallback is gebruikt. Klik "Triageer" om opnieuw te proberen.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Rapportagepaneel ---------- */
function ReportPanel({ results, go }) {
  const done = Object.values(results).filter((r) => r && !r._loading);
  const [summary, setSummary] = useState("");
  const [genning, setGenning] = useState(false);

  const stats = useMemo(() => {
    const bySac = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const byCat = {}, byAfd = {}, byOorzaak = {};
    let igj = 0, escalaties = 0;
    const judgeScores = [];
    done.forEach((r) => {
      bySac[r.sac] = (bySac[r.sac] || 0) + 1;
      byCat[r.categorie] = (byCat[r.categorie] || 0) + 1;
      byOorzaak[r.basisoorzaak] = (byOorzaak[r.basisoorzaak] || 0) + 1;
      if (r.igj_melding) igj++;
      if (r.escalatie) escalaties++;
      if (r._judge && !r._judge.error && typeof r._judge.score === "number") judgeScores.push(r._judge.score);
    });
    INCIDENTS.forEach((i) => { if (results[i.id] && !results[i.id]._loading) byAfd[i.afdeling] = (byAfd[i.afdeling] || 0) + 1; });
    const avgJudgeScore = judgeScores.length
      ? Math.round(judgeScores.reduce((a, b) => a + b, 0) / judgeScores.length)
      : null;
    return { bySac, byCat, byAfd, byOorzaak, igj, escalaties, avgJudgeScore, judgedCount: judgeScores.length, total: done.length };
  }, [done, results]);

  async function genSummary() {
    setGenning(true);
    try {
      const stat = `Totaal ${stats.total} meldingen. SAC1=${stats.bySac[1]}, SAC2=${stats.bySac[2]}, SAC3=${stats.bySac[3]}, SAC4=${stats.bySac[4]}. IGJ-meldingen=${stats.igj}. Per categorie: ${Object.entries(stats.byCat).map(([k, v]) => `${k}:${v}`).join(", ")}. Basisoorzaken: ${Object.entries(stats.byOorzaak).map(([k, v]) => `${k}:${v}`).join(", ")}.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: "Je bent kwaliteitsadviseur patiëntveiligheid. Schrijf een korte, zakelijke bestuurssamenvatting (max 130 woorden) in het Nederlands op basis van de VIM-cijfers. Noem het belangrijkste risicosignaal, de IGJ-plicht en één concrete aanbeveling. Geen opsomming, lopende tekst.",
          messages: [{ role: "user", content: stat }],
        }),
      });
      const data = await res.json();
      setSummary(data.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim());
    } catch {
      setSummary("Samenvatting kon niet live worden gegenereerd. Kern: " +
        `${stats.igj} calamiteit(en) vereisen melding bij de IGJ binnen 3 werkdagen. ` +
        "Medicatie- en overdrachtsincidenten domineren; borg de dubbelcheck en gestructureerde overdracht (SBARR).");
    }
    setGenning(false);
  }

  if (stats.total === 0) {
    return (
      <div>
        <Eyebrow>Laag 05 · Rapportage</Eyebrow>
        <h2 style={{ margin: "0 0 4px", color: C.ink, fontSize: 22 }}>Bestuursdashboard</h2>
        <Card style={{ marginTop: 14, textAlign: "center", padding: 40 }}>
          <FileBarChart size={30} color={C.mutedSoft} style={{ marginBottom: 10 }} />
          <div style={{ color: C.ink, fontWeight: 600, marginBottom: 4 }}>Nog geen getriageerde data</div>
          <div style={{ color: C.muted, fontSize: 13.5, marginBottom: 16 }}>
            Draai eerst de triage-agent; het dashboard vult zich met de resultaten.
          </div>
          <button onClick={() => go("agent")} style={{
            background: C.accent, color: C.ink, border: "none", borderRadius: 10,
            padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>
            Naar de agent
          </button>
        </Card>
      </div>
    );
  }

  const sacData = [1, 2, 3, 4].map((s) => ({ name: SAC[s].label.split(" · ")[0], value: stats.bySac[s], color: SAC[s].color }));
  const catData = Object.entries(stats.byCat).map(([k, v]) => ({ name: CAT[k] || k, value: v })).sort((a, b) => b.value - a.value);
  const oorzaakData = Object.entries(stats.byOorzaak).map(([k, v]) => ({ name: k, value: v, full: PRISMA[k] }));
  const ratio = ((stats.bySac[1] / stats.total) * 100).toFixed(1);

  return (
    <div>
      <Eyebrow>Laag 05 · Rapportage</Eyebrow>
      <h2 style={{ margin: "0 0 4px", color: C.ink, fontSize: 22 }}>Bestuursdashboard</h2>
      <p style={{ color: C.muted, marginTop: 0, fontSize: 14 }}>
        Geaggregeerd over {stats.total} getriageerde meldingen.
      </p>

      {/* KPI-rij */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginTop: 14 }}>
        {[
          { l: "Meldingen", v: stats.total, c: C.dark },
          { l: "Calamiteiten (SAC 1)", v: stats.bySac[1], c: C.sac1 },
          { l: "IGJ-plichtig", v: stats.igj, c: C.sac1 },
          { l: "Calamiteitenratio", v: ratio + "%", c: C.sac2 },
          { l: "Escalaties (onzeker)", v: stats.escalaties, c: C.sac2 },
          { l: "Gem. judge-score", v: stats.avgJudgeScore === null ? "—" : `${stats.avgJudgeScore}/100`, c: C.dark },
        ].map((k) => (
          <Card key={k.l} style={{ padding: 14 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.c, fontFamily: "ui-monospace, Menlo, monospace" }}>{k.v}</div>
          </Card>
        ))}
      </div>

      {stats.igj > 0 && (
        <Card style={{ marginTop: 10, background: "#FBECEA", borderColor: `${C.sac1}44`, display: "flex", gap: 10, alignItems: "center" }}>
          <ShieldAlert size={20} color={C.sac1} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: C.ink }}>
            <strong>{stats.igj} incident(en)</strong> geclassificeerd als calamiteit — melden bij de <strong>IGJ binnen 3 werkdagen</strong> en onderzoeken met PRISMA/SIRE.
          </div>
        </Card>
      )}

      {stats.escalaties > 0 && (
        <Card style={{ marginTop: 10, background: "#FDF3E7", borderColor: `${C.sac2}44`, display: "flex", gap: 10, alignItems: "center" }}>
          <HelpCircle size={20} color={C.sac2} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, color: C.ink }}>
            <strong>{stats.escalaties} melding(en)</strong> door de agent bewust niet doorgegokt maar geëscaleerd —
            de melding of het OKF-runbook liet geen eenduidig antwoord toe. Een model dat durft te escaleren i.p.v. te gokken
            is precies het gedrag dat patiëntveiligheid vraagt.
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, marginTop: 10 }}>
        <Card>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5, marginBottom: 10 }}>Verdeling naar SAC</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sacData} margin={{ left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.muted }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sacData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5, marginBottom: 10 }}>PRISMA-basisoorzaken</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={oorzaakData} dataKey="value" nameKey="name" outerRadius={65} label={(e) => e.name}>
                {oorzaakData.map((d, i) => <Cell key={i} fill={[C.dark, C.darkSoft, C.accent, C.sac2, C.mutedSoft][i % 5]} />)}
              </Pie>
              <Tooltip formatter={(v, n, p) => [v, p.payload.full]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5, marginBottom: 10 }}>Meldingen per categorie</div>
        <ResponsiveContainer width="100%" height={Math.max(160, catData.length * 30)}>
          <BarChart data={catData} layout="vertical" margin={{ left: 40, right: 20 }}>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.muted }} />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: C.ink }} />
            <Tooltip />
            <Bar dataKey="value" fill={C.dark} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontWeight: 700, color: C.ink, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8 }}>Bestuurssamenvatting{summary && <Tag ai>door AI geschreven</Tag>}</div>
          <button onClick={genSummary} disabled={genning} style={{
            display: "flex", alignItems: "center", gap: 6, background: genning ? C.mutedSoft : C.agent,
            color: C.agentInk, border: "none", borderRadius: 8, padding: "7px 13px", fontSize: 12.5, fontWeight: 700,
            cursor: genning ? "default" : "pointer" }}>
            {genning ? <Loader2 size={13} className="spin" /> : <Bot size={13} />}
            {genning ? "Genereren…" : "Genereer met agent"}
          </button>
        </div>
        {summary
          ? <p style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.65, margin: 0 }}>{summary}</p>
          : <p style={{ fontSize: 13, color: C.mutedSoft, margin: 0, fontStyle: "italic" }}>
              Laat de agent een bestuurlijke samenvatting schrijven op basis van de cijfers hierboven.
            </p>}
      </Card>
    </div>
  );
}

/* ================= App ================= */
export default function App() {
  const [layer, setLayer] = useState("arch");
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const cancel = useRef(false);

  async function triageOne(inc) {
    setResults((p) => ({ ...p, [inc.id]: { _loading: true } }));
    let out;
    try {
      out = await agentTriage(inc);
    } catch (e) {
      console.warn(`Triage ${inc.id}: live-agent faalde, fallback gebruikt.`, e);
      out = ruleBasedTriage(inc);
      out._error = true;
    }
    setResults((p) => ({ ...p, [inc.id]: out }));
    return out;
  }

  async function runAll() {
    setRunning(true);
    cancel.current = false;
    for (const inc of INCIDENTS) {
      if (cancel.current) break;
      await triageOne(inc);
    }
    setRunning(false);
  }

  const triagedCount = Object.values(results).filter((r) => r && !r._loading).length;

  const panel = {
    arch: <ArchPanel go={setLayer} />,
    lake: <LakePanel />,
    onto: <OntoPanel />,
    okf: <OkfPanel />,
    agent: <AgentPanel results={results} setResults={setResults} running={running} runAll={runAll} runOne={triageOne} />,
    report: <ReportPanel results={results} go={setLayer} />,
  }[layer];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.paper, color: C.ink,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif",
      WebkitFontSmoothing: "antialiased" }}>
      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}button:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Zijbalk: de stack */}
      <aside style={{ width: 268, flexShrink: 0, borderRight: `1px solid ${C.line}`,
        background: C.card, padding: 18, position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 3 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.dark,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Hospital size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.ink, lineHeight: 1 }}>St. Machteld</div>
            <div style={{ fontSize: 11, color: C.mutedSoft }}>VIM-platform (fictief)</div>
          </div>
        </div>
        <div style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: 10, color: C.mutedSoft,
          letterSpacing: 1, textTransform: "uppercase", margin: "18px 0 8px" }}>Architectuurlagen</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {LAYERS.map((l) => {
            const on = layer === l.id;
            return (
              <button key={l.id} onClick={() => setLayer(l.id)} style={{
                display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                background: on ? C.accent : "transparent",
                border: `1px solid ${on ? C.accent : "transparent"}`,
                borderRadius: 9, padding: "9px 10px", cursor: "pointer" }}>
                <l.icon size={16} color={on ? C.ink : C.muted} />
                <span>
                  <span style={{ display: "block", fontSize: 13, fontWeight: on ? 700 : 600,
                    color: on ? C.ink : C.muted, lineHeight: 1.2 }}>{l.label}</span>
                  <span style={{ display: "block", fontSize: 10.5, color: C.mutedSoft }}>{l.sub}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div style={{ marginTop: 18, padding: 12, background: C.paper, borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: C.muted }}>Getriageerd</span>
            <span style={{ fontWeight: 700, color: C.ink, fontFamily: "ui-monospace, Menlo, monospace" }}>{triagedCount}/{INCIDENTS.length}</span>
          </div>
          <div style={{ height: 6, background: C.line, borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(triagedCount / INCIDENTS.length) * 100}%`,
              background: C.accent, transition: "width .3s" }} />
          </div>
          {triagedCount > 0 && (
            <button onClick={() => setResults({})} style={{
              display: "flex", alignItems: "center", gap: 5, marginTop: 10, background: "none",
              border: "none", color: C.muted, fontSize: 11.5, cursor: "pointer", padding: 0 }}>
              <RotateCcw size={12} /> Reset triage
            </button>
          )}
        </div>
      </aside>

      {/* Hoofdpaneel */}
      <main style={{ flex: 1, padding: "26px 30px", maxWidth: 940, margin: "0 auto", width: "100%" }}>
        {panel}
        <div style={{ marginTop: 28, paddingTop: 14, borderTop: `1px solid ${C.line}`,
          fontSize: 11.5, color: C.mutedSoft }}>
          Fictieve simulatie voor onderwijs. Data lake → semantische laag (ontologie) → Google OKF → AI-agent → rapportage.
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: C.ink, fontWeight: 700, fontSize: 13 }}>
            <BrandMark size={24} /> Business Data Solutions
          </div>
        </div>
      </main>
    </div>
  );
}
