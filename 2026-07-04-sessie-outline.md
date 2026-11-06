# Sessie-outline: AI en kwaliteitsmanagement in de zorg

- **Opbouw:** de Golden Circle van Simon Sinek (Waarom → Hoe → Wat).
- **Taal:** vereenvoudigd Nederlands, met de schrijfregels van ASD-STE100.
- **Bron van de opdracht:** het actiepunt in `notes-22-06-2026.md`.
- **Stand:** bijgewerkt met de wiki-update van 4 november 2026.

---

## Context

### De sessie

- **Evenement:** Santeon-inspiratiedag.
- **Datum en tijd:** 10 november 2026, 10:30–12:00 uur (90 minuten).
- **Locatie:** Maasstad Ziekenhuis, Rotterdam-Zuid.
- **Contactpersoon:** Carien Eijkman – Stuart (Maasstad Ziekenhuis).
- **Publiek:** 60 inschrijvingen (stand 4 november 2026). Het publiek bestaat uit kwaliteitsadviseurs en kwaliteitsmanagers. Alle Santeon-ziekenhuizen zijn aanwezig.
- **Vorm:** frontaal en interactief.

### Het publiek

Het publiek werkt met regels en procedures. Het publiek verkent niet graag zonder kader. Het publiek kent het VIM-proces goed. Daarom is het VIM-proces de casus van de hele sessie.

### Signaal uit het netwerk (4 november 2026)

De kwaliteitsadviseurs zoeken nog wat AI voor hen kan doen, ook bij incidentmeldingen. Eén vraag leeft sterk: **"Is AI wel veilig om te gebruiken — ja of nee?"** Er komen dus vragen over veiligheid.

De outline beantwoordt deze vraag op vijf plaatsen:

1. een belofte in de opening;
2. een apart blok in het Hoe (2b);
3. een kansenkaart aan het begin van het groeimodel (2c);
4. een veilige werkvorm in het interactieve deel (3b);
5. voorbereide antwoorden onderaan dit document.

### Het doel

Na de sessie denkt het publiek: "Ik kan hier morgen mee beginnen."

### De toon

De toon is concreet. De sessie geeft stappen. De sessie maakt geen hype.

### De Golden Circle in deze sessie

De Golden Circle begint bij het waarom. Daarna komen het hoe en het wat. Het publiek krijgt dus eerst een reden. Daarna krijgt het publiek de regels en het hulpmiddel. Zo voelen de regels niet als "nog een procedure".

| Laag | Vraag | Inhoud | Tijd |
|---|---|---|---|
| Opening | Wie spreekt er, en wat komt er? | Welkom, agenda en een belofte over veiligheid. | 5 min |
| **Waarom** | Waarom is AI belangrijk voor het kwaliteitsvak? | AI is een kans om het vak beter te maken. Iedereen staat nog aan het begin. | 10 min |
| **Hoe** | Hoe gebruik je AI veilig? | Expliciete regels, drie veiligheidsvragen en een groeimodel in drie niveaus. | 30 min |
| **Wat** | Wat kan AI vandaag al? | Een werkend prototype op het VIM-proces. Het publiek vergelijkt het eigen oordeel met de AI. | 35 min |
| Afsluiting | Wat doe je morgen? | Terug naar het waarom. Een eerste stap voor morgen. | 10 min |

**Opmerking:** de vaste structuur van het project is Opening → Deel 1 → Brug → Deel 2 → Afsluiting. In deze versie zijn Waarom en Hoe 2a–2b samen Deel 1. Hoe 2c is de Brug. Wat is Deel 2.

### Afspraken

- De sessie gebruikt alleen de kernmodellen uit de frameworks-atlas: de realitycheck (sectie 0) en Ask → Assist → Automate (sectie 9). Zo blijft de sessie kort en concreet.
- De live demo blijft op het niveau Ask. De AI geeft een signaal, en een mens beslist. Calamiteiten en twijfelgevallen gaan altijd naar een mens.
- Deelnemers voeren geen echte meldingen in de demo in.
- Het honorariumvoorstel is een apart traject. Dit document bevat dat voorstel niet.
- Dit document is een getimede sessie-flow met spreeknotities. Het is geen lijst van dia's.

### Bronnen

De bronnen komen uit `background-material/2026-07-01-hospital-quality-ai-presentation-query-trace.md` en uit eerdere gesprekken. De wiki-query is op 4 november 2026 opnieuw gedaan. Alle bronnen uit juli staan nog. De nieuwe bronnen hebben het label "nieuw".

