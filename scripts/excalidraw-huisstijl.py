#!/usr/bin/env python3
"""Zet een .excalidraw-schema om in een strakke SVG in de huisstijl
van Business Data Solutions.

Excalidraw tekent met een handschriftfont en schetslijnen. Die zitten
vast in de geëxporteerde paden. Dit script tekent het schema daarom
opnieuw vanuit de JSON: dezelfde posities, tekst en pijlen, maar met
het systeemfont, rechte lijnen en het palet uit het stijlboek.

Gebruik:
    python3 scripts/excalidraw-huisstijl.py IN.excalidraw UIT.svg

De .excalidraw blijft de bron. Bewerk die en draai het script opnieuw.
"""
import json
import math
import sys
from html import escape

# ── Huisstijl (stijlboek Business Data Solutions) ──────────────────
INK = "#1a1a1a"          # warm zwart
CREAM = "#f5f0e6"
CREAM_2 = "#f0ebe0"
PAGE = "#f9f8f4"         # off-white pagina
GREY = "#4b5563"
GREY_SOFT = "#6b7280"
LINE = "#e5e7eb"
ACCENT = "#d4db3e"       # chartreuse: alleen als vlak, nooit als tekstkleur
WHITE = "#ffffff"
FONT = ("-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', Roboto, "
        "'Helvetica Neue', Arial, sans-serif")

# Excalidraw-vulkleuren die een kop van een route zijn (donker vlak).
HEADER_FILLS = {"#495057", "#2f9e44", "#e8590c", "#c92a2a", "#1971c2"}
# Gele beslisruit.
DECISION_FILLS = {"#ffd43b", "#ffec99", "#fab005"}
# Tekstkleuren in Excalidraw die als accent bedoeld waren: worden grijs.
ACCENT_TEXT = {"#1971c2", "#2f9e44", "#e8590c", "#c92a2a", "#868e96", "#55565f"}

PAD = 40                 # marge rond het schema
ALPHA = 0.5              # Catmull-Rom: 0 uniform, 0,5 centripetaal
FOOTER_H = 56


def inside(a, b):
    """True als element a geheel binnen element b ligt."""
    return (a["x"] >= b["x"] - 1 and a["y"] >= b["y"] - 1
            and a["x"] + a["width"] <= b["x"] + b["width"] + 1
            and a["y"] + a["height"] <= b["y"] + b["height"] + 1)


def _dist(a, b):
    return math.hypot(b[0] - a[0], b[1] - a[1])


def _unit(a, b):
    """Eenheidsvector van a naar b."""
    l = _dist(a, b) or 1
    return ((b[0] - a[0]) / l, (b[1] - a[1]) / l)


def edge_dir(shape, p, inward):
    """Richting loodrecht op de rand van een vorm, bij punt p.
    inward=True: de vorm in (eind van een pijl); anders eruit (begin)."""
    x, y, w, h = shape["x"], shape["y"], shape["width"], shape["height"]
    dx, dy = p[0] - (x + w / 2), p[1] - (y + h / 2)
    if shape["type"] == "ellipse":
        n = (dx / (w / 2) ** 2, dy / (h / 2) ** 2)
    elif shape["type"] == "diamond":
        ux, uy = abs(dx) / (w / 2), abs(dy) / (h / 2)
        if ux > 0.8:                         # bij de linker- of rechterpunt
            n = (dx, 0)
        elif uy > 0.8:                       # bij de boven- of onderpunt
            n = (0, dy)
        else:                                # op een schuine zijde
            n = (math.copysign(1 / w, dx), math.copysign(1 / h, dy))
    else:                                    # rechthoek: dichtstbijzijnde zijde
        gaps = {(-1, 0): abs(p[0] - x), (1, 0): abs(p[0] - x - w),
                (0, -1): abs(p[1] - y), (0, 1): abs(p[1] - y - h)}
        n = min(gaps, key=gaps.get)
    s = -1 if inward else 1
    l = math.hypot(*n) or 1
    return (s * n[0] / l, s * n[1] / l)


