# Volledige sessie-outline: AI en kwaliteitsmanagement in de zorg — triage, data-analyse en workflow

## Context

De vraag was: de **volledige sessie-outline** (90 minuten, frontaal + interactief), zoals die als actiepunt in `notes-22-06-2026.md` staat genoteerd ("Build a prototype demo and full session outline (Witek)").

**Uitgangspunten (vastgelegd in eerdere gesprekken/notities):**
- Event: Santeon-inspiratiedag, 10 november 2026, Rotterdam-Zuid (Maasstad Ziekenhuis).
- Plenaire lezing gepland tussen 10:30 en 12:00 uur — 90 minuten, precies zoals hieronder uitgewerkt.
- Groepsgrootte: 60 inschrijvingen (stand 4 november 2026), zaal goed gevuld. **Alle Santeon-ziekenhuizen zijn aanwezig.**
- Contactpersoon: Carien Eijkman – Stuart (Maasstad Ziekenhuis).
- Publiek: kwaliteitsadviseurs/-managers van alle Santeon-ziekenhuizen — regelvolgend, niet exploratief.
- **Signaal uit het netwerk (update 4 november 2026):** de kwaliteitsadviseurs zijn *zoekende* naar wat er met AI mogelijk is, ook bij incidentmeldingen. Er leeft één vraag in het bijzonder: **"Is het wel veilig om te gebruiken — ja of nee?"** Daar komen naar verwachting vragen over. Verwerkt als: belofte in de Opening, apart blok in Deel 1 (punt 3), kansenkaart aan het begin van de Brug, veilige werkvorm in het interactieve segment en voorbereide antwoorden onderaan dit document.
- Doel: publiek verlaat de zaal met het gevoel "ik zou hier morgen mee kunnen beginnen."
- Toon: concreet en stap-voor-stap, geen hype.
- Rode draad: de VIM-workflow (`background-material/vim-workflow.excalidraw`/`.svg`) als casus — het publiek kent dit proces al door en door.
- Reeds afgesproken tweedeling: **Deel 1** (AI-kansen, high-level) → **Deel 2** (praktijkdemo, live prototype + interactief).
- **Scope-keuze (bevestigd):** alleen de kernspine uit de 12-frameworks-atlas gebruiken (geen extra frameworks zoals Anand-Wu 2×2 of Carucci) — houdt de sessie krap en concreet.
- **Fee proposal**: expliciet buiten dit document — apart traject.
- **Vorm**: getimede sessie-flow met spreeknotities, geen slide-lijst.

**Bronnen die de kernspine dragen** (uit `2026-07-01-hospital-quality-ai-presentation-query-trace.md` + deze sessie; **wiki-query opnieuw gedraaid op 4 november 2026**: alle bronnen uit juli staan nog, de toevoegingen staan hieronder als "nieuw"):
- Maturity-realitycheck: sectie 0 van `background-material/2026-07-01-ai-maturity-frameworks-visuals.html` (getallen ongewijzigd; atlas bijgewerkt op 4 november)
- Rules-of-engagement-onderbouwing: Manditereza (ontologie), Peron/Philips (MIT SMR), AgentSpec (Wang); *nieuw:* Keneally (BCG), die zorgorganisaties aanraadt hun richtlijnen expliciet beschikbaar te maken voor AI
- Vertrouwens-heuristiek: jagged-frontier / Böckeler (probability × impact × detectability); *nieuw:* METR (de grens is van binnenuit onzichtbaar) en Lakhani (AI "talks really well", ook als het fout zit)
- *Nieuw* — toezicht en escalatie: de wikipagina's over menselijk toezicht en verantwoorde AI. Ze laten zien:
  - waar de menselijke check hoort (bij onomkeerbare en voor anderen zichtbare handelingen);
  - dat controle kan verslappen tot afstempelen;
  - dat een agent nooit zijn eigen werk mag nakijken;
  - dat de verantwoordelijkheid kan wegschuiven naar "de AI";
  - "Say I don't know" als ontwerpeis.

  Plus zorgleverancier Hippocratic AI: de agents stellen geen diagnose en schrijven niets voor, en bij een echte klinische vraag komt er een mens bij.