| Onderdeel | Bron |
|---|---|
| Realitycheck (Waarom) | Sectie 0 van `background-material/2026-07-01-ai-maturity-frameworks-visuals.html`. De getallen zijn niet veranderd. De atlas is bijgewerkt op 4 november. |
| Expliciete regels (Hoe) | Manditereza (ontologie), Peron/Philips (MIT SMR), AgentSpec (Wang). Nieuw: Keneally (BCG): zorgorganisaties moeten hun richtlijnen expliciet beschikbaar maken voor AI. |
| Veiligheidsvragen (Hoe) | Wkkgz art. 9 (incidentenregister, versie per 1-1-2026) en art. 11 (meldplicht calamiteiten), KNMG "veilig melden". Beide staan in `background-material/`. |
| Afwegingskader (Hoe) | Jagged frontier, Böckeler (kans × impact × detecteerbaarheid). Nieuw: METR (de grens is van binnenuit niet te zien). Nieuw: Lakhani (AI "talks really well", ook bij een fout antwoord). |
| Toezicht en escalatie (Hoe) | Nieuw: wikipagina's over menselijk toezicht en verantwoorde AI. Nieuw: Hippocratic AI (zorgagenten zonder diagnose; bij een klinische vraag komt er een mens bij). |
| Wie leert er nog? (Hoe) | Nieuw: BCG/Goel ("distributed de-skilling") en Lakhani (eerst zelf met de hand, dan de machine). |
| Arbeidsmarkt en adoptie (reserve) | Nieuw: Stanford Digital Economy Lab. Canaries Dashboard (Amerikaanse loondata van ADP, tot september 2026). Adoption Monitor (stand juli 2026). |
| Groeimodel (Hoe) | Ask → Assist → Automate (Beutler), met een regel voor governance (wie beslist, en wie is verantwoordelijk). |
| Technisch patroon van de demo (Wat) | Luminai/Dinakaran (skelet van een triage-agent). Document intelligence (nauwkeurigheid van extractie). LandingAI (extract → validate → orchestrate). |
| Eigen VIM-materiaal | `vim-workflow.excalidraw` en `.svg`, notities over NEN 8009, KNMG "veilig melden", bevindingen van PSEBench (alles in `background-material/`). |

---

## Sessie-flow (90 minuten)

> **Leeswijzer:** genummerde stappen zijn spreekinstructies voor Witek. Tekst achter "Opmerking" geeft alleen achtergrond. Punten met "Reserve" zijn spreeknotities, geen dia's. Punten met het label "nieuw" komen uit de wiki-update van 4 november. Kies per blok hooguit één nieuw punt om echt te zeggen.

### 0. Opening — 5 min

1. Heet het publiek welkom.
2. Vertel kort wie je bent.
3. Vertel waarom je deze sessie geeft.
4. Noem dat alle Santeon-ziekenhuizen in de zaal zitten.
5. Noem meteen de vraag uit het netwerk: "Is AI wel veilig om te gebruiken — ja of nee?"
6. Geef een belofte: "Daar kom ik expliciet op terug. Je gaat hier weg met drie vragen. Met die vragen beantwoord je de veiligheidsvraag voor je eigen ziekenhuis."
7. Geef de agenda: "Eerst vertel ik waarom dit belangrijk is. Dan laat ik zien hoe het veilig kan. Dan laten we het echt werken zien."

**Opmerking:** door de belofte in stap 6 blijft niemand de hele sessie met de veiligheidsvraag zitten.

---

### 1. WAAROM — 10 min

**Kernboodschap:** "AI is een kans om het vak beter te maken, niet alleen sneller."

#### 1a. Het doel achter het vak (5 min)

1. Zeg de kernboodschap.
2. Geef de stip op de horizon: "Meer tijd op de werkvloer bij de professionals. Minder tijd achter schermen."
3. Verbind de kernboodschap met een waarde die het publiek al kent: KNMG "veilig melden". Een melding is er om te leren. Een melding is er niet om een persoon af te rekenen.
4. Citeer Peron (Philips): "AI is here to add, not to take over."

**Opmerking:** het publiek hoort zo dat AI bij de eigen kernwaarde past. AI vervangt het vak niet.

#### 1b. Realitycheck: hoe volwassen is AI echt? (5 min)

1. Toon de volwassenheidsbalk (sectie 0 van de HTML-atlas).
2. Geef de cijfers: vijf onafhankelijke onderzoeken. In alle onderzoeken is 1–15% van de organisaties "mature". De adoptie is al 78–88%.
3. Zeg de boodschap: "De adoptie is hoog. Volwassenheid is zeldzaam."
4. Verbind de boodschap met het signaal uit het netwerk: "We horen dat je nog zoekt. Dat is geen achterstand. Zo ziet bijna elke organisatie eruit."

**Opmerking:** het publiek loopt dus niet achter. Een lage volwassenheid is overal de norm. Dit verlaagt de drempel. Dit voorkomt ook een gevoel van hype.

**Reserve (niet op een dia, bijgewerkt 4 november):**

- De vijf getallen gelden nog.
- Andere cijfers sinds juli:
  - Ongeveer 3 van de 10 pilots komen in productie. Dit getal komt uit de index van één AI-bedrijf, genoemd in BBC *AI Decoded*.
  - Volgens BCG haalt maar 26% van de organisaties echt waarde uit AI.
- Als iemand doorvraagt over de 78–88% adoptie: ook die cijfers zijn minder hard dan ze lijken. Volgens Goldman Sachs komt de sprong in Amerikaanse bedrijfsadoptie door een ruimere enquêtevraag. De enquête vraagt nu naar gebruik "in een bedrijfsfunctie" in plaats van "in de productie". Zoeken is dus echt normaal.
- Nieuw: het gebruik is breed, maar niet diep (Stanford Adoption Monitor, juli 2026).
  - 62% van de Amerikaanse volwassenen gebruikt generatieve AI. Maar slechts 15% gebruikt het elke dag. Dat is ongeveer een kwart van de gebruikers.
  - Over gebruik op het werk zijn de enquêtes het niet eens. Twee enquêtes zien een stijging naar ongeveer de helft van de werkenden. Eén enquête ziet in een jaar een daling van 46% naar 33%.
- Nieuw: adoptiecijfers liggen tussen ongeveer 20% en 88%. Het getal hangt af van wat er geteld wordt:
  - Telt elk gebruik mee, of alleen gebruik in de productie?
  - Gaat het om één product, of om alle AI?
  - Gaat het om kleine of om grote bedrijven? Bij de OECD gebruikt meer dan de helft van de grote bedrijven AI. Bij de kleine bedrijven is dat ongeveer 17%.
