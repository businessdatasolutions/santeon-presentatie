# Volledige sessie-outline: AI en kwaliteitsmanagement in de zorg — triage, data-analyse en workflow

## Context

De vraag was: de **volledige sessie-outline** (90 minuten, frontaal + interactief), zoals die als actiepunt in `notes-22-06-2026.md` staat genoteerd ("Build a prototype demo and full session outline (Witek)").

**Uitgangspunten (vastgelegd in eerdere gesprekken/notities):**
- Event: Santeon-inspiratiedag, 10 november 2026, Rotterdam-Zuid (Maasstad Ziekenhuis).
- Plenaire lezing gepland tussen 10:30 en 12:00 uur — 90 minuten, precies zoals hieronder uitgewerkt.
- Verwachte groepsgrootte: circa 65 collega's.
- Contactpersoon: Carien Eijkman – Stuart (Maasstad Ziekenhuis).
- Publiek: kwaliteitsadviseurs/-managers van meerdere ziekenhuizen — regelvolgend, niet exploratief.
- Doel: publiek verlaat de zaal met het gevoel "ik zou hier morgen mee kunnen beginnen."
- Toon: concreet en stap-voor-stap, geen hype.
- Rode draad: de VIM-workflow (`background-material/vim-workflow.excalidraw`/`.svg`) als casus — het publiek kent dit proces al door en door.
- Reeds afgesproken tweedeling: **Deel 1** (AI-kansen, high-level) → **Deel 2** (praktijkdemo, live prototype + interactief).
- **Scope-keuze (bevestigd):** alleen de kernspine uit de 12-frameworks-atlas gebruiken (geen extra frameworks zoals Anand-Wu 2×2 of Carucci) — houdt de sessie krap en concreet.
- **Fee proposal**: expliciet buiten dit document — apart traject.
- **Vorm**: getimede sessie-flow met spreeknotities, geen slide-lijst.

**Bronnen die de kernspine dragen** (uit `2026-07-01-hospital-quality-ai-presentation-query-trace.md` + deze sessie):
- Maturity-realitycheck: sectie 0 van `background-material/2026-07-01-ai-maturity-frameworks-visuals.html`
- Rules-of-engagement-onderbouwing: Manditereza (ontologie), Peron/Philips (MIT SMR), AgentSpec (Wang)
- Vertrouwens-heuristiek: jagged-frontier / Böckeler (probability × impact × detectability)
- Groeimodel: Ask→Assist→Automate (Beutler) + governanceregel
- Live-demo-technisch-patroon: Luminai/Dinakaran (triage-agent-skeleton) + document-intelligence (extractie-nauwkeurigheid) + LandingAI (extract→validate→orchestrate)
- Eigen VIM-materiaal: `vim-workflow.excalidraw`/`.svg`, NEN 8009-notities, KNMG "veilig melden", PSEBench-bevindingen (allemaal in `background-material/`)

---

## Sessie-flow (90 minuten)

### 0. Opening — 5 min
- Welkom, wie is Witek, waarom deze sessie.
- Meteen het frame neerzetten: **"AI als kans om het vak beter te maken, niet alleen sneller."**
- Stip op de horizon: meer tijd op de vloer bij professionals, minder achter schermen.
- Agenda in één zin: "Eerst het brede plaatje, dan concreet op jullie eigen proces, dan laten we het echt werken zien."

### Deel 1 — AI-kansen in context (high-level) — 25 min

**1. Realitycheck: hoe volwassen is "AI-volwassenheid" echt? (5 min)**
- Toon de maturity-bar (sectie 0 van de HTML-atlas): vijf onafhankelijke onderzoeken, allemaal tussen 1–15% "mature," terwijl brede adoptie al 78–88% is.
- Boodschap: *adoptie is hoog, volwassenheid is zeldzaam* — dit is dus geen achterstand van deze zaal specifiek, maar de norm overal. Verlaagt de drempel en voorkomt hype-gevoel.