- *Nieuw* — wie leert er nog?: BCG/Goel ("distributed de-skilling") en Lakhani (eerst zelf met de hand, dan de machine)
- *Nieuw* — arbeidsmarkt- en adoptiecijfers: Stanford Digital Economy Lab, Canaries Dashboard (Amerikaanse loondata van ADP, tot september 2026) en Adoption Monitor (stand juli 2026)
- Groeimodel: Ask→Assist→Automate (Beutler) + governanceregel
- Live-demo-technisch-patroon: Luminai/Dinakaran (triage-agent-skeleton) + document-intelligence (extractie-nauwkeurigheid) + LandingAI (extract→validate→orchestrate)
- Eigen VIM-materiaal: `vim-workflow.excalidraw`/`.svg`, NEN 8009-notities, KNMG "veilig melden", PSEBench-bevindingen (allemaal in `background-material/`)
- Veiligheidsvraag: **Wkkgz art. 9** (incidentenregister, versie per 1-1-2026) en **art. 11** (meldplicht calamiteiten), KNMG "veilig melden" (beide in `background-material/`)

---

## Sessie-flow (90 minuten)

### 0. Opening — 5 min
- Welkom, wie is Witek, waarom deze sessie.
- Meteen het frame neerzetten: **"AI als kans om het vak beter te maken, niet alleen sneller."**
- Stip op de horizon: meer tijd op de vloer bij professionals, minder achter schermen.
- Erken de zaal: alle Santeon-ziekenhuizen zijn er.
- Benoem meteen de vraag die in het netwerk leeft: *"Is AI wel veilig om te gebruiken — ja of nee?"* Belofte: *"Daar kom ik expliciet op terug. U gaat hier weg met drie vragen waarmee u dat voor uw eigen ziekenhuis kunt beantwoorden."* Zo blijft niemand de hele sessie met die vraag zitten.
- Agenda in één zin: "Eerst het brede plaatje, dan concreet op jullie eigen proces, dan laten we het echt werken zien."

### Deel 1 — AI-kansen in context (high-level) — 25 min

**1. Realitycheck: hoe volwassen is "AI-volwassenheid" echt? (4 min)**
- Toon de maturity-bar (sectie 0 van de HTML-atlas): vijf onafhankelijke onderzoeken, allemaal tussen 1–15% "mature," terwijl brede adoptie al 78–88% is.
- Boodschap: *adoptie is hoog, volwassenheid is zeldzaam* — dit is dus geen achterstand van deze zaal specifiek, maar de norm overal. Verlaagt de drempel en voorkomt hype-gevoel.
- Koppel aan het signaal uit het netwerk: *"We horen dat jullie zoekende zijn. Dat is geen achterstand — zo ziet vrijwel elke organisatie eruit."*
- Reservemateriaal (bijgewerkt 4 november, niet op sheet):
  - De vijf getallen staan nog.
  - Naastliggende cijfers sinds juli: ongeveer 3 op de 10 pilots haalt de productie (index van één AI-bedrijf, genoemd in BBC *AI Decoded*), en volgens BCG haalt maar 26% van de organisaties echt waarde uit AI.
  - Wordt er doorgevraagd naar die 78–88% adoptie? Ook die cijfers zijn minder hard dan ze lijken. Goldman Sachs schrijft de sprong in Amerikaanse bedrijfsadoptie toe aan een ruimere enquêtevraag ("in enige bedrijfsfunctie" in plaats van "in de productie"). Zoeken is dus echt normaal.
  - *Nieuw* — het gebruik is breed maar ondiep (Stanford Adoption Monitor, juli 2026).
    - 62% van de Amerikaanse volwassenen gebruikt generatieve AI, maar slechts 15% elke dag: ongeveer een kwart van de gebruikers.
    - Over gebruik op het werk spreken de enquêtes elkaar tegen. Twee zien het stijgen naar ongeveer de helft van de werkenden; één ziet het in een jaar dalen van 46% naar 33%.
  - *Nieuw* — adoptiecijfers lopen uiteen van ongeveer 20% tot 88%, afhankelijk van wat er geteld wordt:
    - elk gebruik of alleen gebruik in de productie;
    - één product of alle AI;
    - kleine of grote bedrijven. Bij de OECD gebruikt meer dan de helft van de grote bedrijven AI, tegen ongeveer 17% van de kleine.

    Vuistregel voor de zaal: vraag bij elk adoptiecijfer wát er gemeten is.