- Vuistregel voor de zaal: vraag bij elk adoptiecijfer wát er gemeten is.

**Overgang naar Hoe:** "AI is dus een kans, en iedereen staat aan het begin. Hoe gebruik je die kans veilig?"

---

### 2. HOE — 30 min

**Kernboodschap:** "AI werkt pas betrouwbaar als de kwaliteitsstandaarden expliciet zijn. Dat werk is jouw vak, niet de techniek."

#### 2a. Expliciete regels: rules of engagement (8 min)

1. Geef de kernstelling: AI werkt pas betrouwbaar als de kwaliteitsstandaarden en de KPI's expliciet zijn. Die standaarden opschrijven is een professionele taak, geen technische taak.
2. Onderbouw de kernstelling met Manditereza (ontologie voor industriële AI).
   - Citaat: *"traditional databases store records; ontologies model operational reality"*.
   - Het voorbeeld in die bron is een domein met Quality, Inspection en Defect.
   - Vertaling voor het publiek: "Je kwaliteitshandboek is de ontologie die AI nodig heeft."
3. Onderbouw de kernstelling met Peron (Philips, MIT SMR).
   - Peron noemt de grootste barrière voor AI in de zorg: *"data quality and standardization from the get-go"*.
   - Peron is clinicus. Manditereza is engineer. De twee bronnen zeggen hetzelfde.
4. Onderbouw de kernstelling met AgentSpec (Wang).
   - AgentSpec legt rules of engagement vast als regel → aanleiding → controle → handhaving.
   - Voorbeeld: "Als X gebeurt, controleer Y. Doe dan Z: pauzeer voor een mens, stop, of ga door."
   - Boodschap: elke kwaliteitsstandaard kan zo'n regel worden.
5. Verbind de regels met het waarom: toezicht op AI werkt zoals "veilig melden". Het toezicht kijkt naar het systeem, niet naar een persoon.

**Reserve (nieuw):**

- **Keneally (BCG, *The So What*, juli 2026).** Patiënten gebruiken AI al als eerste stap in de zorg. Zijn advies aan zorgorganisaties: geef dat gebruik zelf vorm.
  - Maak de eigen richtlijnen beschikbaar voor de taalmodellen.
  - Zet modellen achter de eigen firewall. Stem die modellen af op de lokale richtlijnen.
  - Vertaling voor de zaal: een richtlijn die niet expliciet is opgeschreven, kan geen enkel model gebruiken.
  - Let op: de bron is een adviespartner die een eigen rapport toelicht. Gebruik dit als richting, niet als bewijs.
- **Hill (Harvard).** Wie bepaalt hoeveel risico acceptabel is? Ook dat is geen technische vraag. Besturen bespreken hun risicobereidheid zelden expliciet. Die risicobereidheid moet er zijn vóórdat AI komt. Anders bepaalt de schrijver van het beleid het risico, en niet de persoon die verantwoordelijk is.

**Opmerking:** Peron is een van de weinige bronnen in de wiki die specifiek over AI in de zorg gaan. Stap 5 gebruikt de kernwaarde van het publiek als model voor toezicht op AI.

#### 2b. "Is het veilig — ja of nee?" Drie vragen in plaats van één (9 min)

**Aanleiding:** juist deze vraag leeft in het netwerk. Neem de vraag serieus en letterlijk. Het eerlijke antwoord is niet "ja" of "nee". Het eerlijke antwoord is een wedervraag: "Veilig voor wie?" In de vraag zitten drie vragen. Voor alle drie heeft het publiek al een toetssteen in de eigen regels.

1. Zeg de aanleiding.
2. Behandel vraag 1.

   **Vraag 1 — Veilig voor de gegevens: waar gaat de melding naartoe, en wie kan meelezen?**

   - **Toetssteen:** art. 9 Wkkgz.
     - In het incidentenregister mag de zorgaanbieder gezondheidsgegevens zonder toestemming verwerken (lid 1).
     - De procedure moet garanderen dat **alleen de functionarissen die met de meldingen werken** persoonsgegevens kunnen zien (lid 3).
     - De zorgaanbieder is verwerkingsverantwoordelijke onder de AVG (lid 8).
   - **Vertaling:** een melding in een publieke chatbot plakken is een melding delen met "anderen". Een AI-toepassing hoort binnen de beschermde kring. Dat is een omgeving die het ziekenhuis heeft goedgekeurd en gecontracteerd. Die omgeving heeft een verwerkersovereenkomst en afspraken over opslag. De leverancier gebruikt de gegevens niet om modellen te trainen. Stem de omgeving af met de FG en met informatiebeveiliging.
   - **KNMG:** een melding bevat "zoveel mogelijk geanonimiseerde informatie". Maar vrije tekst is vaak toch te herleiden, bijvoorbeeld via afdeling + datum + een bijzonderheid. Ga er dus niet van uit dat een melding anoniem is.