def curve_path(pts, curved, start_dir=None, end_dir=None):
    """Pad door alle punten. Gebogen pijlen krijgen een centripetale
    Catmull-Rom-curve (alfa 0,5). Die schiet niet door en maakt geen
    lusjes, ook niet als de stukken heel verschillend lang zijn.
    start_dir en end_dir zijn de looprichting aan begin en eind. Zo
    vertrekt en landt een pijl loodrecht op de rand van zijn vorm."""
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    if not curved or len(pts) < 3:
        return d + "".join(f" L{x:.1f},{y:.1f}" for x, y in pts[1:])

    def handle(p_from, p_to, p_next):
        """Bézierhandvat bij p_to op het stuk p_from → p_to, met p_next
        als buurpunt (Yuksel, Schaefer & Keyser 2011)."""
        a = ALPHA
        d1, d2 = _dist(p_next, p_to) ** a, _dist(p_from, p_to) ** a
        if d1 == 0 or d2 == 0:
            u, l = _unit(p_to, p_from), _dist(p_from, p_to) / 3
            return (p_to[0] + u[0] * l, p_to[1] + u[1] * l)
        k = 2 * d1 * d1 + 3 * d1 * d2 + d2 * d2
        den = 3 * d1 * (d1 + d2)
        return tuple((d1 * d1 * p_from[j] - d2 * d2 * p_next[j]
                      + k * p_to[j]) / den for j in (0, 1))

    last = len(pts) - 2
    for i in range(last + 1):
        p1, p2 = pts[i], pts[i + 1]
        third = _dist(p1, p2) / 3
        if i == 0:
            u = start_dir or _unit(p1, p2)
            c1 = (p1[0] + u[0] * third, p1[1] + u[1] * third)
        else:
            c1 = handle(p2, p1, pts[i - 1])
        if i == last:
            u = end_dir or _unit(p1, p2)
            c2 = (p2[0] - u[0] * third, p2[1] - u[1] * third)
        else:
            c2 = handle(p1, p2, pts[i + 2])
        d += (f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} "
              f"{p2[0]:.1f},{p2[1]:.1f}")
    return d


def is_elbow(pts, tol=25):
    """True als (bijna) alle stukken horizontaal of verticaal lopen.
    Zulke pijlen zijn in de bron haaks bedoeld, niet als curve."""
    segs = list(zip(pts, pts[1:]))
    straight = sum(1 for (a, b) in segs
                   if min(abs(b[0] - a[0]), abs(b[1] - a[1])) <= tol)
    return len(segs) >= 2 and straight >= len(segs) - 1


def elbow_path(pts, radius=16):
    """Haakse lijn met afgeronde hoeken."""
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(1, len(pts) - 1):
        (ax, ay), (bx, by), (cx, cy) = pts[i - 1], pts[i], pts[i + 1]
        l1 = ((bx - ax) ** 2 + (by - ay) ** 2) ** 0.5 or 1
        l2 = ((cx - bx) ** 2 + (cy - by) ** 2) ** 0.5 or 1
        r = min(radius, l1 / 2, l2 / 2)
        p = (bx - (bx - ax) / l1 * r, by - (by - ay) / l1 * r)
        q = (bx + (cx - bx) / l2 * r, by + (cy - by) / l2 * r)
        d += (f" L{p[0]:.1f},{p[1]:.1f} Q{bx:.1f},{by:.1f} "
              f"{q[0]:.1f},{q[1]:.1f}")
    return d + f" L{pts[-1][0]:.1f},{pts[-1][1]:.1f}"


def tidy(text):
    return text.replace(" -> ", " → ").replace("->", "→")


def rewrap(lines, max_chars):
    """Breek tekst opnieuw af. Excalidraw brak af op de breedte van zijn
    handschriftfont; het systeemfont is smaller. Excalidraw bewaart niet
    welke afbreking bewust was. Vuistregel: een regel die met "(" of "+"
    begint, is bewust een nieuwe regel. De rest wordt opnieuw verdeeld."""
    paras = []
    for line in lines:
        line = line.strip()
        if not paras or line[:1] in ("(", "+"):
            paras.append(line)
        elif paras[-1].endswith("-") and not paras[-1].endswith(" -"):
            paras[-1] += line               # afgebroken woord: aaneen
        else:
            paras[-1] += " " + line
    out = []
    for para in paras:
        cur = ""
        for w in para.split(" "):
            if cur and len(cur) + 1 + len(w) > max_chars:
                out.append(cur)
                cur = w
            else:
                cur = f"{cur} {w}" if cur else w
        if cur:
            out.append(cur)
    return out


def text_block(lines, cx, cy, size, color, weight=400, anchor="middle",
               halo=False):
    """Meerdere regels tekst, verticaal gecentreerd rond cy."""
    lh = size * 1.3
    top = cy - lh * (len(lines) - 1) / 2
    extra = (f' stroke="{PAGE}" stroke-width="5" paint-order="stroke" '
             f'stroke-linejoin="round"') if halo else ""
    out = [f'<text x="{cx:.1f}" font-size="{size}" font-weight="{weight}" '
           f'fill="{color}" text-anchor="{anchor}" '
           f'dominant-baseline="central"{extra}>']
    for i, line in enumerate(lines):
        out.append(f'<tspan x="{cx:.1f}" y="{top + i * lh:.1f}">'
                   f'{escape(line)}</tspan>')
    out.append("</text>")
    return "".join(out)