**2. Het fundament: rules of engagement, expliciet gemaakt (10 min)**
- Kernstelling: AI werkt pas betrouwbaar als kwaliteitsstandaarden en KPI's *expliciet* zijn vastgelegd — en dat is een **professionele**, geen technische taak.
- Onderbouwing (citeerbaar):
  - Manditereza (industrial-AI ontologie): *"traditional databases store records; ontologies model operational reality"* — met als voorbeeld nota bene een Quality/Inspection/Defect-domein. Vertaling: het schrijven van jullie kwaliteitshandboek **is** het bouwen van de ontologie die AI nodig heeft.
  - Peron/Philips (zorg-AI-bron in de wiki): noemt *"data quality and standardization from the get-go"* als grootste barrière voor AI in de zorg — dezelfde claim, nu van een clinicus i.p.v. een engineer. Herhaalt: *"AI is here to add, not to take over."*
  - *Nieuw sinds juli:* Keneally (BCG, *The So What*, juli 2026). Patiënten gebruiken AI al als eerste stap in de zorg. Zijn advies aan zorgorganisaties is dat niet tegen te houden maar vorm te geven:
    - zorg dat de eigen richtlijnen beschikbaar zijn voor de taalmodellen;
    - zet modellen achter de eigen firewall die zijn afgestemd op de lokale richtlijnen.

    Vertaling voor deze zaal: een richtlijn die niet expliciet is opgeschreven, kan geen enkel model gebruiken. (Bron: een adviespartner die een eigen rapport toelicht. Gebruik dit als richting, niet als bewijs.)
  - En wie bepaalt hoeveel risico acceptabel is? Ook dat is geen technische vraag. Hill (Harvard) ziet dat besturen hun risicobereidheid zelden expliciet bespreken, terwijl die er vóór de invoering van AI moet liggen. Anders bepaalt degene die het beleid schrijft het risico, en niet wie ervoor verantwoordelijk is.
  - AgentSpec (Wang): "rules of engagement" letterlijk geformaliseerd als `regel → trigger → check → handhaving` (wanneer X gebeurt, check Y, dan Z: pauzeer voor mens / stop / ga door) — een niet-technische manier om te laten zien dat elke kwaliteitsstandaard zo'n drieledige regel wordt.
  - **Eigen inzicht (koppel dit expliciet)**: dit is precies het KNMG "veilig melden"-principe toegepast op AI zelf — systeemgericht, niet gericht op afrekenen van een individu. Sterk bruggetje omdat het de eigen kernwaarde van het publiek gebruikt als model voor hoe AI-toezicht zélf zou moeten werken.

**3. "Is het veilig — ja of nee?" Drie vragen in plaats van één (9 min)**
- Aanleiding: precies deze vraag leeft in het netwerk. Neem hem serieus en letterlijk. Het eerlijke antwoord is niet ja of nee, maar: *veilig voor wíe?* Er zitten drie vragen in, en voor alle drie heeft dit publiek al een toetssteen in de eigen regels.
- **Vraag 1 — Veilig voor de gegevens: waar gaat de melding naartoe, en wie kan meelezen?**
  - Toetssteen: **art. 9 Wkkgz**. In het incidentenregister mogen gezondheidsgegevens zonder toestemming worden verwerkt (lid 1), maar de procedure moet waarborgen dat **alleen de functionarissen die met de meldingen belast zijn** kennis kunnen nemen van persoonsgegevens (lid 3). De zorgaanbieder is verwerkingsverantwoordelijke onder de AVG (lid 8).
  - Vertaling: een melding in een publieke chatbot plakken is een melding delen met "anderen". Een AI-toepassing hoort binnen die beschermde kring: een omgeving die het ziekenhuis heeft goedgekeurd en gecontracteerd (verwerkersovereenkomst, afspraken over opslag en over het niet gebruiken van de gegevens om modellen te trainen), afgestemd met de FG en informatiebeveiliging.
  - KNMG: een melding bevat "zoveel mogelijk geanonimiseerde informatie". Maar vrije tekst blijft vaak herleidbaar (afdeling + datum + bijzonderheid) — ga er niet van uit dat een melding anoniem is.