3. Behandel vraag 2.

   **Vraag 2 — Veilig voor de patiënt: kan ik de uitkomst vertrouwen?**

   - Leg de jagged frontier uit: AI is betrouwbaar *binnen* een afgebakende, goed beschreven taak. Buiten die taak is AI niet betrouwbaar.
   - Geef de vuistregel van Böckeler als checklist. Hoeveel toezicht heeft een taak nodig?
     **Toezicht = (kans op een fout) × (impact van de fout) × (detecteerbaarheid van de fout)**.
   - Geef twee eisen die het publiek aan élke AI-uitkomst mag stellen:
     1. Elke uitspraak is te herleiden naar de brontekst (een citaat).
     2. Bij twijfel of tegenstrijdigheid escaleert het systeem. Het systeem gokt niet.
   - Zeg: "Beide eisen zie je straks in de demo."

   **Achtergrond bij eis 2:** het grootste gevaar is een vloeiend antwoord dat op een gok rust. Leg daarom als regel vast: "Vul niet in. Kom terug en zeg dat je het niet weet." (In de wiki: *"Say I don't know"*.)

   **Reserve (nieuw) — waarom meten, en niet op gevoel?** De grens van de jagged frontier is van binnenuit niet te zien.

   - In een gerandomiseerde studie (METR) werkten ervaren ontwikkelaars met AI 19% trager. Zelf dachten ze dat ze 20% sneller werkten.
   - Lakhani is medeauteur van het jagged-frontier-onderzoek. Hij zegt over AI: *"is not perfect but it talks really well"*. In het BCG-experiment verdedigde het model zich harder als consultants tegengas gaven, ook als het model ongelijk had. Zijn tip: laat het model eerst tégen je in argumenteren.

   **Reserve (nieuw) — een voorbeeld uit de zorg:** Hippocratic AI gebruikt spraakagenten voor routinecontact met patiënten. Die agenten volgen dezelfde regels:

   - De agenten stellen geen diagnose en schrijven niets voor.
   - Bij een echte klinische vraag komt er een mens bij.
   - Een apart model test het systeem steeds.

   Let op: de bron is een marketingvideo. De term "nul veiligheidsincidenten" heeft in die video geen definitie.

4. Behandel vraag 3.

   **Vraag 3 — Veilig voor de melder: blijft melden veilig?**

   - **Toetssteen 1:** KNMG "veilig melden". De organisatie mag een melding niet gebruiken voor maatregelen tegen de melder of tegen andere betrokkenen.
   - **Toetssteen 2:** art. 9 lid 6 Wkkgz. Gegevens over intern gemelde incidenten zijn geen bewijs en geen grond voor een disciplinaire maatregel. Uitzonderingen: calamiteiten en geweld in de zorgrelatie. Er is ook een beperkte uitzondering voor strafrechtelijk bewijs.
   - **Vertaling:** richt AI op patronen in het systeem. Richt AI nooit op personen. Doe dus geen analyses als "wie meldt het meest" of "wie veroorzaakt het meest".
   - **Open vraag voor de eigen jurist of FG:** blijven gegevens die de AI maakt (samenvattingen, classificaties) binnen het beschermde register? Of komt er een kopie buiten die bescherming?
   - Verbind vraag 3 met stap 5 uit 2a: "veilig melden" is het model voor toezicht op AI.

5. Toon de tekst op de dia: *"Is het veilig? Veilig voor de gegevens · veilig voor de patiënt · veilig voor de melder."*
6. Zeg de boodschap: "Bij alle drie de vragen bepalen de afspraken rond de technologie het antwoord. Dat zijn weer de rules of engagement."

**Opmerking:** het publiek wil een concreet kader. Met deze drie vragen kan het publiek elke nieuwe AI-toepassing zelf afwegen.

#### 2c. Groeimodel: Ask → Assist → Automate op het VIM-proces (13 min)

**Kansenkaart: waar in het VIM-proces kan AI helpen? (3 min)**

Het publiek zoekt nog wat er mogelijk is. Geef daarom eerst het overzicht. Ga daarna de diepte in.

1. Toon het VIM-diagram.
2. Wijs vijf punten aan waar AI kan helpen:
   1. **Melden:** de AI vraagt door bij een onvolledige melding (demo: VIM-2026-0501).
   2. **Triage:** de AI stelt een categorie en een SAC-score voor, met een citaat uit de melding (demo).
   3. **Analyse:** de AI maakt een concept-classificatie van oorzaken met PRISMA (niveau Assist).
   4. **Trends:** de AI ziet patronen over afdelingen heen (route 3, hieronder uitgewerkt).
   5. **Rapportage:** de AI maakt een concept-samenvatting voor het bestuur (demo).
3. Zeg bij elk punt: "De AI doet een voorstel. De mens beslist. Calamiteiten (route 4) blijven altijd mensenwerk."

**Ask → Assist → Automate op route 3 (10 min)**

1. Toon de mermaid-figuur Ask → Assist → Automate (sectie 9 van de HTML-atlas).
2. Toon het VIM-diagram naast de mermaid-figuur.
3. Kies één scenario: een trendanalyse over meerdere afdelingen (route 3 in het VIM-diagram).
4. Doorloop dit scenario drie keer. Geef de AI elke keer meer autonomie.

**ASK — "AI leest mee, jij beslist"**

- **De AI:** de AI leest meldingen van meerdere afdelingen. De AI stelt een samenvatting van het patroon voor. De AI geeft alleen een signaal.
- **Voorbeeld:** "Deze drie afdelingen meldden deze maand vergelijkbare medicatie-incidenten."
- **Tekst op de dia:** "AI stelt een trendsamenvatting over afdelingen voor. De kwaliteitsadviseur beoordeelt en beslist."
- **Zeg expliciet:** "Wat je zo in de demo ziet, is dit niveau. Dit niveau werkt vandaag al."
- **Nieuw — valkuil: afstempelen.** Een team bij Y Combinator kreeg een reeks goede AI-voorstellen. Daarna was de menselijke controle ongemerkt een stempel geworden. De controle faalde niet. De mens ging geleidelijk minder goed kijken. Houd de controle daarom scherp. Eigen vertaling: laat de adviseur regelmatig een steekproef eerst zelf scoren. Vergelijk de score pas daarna met de AI.

