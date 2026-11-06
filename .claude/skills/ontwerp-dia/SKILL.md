---
name: ontwerp-dia
description: Gebruik bij het schrijven of aanpassen van dia's van een hoorcollege — weken/week-NN/college.html of elk deck dat een docent presenteert — en zodra een dia meer draagt dan een luisteraar in één oogopslag opneemt. Triggers zijn "maak de dia's", "voeg een dia toe", "deze dia is te vol", "korter", "te veel tekst op het scherm", of een dia waarvan een student de tekst leest in plaats van luistert.
argument-hint: "pad-naar-deck.html [dianummers]"
---

# De dia draagt het bewijs, de docent draagt het verhaal

## De kernregel

**Een student leest of luistert, nooit allebei.** Een zaal die zinnen op een dia ziet, leest ze — en
zolang ze lezen, horen ze de docent niet. Dus draagt een dia alleen wat de stem niet kan
dragen: de ene zin die blijft hangen, een getal, een citaat, een naam, een structuur, een
tekening. Alles wat je kunt zéggen, zeg je — en het staat niet op het scherm. De volledige tekst
staat in de docentnotities, en dat is ook waar de student hem later terugvindt in de pdf.

Dit is de bewering-en-bewijsstructuur: de kop is de bewering, het lijf is het bewijs ervoor, en
het betoog is van de docent.

## Wat een dia draagt

| Onderdeel | Regel |
|---|---|
| Kop (`h2`) | Eén zin die een student kan navertellen; hooguit twaalf woorden. Een label (*De casus*) markeert een blok; een inhoudsdia stelt iets. |
| Lijf | Hooguit 40 woorden lopende tekst. Fragmenten, geen volzinnen. Hooguit drie opsommingspunten van één regel. |
| Een zin, als het er een moet zijn | Hooguit 20 woorden — D1 voor geprojecteerde tekst, want de lezer krijgt één oogopslag. |
| Bewijs | Eén ding: een getal, een citaat, een naam, een tekening, een rij tegels. Nooit een alinea die het uitlegt. |
| Tekening (`svg`) | Aslabels en kernwoorden tellen anders dan lopende tekst: ze worden bekeken, niet gelezen. Het script houdt ze in een aparte kolom. |
| Detail | Naar de docentnotities, of naar het bronmateriaal van de week. |
| Regie | Nooit op de dia. Wat de docent moet dóen staat in `div.notes` — zie CLAUDE.md, „Geen regieaanwijzingen op een dia". |

## Twee toetsen

**De spookdeck-toets.** Lees alleen de koppen, van boven naar beneden. Vertellen ze samen het
verhaal van het college, dan houdt het deck. Een kop die alleen een label is (*Structuur*,
*Mensen*) betekent dat de dia nog niet weet waarvoor hij er staat.

**De luistertoets.** Zeg per dia hardop wat je erover gaat vertellen. Alles wat je zojuist zei en
óók op de dia staat, is dubbel: haal het van de dia. Alles wat je nooit hardop zou zeggen — de
exacte formulering van een opdracht, een getal, een citaat, een tekening — is precies waarom de
dia bestaat.

## Werkwijze

1. **Schrijf eerst het spoor van de docent.** Eén regel per dia: wat je zegt. In dit deck is dat
   de notitie; die staat er meestal al.
2. **Bepaal per regel wat de luisteraar moet zíen** om je te kunnen volgen. Dat is de dia.
3. **Draai de teller.** Hij geeft per dia de woorden, de figuurtekst apart, de opsommingspunten,
   de langste zin en de koplengte, en markeert wat over de streep gaat; afsluitcode 1 betekent
   dat er iets over is.

   ```bash
   python3 .claude/skills/ontwerp-dia/scripts/diawoorden.py weken/week-03/college.html
   python3 .claude/skills/ontwerp-dia/scripts/diawoorden.py weken/week-03/college.html --zonder-figuur
   python3 .claude/skills/ontwerp-dia/scripts/diawoorden.py college.html --max-woorden 40 --max-opsomming 3 --max-zin 20
   python3 -m pytest .claude/skills/ontwerp-dia/scripts -q     # 5 tests
   ```

