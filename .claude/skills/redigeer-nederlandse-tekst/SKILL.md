---
name: redigeer-nederlandse-tekst
description: Use when Dutch professional text must be edited before it reaches readers — reports, documentation, course material, letters, skill files. Triggers include "redigeer deze tekst", "nakijken op stijl en spelling", "tekst aanscherpen", "kun je dit redigeren", or when a generated Dutch document is about to be shared or published.
---

# Nederlandse zakelijke tekst redigeren

## De kernregel

**Elke zin draagt nieuwe informatie.** Kost een zin leestijd zonder iets toe te voegen, dan moet hij weg — hoe correct hij verder ook is.

Dat klinkt vanzelfsprekend en wordt toch voortdurend geschonden, meestal in de vorm van een samenvattende slotzin die herhaalt wat er net stond. Die zin voelt bij het schrijven als afronding en leest als vertraging.

## Drie vragen bij een verdachte zin

Deze drie vragen komen uit een echte redactieopmerking en vangen het meeste:

1. **Wie is hier het onderwerp?** Kun je de handelende partij niet aanwijzen, dan moet de zin herschreven.
2. **Waarom staat deze zin er?** Kun je dat niet beantwoorden, dan is de zin overbodig.
3. **Wat voegt hij toe aan de vorige?** Niets — dan weg.

Het aanleidende voorbeeld:

> Elk puntgevend element in een antwoordmodel krijgt een bron met paginanummer. *Wie geen passage vindt, schrijft geen vraag.*

De tweede zin faalt op alle drie: "Wie" wijst niemand aan, hij is toegevoegd als afronding, en hij volgt logisch uit de eerste. Geschrapt.

## Werkwijze

1. **Draai het controlescript.** Het vindt zes soorten fouten die een regel kan aanwijzen.

   ```bash
   python3 scripts/tekstcheck.py verslag.md
   python3 scripts/tekstcheck.py map/ --recursief --codes F1,F4,F5
   ```

2. **Los de meldingen op.** Elke melding is een aanwijzing, geen vonnis — zie de precisienotitie hieronder.
3. **Loop de oordeelsvormige faalvormen langs** uit `faalvormen.md`: F7 tot en met F9 zijn niet detecteerbaar en vragen dat je de tekst leest.
4. **Controleer de aanspreekvorm.** Kies je of u, en houd dat vol. Mengvormen ontstaan bij het redigeren zelf.
5. **Lees de openings- en slotzin van elke sectie apart.** Daar zit de meeste redundantie.

## Wat het script vindt

| Code | Faalvorm | Precisie |
|---|---|---|
| F1 | Onbepaald onderwerp: "Wie …, …" en "Er/Men wordt …" | matig — de constructie is soms idiomatisch |
| F2 | Zin herhaalt lexicaal de vorige | goed, na uitsluiting van lijstitems |
| F3 | Lijdende vorm zonder uitvoerder | matig — soms is de uitvoerder terecht weggelaten |
| F4 | Aangekondigd aantal klopt niet met de lijst eronder | goed |
| F5 | Engelse genitief bij een naam: *Cronbach's* | hoog |
| F6 | Zin boven de 25 woorden | hoog, maar het is een norm en geen fout |

Gemeten op twee documenten: nul bevindingen op een geredigeerd verslag van 210 kB. In een testtekst met opzettelijke fouten werden alle zes faalvormen gevonden.

Draai je het script op een tekst die fouten *citeert* om ze te tonen — zoals `faalvormen.md` hiernaast — dan meldt hij die citaten. Dat is correct gedrag en geen fout in de tekst.

## Wat het script niet vindt

**Semantische redundantie.** Een zin die de vorige herhaalt zonder er één woord mee te delen ontsnapt aan F2. *"Deze scheiding is bewust"* na twee zinnen die de scheiding al uitleggen, deelt geen woordenschat en is toch overbodig.

**Een verkeerd benoemde actor.** *"Een verse lezer beoordeelt elke vraag — iemand die de bedoeling van de maker niet kent."* Grammaticaal onberispelijk, en misleidend zodra die lezer een taalmodel is. Alleen wie weet wat er gebeurt, ziet dat.

**Een circulaire formulering.** *"Ze meten wat meetbaar is"* is een zin die zichzelf definieert.

Voor die drie is `faalvormen.md` er, en uiteindelijk het lezen zelf.

## Veelgemaakte fouten bij het redigeren

| Fout | Waarom het misgaat |
|---|---|
| Alle meldingen klakkeloos opvolgen | F1 en F3 hebben matige precisie; een idiomatische constructie hoeft niet weg |
| Alleen het script draaien | de drie ernstigste faalvormen zijn niet detecteerbaar |
| Zinnen inkorten zonder te schrappen | een overbodige zin van tien woorden blijft overbodig |
| Aanspreekvorm wisselen tijdens het redigeren | herlees op je/u nadat je klaar bent |
| Citaten meeredigeren | een geciteerde bron houdt zijn eigen bewoording, ook als die afwijkt |