- **Vraag 2 — Veilig voor de patiënt: kan ik de uitkomst vertrouwen?**
  - Jagged frontier: AI is betrouwbaar *binnen* een afgebakende, goed gespecificeerde taak, onbetrouwbaar erbuiten.
  - Böckeler-heuristiek als meeneembare checklist: **(kans op fout) × (impact als het fout gaat) × (detecteerbaarheid van de fout)** = hoeveel toezicht een taak nodig heeft.
  - *Nieuw:* waarom meten en niet op gevoel? De grens is van binnenuit onzichtbaar.
    - In een gerandomiseerde studie (METR) werden ervaren ontwikkelaars met AI 19% trager, terwijl ze dachten dat ze 20% sneller waren.
    - Lakhani, medeauteur van het jagged-frontier-onderzoek: de intelligentie van AI *"is not perfect but it talks really well"*. In het BCG-experiment ging het model harder in de verdediging als consultants tegengas gaven, ook als het ongelijk had. Zijn tip: laat het model eerst tégen u in argumenteren.
  - Twee eisen die u aan élke AI-uitkomst mag stellen: (a) elke uitspraak is herleidbaar naar de brontekst (citaat), (b) bij twijfel of tegenstrijdigheid escaleert het systeem in plaats van te gokken. Beide ziet u straks in de demo. Achtergrond bij (b): het gevaar is niet dat AI "ik weet het niet" zegt, maar een vloeiend antwoord dat op een gok is gebouwd. Leg dus als regel vast: *"niet invullen — terugkomen en zeggen dat je het niet weet"* (wiki: *"Say I don't know"*).
  - Voorbeeld uit de zorg (*nieuw*): Hippocratic AI richt zijn spraakagenten voor routinecontact met patiënten precies zo in:
    - ze stellen geen diagnose en schrijven niets voor;
    - bij een echte klinische vraag komt er een mens bij;
    - een apart model test het systeem doorlopend.

    Let op: het is een marketingvideo, en "nul veiligheidsincidenten" wordt nergens gedefinieerd.
- **Vraag 3 — Veilig voor de melder: blijft melden veilig?**
  - Toetssteen: KNMG "veilig melden" — de melding mag niet worden gebruikt om maatregelen te nemen tegen de melder of andere betrokkenen. En **art. 9 lid 6 Wkkgz**: gegevens over intern gemelde incidenten kunnen (behalve bij calamiteiten en geweld in de zorgrelatie) niet als bewijs dienen of de grondslag zijn voor een disciplinaire maatregel; er is alleen een beperkte uitzondering voor strafrechtelijk bewijs.
  - Vertaling: richt AI op patronen in het systeem, nooit op personen (geen "wie meldt of veroorzaakt het meest"-analyses). Open vraag voor de eigen jurist/FG: blijven AI-afgeleide gegevens (samenvattingen, classificaties) binnen het beschermde register, of ontstaat er een kopie buiten die bescherming?
  - Sluit aan op het bruggetje uit punt 2: veilig melden als model voor hoe AI-toezicht zelf moet werken.
- Sheettekst: *"Is het veilig? Veilig voor de gegevens · veilig voor de patiënt · veilig voor de melder."*
- Boodschap: bij alle drie bepaalt niet de technologie het antwoord, maar de afspraken eromheen — dus weer de rules of engagement uit punt 2. Dit is het concrete afwegingskader dat dit regelvolgende publiek zelf op elke nieuwe AI-toepassing kan toepassen.

**4. Samenvatting Deel 1 (2 min)**
- Herhaal de drieslag: zoeken is normaal (realitycheck) → expliciete standaarden → drie veiligheidsvragen.
- Overgang: *"Wat betekent dit nu concreet, toegepast op jullie eigen proces?"*

### Brug — Ask → Assist → Automate op de VIM-workflow — 15 min

**0. Kansenkaart: waar in het VIM-proces kan AI helpen? (3 min)**
- Antwoord op "wat is er mogelijk?" — de zaal is zoekende, dus eerst het overzicht, dan de diepte. Leg vijf aangrijpingspunten op de VIM-workflow:
  1. **Melden** — doorvragen bij een onvolledige melding (demo: VIM-2026-0501)
  2. **Triage** — voorstel voor categorie en SAC-score, met citaat uit de melding (demo)
  3. **Analyse** — concept-PRISMA-oorzakenclassificatie (Assist-niveau)
  4. **Trends** — patronen over afdelingen heen (Route 3, hieronder uitgewerkt)
  5. **Rapportage** — concept-bestuurssamenvatting (demo)
- Bij elk punt: AI doet een voorstel, de mens beslist. Calamiteiten (Route 4) blijven altijd mensenwerk.

**Ask → Assist → Automate op Route 3 (12 min)**

*(Dit is de al eerder uitgewerkte kern — hieronder de condensatie; volledige spreektekst met alle drie de niveaus staat behouden omdat dit het meest concrete onderdeel van de hele sessie is.)*