**2. Het fundament: rules of engagement, expliciet gemaakt (10 min)**
- Kernstelling: AI werkt pas betrouwbaar als kwaliteitsstandaarden en KPI's *expliciet* zijn vastgelegd — en dat is een **professionele**, geen technische taak.
- Onderbouwing (citeerbaar):
  - Manditereza (industrial-AI ontologie): *"traditional databases store records; ontologies model operational reality"* — met als voorbeeld nota bene een Quality/Inspection/Defect-domein. Vertaling: het schrijven van jullie kwaliteitshandboek **is** het bouwen van de ontologie die AI nodig heeft.
  - Peron/Philips (enige toegewijde zorg-AI-bron in de wiki): noemt *"data quality and standardization from the get-go"* als grootste barrière voor AI in de zorg — dezelfde claim, nu van een clinicus i.p.v. een engineer. Herhaalt: *"AI is here to add, not to take over."*
  - AgentSpec (Wang): "rules of engagement" letterlijk geformaliseerd als `regel → trigger → check → handhaving` (wanneer X gebeurt, check Y, dan Z: pauzeer voor mens / stop / ga door) — een niet-technische manier om te laten zien dat elke kwaliteitsstandaard zo'n drieledige regel wordt.
  - **Eigen inzicht (koppel dit expliciet)**: dit is precies het KNMG "veilig melden"-principe toegepast op AI zelf — systeemgericht, niet gericht op afrekenen van een individu. Sterk bruggetje omdat het de eigen kernwaarde van het publiek gebruikt als model voor hoe AI-toezicht zélf zou moeten werken.

**3. Vertrouwens-heuristiek: wanneer is een taak "veilig genoeg" voor AI? (5 min)**
- Jagged frontier: AI is betrouwbaar *binnen* een afgebakende, goed gespecificeerde taak, onbetrouwbaar erbuiten.
- Böckeler-heuristiek als meeneembare checklist: **(kans op fout) × (impact als het fout gaat) × (detecteerbaarheid van de fout)** = hoeveel toezicht een taak nodig heeft.
- Dit geeft het regelvolgende publiek precies het soort concreet afwegingskader dat ze zelf willen kunnen toepassen op elke nieuwe AI-toepassing.

**4. Samenvatting Deel 1 (5 min)**
- Herhaal de drieslag: reality-check → expliciete standaarden → afwegingskader.
- Overgang: *"Wat betekent dit nu concreet, toegepast op jullie eigen proces?"*

### Brug — Ask → Assist → Automate op de VIM-workflow — 15 min

*(Dit is de al eerder uitgewerkte kern — hieronder de condensatie; volledige spreektekst met alle drie de niveaus staat behouden omdat dit het meest concrete onderdeel van de hele sessie is.)*

- Toon de Ask→Assist→Automate-mermaid (HTML-atlas sectie 9) náást de VIM-workflow.
- Loop **hetzelfde scenario — cross-unit trendanalyse (Route 3 in het VIM-diagram)** drie keer door, met oplopende autonomie:

  **ASK — "AI leest mee, jullie beslissen"**
  - AI leest meldingen uit meerdere units en **stelt een samenvatting van het patroon voor** ("deze drie units meldden deze maand vergelijkbare medicatie-incidenten") — puur signalerend.
  - Sheettekst: *"AI stelt een cross-unit trendsamenvatting voor; de kwaliteitsadviseur beoordeelt en beslist."*
  - **Expliciet benoemen:** "wat u zo dadelijk in de demo ziet, is dit niveau, vandaag al werkend."

  **ASSIST — "AI stelt op, jullie autoriseren"**
  - AI zet het patroon om in een **concept-analyse** (bv. eerste PRISMA-oorzakenclassificatie) en zoekt relevante literatuur/oplossingen elders toegepast.
  - PVC/MIP-commissie corrigeert en autoriseert voordat het naar RvB of andere afdelingen gaat.
  - Sheettekst: *"AI stelt concept-analyse en verbetervoorstel op; de commissie corrigeert en autoriseert."*

  **AUTOMATE — "AI handelt zelf af, met een harde grens"**
  - Voor de duidelijkste, laagst-risicovolle gevallen sluit AI de cyclus zelf: signaleren, classificeren, archiveren (Eindpunt A), afdelingen informeren.
  - **Harde grens**: bij onduidelijke score, nieuw patroon, of calamiteit (Route 4) → altijd naar een mens.
  - Governance-citaat: *"als het afdelingshoofd niet verantwoordelijk gehouden kan worden voor het resultaat, heb je een demo, geen agent."*
  - Onderbouwing "waarom die grens hard moet zijn": PSEBench laat zien dat AI-modellen juist onbetrouwbaar en overmoedig worden bij twijfelgevallen — automatiseer nooit de grensgevallen, alleen de duidelijke.