def convert(src, dst):
    data = json.load(open(src, encoding="utf-8"))
    els = [e for e in data["elements"] if not e.get("isDeleted")]
    by_id = {e["id"]: e for e in els}

    shapes = [e for e in els if e["type"] in ("rectangle", "ellipse", "diamond")]
    containers = [e for e in shapes if e.get("strokeStyle") == "dashed"]

    # Omvang van het schema.
    xs, ys = [], []
    for e in els:
        if e["type"] == "arrow":
            for px, py in e["points"]:
                xs.append(e["x"] + px)
                ys.append(e["y"] + py)
        else:
            xs += [e["x"], e["x"] + e["width"]]
            ys += [e["y"], e["y"] + e["height"]]
    minx, miny = min(xs) - PAD, min(ys) - PAD
    w = max(xs) - min(xs) + 2 * PAD
    h = max(ys) - min(ys) + 2 * PAD + FOOTER_H

    def role(e):
        bg = (e.get("backgroundColor") or "").lower()
        if e in containers:
            return "container"
        if bg in HEADER_FILLS:
            return "header"
        if e["type"] == "diamond" or bg in DECISION_FILLS:
            return "decision"
        if e["type"] == "ellipse":
            return "start"
        if any(inside(e, c) for c in containers):
            return "node"
        if bg in ("#ffffff", "transparent", ""):
            return "node"
        return "endpoint"

    style = {
        "container": dict(fill=CREAM_2, stroke="none", sw=0),
        "header":    dict(fill=INK, stroke=INK, sw=1.5),
        "decision":  dict(fill=ACCENT, stroke=INK, sw=1.5),
        "start":     dict(fill=CREAM, stroke=INK, sw=1.5),
        "node":      dict(fill=WHITE, stroke=INK, sw=1.25),
        "endpoint":  dict(fill=CREAM, stroke=INK, sw=1.25),
    }

    out = [
        # Geen vaste maat: met alleen een viewBox schaalt de browser het
        # schema zodat het altijd binnen het venster past (verhouding blijft).
        # De achtergrond op het root-element vult ook de rand eromheen.
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
        f'width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '
        f'style="background:{PAGE}" font-family="{escape(FONT)}">',
        "<defs>",
        f'<marker id="pijl" viewBox="0 0 10 10" refX="9" refY="5" '
        f'markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0,1 L9,5 L0,9 z" fill="{INK}"/></marker>',
        f'<marker id="pijl-grijs" viewBox="0 0 10 10" refX="9" refY="5" '
        f'markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
        f'<path d="M0,1 L9,5 L0,9 z" fill="{GREY_SOFT}"/></marker>',
        "</defs>",
        f'<rect width="100%" height="100%" fill="{PAGE}"/>',
        f'<g transform="translate({-minx:.1f},{-miny:.1f})">',
    ]

    roles = {e["id"]: role(e) for e in shapes}

    # 1. Vlakken: containers eerst, dan de rest (volgorde uit het bestand).
    ordered = ([e for e in shapes if roles[e["id"]] == "container"]
               + [e for e in shapes if roles[e["id"]] != "container"])
    for e in ordered:
        s = style[roles[e["id"]]]
        x, y, ew, eh = e["x"], e["y"], e["width"], e["height"]
        attrs = (f'fill="{s["fill"]}" stroke="{s["stroke"]}" '
                 f'stroke-width="{s["sw"]}"')
        if e["type"] == "rectangle":
            r = 4 if roles[e["id"]] == "header" else (14 if roles[e["id"]] == "container" else 8)
            out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{ew:.1f}" '
                       f'height="{eh:.1f}" rx="{r}" {attrs}/>')
        elif e["type"] == "ellipse":
            out.append(f'<ellipse cx="{x + ew / 2:.1f}" cy="{y + eh / 2:.1f}" '
                       f'rx="{ew / 2:.1f}" ry="{eh / 2:.1f}" {attrs}/>')
        else:
            out.append(f'<path d="M{x + ew / 2:.1f},{y:.1f} L{x + ew:.1f},'
                       f'{y + eh / 2:.1f} L{x + ew / 2:.1f},{y + eh:.1f} '
                       f'L{x:.1f},{y + eh / 2:.1f} z" stroke-linejoin="round" '
                       f'{attrs}/>')

    # 2. Pijlen.
    for e in els:
        if e["type"] != "arrow":
            continue
        pts = [(e["x"] + px, e["y"] + py) for px, py in e["points"]]
        grey = (e.get("strokeStyle") == "dashed"
                or (e.get("strokeColor") or "").lower() == "#868e96")
        color, marker, sw = ((GREY_SOFT, "pijl-grijs", 1.5) if grey
                             else (INK, "pijl", 1.75))
        m_end = f' marker-end="url(#{marker})"' if e.get("endArrowhead") else ""
        m_start = f' marker-start="url(#{marker})"' if e.get("startArrowhead") else ""
        def bound_dir(key, p, inward):
            target = by_id.get((e.get(key) or {}).get("elementId") or "")
            if target and target["type"] in ("rectangle", "ellipse", "diamond"):
                return edge_dir(target, p, inward)
            return None

        d = (elbow_path(pts) if is_elbow(pts)
             else curve_path(pts, bool(e.get("roundness")),
                             bound_dir("startBinding", pts[0], False),
                             bound_dir("endBinding", pts[-1], True)))
        out.append(f'<path d="{d}" '
                   f'fill="none" stroke="{color}" stroke-width="{sw}" '
                   f'stroke-linecap="round"{m_start}{m_end}/>')

    # 3. Tekst.
    for e in els:
        if e["type"] != "text":
            continue
        lines = tidy(e.get("originalText") or e["text"]).split("\n")
        size = e["fontSize"]
        cont = by_id.get(e.get("containerId") or "")
        if cont and cont["type"] != "arrow":
            r = roles.get(cont["id"], "node")
            color = CREAM if r == "header" else INK
            weight = 600 if r in ("header", "decision", "start") else 400
            # Bruikbare breedte: een ruit of ellips is smaller dan zijn kader.
            usable = cont["width"] * {"diamond": 0.62, "ellipse": 0.84}.get(
                cont["type"], 1) - 24
            room = cont["height"] * {"diamond": 0.7, "ellipse": 0.84}.get(
                cont["type"], 1) - 8
            char_w = 0.56 if weight == 600 else 0.52
            # Het systeemfont is smaller dan Excalifont: vergroot waar het
            # past, verklein als het anders niet past.
            base = size
            for cand in (base + 2, base + 1, base, base - 1, base - 2):
                wrapped = rewrap(lines, max(8, int(usable / (cand * char_w))))
                if len(wrapped) * cand * 1.3 <= room:
                    break
            size, lines = cand, wrapped
            out.append(text_block(lines, cont["x"] + cont["width"] / 2,
                                  cont["y"] + cont["height"] / 2, size,
                                  color, weight))
            continue
        raw = (e.get("strokeColor") or "").lower()
        if size >= 22:                       # sectiekop
            color, weight, size = INK, 700, size + 2
        elif size >= 16:                     # kop van een groep
            color, weight = GREY, 600
        else:                                # label bij een pijl
            color, weight = (GREY if raw in ACCENT_TEXT else INK), 500
        align = e.get("textAlign", "left")
        anchor = {"left": "start", "center": "middle", "right": "end"}[align]
        ax = {"left": e["x"], "center": e["x"] + e["width"] / 2,
              "right": e["x"] + e["width"]}[align]
        cy = e["y"] + e["height"] / 2
        if 16 <= size < 22:                  # kop van een groep: iets hoger,
            cy -= 6                          # vrij van de vakken eronder
        out.append(text_block(lines, ax, cy, size,
                              color, weight, anchor, halo=size < 16))

    out.append("</g>")

    # 4. Voet met merkteken: klein, rechtsonder.
    fy = h - FOOTER_H / 2
    out.append(f'<line x1="{PAD}" y1="{h - FOOTER_H:.0f}" x2="{w - PAD:.0f}" '
               f'y2="{h - FOOTER_H:.0f}" stroke="{LINE}" stroke-width="1"/>')
    lx = w - PAD - 190
    out.append(
        f'<g transform="translate({lx:.0f},{fy - 11:.0f}) scale(0.7)">'
        f'<g fill="{INK}"><polygon points="9,29 11,10 17,10 19,29"/>'
        f'<polygon points="8,8.5 20,8.5 19,10 9,10"/>'
        f'<rect x="11" y="5" width="6" height="3.5"/>'
        f'<path d="M10.5 5 Q10.5 1.5 14 1.5 Q17.5 1.5 17.5 5 Z"/>'
        f'<rect x="13.5" y="0" width="1" height="1.8"/></g>'
        f'<rect x="13" y="6" width="2" height="2" fill="{ACCENT}"/>'
        f'<g stroke="{ACCENT}" stroke-width="2" stroke-linecap="round" '
        f'stroke-linejoin="round" fill="none"><path d="M21 4 L26 7 L21 10"/>'
        f'<path d="M26 4 L31 7 L26 10"/></g></g>')
    out.append(f'<text x="{lx + 28:.0f}" y="{fy:.0f}" font-size="13" '
               f'fill="{GREY_SOFT}" dominant-baseline="central">'
               f'Business Data Solutions</text>')
    out.append("</svg>")

    with open(dst, "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    convert(sys.argv[1], sys.argv[2])