- Toon de Ask→Assist→Automate-mermaid (HTML-atlas sectie 9) náást de VIM-workflow.
- Loop **hetzelfde scenario — cross-unit trendanalyse (Route 3 in het VIM-diagram)** drie keer door, met oplopende autonomie:

  **ASK — "AI leest mee, jullie beslissen"**
  - AI leest meldingen uit meerdere units en **stelt een samenvatting van het patroon voor** ("deze drie units meldden deze maand vergelijkbare medicatie-incidenten") — puur signalerend.
  - Sheettekst: *"AI stelt een cross-unit trendsamenvatting voor; de kwaliteitsadviseur beoordeelt en beslist."*
  - **Expliciet benoemen:** "wat u zo dadelijk in de demo ziet, is dit niveau, vandaag al werkend."
  - *Nieuw* — de valkuil van dit niveau is afstempelen. Een team bij Y Combinator merkte dat de menselijke controle na een reeks goede AI-voorstellen ongemerkt een stempel was geworden. De controle faalde niet; de mens deed het, geleidelijk. Bouw dus een verversing in. Eigen vertaling: laat de adviseur geregeld een steekproef eerst zelf scoren en vergelijk pas daarna met de AI.

  **ASSIST — "AI stelt op, jullie autoriseren"**
  - AI zet het patroon om in een **concept-analyse** (bv. eerste PRISMA-oorzakenclassificatie) en zoekt relevante literatuur/oplossingen elders toegepast.
  - PVC/MIP-commissie corrigeert en autoriseert voordat het naar RvB of andere afdelingen gaat.
  - Sheettekst: *"AI stelt concept-analyse en verbetervoorstel op; de commissie corrigeert en autoriseert."*
  - *Nieuw* — let op wie er nog leert. Als AI de eerste analyse altijd doet, leren nieuwe adviseurs het vak zelf minder goed.
    - Peron ziet hetzelfde bij radiologen in opleiding.
    - BCG noemt het *"distributed de-skilling"*: in een onderzoek onder 70 bestuurders ziet 90% te veel vertrouwen in AI-uitkomsten die niemand toetst. Probleemdefinitie en oordeelsvorming lopen het meeste risico.
    - Op de arbeidsmarkt is het al zichtbaar bij starters (Stanford/ADP Canaries Dashboard, Amerikaanse loondata tot september 2026).
      - Bij 22- tot 25-jarigen in de beroepen met de meeste AI-blootstelling ligt het aantal banen 12% onder het niveau van november 2022. In de minst blootgestelde beroepen groeide het met 7 tot 10%.
      - Boven de 34 jaar is er nauwelijks verschil.
      - De krimp hangt samen met beroepen waarin AI vooral taken overneemt (automatisering). Dat samenwerken met AI banen beschermt, laten de nieuwste cijfers niet zien.
      - Kanttekening: dit is een samenhang, geen bewezen oorzaak. Volgens de onderzoekers zelf komt het begin van de daling waarschijnlijk niet door AI.

    Tegenmaatregel: laat mensen de eerste gevallen zelf doen.

  **AUTOMATE — "AI handelt zelf af, met een harde grens"**
  - Voor de duidelijkste, laagst-risicovolle gevallen sluit AI de cyclus zelf: signaleren, classificeren, archiveren (Eindpunt A), afdelingen informeren.
  - **Harde grens**: bij onduidelijke score, nieuw patroon, of calamiteit (Route 4) → altijd naar een mens. Leg ook vast **wíe** een escalatie oppakt. In een experiment met een bedrijf dat volledig door AI-agents werd geleid, waarschuwde de AI op dag 19 dat het de verkeerde kant op ging; niemand deed er iets mee.
  - *Nieuw* — kanttekening bij "afdelingen informeren". Onderzoek naar *delegation regret* laat zien dat mensen een check vooral willen bij handelingen die **onomkeerbaar én zichtbaar voor anderen** zijn, en niet per se bij "grote" beslissingen. Een bericht aan afdelingen is precies zo'n handeling. Laat het daarom ook op Automate-niveau eerst als voorvertoning langs een mens gaan.
  - Governance-citaat: *"als het afdelingshoofd niet verantwoordelijk gehouden kan worden voor het resultaat, heb je een demo, geen agent."* Hoe nodig dat is: in een BCG-onderzoek onder 70 bestuurders zegt meer dan de helft dat de schuld naar de AI gaat zodra er een fout wordt ontdekt.
  - Onderbouwing "waarom die grens hard moet zijn": PSEBench laat zien dat AI-modellen juist onbetrouwbaar en overmoedig worden bij twijfelgevallen — automatiseer nooit de grensgevallen, alleen de duidelijke.