**ASSIST — "AI stelt op, jij autoriseert"**

- **De AI:** de AI maakt van het patroon een concept-analyse, bijvoorbeeld een eerste classificatie van oorzaken met PRISMA. De AI zoekt ook literatuur en oplossingen van andere organisaties.
- **De mens:** de PVC- of MIP-commissie corrigeert de concept-analyse. De commissie autoriseert de analyse voordat die naar de RvB of naar andere afdelingen gaat.
- **Tekst op de dia:** "AI stelt een concept-analyse en een verbetervoorstel op. De commissie corrigeert en autoriseert."
- **Nieuw — wie leert er nog?** Doet de AI altijd de eerste analyse? Dan leren nieuwe adviseurs het vak minder goed.
  - Peron ziet hetzelfde bij radiologen in opleiding.
  - BCG noemt dit *"distributed de-skilling"*. In een onderzoek onder 70 bestuurders ziet 90% te veel vertrouwen in AI-uitkomsten die niemand toetst. Probleemdefinitie en oordeelsvorming lopen het meeste risico.
  - **Tegenmaatregel:** laat mensen de eerste gevallen zelf doen.

**Reserve (nieuw) — de arbeidsmarkt.** Het effect is al te zien bij starters (Stanford/ADP Canaries Dashboard, Amerikaanse loondata tot september 2026):

- Bij 22- tot 25-jarigen in de beroepen met de meeste AI-blootstelling is het aantal banen 12% lager dan in november 2022. In de beroepen met de minste blootstelling groeide het aantal banen met 7 tot 10%.
- Boven de 34 jaar is er bijna geen verschil.
- De krimp komt voor in beroepen waarin AI vooral taken overneemt (automatisering). De nieuwste cijfers laten niet zien dat samenwerken met AI banen beschermt.
- Kanttekening: dit is een samenhang, geen bewezen oorzaak. Volgens de onderzoekers zelf komt het begin van de daling waarschijnlijk niet door AI.

**AUTOMATE — "AI handelt zelf af, met een harde grens"**

- **De AI:** bij de duidelijkste gevallen met het laagste risico sluit de AI de cyclus zelf. De AI signaleert, classificeert, archiveert (eindpunt A) en informeert de afdelingen.
- **De harde grens, in drie regels:**
  1. Per melding: een calamiteit (route 4) gaat altijd naar een mens.
  2. Twijfel komt bij de mens, als het model goed gekalibreerd is. Dat meet je met de feedback: als de AI "90% zeker" zegt, klopt het dan ook in ongeveer 90% van de gevallen? Een goed gekalibreerd model twijfelt ook bij een nieuw patroon. Zo komt dat vanzelf bij de mens.
  3. Per patroon: de AI schat de kans uit de data, over afdelingen heen. Een stijgend risico gaat als signaal naar een mens.
- **Leg ook vast wíe een escalatie oppakt.** Voorbeeld: in een experiment werd een bedrijf volledig door AI-agenten geleid. Op dag 19 waarschuwde de AI dat het bedrijf de verkeerde kant op ging. Niemand deed iets met die waarschuwing.
- **Nieuw — kanttekening bij "de afdelingen informeren".** Onderzoek naar *delegation regret* (spijt over een uitbestede beslissing) laat dit zien. Mensen willen vooral een controle bij handelingen die **onomkeerbaar én zichtbaar voor anderen** zijn. Dat zijn niet altijd de "grote" beslissingen. Een bericht aan afdelingen is zo'n handeling. Laat dat bericht daarom ook op het niveau Automate eerst als voorbeeld langs een mens gaan.
- **Citaat:** *"Als het afdelingshoofd niet verantwoordelijk gehouden kan worden voor het resultaat, heb je een demo, geen agent"*. Een BCG-onderzoek laat zien waarom dat nodig is. Van 70 bestuurders zegt meer dan de helft: bij een fout krijgt de AI de schuld.
- **Waarom de grens hard is:** PSEBench toont dat AI-modellen bij twijfelgevallen onbetrouwbaar worden. De modellen zijn dan ook te zeker. Automatiseer daarom alleen de duidelijke gevallen. Automatiseer nooit de grensgevallen.

**Het groeipad in de keten (4 min)**

- **Starten:** kies op de startpagina "Groeipad in de keten". Dit is dezelfde 3D-stapel als in 3a, nu met een mens erin. Klik verder met de pijltjes of de klikker.
- **Vijf stappen:**
  1. Niveau Ask: een mens beoordeelt elke melding. De organisatie is nog weinig volwassen in AI. Ze leert zo hoe goed de AI is.
  2. Meekijken bij twijfel: de AI geeft per SAC-niveau een kans, bijvoorbeeld SAC 1 tot en met 4 = 5, 10, 15 en 70%. Het meest waarschijnlijke niveau is dan SAC 4. Is de hoogste kans lager dan 90%? Dan kijkt een mens mee. Een steekproef van de zekere gevallen ziet de mens ook (zie de valkuil "afstempelen"). In de stapel is een licht bolletje een melding waarover de AI twijfelt.
  3. Het model leert: de correcties worden data. Welke voorstellen waren fout-positief of fout-negatief? Het model leert daarvan en onderscheidt scherper. In het voorbeeld gaat de kans op SAC 4 van 70 naar 93%. Er zijn minder lichte bolletjes, dus minder meldingen langs de mens.
  4. Niveau Automate: alleen calamiteiten gaan naar een mens, hoe zeker de AI ook is. Alle andere meldingen gaan direct naar het overzicht. Wijs op de rode lijn: de mens meldt de calamiteit binnen 3 werkdagen bij de IGJ. Daarna staat de calamiteit ook in de rapportage voor het bestuur.
  5. Het systeem onthoudt: drie keer een val door bedhoogte, op drie afdelingen, in twee weken. Normaal is één per maand. Stel de vraag: "Past dit nog bij normaal?" Bij normaal is de kans op drie of meer 1,4%. Dus de kans stijgt, en het risico ook (risico = kans × impact). Het patroon gaat als signaal naar een mens, met minimaal SAC 2. Elke melding houdt zelf SAC 4. Laat geen formules zien.
