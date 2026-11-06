#!/usr/bin/env python3
"""
Meldt de machinaal vindbare redactiefouten in Nederlandse zakelijke tekst.

Dit script vervangt het redigeren niet. Het vindt vijf soorten fouten die een
regel kan aanwijzen, zodat de lezer zijn aandacht kan besteden aan wat een
oordeel vraagt: circulaire redeneringen, verkeerd benoemde actoren en vage
vragen. Zie faalvormen.md voor die andere kant.

    python3 tekstcheck.py verslag.md
    python3 tekstcheck.py *.html --json
    python3 tekstcheck.py skills/ --recursief
"""

from __future__ import annotations

import argparse
import html as _html
import json
import re
import sys
from pathlib import Path

MAX_ZIN = 25
HERHALING_DREMPEL = 0.60

TELWOORDEN = {"twee": 2, "drie": 3, "vier": 4, "vijf": 5, "zes": 6,
              "zeven": 7, "acht": 8, "negen": 9, "tien": 10}

# Voltooide deelwoorden komen meestal op -d/-t/-en na ge-/be-/ver-/ont-/her-.
DEELWOORD = r"(?:ge|be|ver|ont|her|er)\w+(?:d|t|en)\b|\w+eerd\b|\w+eerde\b"

STOPWOORDEN = {
    "deze", "die", "dat", "het", "een", "van", "voor", "met", "door", "over",
    "wordt", "worden", "zijn", "hebben", "kunnen", "moeten", "niet", "geen",
    "maar", "want", "omdat", "zodat", "dus", "ook", "nog", "wel", "dan",
    "waarin", "waarbij", "waardoor", "daarom", "daarmee", "hierdoor", "echter",
}


# --------------------------------------------------------------------------
# Tekst uit een bestand halen
# --------------------------------------------------------------------------

def leestekst(pad: Path) -> str:
    ruw = pad.read_text(encoding="utf-8", errors="replace")
    if pad.suffix.lower() in (".html", ".htm"):
        ruw = re.sub(r"(?is)<(script|style|svg|pre|code)[^>]*>.*?</\1>", " ", ruw)
        # Lijstitems en tabelcellen eerst markeren: parallelle formulering is
        # daar de bedoeling, en zonder markering ziet F2 ze als proza.
        ruw = re.sub(r"(?i)<li[^>]*>", "\n- ", ruw)
        ruw = re.sub(r"(?i)<t[dh][^>]*>", "\n\u00b7 ", ruw)
        # Inline-tags verdwijnen zonder regeleinde, anders raakt de optietekst
        # los van zijn lijstmarkering en ziet F2 hem alsnog als proza.
        ruw = re.sub(r"(?is)</?(span|strong|em|b|i|a|code|small|sup|sub|abbr|u)\b[^>]*>", "", ruw)
        ruw = re.sub(r"(?s)<[^>]+>", "\n", ruw)
        ruw = _html.unescape(ruw)
    elif pad.suffix.lower() in (".md", ".markdown"):
        ruw = re.sub(r"(?s)```.*?```", " ", ruw)          # codeblokken
        ruw = re.sub(r"^---\n.*?\n---\n", "", ruw, flags=re.S)  # frontmatter
        ruw = re.sub(r"^\s*\|.*$", "", ruw, flags=re.M)   # tabelrijen
        ruw = re.sub(r"`[^`]*`", " ", ruw)                # inline code
    return re.sub(r"[ \t]+", " ", ruw)


LIJSTMARKERING = re.compile(r"^\s*(?:[-*•·]|\d+[.)]|[A-Z][.)])\s+\S")


def zinnen(tekst: str) -> list[tuple[int, str, bool]]:
    """Zinnen met regelnummer en of ze uit een lijstitem komen.

    Dat laatste is nodig voor F2: lijstitems en antwoordopties horen parallel
    geformuleerd te zijn, dus lexicale echo is daar geen fout maar de bedoeling.
    """
    uit, regelnr = [], 0
    for blok in tekst.split("\n"):
        regelnr += 1
        kaal = blok.strip()
        if not kaal or kaal.startswith("#") or re.fullmatch(r"[-=*_]{3,}", kaal):
            continue
        uit_lijst = bool(LIJSTMARKERING.match(kaal))
        kaal = re.sub(r"^\s*(?:[-*•·]|\d+[.)]|[A-Z][.)])\s+", "", kaal)
        for z in re.split(r"(?<=[.!?])\s+", kaal):
            z = z.strip()
            if len(z.split()) >= 4:
                uit.append((regelnr, z, uit_lijst))
    return uit