- **Sluitzin naar Deel 2**: *"Wat u zo dadelijk ziet, is niveau 1: Ask. Assist en Automate zijn waar u naartoe kúnt groeien — bewust, stap voor stap, met u aan het stuur van elke escalatie."*

### Deel 2 — Praktische demonstratie — 35 min

**1. Live demo (18–20 min)**
- Werkend prototype: lokaal via `npm start` → startpagina → "Live demo" — fictieve simulatie (ziekenhuis "St. Machteld") van data lake → semantische laag/ontologie → OKF-kennisbundel → AI-triage-agent → bestuursrapportage. De AI-triage roept een extern taalmodel aan (Claude, via de Anthropic-API). Lukt die aanroep niet, dan valt de demo terug op een regelgebaseerde classificatie op trefwoorden (zichtbaar als label "fallback"), zodat er altijd iets te zien is.
- ⚠️ **Presenteer vanaf de lokale server, niet vanaf witusj.github.io.** De gehoste versie is verouderd (geen doorvraag-lus, geen verificatie, geen meldingen 0501/0505) en kan de AI niet bereiken. Lokaal voegt de server de API-sleutel uit `.env` toe. Controleer vóór aanvang de statusregel op de startpagina ("AI-verbinding werkt").
- **Moment: waar gaan de gegevens in deze demo heen? (1 min)** Alle meldingen zijn verzonnen (St. Machteld). Dat is geen detail maar een bewuste keuze: de meldingstekst gaat in deze demo naar een extern taalmodel. Met echte meldingen mag dat alleen binnen een omgeving die aan art. 9 Wkkgz voldoet (vraag 1 uit Deel 1). Zo laat de demo zelf zien hoe je de veiligheidsvraag beantwoordt.
- Laat VIM-2026-0501 zien: de agent vraagt door ("is de dubbelcheck uitgevoerd?") in plaats van te gokken — het antwoord op vraag 2 uit Deel 1 in de praktijk. (Getest op 4 november: drie vragen aan de InfoProvider, daarna SAC 2 en "Geverifieerd".)
- Bij het label "Geverifieerd": de triage wordt in een aparte aanroep gecontroleerd tegen het draaiboek (de OKF-kennisbundel). Dat is de regel *"laat een agent nooit zijn eigen huiswerk nakijken"* (wiki, *nieuw*). Ook Hippocratic AI laat zijn zorgagenten door een apart model testen.
- Technisch patroon: Luminai/Dinakaran's triage-agent-skeleton (classificeer op urgentie/type → extraheer gestructureerde data → routeer/aggregeer) — vertaald naar VIM-meldingen.
- Toon de AI live: leest (gesimuleerde) meldingen uit meerdere units, signaleert een cross-unit patroon, **stopt daar** voor menselijk oordeel — bevestigt letterlijk de Ask-tier-belofte uit de brug.
- Noem de nauwkeurigheidsgrens eerlijk (document-intelligence-inzicht): generieke extractie haalt 80–90%, een betrouwbare pijplijn heeft ~99,x% nodig — en *grounding* (elke uitspraak herleidbaar naar de brontekst) is wat vertrouwen mogelijk maakt. Dit is precies waarom Ask-tier (mens beoordeelt) het juiste startniveau is, niet Assist of Automate.
- Werkwijze zoals afgesproken: Witek bouwt het prototype, de contactpersoon reviewt en corrigeert vooraf.