- **De feedbackstroom:** wijs bij stap 1 op de lijnen van de mens terug naar beneden. Elke correctie verbetert de instructies van de agent, de OKF-kennis en de ontologie. Soms gaat een correctie naar de melder: wat ontbrak er in de melding? In het begin is die stroom groot. Bij elke stap wordt hij kleiner.
- **Zeg:** "Het systeem leert van jouw oordeel. Daarom begin je met alles zelf beoordelen."
- **Let op:** de kansen zijn een voorbeeld. De live demo geeft geen kansen per SAC-niveau. Die werkt met grensvoorwaarden en een citaat als bewijs.

**Overgang naar Wat:** "Wat je zo ziet, is niveau 1: Ask. Assist en Automate zijn de volgende niveaus. Je groeit bewust, stap voor stap. Je blijft aan het stuur bij elke escalatie."

---

### 3. WAT — 35 min

**Kernboodschap:** "Dit kan vandaag al, op het niveau Ask."

#### 3a. Live demo (18–20 min)

**Eerst: de keten in beeld (4 min)**

- **Starten:** kies op de startpagina "Van melding naar signaal". Klik verder met de pijltjes, de spatiebalk of de klikker.
- **Deel 1, hoog over (6 stappen):** de happy flow. Zo werkt de keten als alles goed gaat. De vijf lagen staan als een stapel in 3D. De meldingen gaan automatisch van onder naar boven. Bij de laag AI-agent lichten vier kennisbestanden op. Lijnen lopen naar de agent. Zo zie je welke kennis de agent leest.
- **Bij de laatste stap van deel 1:** zeg "Dit is de keten als alles goed gaat. Vandaag zit er nog een mens tussen." Zo sluit het beeld aan op het groeipad uit 2c.
- **Deel 2, twee meldingen (6 stappen):** dit is vandaag, op niveau Ask. VIM-2026-0470 (Geriatrie, geen letsel) en VIM-2026-0485 (IC, overleden) gaan samen langs zes stations.
- **Wijs op drie momenten:**
  1. Ontologie: in 0470 staat het woord "val" niet. Toch is het een val. Dat is de waarde van één vaste taal (2a).
  2. OKF-kennis: voor 0485 leest de agent één bestand extra, het draaiboek voor de IGJ.
  3. Mens beslist: de AI doet een voorstel. Een mens bevestigt beide meldingen. Zo begin je.
- **Let op:** deel 2 is een vast script, net als de verwerkingsanimatie. De live demo kan voor 0470 een andere SAC-score geven. Zeg dat als het gebeurt.
- **Overgang:** "Dit was het script. Nu doet de AI het echt." Open daarna de live demo.

**Het prototype**

- **Starten:** lokaal met `npm start`. Kies op de startpagina "Live demo".
- **Inhoud:** een fictieve simulatie van het ziekenhuis "St. Machteld".
- **De keten:** data lake → semantische laag (ontologie) → OKF-kennisbundel → AI-triage-agent → rapportage voor het bestuur.
- **Techniek:** de AI-triage roept een extern taalmodel aan (Claude, via de API van Anthropic). De lokale server voegt de API-sleutel uit `.env` toe.
- **Terugvaloptie:** als de aanroep niet lukt, gebruikt de demo een classificatie op basis van trefwoorden. Het label "fallback" toont dat. Zo is er altijd iets te zien.
- **Technisch patroon:** het skelet van een triage-agent van Luminai/Dinakaran, toegepast op VIM-meldingen:
  1. Classificeer de melding op urgentie en type.
  2. Haal gestructureerde data uit de melding.
  3. Stuur de meldingen door en voeg ze samen.

> ⚠️ **Presenteer vanaf de lokale server, niet vanaf witusj.github.io.** De gehoste versie is oud. Die versie heeft geen doorvraag-lus, geen verificatie en geen meldingen 0501 en 0505. Die versie bereikt de AI ook niet. Controleer vóór de sessie de statusregel op de startpagina: "AI-verbinding werkt".

**Spreekinstructies**

