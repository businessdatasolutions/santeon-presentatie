#!/usr/bin/env python3
"""Woorden, opsommingen en langste zin per dia van een hoorcollegedeck.

Een student leest of luistert, nooit allebei. Dit telt wat een dia te lezen
geeft — dus zonder de docentnotities — en markeert de dia's die te veel vragen:

  tekst  > 40 woorden    de dia vertelt het verhaal in plaats van de docent
  opsomming > 3 punten   meer dan één oogopslag
  zin    > 20 woorden    D1 voor geprojecteerde tekst (schrap-ai-taal)
  kop    > 12 woorden    een bewering, geen alinea

Het deckcontract: <section class="slide" data-part data-title>, per dia een
<div class="notes"> en een <p class="eyebrow"> boven de kop. Notities, eyebrow
en de kop zelf tellen niet mee in de tekst; tekst in een <svg> wel, maar apart
zichtbaar in de kolom `fig`, want een aslabel leest anders dan een volzin.

Gebruik:
  python3 diawoorden.py weken/week-02/college.html [meer decks...]
  python3 diawoorden.py college.html --max-woorden 40 --max-opsomming 3 --max-zin 20
  python3 diawoorden.py college.html --zonder-figuur   # svg-tekst niet meetellen
Afsluitcode 1 zodra een dia gemarkeerd is, anders 0.
"""
import argparse
import html
import re
import sys

DIA = re.compile(r'<section class="slide([^"]*)"([^>]*)>(.*?)</section>', re.S)
TITEL = re.compile(r'data-title="([^"]*)"')
NOTITIES = re.compile(r'<div class="notes".*?</div>\s*$', re.S)
EYEBROW = re.compile(r'<p class="eyebrow"[^>]*>.*?</p>', re.S)
KOP = re.compile(r"<h1[^>]*>(.*?)</h1>|<h2[^>]*>(.*?)</h2>", re.S)
SVG = re.compile(r"<svg\b.*?</svg>", re.S)
ONZICHTBAAR = re.compile(r"<(style|script)\b.*?</\1>", re.S)
TAG = re.compile(r"<[^>]+>")
WOORD = re.compile(r"\w", re.UNICODE)


def tekst(fragment):
    return html.unescape(TAG.sub(" ", fragment))


def woorden(t):
    # Een los scheidingsteken (· — →) is geen woord
    return sum(1 for w in t.split() if WOORD.search(w))


def zinnen(t):
    # Een opsommingspunt, een kop en een regeleinde sluiten een zin af; . ! ? ; : ook
    delen = re.split(r"[.!?;:\n]+|·", t)
    return [d.strip() for d in delen if d.strip()]


def meet(body, met_figuur=True):
    body = ONZICHTBAAR.sub(" ", body)
    body = NOTITIES.sub("", body)
    body = EYEBROW.sub("", body, count=1)
    m = KOP.search(body)
    kop = tekst(m.group(1) or m.group(2)).strip() if m else ""
    rest = KOP.sub(" ", body, count=1)
    figuur = woorden(tekst(" ".join(SVG.findall(rest))))
    if not met_figuur:
        rest = SVG.sub(" ", rest)
    opsomming = len(re.findall(r"<li\b", rest))
    # Blokelementen als aparte regel, zodat een dia nooit één lange zin wordt
    rest = re.sub(r"</(li|p|h3|h4|div|span|td|tr|em|b)>", "\n", rest)
    lijf = tekst(rest)
    return {
        "kop": kop,
        "kop_woorden": woorden(kop),
        "woorden": woorden(lijf),
        "figuur": figuur if met_figuur else 0,
        "opsomming": opsomming,
        "langste_zin": max((woorden(z) for z in zinnen(lijf)), default=0),
    }


def keur(pad, grens):
    src = open(pad, encoding="utf-8").read()
    gemarkeerd = 0
    print(f"{pad}")
    print(f"  {'dia':>3} {'wrd':>4} {'fig':>4} {'ops':>3} {'zin':>4} {'kop':>4}  titel")
    for nr, (klassen, attrs, body) in enumerate(DIA.findall(src), 1):
        m = meet(body, met_figuur=not grens.zonder_figuur)
        t = TITEL.search(attrs)
        titel = t.group(1) if t else m["kop"]
        vlaggen = []
        if m["woorden"] > grens.max_woorden:
            vlaggen.append(f"tekst {m['woorden']} > {grens.max_woorden}")
        if m["opsomming"] > grens.max_opsomming:
            vlaggen.append(f"opsomming {m['opsomming']} > {grens.max_opsomming}")
        if m["langste_zin"] > grens.max_zin:
            vlaggen.append(f"zin {m['langste_zin']} > {grens.max_zin}")
        if m["kop_woorden"] > grens.max_kop:
            vlaggen.append(f"kop {m['kop_woorden']} > {grens.max_kop}")
        merk = "!" if vlaggen else " "
        print(f"{merk} {nr:>3} {m['woorden']:>4} {m['figuur']:>4} {m['opsomming']:>3} "
              f"{m['langste_zin']:>4} {m['kop_woorden']:>4}  {titel[:52]}")
        for v in vlaggen:
            print(f"        → {v}")
        gemarkeerd += bool(vlaggen)
    return gemarkeerd


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("decks", nargs="+")
    ap.add_argument("--max-woorden", type=int, default=40)
    ap.add_argument("--max-opsomming", type=int, default=3)
    ap.add_argument("--max-zin", type=int, default=20)
    ap.add_argument("--max-kop", type=int, default=12)
    ap.add_argument("--zonder-figuur", action="store_true",
                    help="tekst in een <svg> niet meetellen in de woordentelling")
    a = ap.parse_args(argv)
    totaal = sum(keur(d, a) for d in a.decks)
    print(f"\n{totaal} dia('s) gemarkeerd")
    return 1 if totaal else 0


if __name__ == "__main__":
    sys.exit(main())