- **Sluitzin naar Deel 2**: *"Wat u zo dadelijk ziet, is niveau 1: Ask. Assist en Automate zijn waar u naartoe kúnt groeien — bewust, stap voor stap, met u aan het stuur van elke escalatie."*

### Deel 2 — Praktische demonstratie — 35 min

**1. Live demo (18–20 min)**
- Werkend prototype: [vim-okf-simulatie](https://witusj.github.io/vim-okf-simulatie/) — fictieve simulatie (ziekenhuis "St. Machteld") van data lake → semantische laag/ontologie → OKF-kennisbundel → AI-triage-agent → bestuursrapportage. Draait volledig client-side (geen API-key nodig); AI-triage valt automatisch terug op een regelgebaseerde classificatie zodat de demo altijd werkt, ook offline.
- Technisch patroon: Luminai/Dinakaran's triage-agent-skeleton (classificeer op urgentie/type → extraheer gestructureerde data → routeer/aggregeer) — vertaald naar VIM-meldingen.
- Toon de AI live: leest (gesimuleerde) meldingen uit meerdere units, signaleert een cross-unit patroon, **stopt daar** voor menselijk oordeel — bevestigt letterlijk de Ask-tier-belofte uit de brug.
- Noem de nauwkeurigheidsgrens eerlijk (document-intelligence-inzicht): generieke extractie haalt 80–90%, een betrouwbare pijplijn heeft ~99,x% nodig — en *grounding* (elke uitspraak herleidbaar naar de brontekst) is wat vertrouwen mogelijk maakt. Dit is precies waarom Ask-tier (mens beoordeelt) het juiste startniveau is, niet Assist of Automate.
- Werkwijze zoals afgesproken: Witek bouwt het prototype, de contactpersoon reviewt en corrigeert vooraf.

**2. Interactief groepssegment (15 min)**
- Deelnemers voeren zelf een (voorbeeld-)meldingstekst uit hun eigen ziekenhuis in en zien de AI-classificatie/-samenvatting.
- Groepsgesprek: zouden jullie dit vertrouwen? Wat zou je aanpassen? — operationaliseert "ik zou hier morgen mee kunnen beginnen" heel letterlijk.
- **Facilitatie-tip voor Witek zelf (niet op sheet)**: mocht er weerstand/scepsis opkomen, behandel dat als signaal, niet als ruis — vraag door op wát de weerstand precies is (verlies, onzekerheid, controleverlies, of een terecht gesignaleerde makke) in plaats van het meteen te willen "oplossen."

### Afsluiting — 10 min
- Recap in één plaat: kwaliteitsbaseline → Ask → Assist → Automate, met de harde grens (calamiteiten/twijfelgevallen altijd naar een mens) als vast anker.
- Concrete eerste stap voor morgen: *"Schrijf je top-3 terugkerende incidenttypen en je bestaande risicomatrix expliciet op — dat is je eerste 'rules of engagement'-document."*
- Ruimte voor vragen.

---

## Wat bewust buiten dit outline valt

- De overige 8 frameworks uit de HTML-atlas (Werner/Tin Man-Octopus, Cisco 5 Foundations, MIT CISR, Ransbotham, McKinsey Rewired, Nishar-Nohria, Bain/OpenAI, Anand-Wu, Agent Harness) — bewust weggelaten om de sessie krap en concreet te houden op de kernspine.
- De fee proposal — apart traject, geen onderdeel van deze inhoudsoutline.
- Concrete slide-ontwerp/opmaak — dit document is de sessie-flow met spreeknotities; het omzetten naar daadwerkelijke sheets is een vervolgstap.

## Vervolgstappen

1. Deze sessie-flow omzetten naar sheets (tekst + waar relevant de mermaid/VIM-svg als beeld).
2. Prototype voor Deel 2 bouwen/valideren zodat het qua scope daadwerkelijk op Ask-niveau blijft.
3. Tijdsblokken in de praktijk testen (bijv. hardop doorlopen) — 90 minuten is krap met een live demo + interactief segment; overweeg een marge van 5 minuten buffer.
