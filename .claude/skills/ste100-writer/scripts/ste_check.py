#!/usr/bin/env python3
"""ASD-STE100 Issue 9 pre-check: word counts, verb forms and dictionary lookup.

Usage:
  python3 ste_check.py text.txt [--mode auto|procedure|descriptive]
                       [--dict ../references/ste100_dictionary.json]
                       [--terms terms.txt]   # project technical nouns/verbs, one per line
  python3 ste_check.py --lookup ensure check close

Flags CANDIDATES only. The reviewer decides, using the rules and the dictionary.
Rule numbers refer to ASD-STE100 Issue 9 (2025-01-15)."""
import argparse, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DICT = os.path.join(HERE, "..", "references", "ste100_dictionary.json")

ap = argparse.ArgumentParser()
ap.add_argument("file", nargs="?")
ap.add_argument("--mode", default="auto", choices=["auto", "procedure", "descriptive"])
ap.add_argument("--dict", default=DEFAULT_DICT)
ap.add_argument("--terms")
ap.add_argument("--lookup", nargs="+")
a = ap.parse_args()

D = json.load(open(a.dict, encoding="utf-8")) if os.path.exists(a.dict) else {}
if not D:
    print("NOTE: dictionary JSON not found; only structural checks run. "
          "Build it with build_dictionary.py from the official PDF.\n")

def fmt(entries):
    out = []
    for e in entries:
        if e["approved"]:
            s = f"APPROVED ({e['pos']}): {e['meaning']}"
            if e.get("other_meanings_use"): s += f" | other meanings -> {', '.join(e['other_meanings_use'])}"
            if e.get("forms"): s += f" | forms: {', '.join(e['forms'])}"
        else:
            s = f"not approved ({e['pos']}) -> {', '.join(e['alternatives'])}"
        out.append(s)
    return " || ".join(out)

if a.lookup:
    for w in a.lookup:
        print(f"{w}: {fmt(D[w.lower()]) if w.lower() in D else 'NOT IN DICTIONARY (only usable as technical noun/verb, rules 1.5/1.6/1.12)'}")
    sys.exit()

# form -> lemma map from approved inflections
FORMS = {}
for w, lst in D.items():
    for e in lst:
        for f in e.get("forms", []):
            FORMS.setdefault(f.lower(), w)
TERMS = set()
if a.terms and os.path.exists(a.terms):
    TERMS = {l.strip().lower() for l in open(a.terms, encoding="utf-8") if l.strip()}

FUNCTION_OK = {"a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for",
               "from", "by", "with", "this", "these", "that", "it", "its", "you", "your", "is", "are",
               "be", "not", "no", "do", "does", "was", "were", "been", "will", "warning", "caution", "note",
               "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
               "eleven", "twelve", "first", "second", "third"}  # numbers = technical nouns (cat. 9)

def lemma_candidates(w):
    w = w.lower()
    c = [w]
    if w in FORMS: c.append(FORMS[w])
    for suf, rep in (("ies", "y"), ("es", ""), ("s", ""), ("ed", ""), ("ed", "e"), ("ing", ""), ("ing", "e"),
                     ("er", ""), ("est", ""), ("ly", "")):
        if w.endswith(suf) and len(w) > len(suf) + 2:
            c.append(w[: -len(suf)] + rep)
    if re.search(r"(.)\1(ed|ing)$", w):  # stopped -> stop
        c.append(re.sub(r"(.)\1(ed|ing)$", r"\1", w))
    return c

def sentences(block):
    parts = re.split(r"(?<=[A-Za-z)%\]][.!?:])\s+|\n+", block.strip())
    return [p.strip() for p in parts if p.strip()]

def strip_marker(s):
    return re.sub(r"^(\d+[.)]|\([a-z0-9]+\)|[-*•])\s+", "", s)

def word_count(s):
    s = strip_marker(s)
    s = re.sub(r"\([^)]*\)", "X", s)                 # 8.5 parentheses = one word
    s = re.sub(r"[\"“][^\"”]*[\"”]", "X", s)         # 8.6 quoted text = one word
    s = re.sub(r"\b\d+([.,]\d+)?\s?(mm|cm|m|km|kg|g|l|ml|kPa|Pa|bar|psi|V|A|W|kW|Hz|N·m|Nm|°C|°F|%|in|ft|lb)\b", "X", s)  # 8.6
    return len([t for t in s.split() if re.search(r"[A-Za-z0-9]", t)])  # 8.7 hyphenated = one

IMPERATIVE_START = {"if", "when", "before", "after", "while", "make", "do", "set", "put", "turn"}
def kind(s):
    if a.mode != "auto":
        return a.mode
    if re.match(r"^(\d+[.)]|\([a-z0-9]+\))\s", s) or re.match(r"^(WARNING|CAUTION|NOTE)\b", s):
        return "procedure"
    words = [w for w in re.findall(r"[A-Za-z\-]+", strip_marker(s)) if not w.lower().endswith("ly")]
    if not words: return "descriptive"
    f = words[0].lower()
    if f in IMPERATIVE_START: return "procedure"
    ent = D.get(f, [])
    if any(e["pos"] == "v" for e in ent) and not any(e["pos"] in ("n", "adj", "art", "pron") for e in ent):
        return "procedure"
    return "descriptive"

