#!/usr/bin/env python3
"""Build a JSON lookup of the ASD-STE100 Part 2 dictionary from the official PDF.
Usage: python3 build_dictionary.py ASD-STE100_ISSUE9.pdf out.json
Needs pdftotext (poppler-utils).
Output: {word: [{"pos", "approved", "meaning" | "alternatives", "forms"?}]}
Parsing is column-based and good but not perfect: for edge cases, read the PDF page."""
import json, re, subprocess, sys

POS = r"(?:n|v|adj|adv|prep|conj|pron|art|TN|TV)"
ENTRY = re.compile(rf"^(?P<word>[A-Za-z][A-Za-z0-9'’\-\. ]*?(?: \([a-z]+\))?) \((?P<pos>{POS})\),?(?=\s|$)")

pdf, out = sys.argv[1], sys.argv[2]
text = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True, check=True).stdout
lines = text.splitlines()
abaft = next(i for i, l in enumerate(lines) if l.startswith("abaft (prep)"))
start = max(i for i in range(abaft) if lines[i].startswith("A (art)"))
lines = lines[start - 4:]
# join entries whose part of speech wrapped to the next line: "IMMEDIATELY ..." + "(adv) ..."
for i in range(len(lines) - 1):
    m = re.match(r"^([A-Za-z][A-Za-z\-']+)(\s{2,}.*)$", lines[i])
    n = re.match(rf"^(\({POS}\),?)(.*)$", lines[i + 1])
    if m and n and "(" not in m.group(1):
        lines[i] = m.group(1) + " " + n.group(1) + m.group(2)[len(n.group(1)) + 1:] if len(m.group(2)) > len(n.group(1)) + 1 else m.group(1) + " " + n.group(1)
        lines[i + 1] = " " * len(n.group(1)) + n.group(2)

col2, col3 = 19, 48  # defaults; updated from each page header
entries, cur = {}, None
for l in lines:
    if l.startswith("Word ") and "Approved meaning" in l:
        col2 = l.index("Approved meaning"); continue
    if "ALTERNATIVES" in l and "STE EXAMPLE" in l:
        col3 = l.index("STE EXAMPLE"); continue
    if re.match(r"^\s*(Issue 9|Page 2-|2025-01-15|ASD.STE100|\(part of speech\)|Blank Page)", l):
        continue
    if not l.strip():
        continue
    c1, c2 = l[:col2 - 2], l[col2 - 2:col3 - 1]
    m = ENTRY.match(l)
    if m and m.end() <= col2 + 2:
        word, pos = m["word"].strip(), m["pos"]
        approved = word.upper() == word
        cur = {"pos": pos, "approved": approved, "c1": [], "c2": [c2.strip()]}
        entries.setdefault(word.lower(), []).append(cur)
        continue
    if cur:
        if c1.strip():
            cur["c1"].append(c1.strip())
        cur["c2"].append(c2.strip())

def trim(a):
    a = a.split("[")[0].strip()
    m = re.match(rf"^(.*?\({POS}\))", a)
    return m.group(1) if m else re.sub(r"\s{2,}", " ", a).strip()

ALT_RE = re.compile(rf"^([A-Z][A-Z0-9'’\-\. …]*?(?: \({POS}\))?)(?:\s|$)")
result = {}
for w, lst in entries.items():
    out_l = []
    for e in lst:
        items = [i for i in e["c2"] if i and i not in ("For other", "meanings, use:", "For other meanings, use:")]
        forms = [f.strip(", ") for f in " ".join(e["c1"]).split(",") if f.strip(", ") and f.strip(", ").isupper()]
        forms = [f.strip("()") for f in forms]
        if e["approved"]:
            meaning, others = [], []
            for i in items:
                if re.match(rf"^[A-Z][A-Z0-9 \-'’]* \({POS}\)", i):
                    others.append(i)
                elif others:
                    others[-1] += " " + i
                else:
                    meaning.append(i)
            mtext = re.sub(r"\b(?!GR\b)[A-Z]{2,}\b(?!-)\s*", "", " ".join(meaning))  # drop example-column bleed
            mtext = re.sub(r"\s{2,}", " ", mtext).strip()
            d = {"pos": e["pos"], "approved": True, "meaning": mtext}
            if others: d["other_meanings_use"] = [trim(o) for o in others]
        else:
            alts = []
            for i in items:
                if re.match(r"^[A-Z]", i) and not re.match(r"^[A-Z][a-z]", i) or not alts:
                    alts.append(i)
                else:
                    alts[-1] += " " + i
            d = {"pos": e["pos"], "approved": False, "alternatives": list(dict.fromkeys(trim(a) for a in alts))}
        if forms: d["forms"] = forms
        if d not in out_l: out_l.append(d)
    result[w] = out_l

json.dump(result, open(out, "w"), indent=0, ensure_ascii=False)
n_app = sum(1 for l in result.values() for e in l if e["approved"])
n_un = sum(1 for l in result.values() for e in l if not e["approved"])
print(f"{len(result)} headwords; {n_app} approved entries; {n_un} not-approved entries")