def inhoudswoorden(zin: str) -> set[str]:
    return {w.lower() for w in re.findall(r"\b[\wÀ-ÿ]{4,}\b", zin)
            if w.lower() not in STOPWOORDEN}


# --------------------------------------------------------------------------
# De vijf controles
# --------------------------------------------------------------------------

def f1_onbepaald_onderwerp(zs):
    """"Wie X doet, doet Y" — de lezer weet niet wie er handelt."""
    uit = []
    for nr, z, _ in zs:
        if re.match(r"^Wie\s+\w+", z) and "," in z:
            uit.append((nr, "F1",
                        "constructie 'Wie …, …' — draagt hij een algemene regel, of "
                        "verbergt hij een specifieke uitvoerder? Bij het tweede: benoem wie",
                        z))
        elif re.match(r"^(Er|Men)\s+(wordt|worden|kan|moet|dient)\b", z):
            uit.append((nr, "F1", "onbepaald onderwerp 'Er/Men wordt …' — benoem de uitvoerder", z))
    return uit


def f2_herhaling(zs):
    """Lexicale echo tussen twee opeenvolgende prozazinnen.

    Let op de grens: dit vindt alleen woordoverlap. Een zin die de vorige
    semantisch herhaalt zonder er een woord mee te delen -- "Deze scheiding is
    bewust" na twee zinnen die dat al zeggen -- ontsnapt hieraan. Zie F7 in
    faalvormen.md; dat blijft oordeelswerk.
    """
    proza = [(nr, z) for nr, z, in_lijst in zs if not in_lijst]
    uit = []
    for (nr1, z1), (nr2, z2) in zip(proza, proza[1:]):
        a, b = inhoudswoorden(z1), inhoudswoorden(z2)
        if len(b) < 3:
            continue
        overlap = len(a & b) / len(b)
        if overlap >= HERHALING_DREMPEL:
            uit.append((nr2, "F2",
                        f"herhaalt {overlap:.0%} van de vorige zin — draagt die nog nieuwe "
                        f"informatie?", z2))
    return uit


def f3_passief_zonder_uitvoerder(zs):
    """"worden vragen geschreven" — door wie?"""
    uit = []
    for nr, z, _ in zs:
        if re.search(rf"\b(wordt|worden|werd|werden)\b(?:(?!\bdoor\b).){{0,60}}?\b({DEELWOORD})",
                     z, re.I) and not re.search(r"\bdoor\b", z, re.I):
            uit.append((nr, "F3",
                        "lijdende vorm zonder uitvoerder — benoem wie of wat het doet", z))
    return uit


def f4_telfout(tekst):
    """Een aangekondigd aantal dat niet klopt met de lijst eronder."""
    uit, regels = [], tekst.split("\n")
    telwoord = "|".join(TELWOORDEN)
    for i, regel in enumerate(regels):
        # Een lijstitem kondigt zijn eigen zusteritems niet aan.
        if LIJSTMARKERING.match(regel):
            continue
        m = re.search(rf"\b({telwoord}|[2-9])\s+([\wÀ-ÿ]{{4,}})", regel, re.I)
        if not m:
            continue
        # "zes van de tien grootste klanten" kondigt geen lijst aan.
        voor = regel[max(0, m.start() - 12):m.start()].lower()
        if re.search(r"\bvan de\s*$|\bvan\s*$|\bop\s*$", voor):
            continue
        # De lijst moet ook direct volgen, niet ergens verderop.
        volgend = next((r.strip() for r in regels[i + 1:i + 4] if r.strip()), "")
        if not (re.match(r"^(?:[-*•]|\d+[.)])\s+\S", volgend)
                or re.match(r"^\*\*[^*]+\.?\*\*", volgend)):
            continue
        aangekondigd = TELWOORDEN.get(m.group(1).lower(), None)
        if aangekondigd is None:
            aangekondigd = int(m.group(1))
        # tel de lijstachtige items direct hieronder
        items, j, gezien_leeg = 0, i + 1, 0
        while j < len(regels) and j < i + 40:
            r = regels[j].strip()
            if not r:
                gezien_leeg += 1
                if gezien_leeg > 2 and items:
                    break
                j += 1
                continue
            if re.match(r"^(?:[-*•]|\d+[.)])\s+\S", r) or re.match(r"^\*\*[^*]+\.?\*\*", r):
                items += 1
                gezien_leeg = 0
            elif items:
                break
            elif gezien_leeg > 1:
                break
            j += 1
        if items >= 2 and items != aangekondigd:
            uit.append((i + 1, "F4",
                        f"kondigt {aangekondigd} aan, maar er volgen {items} onderdelen",
                        regel.strip()[:110]))
    return uit