def check_words(tag, s, issues, seen_unknown):
    toks = re.findall(r"[A-Za-z][A-Za-z'’\-]*", strip_marker(s))
    low_s = s.lower()
    # multi-word unapproved entries first (e.g. "in order to", "prior to")
    for w, lst in D.items():
        if " " in w and not any(e["approved"] for e in lst) and re.search(rf"\b{re.escape(w)}\b", low_s):
            issues.append(f"{tag} '{w}' not approved -> {', '.join(lst[0]['alternatives'])} (1.1)")
    covered = {p for w, lst in D.items() if " " in w and not any(e["approved"] for e in lst)
               and re.search(rf"\b{re.escape(w)}\b", low_s) for p in w.split()}
    for i, t in enumerate(toks):
        lw = t.lower().strip("'’")
        if lw in covered:
            continue
        if lw in FUNCTION_OK or lw in TERMS or t.isupper() and len(t) > 1 and not D.get(lw):
            continue  # acronyms / labels are technical nouns (category 15/19) or 8.6 labels
        if "-" in lw and all(p in D or p in TERMS for p in lw.split("-")):
            continue
        found = None
        for c in lemma_candidates(lw):
            if c in D:
                found = (c, D[c]); break
        if not found:
            UNKNOWN.setdefault(lw, tag)
            continue
        base, lst = found
        if all(not e["approved"] for e in lst):
            prev = toks[i - 1].lower() if i > 0 else ""
            prev_adj = any(e["approved"] and e["pos"] == "adj" for e in D.get(prev, []))
            nounish = prev in {"the", "a", "an", "this", "these", "of", "and", "or", "for", "with", "no",
                               "all", "each", "two", "three", "four", "five", "six"} or prev_adj or \
                      (lw != base and lw.endswith("s") and prev not in {"it", "this", "that", "which"})
            if all(e["pos"] == "v" for e in lst) and nounish:
                if lw not in seen_unknown:
                    seen_unknown.add(lw)
                    issues.append(f"{tag} '{t}' as noun: technical noun? (verb not approved -> {', '.join(lst[0]['alternatives'])}) (1.5/1.7)")
                continue
            alts = "; ".join(", ".join(e["alternatives"]) for e in lst)
            issues.append(f"{tag} '{t}' not approved -> {alts} (1.1)")
            continue
        # part-of-speech hints (1.2)
        approved_pos = {e["pos"] for e in lst if e["approved"]}
        unapproved = [e for e in lst if not e["approved"]]
        verb_like = i == 0 or (i > 0 and toks[i - 1].lower() in {"to", "must", "can", "will", "you", "not"})
        if verb_like and "v" not in approved_pos and any(e["pos"] == "v" for e in unapproved):
            alts = ", ".join(next(e for e in unapproved if e["pos"] == "v")["alternatives"])
            issues.append(f"{tag} '{t}' used as verb; approved only as {'/'.join(sorted(approved_pos))} -> {alts} (1.2)")
        elif verb_like and "v" not in approved_pos and approved_pos <= {"n"} and i == 0:
            issues.append(f"{tag} '{t}' starts an instruction but is approved only as noun (1.2)")

issues, seen_unknown, UNKNOWN = [], set(), {}
text = open(a.file, encoding="utf-8").read()
for pi, para in enumerate(re.split(r"\n\s*\n", text)):
    sents = sentences(para)
    kinds = [kind(s) for s in sents]
    if len(sents) > 6 and all(k == "descriptive" for k in kinds):
        issues.append(f"P{pi+1}: {len(sents)} sentences in one paragraph, max 6 (6.6)")
    for si, (s, k) in enumerate(zip(sents, kinds)):
        tag, low, n = f"P{pi+1}S{si+1}", s.lower(), word_count(s)
        limit, rule = (20, "5.1") if k == "procedure" else (25, "6.3")
        if n > limit:
            issues.append(f"{tag} [{k}] {n} words > {limit} ({rule}): {s}")
        if re.search(r"\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?\w+(ed|en)\s+by\b", low) or \
           (k == "procedure" and re.search(r"\b(is|are|was|were|be|been)\s+(\w+ly\s+)?\w+(ed|en)\b", low)):
            issues.append(f"{tag} passive voice{' in procedure' if k == 'procedure' else ' with agent'} (3.6)")
        if re.search(r"\b(has|have|had)\s+(been\s+)?\w+(ed|en)\b", low):
            issues.append(f"{tag} perfect tense (3.2/3.4)")
        if re.search(r"\b(is|are|was|were|be|been|will be)\s+\w+ing\b", low):
            issues.append(f"{tag} progressive tense (3.2/3.4)")
        for m_ in re.finditer(r"(\S+\s+)?\b([a-z]{3,}ing)\b", low):
            prev, w = (m_.group(1) or "").strip(" ,"), m_.group(2)
            if w in D or w in TERMS or w in FUNCTION_OK or prev in {"the", "a", "an", "this", "these", "of"}:
                continue  # probably a technical noun or an approved word
            if any(c in D for c in (w[:-3], w[:-3] + "e", re.sub(r"(.)\1$", r"\1", w[:-3]))):
                issues.append(f"{tag} -ing form '{w}': only as technical noun or modifier (3.5)")
        if ";" in s:
            issues.append(f"{tag} semicolon not permitted (8.1)")
        if re.search(r"\b\w+n['’]t\b|\b\w+['’](re|ll|ve|d|s)\b(?<!['’]s)", low):
            issues.append(f"{tag} contraction (4.2)")
        if re.search(r"\b(note|tip)\b\s*:", low) and re.match(r"^\s*(note|tip)", low) and kind(re.sub(r"^\s*\w+\s*:\s*", "", s)) == "procedure":
            issues.append(f"{tag} note contains an instruction (5.5)")
        if D:
            check_words(tag, s, issues, seen_unknown)

if UNKNOWN:
    issues.append("NOT IN DICTIONARY - confirm each as technical noun/verb (1.5/1.12) or replace (1.1): "
                  + ", ".join(f"{w} [{t}]" for w, t in UNKNOWN.items()))
print("\n".join(issues) if issues else "No flags. Still review the rules manually (one topic per sentence, noun clusters, meanings).")