1. **Zeg waar de gegevens heen gaan (1 min).** Alle meldingen in de demo zijn verzonnen (St. Machteld). Dat is een bewuste keuze. In deze demo gaat de tekst van de melding naar een extern taalmodel. Met echte meldingen mag dat alleen in een omgeving die aan art. 9 Wkkgz voldoet (vraag 1 uit 2b). Zo toont de demo zelf hoe je de veiligheidsvraag beantwoordt.
2. **Toon melding VIM-2026-0501.** De melding is onvolledig. De agent vraagt door ("Is de dubbelcheck uitgevoerd?"). De agent gokt niet. Dit is het antwoord op vraag 2 uit 2b, in de praktijk. (Getest op 4 november: drie vragen aan de InfoProvider, daarna SAC 2 en "Geverifieerd".)
3. **Leg het label "Geverifieerd" uit.** Een aparte aanroep controleert de triage tegen het draaiboek (de OKF-kennisbundel). Dat is de regel "Laat een agent nooit zijn eigen huiswerk nakijken" (wiki, nieuw). Ook Hippocratic AI laat zijn zorgagenten door een apart model testen.
4. Laat de AI live gesimuleerde meldingen van meerdere afdelingen lezen.
5. Laat zien dat de AI een patroon over afdelingen signaleert.
6. Laat zien dat de AI daar stopt voor het oordeel van een mens. Dit bevestigt de belofte van het niveau Ask.
7. Noem eerlijk de grens van de nauwkeurigheid: generieke extractie haalt 80–90%. Een betrouwbare pijplijn heeft ongeveer 99,x% nodig.
8. Leg grounding uit (verankering in de bron): elke uitspraak van de AI is te herleiden naar de brontekst. Daardoor kun je de AI controleren en vertrouwen.
9. Trek de conclusie: "Daarom is Ask het juiste startniveau. Assist en Automate komen later."

**Voorbereiding:** Witek bouwt het prototype. De contactpersoon controleert en corrigeert het prototype voor de sessie.

#### 3b. Mens tegen agent, en het gesprek (15 min)

**Bewust géén echte meldingen.** De demo heeft geen invoerveld. Echte meldingen uit de eigen ziekenhuizen horen niet in een demo-omgeving (vraag 1 uit 2b). Zeg dat hardop: "Dit is het veiligheidsverhaal in de praktijk."

**Mens tegen agent (ongeveer 4 min)**

1. Toon de tegenstrijdige melding VIM-2026-0505. Volgens de verpleging was de patiënt een tijd bewusteloos. Volgens de arts was de patiënt "alert en aanspreekbaar".
2. Laat de zaal eerst zelf een SAC-score kiezen. De deelnemers steken 1 tot 4 vingers op.
3. De zaal is het waarschijnlijk onderling oneens. Benoem dat.
4. Toon daarna de agent. De agent kiest géén score. De agent escaleert, met de tegenstrijdigheid als reden.
5. Zeg de boodschap: "Bij twijfel is escaleren het goede antwoord. Ook voor AI."

**Opmerking:** ook de fallback escaleert deze melding. Zonder internet staat dezelfde casus in `vim-agent-animatie.html`. Lakhani raadt de volgorde "eerst zelf scoren, dan de machine" ook aan. Zo blijf je het vak leren (zie Assist in 2c).

**Gesprek in kleine groepen (ongeveer 8 min)**

1. Vorm groepen. Zet bij voorkeur iemand uit een ander Santeon-ziekenhuis in elke groep.
2. Stel de vraag: "Welke van de drie veiligheidsvragen kun je voor je eigen ziekenhuis vandaag al beantwoorden? En bij wie ligt het antwoord op de andere vragen?"

**Opmerking:** de werkvorm hangt af van de zaal (zie Vervolgstappen). Bij tafels: gemengde tafels. Bij een theateropstelling: gesprekken met drie buren.

**Plenaire oogst (ongeveer 3 min)**

1. Laat twee of drie groepen hun antwoord delen.
2. Noteer welke vraag het vaakst "weet ik niet" oplevert.
3. Zeg: "Daar ligt jouw eerste stap voor morgen."

**Opmerking:** dit deel maakt het doel letterlijk waar: "Ik kan hier morgen mee beginnen."

**Facilitatie (niet op een dia):**

1. Komt er weerstand of scepsis? Zie die weerstand als een signaal.
2. Vraag door: wat is de weerstand precies?
3. Onderzoek de oorzaak: verlies, onzekerheid, verlies van controle, of een terechte zwakke plek.
4. Los de weerstand niet meteen op.

---

### 4. Afsluiting: terug naar het waarom — 10 min

1. Toon één samenvattende dia: expliciete kwaliteitsstandaarden → Ask → Assist → Automate. Zet de drie veiligheidsvragen ernaast: gegevens · patiënt · melder.
2. Noem de harde grens als vast anker: calamiteiten en twijfelgevallen gaan altijd naar een mens.
3. Herhaal de kernboodschap van het waarom: "AI is een kans om het vak beter te maken, niet alleen sneller."
4. Geef de eerste stap voor morgen: "Schrijf je top-3 van terugkerende incidenttypen op. Schrijf ook je bestaande risicomatrix expliciet op. Dat is je eerste document met rules of engagement."
5. Geef één vraag mee voor de FG of de informatiebeveiliger. De vraag is: "In welke goedgekeurde omgeving mogen wij AI op VIM-meldingen gebruiken?" Is het antwoord "nog nergens"? Dan ken je de eerste stap van je organisatie.
6. Geef ruimte voor vragen. Gebruik de voorbereide antwoorden hieronder.

**Opmerking:** de sessie eindigt waar de sessie begon: bij het waarom. Zo sluit de Golden Circle.

---

## Verwachte vragen — voorbereide antwoorden (spreeknotitie, niet op een dia)

**"Mag ik meldingen in ChatGPT of Copilot plakken?"**
Niet met echte meldingen, tenzij je ziekenhuis die omgeving daarvoor heeft goedgekeurd. De toetssteen is art. 9 lid 3 Wkkgz: alleen de aangewezen functionarissen mogen persoonsgegevens uit meldingen zien. Weet je het niet? Vraag het aan je FG. Dat is precies de eerste stap.

**"En als ik de melding eerst anonimiseer?"**
Dat helpt. Maar vrije tekst is vaak toch te herleiden, bijvoorbeeld via afdeling, datum of een zeldzame aandoening. Behandel een melding als persoonsgegevens, tenzij het tegendeel bewezen is.