**2. Interactief groepssegment (15 min)**
- **Bewust géén echte meldingen.** De demo heeft geen invoerveld, en echte meldingen uit de eigen ziekenhuizen horen niet in een demo-omgeving (Deel 1, vraag 1). Benoem dat hardop: dit is het veiligheidsverhaal in de praktijk.
- **Mens vs. agent (≈4 min):** toon de tegenstrijdige melding VIM-2026-0505 (volgens de verpleging een periode van bewusteloosheid, volgens de arts "alert en aanspreekbaar"). Laat de zaal eerst zelf een SAC-score kiezen met handopsteken (1–4 vingers). Grote kans dat de zaal het onderling oneens is. Toon daarna de agent: die kiest géén score maar escaleert, met de tegenstrijdigheid als reden. Punt: bij twijfel is escaleren het goede antwoord — ook voor AI. (Ook de fallback escaleert deze melding; back-up zonder internet: dezelfde casus in `vim-agent-animatie.html`.) De volgorde (eerst zelf scoren, dan de machine) is ook wat Lakhani aanraadt om het vak te blijven leren; zie de Assist-stap in de Brug.
- **Gesprek in kleine groepjes (≈8 min),** bij voorkeur met iemand uit een ander Santeon-ziekenhuis: *"Welke van de drie veiligheidsvragen kunt u voor uw eigen ziekenhuis vandaag al beantwoorden — en bij wie ligt het antwoord op de rest?"* Werkvorm hangt af van de zaalopstelling (zie Vervolgstappen): bij tafels gemengde tafels, bij theateropstelling buurgesprekken van drie.
- **Plenaire oogst (≈3 min):** twee à drie groepjes delen hun antwoord. Noteer welke vraag het vaakst "weet ik niet" oplevert — daar ligt de eerste stap voor morgen. Dit operationaliseert "ik zou hier morgen mee kunnen beginnen" heel letterlijk.
- **Facilitatie-tip voor Witek zelf (niet op sheet)**: mocht er weerstand/scepsis opkomen, behandel dat als signaal, niet als ruis — vraag door op wát de weerstand precies is (verlies, onzekerheid, controleverlies, of een terecht gesignaleerde makke) in plaats van het meteen te willen "oplossen."

### Afsluiting — 10 min
- Recap in één plaat: kwaliteitsbaseline → Ask → Assist → Automate, met de harde grens (calamiteiten/twijfelgevallen altijd naar een mens) als vast anker — en de drie veiligheidsvragen (gegevens · patiënt · melder) ernaast.
- Concrete eerste stap voor morgen: *"Schrijf je top-3 terugkerende incidenttypen en je bestaande risicomatrix expliciet op — dat is je eerste 'rules of engagement'-document."*
- En één vraag voor uw FG of informatiebeveiliger: *"In welke goedgekeurde omgeving mogen wij AI op VIM-meldingen gebruiken?"* Is het antwoord "nog nergens", dan weet u wat de eerste stap van uw organisatie is.
- Ruimte voor vragen (zie voorbereide antwoorden hieronder).

---

## Verwachte vragen — voorbereide antwoorden (spreeknotitie, niet op sheet)

- **"Mag ik meldingen in ChatGPT of Copilot plakken?"** Niet met echte meldingen, tenzij uw ziekenhuis die omgeving daarvoor heeft goedgekeurd. Toetssteen: art. 9 lid 3 Wkkgz — alleen de daarvoor aangewezen functionarissen mogen persoonsgegevens uit meldingen zien. Weet u het niet, vraag het uw FG; dat is precies de eerste stap.
- **"En als ik de melding eerst anonimiseer?"** Dat helpt, maar vrije tekst blijft vaak herleidbaar (afdeling, datum, zeldzame aandoening). Behandel een melding als persoonsgegevens, tenzij het tegendeel is aangetoond.
- **"Wie is verantwoordelijk als de AI een calamiteit mist?"** De zorgaanbieder. De meldplicht bij de inspectie (art. 11 Wkkgz) verschuift niet naar een systeem. Daarom gaan calamiteiten en twijfelgevallen altijd naar een mens, en begint AI op Ask-niveau. Het risico in de praktijk is dat de verantwoordelijkheid ongemerkt wegschuift: in een BCG-onderzoek onder 70 bestuurders zegt meer dan de helft dat de schuld naar de AI gaat zodra er een fout wordt ontdekt.
- **"Kan een AI-analyse tegen een melder worden gebruikt?"** Gegevens in het incidentenregister zijn beschermd (art. 9 lid 6 Wkkgz). Of dat ook geldt voor AI-afgeleide kopieën buiten het register, is een vraag voor de eigen jurist. Ontwerpregel: AI kijkt naar systemen, niet naar personen.
- **"Gaat AI ons werk overnemen?"** Peron: *"AI is here to add, not to take over."* Op Ask-niveau neemt AI het verzamelen en samenvatten over; het oordeel blijft bij u. Het reële risico is eerder dat we het vak verleren (BCG: *"distributed de-skilling"*). Laat mensen daarom de eerste gevallen zelf blijven doen. De hardste cijfers tot nu toe komen uit de Amerikaanse loonadministratie (Stanford/ADP, tot september 2026):
  - Over alle leeftijden is het verschil tussen meer en minder AI-blootgestelde beroepen klein. De onderzoekers vatten hun herziene studie (augustus 2026) samen als "geen brede verdringing".
  - Wel krimpt het werk voor starters van 22–25 jaar in de meest blootgestelde beroepen.
  - Zorgwerk met veel menselijk en fysiek contact groeit juist. Bij thuiszorgmedewerkers groeit het werk voor starters met 22% sinds eind 2022.
  - Ziekenhuisberoepen en kwaliteitsadviseurs staan niet apart in deze cijfers.
