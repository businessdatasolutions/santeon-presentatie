# Negen faalvormen, met gewerkte voorbeelden

Alle voorbeelden komen uit één redactieronde op een gegenereerd reviewdossier. Ze zijn niet bedacht: ze stonden er.

## Detecteerbaar door `scripts/tekstcheck.py`

### F1 — Onbepaald onderwerp

> Elk puntgevend element krijgt een bron met paginanummer. **Wie geen passage vindt, schrijft geen vraag.**

Wie is "wie"? De vraagmaker, het model, de docent? De lezer moet het raden.

**Let op:** de constructie is niet altijd fout. *"Wie genereren en scoren in één beurt doet, komt er langs"* stelt een algemene regel en is correct Nederlands. Het onderscheid: draagt "Wie" een algemene regel, of verbergt het een specifieke uitvoerder die genoemd had moeten worden?

Ook onder F1: *"Er wordt gecontroleerd of …"* — door wie?

### F2 — Lexicale echo

> Een deel van de kwaliteit is meetbaar en wordt afgedwongen. De rest is oordeelswerk en blijft bij mensen. **Deze scheiding is bewust.**

Hier vindt het script niets, want de derde zin deelt geen woord met de eerste twee. Zie F7.

Wél gevonden wordt het geval waarin de herhaling ook lexicaal is:

> Je invoer blijft op je apparaat tot je hem zelf verstuurt. **Er gaat niets automatisch weg.**

**Uitzondering:** lijstitems en antwoordopties horen parallel geformuleerd te zijn. Het script slaat ze daarom over. Bij handmatig redigeren geldt hetzelfde.

### F3 — Lijdende vorm zonder uitvoerder

> **Per beoordelingscriterium worden vragen geschreven**, uitsluitend op basis van passages uit de literatuur.

Door wie? In dit geval door een taalmodel, en juist dat is voor de lezer belangrijk.

→ *Een taalmodel schrijft per beoordelingscriterium een aantal vragen …*

**Let op:** soms is de uitvoerder terecht weggelaten, bijvoorbeeld als hij irrelevant is of uit de context volgt.

### F4 — Telfout tussen aankondiging en lijst

> De werkwijze scheidt **drie** taken die elkaar anders in de weg zitten.
>
> **Genereren.** … **Keuren.** … **Beoordelen.** … **Samenstellen.** …

Vier. Dit ontstaat bij het uitbreiden van een lijst zonder de inleiding bij te werken. Een lezer merkt het op, de schrijver niet.

### F5 — Engelse genitief bij een naam

> **Cronbach's alfa** en de discriminatie-index zijn pas na afname vast te stellen.

Nederlands schrijft *Cronbachs alfa*. De apostrof komt alleen bij namen die op een klinker eindigen: *Anna's*, *Rousseau's*.

### F6 — Te lange zin

Boven de 25 woorden. Geen fout maar een norm, en vrijwel altijd een teken dat er twee gedachten in één zin zitten.

In een proef lag geen van de zeven gegenereerde opdrachtzinnen onder die norm. De lengtes liepen van 31 tot 51 woorden, en correleerden met de puntenaftrek van de beoordelaars.

## Alleen door lezen te vinden

### F7 — Semantische redundantie

> Een deel van de kwaliteit is meetbaar en wordt afgedwongen. De rest is oordeelswerk en blijft bij mensen. **Deze scheiding is bewust.**

De derde zin voegt niets toe. Dat er een scheiding is staat er al, en dat die bewust is volgt uit de uitleg.

Herkenbaar aan de vorm: een korte slotzin die begint met *Dit*, *Dat*, *Deze* of *Zo* en het voorafgaande samenvat of van een oordeel voorziet.

### F8 — Verkeerd benoemde actor

> Vervolgens beoordeelt **een verse lezer** elke vraag — **iemand** die de bedoeling van de maker niet kent.

"Iemand" leest als een mens. Het is een tweede taalmodel. Voor lezers die op basis van deze tekst een oordeel vormen, is dat verschil wezenlijk.

→ *Vervolgens scoort een tweede taalmodel elke vraag. Het krijgt alleen de vraag, het criterium en de brontekst.*

Dit is geen stijlfout maar een nauwkeurigheidsfout, en daarmee de ernstigste van de negen.

### F9 — Circulaire of nietszeggende formulering

> Die vellen geen oordeel over kwaliteit, maar **meten wat meetbaar is**.

De zin definieert zichzelf. Vervang hem door wat er werkelijk wordt gemeten.

→ *Geautomatiseerde controles meten drie dingen: de brondekking, het denkniveau, en of de opdracht is opgedeeld in deelvragen.*

Verwant hieraan: een vraag die om een vaag antwoord vraagt. *"Wat vind je van deze werkwijze?"* levert "prima" op; *"Klopt deze werkwijze volgens jou? Welke stap ontbreekt?"* levert een antwoord op.