4. **Draai de prozacontrole** op dezelfde dia's, zodat losse kaartjes niet als één lange zin
   gelezen worden en de notities buiten schot blijven:

   ```bash
   python3 .claude/skills/schrap-ai-taal/scripts/aitaal.py weken/week-03/college.html \
           --negeer-html-klasse notes --blok-tag span --codes A1,D1
   ```

5. **Render en kijk.** Een dia die als een muur tekst leest, zie je op het scherm en niet in de
   broncode. `meet_college.py --schermen <map>` zet ze voor je klaar.
6. **Wat je schrapt, verplaats je.** Draagt een geschrapte zin een feit dat nergens anders staat,
   dan gaat hij naar de docentnotities van diezelfde dia — niet terug naar het scherm, en niet
   weg.

## Waar dit deck staat, en wat de streep hier betekent

Gemeten op 16 september 2026, zonder figuurtekst en zonder notities:

| Deck | Dia's | Gemiddeld | Mediaan | Zwaarste | ≤ 40 woorden |
|---|---|---|---|---|---|
| Week 1 | 32 | 63 | 58 | 115 (dia 14) | 10 |
| Week 2 | 35 | 50 | 53 | 116 (dia 15) | 10 |
| Week 3 | 40 | 63 | 65 | 120 (dia 1) | 10 |

Veertig woorden is dus geen poortje dat dit deck vandaag haalt, en zo moet je de uitvoer ook
niet lezen: **gebruik de teller als rangschikking, niet als stoplicht.** De zwaarste vijf dia's
van een week zijn het werk; de dia van 45 woorden is het niet.

Let op het verschil met de beoordelingslat: gate D3 in `beoordeel-hoorcollege` staat op
gemiddeld 110 en maximaal 170 woorden per dia, en telt de figuurtekst gewoon mee. Die lat is de
ondergrens waarop een college beoordeeld wordt; deze skill is de scherpere blik waarmee je het
beter maakt. Een deck kan D3 ruim halen en hier alsnog twintig dia's oplichten — dat is geen
tegenspraak, dat is het verschil tussen voldoende en goed.

## De decks van deze repo

`weken/week-NN/college.html` is de bron: één bestand, één `<section class="slide">` per dia.

- Een dia heeft `data-part` en `data-title`, dan een `p.eyebrow`, dan de kop (`h2`, of `h1` op de
  titeldia), dan het lijf, en sluit af met `div.notes`.
- De teller laat notities, eyebrow en de kop zelf buiten de woordentelling, en houdt `svg`-tekst
  in een aparte kolom.
- Een dia invoegen verschuift alle dianummers erna — draai `test_stemtool.py` en de beoordeling
  opnieuw (zie CLAUDE.md).
- pptx en pdf in `afgeleiden/` zijn afgeleiden; je bewerkt ze nooit met de hand.

## Waar dit vandaan komt, en waar het afwijkt

- **De assertion–evidence structure van Michael Alley** (Penn State): een kop die de boodschap van de
  dia uitspreekt, gedragen door visueel bewijs; opsommingen horen er niet. Wij houden
  opsommingen, hooguit drie en alleen als fragment, omdat dit deck ook als pdf wordt nagelezen.
- **De `academic-pptx`-skill** (Gabberflast): actietitels als hele zin, ongeveer 40 woorden lijf
  per inhoudsdia, één inzicht per dia, en de spookdeck-toets — „de spreker draagt het betoog, de
  dia draagt het bewijs". De 40 woorden en die toets zijn overgenomen zoals ze zijn.
- **De `pptx`-skill van Anthropic**: elke dia heeft een visueel element, want „text-only slides are
  forgettable", en notities horen in het notitieveld, nooit in een tekstvak.
- **De huisskill `schrap-ai-taal`**: D1 op 20 woorden voor geprojecteerde tekst, en `--blok-tag`
  zodat een deck dia voor dia gemeten wordt.

De canonieke versie staat in `~/Documents/HAN/M3DM/ai-in-business/.claude/skills/slide-deck/`;
deze is er de Nederlandse bewerking van (16 sep 2026), met de teller op dit deckcontract gezet.
Wie hier iets verbetert, brengt het daar ook aan.