- **"Zijn er ziekenhuizen die dit al doen?"** Wel in de buurt, nog niet voor incidentanalyse.
  - Luminai triageert binnenkomende faxen voor grote Amerikaanse ziekenhuizen.
  - Hippocratic AI belt patiënten voor routinecontact, zonder diagnose.
  - BCG ziet patiënten AI al als eerste stap gebruiken.

  Voor AI-analyse van incidentmeldingen over afdelingen heen is in de geraadpleegde bronnen geen praktijkvoorbeeld gevonden. Zeg dat eerlijk: daarom laten we een prototype zien en geen product.
- **"Moeten we iets met de Europese AI-verordening?"** Voor deze zaal vooral: organisaties moeten zorgen dat medewerkers voldoende AI-geletterd zijn (art. 4, van kracht sinds februari 2025). Of een specifieke toepassing onder strengere regels valt, hangt af van het gebruik — laat dat per toepassing toetsen.

---

## Wat bewust buiten dit outline valt

- De overige frameworks uit de HTML-atlas (Werner/Tin Man-Octopus, Cisco 5 Foundations, MIT CISR, Ransbotham, McKinsey Rewired, Nishar-Nohria, Bain/OpenAI, Anand-Wu, Agent Harness, en sinds 4 november de werknemersladder L0–L5 in sectie 12) — bewust weggelaten om de sessie krap en concreet te houden op de kernspine.
- De fee proposal — apart traject, geen onderdeel van deze inhoudsoutline.
- Concrete slide-ontwerp/opmaak — dit document is de sessie-flow met spreeknotities; het omzetten naar daadwerkelijke sheets is een vervolgstap.

## Vervolgstappen

1. Deze sessie-flow omzetten naar sheets (tekst + waar relevant de mermaid/VIM-svg als beeld).
2. ~~Demo werkend krijgen~~ **Opgelost op 4 november:** de demo draait lokaal (`npm start`), met de actuele versie en live AI via een lokale proxy. Ook de atlas werkt weer: d3 werd geblokkeerd door een gewijzigde CDN-versie. Nog doen: een generale repetitie op de presentatielaptop en op het netwerk van de zaal. Zonder internet valt de demo terug op de fallback; de back-up is `vim-agent-animatie.html`. Optioneel: de verouderde versie op witusj.github.io bijwerken of offline halen, zodat niemand de verkeerde link gebruikt.
3. Bij Carien navragen: (a) de zaalopstelling (tafels of theater) voor de werkvorm in het interactieve segment; (b) of er in het netwerk al AI-beleid of een standpunt van FG's/CISO's is — dan kan Deel 1, punt 3 daarnaar verwijzen.
4. De juridische punten (Wkkgz art. 9 en 11, AI-verordening art. 4) en de voorbereide antwoorden kort laten checken door een FG of jurist uit het netwerk. De Wkkgz-citaten komen uit de wettekst in `background-material/`; de vertaling naar AI is eigen interpretatie.
5. Tijdsblokken in de praktijk testen (bijv. hardop doorlopen) — 90 minuten is krap met een live demo + interactief segment; overweeg een marge van 5 minuten buffer.
6. **Wiki-update van 4 november verwerkt.** De trace staat in `background-material/2026-07-01-hospital-quality-ai-presentation-query-trace.md` en de atlas is bijgewerkt. De toevoegingen (gemarkeerd met *nieuw*) zijn spreeknotities en reservemateriaal, **geen extra sheets**: de tijdsblokken blijven gelijk. Kies bij het hardop doorlopen (punt 5) per blok hooguit één nieuw punt om echt te zeggen. Neem de nieuwe citaten mee in de check door de FG of jurist (punt 4).