**"Wie is verantwoordelijk als de AI een calamiteit mist?"**
De zorgaanbieder. De meldplicht bij de inspectie (art. 11 Wkkgz) gaat niet over naar een systeem. Daarom gaan calamiteiten en twijfelgevallen altijd naar een mens. Daarom begint AI ook op het niveau Ask. Het risico in de praktijk: de verantwoordelijkheid schuift ongemerkt weg. In een BCG-onderzoek onder 70 bestuurders zegt meer dan de helft: bij een fout krijgt de AI de schuld.

**"Kan een AI-analyse tegen een melder worden gebruikt?"**
Gegevens in het incidentenregister zijn beschermd (art. 9 lid 6 Wkkgz). Geldt dat ook voor kopieën die de AI buiten het register maakt? Dat is een vraag voor de eigen jurist. De ontwerpregel: AI kijkt naar systemen, niet naar personen.

**"Gaat AI ons werk overnemen?"**
Peron zegt: *"AI is here to add, not to take over"*. Op het niveau Ask doet de AI het verzamelen en samenvatten. Het oordeel blijft bij jou. Het echte risico is eerder dat we het vak verleren (BCG: *"distributed de-skilling"*). Laat mensen daarom de eerste gevallen zelf blijven doen.

De hardste cijfers tot nu toe komen uit de Amerikaanse loonadministratie (Stanford/ADP, tot september 2026):

- Over alle leeftijden is het verschil klein tussen beroepen met meer en met minder AI-blootstelling. De onderzoekers vatten hun herziene studie (augustus 2026) samen als "geen brede verdringing".
- Het werk voor starters van 22–25 jaar in de meest blootgestelde beroepen krimpt wel.
- Zorgwerk met veel menselijk en fysiek contact groeit juist. Bij thuiszorgmedewerkers groeit het werk voor starters met 22% sinds eind 2022.
- Ziekenhuisberoepen en kwaliteitsadviseurs staan niet apart in deze cijfers.

**"Zijn er ziekenhuizen die dit al doen?"**
Er zijn voorbeelden in de buurt, maar nog niet voor incidentanalyse:

- Luminai triageert binnenkomende faxen voor grote Amerikaanse ziekenhuizen.
- Hippocratic AI belt patiënten voor routinecontact, zonder diagnose.
- BCG ziet dat patiënten AI al als eerste stap gebruiken.

De geraadpleegde bronnen geven geen praktijkvoorbeeld van AI-analyse van incidentmeldingen over afdelingen heen. Zeg dat eerlijk: "Daarom laten we een prototype zien, en geen product."

**"Moeten we iets met de Europese AI-verordening?"**
Voor deze zaal is vooral artikel 4 belangrijk (van kracht sinds februari 2025). Organisaties moeten zorgen dat medewerkers voldoende AI-geletterd zijn. Valt een specifieke toepassing onder strengere regels? Dat hangt af van het gebruik. Laat dat per toepassing toetsen.

---

## Buiten deze outline

- **De andere modellen uit de HTML-atlas.** De sessie laat deze modellen bewust weg. Zo blijft de sessie kort en concreet.
  - Werner/Tin Man-Octopus, Cisco 5 Foundations, MIT CISR, Ransbotham, McKinsey Rewired.
  - Nishar-Nohria, Bain/OpenAI, Anand-Wu, Agent Harness.
  - Sinds 4 november: de werknemersladder L0–L5 (sectie 12).
- **Het honorariumvoorstel:** dat voorstel is een apart traject.
- **Het ontwerp van de dia's:** dit document geeft de sessie-flow met spreeknotities. De dia's zijn een volgende stap.

## Vervolgstappen

1. Zet deze sessie-flow om naar dia's. Gebruik de mermaid-figuur en het VIM-diagram als beeld.
2. ~~Krijg de demo werkend.~~ **Opgelost op 4 november:** de demo draait lokaal (`npm start`). Het is de actuele versie, met live AI via een lokale proxy. Ook de atlas werkt weer: een gewijzigde CDN-versie blokkeerde d3.
   - Nog te doen: een generale repetitie op de presentatielaptop en op het netwerk van de zaal. Zonder internet gebruikt de demo de fallback. De reserve is `vim-agent-animatie.html`.
   - Optioneel: werk de oude versie op witusj.github.io bij, of haal die offline. Dan gebruikt niemand de verkeerde link.
3. Vraag Carien:
   1. Wat is de opstelling van de zaal: tafels of theater? Dat bepaalt de werkvorm in 3b.
   2. Is er in het netwerk al AI-beleid, of een standpunt van FG's of CISO's? Dan kan 2b daarnaar verwijzen.
4. Laat een FG of jurist uit het netwerk de juridische punten kort controleren: Wkkgz art. 9 en 11, AI-verordening art. 4, en de voorbereide antwoorden. De Wkkgz-citaten komen uit de wettekst in `background-material/`. De vertaling naar AI is een eigen interpretatie.
5. Oefen de sessie hardop, met een klok. De tijd is krap met een live demo en een interactief deel. Plan daarom een buffer van 5 minuten.
6. **De wiki-update van 4 november is verwerkt.** De trace staat in `background-material/2026-07-01-hospital-quality-ai-presentation-query-trace.md`. De atlas is bijgewerkt. De nieuwe punten zijn spreeknotities en reserve, **geen extra dia's**. Kies bij het oefenen (stap 5) per blok hooguit één nieuw punt om echt te zeggen. Neem de nieuwe citaten mee in de controle door de FG of jurist (stap 4).