def f5_engelse_genitief(zs):
    """Cronbach's alfa → Cronbachs alfa."""
    uit = []
    for nr, z, _ in zs:
        # Na een klinker hoort de apostrof er juist wel: Anna's, Rousseau's.
        for m in re.finditer(r"\b([A-Z][a-zà-ÿ]*[^aeiouyAEIOUY\s])'s\b", z):
            uit.append((nr, "F5",
                        f"Engelse genitief \"{m.group(0)}\" — Nederlands schrijft "
                        f"\"{m.group(1)}s\" zonder apostrof", z))
    return uit


def f6_lange_zin(zs):
    uit = []
    for nr, z, _ in zs:
        aantal = len(z.split())
        if aantal > MAX_ZIN:
            uit.append((nr, "F6", f"zin van {aantal} woorden (norm {MAX_ZIN})", z))
    return uit


def controleer(pad: Path) -> list[dict]:
    tekst = leestekst(pad)
    zs = zinnen(tekst)
    bevindingen = (f1_onbepaald_onderwerp(zs) + f2_herhaling(zs)
                   + f3_passief_zonder_uitvoerder(zs) + f4_telfout(tekst)
                   + f5_engelse_genitief(zs) + f6_lange_zin(zs))
    return [{"bestand": str(pad), "regel": nr, "code": code,
             "melding": melding, "fragment": frag[:150]}
            for nr, code, melding, frag in sorted(bevindingen)]


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("paden", nargs="+", type=Path)
    p.add_argument("--recursief", action="store_true", help="mappen doorzoeken")
    p.add_argument("--codes", help="alleen deze codes, bijv. F1,F2,F4")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()

    bestanden: list[Path] = []
    for pad in a.paden:
        if pad.is_dir():
            if a.recursief:
                bestanden += [f for e in ("*.md", "*.html", "*.htm", "*.txt")
                              for f in pad.rglob(e)]
            else:
                print(f"{pad} is een map — gebruik --recursief", file=sys.stderr)
        elif pad.exists():
            bestanden.append(pad)
        else:
            print(f"niet gevonden: {pad}", file=sys.stderr)
    if not bestanden:
        return 1

    wens = {c.strip().upper() for c in a.codes.split(",")} if a.codes else None
    alles = [b for f in sorted(set(bestanden)) for b in controleer(f)
             if not wens or b["code"] in wens]

    if a.json:
        print(json.dumps(alles, ensure_ascii=False, indent=2))
        return 0

    huidig = None
    for b in alles:
        if b["bestand"] != huidig:
            huidig = b["bestand"]
            print(f"\n{huidig}")
        print(f"  r{b['regel']:<5} {b['code']}  {b['melding']}")
        print(f"         “{b['fragment']}”")

    from collections import Counter
    telling = Counter(b["code"] for b in alles)
    print(f"\n{len(bestanden)} bestand(en), {len(alles)} bevinding(en)"
          + (f" — {dict(sorted(telling.items()))}" if telling else " — niets gevonden"))
    return 1 if alles else 0


if __name__ == "__main__":
    raise SystemExit(main())
