---
name: ste100-writer
description: Review English technical text against ASD-STE100 Simplified Technical English (Issue 9), or write and rewrite procedures, descriptions and safety instructions in STE.
---

# ASD-STE100 reviewer and writer (Issue 9)

Use this skill when the user asks to check, score, rewrite or write text in Simplified Technical English (STE, ASD-STE100), or asks for manuals, work instructions, maintenance procedures, safety instructions or technical descriptions "in STE".

STE applies to English. Answer in the user's language (often Dutch); keep the STE text itself in English. If the source text is Dutch, translate it into STE English.

## Files in this skill

- `scripts/ste_check.py` - pre-check: word counts (rules 5.1/6.3 with the counting rules of section 8), verb forms, -ing, semicolons, contractions, and a full lookup in the Part 2 dictionary (approved words, part of speech, not-approved words with their approved alternatives).
- `references/ste100_dictionary.json` - the Issue 9 dictionary (about 875 approved and 1274 not-approved words), extracted from the official PDF. Private reference: do not publish or redistribute it.
- `scripts/build_dictionary.py` - rebuilds the JSON from a new issue of the PDF (`python3 build_dictionary.py ASD-STE100_ISSUE9.pdf ../references/ste100_dictionary.json`).

Run the scripts from the skill folder (copy it to a working directory if the skill folder is read-only):

```
python3 scripts/ste_check.py text.txt [--mode auto|procedure|descriptive] [--terms terms.txt]
python3 scripts/ste_check.py --lookup check test ensure
```

`--terms` takes the project's technical nouns and verbs (one per line) so they are not flagged.

## Authority and honesty

- Issue 9 (2025-01-15) is an international standard: Part 1 has 53 writing rules in 9 sections plus 8 general recommendations (GR-1 to GR-8); Part 2 is the dictionary. Issue 9 added rule 4.5 (articles), moved old rule 2.3, and reclassified technical names as **technical nouns** (22 categories) next to **technical verbs** (4 categories).
- The dictionary JSON is parsed from the PDF and is reliable but not perfect. When a decision depends on a subtle meaning, or the JSON looks garbled, say so and, if the PDF is available, read the dictionary page.
- A word that is approved is approved only with **one meaning and one part of speech**. "Approved" in the JSON is not enough: compare the meaning in the text with the approved meaning.
- The checker flags candidates. You make the final judgement; remove false positives (for example a technical noun that ends in -ing, or a word the user confirms as a technical noun).
- Paraphrase the standard; do not reproduce long passages.

## The rules (Issue 9 numbering)

**Section 1 - Words**
- 1.1 Use only words that are approved in the dictionary, technical nouns or technical verbs.
- 1.2 Use an approved word only as its specified part of speech (e.g. TEST and CHECK are nouns: "Do a test of ...", not "Test the ...").
- 1.3 Use an approved word only with its approved meaning (e.g. FOLLOW = come after; for instructions use OBEY).
- 1.4 Use only the approved forms of verbs and adjectives (given in the dictionary).
- 1.5 You can use technical nouns: words that fit one of the 22 categories (official parts; vehicles/machines and locations; tools and support equipment; materials and consumables; facilities and logistics; systems, components, circuits; mathematical/scientific/engineering terms; navigation and geography; numbers, units and time; quoted text; roles, persons, organizations; body parts; personal effects, food, beverages; medical terms; documents and standards; environmental and operational conditions; colors; damage terms; computer science and ICT; civil and military operations; law and regulations; animals and plants).
- 1.6 Use a not-approved word only when it is (part of) a technical noun.
- 1.7 Do not use technical nouns as verbs ("Grease the bearing" -> "Apply grease to the bearing").
- 1.8 Use technical nouns that are approved in the company, industry or subject field.
- 1.9 When you must select a technical noun, select a short, easy one.
- 1.10 No regional, slang or jargon words as technical nouns.
- 1.11 Do not use different technical nouns for the same item.
- 1.12 You can use technical verbs in 4 categories: manufacturing processes (drill, solder, weld, polish ...); computer processes and applications (click, type, save, install, upload ...); subject-field processes (engineering, medical, civil/military, navigation, automotive/railway, energy); law and regulations (only in legal/regulatory texts).
- 1.13 Do not use technical verbs as nouns.
- 1.14 Use American English spelling unless official directives say otherwise.

**Section 2 - Multi-word nouns**
- 2.1 Write multi-word nouns of no more than three words. Break longer ones up with prepositions ("the fuel pump inlet valve seal" -> "the seal of the inlet valve on the fuel pump").
- 2.2 When a technical noun has more than three words, write it in full (do not shorten it into jargon).

**Section 3 - Verbs**
- 3.1 Use only the verb forms that the dictionary gives.
- 3.2 Permitted: infinitive, imperative, simple present, simple past, simple future, past participle as adjective. Not permitted: perfect and progressive tenses, "would/should/may/shall" (use CAN or MUST).
- 3.3 Use the past participle as an adjective ("the damaged seal", "the valve is closed").
- 3.4 Do not use auxiliary verbs to make complex verb constructions ("you will have to ...", "must have been ...").
- 3.5 Use the -ing form only as a technical noun or as a modifier in a technical noun ("bearing", "cooling system").
- 3.6 Use the active voice. In descriptive writing, use the passive only when the agent is unknown. Never passive in procedures.
- 3.7 Use an approved verb for an action, not a noun ("make an adjustment" -> "adjust").

**Section 4 - Sentences**
- 4.1 Write short, clear sentences.
- 4.2 Do not omit words (articles, "that", verbs) or use contractions to make sentences shorter.
- 4.3 Use vertical lists for complex text.
- 4.4 Use connecting words and phrases (then, but, because, as a result) to connect sentences with related topics.
- 4.5 When applicable, put an article (the, a, an) or a demonstrative adjective (this, these) before a noun or multi-word noun.

**Section 5 - Procedural writing**
- 5.1 Maximum 20 words per sentence.
- 5.2 One instruction per sentence, unless two or more actions occur at the same time.
- 5.3 Write instructions in the imperative.
- 5.4 When there is a condition the reader must know first, start with that descriptive statement, then a comma, then the command ("If the light comes on, stop the engine.").
- 5.5 Notes give information only, not instructions.

**Section 6 - Descriptive writing**
- 6.1 Give information gradually (general before specific, known before new).
- 6.2 Use key words and key phrases to give the text a logical structure.
- 6.3 Maximum 25 words per sentence.
- 6.4 Use paragraphs to show related information.
- 6.5 One topic per paragraph.
- 6.6 Maximum six sentences per paragraph.

**Section 7 - Safety instructions**
- 7.1 Identify the level of risk with an applicable word: WARNING = risk of injury or death; CAUTION = risk of damage to objects. Other domains may use DANGER/NOTICE or ISO 3864/ANSI Z535 symbols; rules 7.1-7.3 still apply.
- 7.2 Start with a clear and accurate command or condition.
- 7.3 Then give an explanation that shows the risk or possible result.

**Section 8 - Punctuation and word count**
- 8.1 All standard punctuation is permitted except the semicolon.
- 8.2 Use hyphens to connect words that are directly related.
- 8.3 Parentheses only for: references to illustrations/text, item identifiers, work-step identifiers, abbreviations, singular/plural forms together, explanations, alternatives.
- 8.4 In a vertical list, a colon counts like a period (end of sentence).
- 8.5 Text in parentheses counts as one word.
- 8.6 Count as one word: a number, a number with its unit, an abbreviation, an alphanumeric identifier, quoted text, a title/heading/placard/label, a proper noun.
- 8.7 A hyphenated word counts as one word.

**Section 9 - Writing practices**
- 9.1 When a word-for-word replacement does not work, use a different sentence construction.
- 9.2 Use each approved word correctly (meaning and part of speech).
- 9.3 Do not make phrasal verbs from two approved words ("set up", "carry out", "fill in" -> one approved verb).
- 9.4 Use a consistent style in terminology and wording.
- General recommendations: GR-1 the conjunction "that" (keep it); GR-2 the preposition "with" (use it carefully, it is ambiguous); GR-3 pronouns (only pronouns from the dictionary, no "he/she"; the reference must be clear); GR-4 the pronoun "this" (if it can refer to more than one item, repeat the noun); GR-5 false friends (check the English meaning, important for Dutch writers: "control" is not "controleren"); GR-6 Latin abbreviations (no e.g., i.e., etc.; write "for example", "that is", "and so on"); GR-7 inclusive, gender-neutral language; GR-8 possessive form (permitted, but if you are not sure it is correct, do not use it).

### Frequent errors (from the dictionary's list of recurring errors)
acceptable -> PERMITTED; avoid -> PREVENT; check (v) -> MAKE SURE / EXAMINE / "do a check"; test (v) -> "do a test"; damage (v) -> "cause damage"; ensure -> MAKE SURE; fit -> INSTALL; follow (instructions) -> OBEY; further -> MORE; have to -> imperative verb; however -> BUT; insert -> PUT; main -> PRIMARY; may -> CAN; need -> NECESSARY; now -> AT THIS TIME; over -> ABOVE/ON/ALONG; perform -> DO; press -> PUSH; reach -> GET; repeat -> DO ... AGAIN; required -> NECESSARY; rotate -> TURN; secure -> ATTACH; shall/should -> MUST; since -> BECAUSE; therefore -> THUS / AS A RESULT; under -> BELOW / IN / LESS THAN; using -> USE / WITH.

## Workflow

1. **Classify** each part: procedure (instructions), descriptive text, safety instruction, note. Ask only if truly unclear.
2. **Collect technical nouns and verbs**: ask for (or infer and list) the project's terms; put them in a `terms.txt` for the checker.
3. **Run the checker** on the original. Trust the script for word counts; LLMs miscount.
4. **Review manually** for what a script cannot see: approved meaning (1.3), part of speech in context (1.2), multi-word nouns (2.1), one topic per sentence (4.1), one instruction per step (5.2), condition first (5.4), notes vs instructions (5.5), information order (6.1), safety structure (7.1-7.3), terminology consistency (1.11, 9.4), phrasal verbs (9.3). Use `--lookup` for any word you are not sure about.
5. **Rewrite** in STE. Keep the technical meaning exactly; never invent technical data. If the original is ambiguous (who does what, which part, which value), ask or mark `[CHECK: ...]`.
6. **Re-run the checker** on the rewrite and fix what remains. Report technical nouns/verbs you used.

## Output formats

**Review mode** ("check / beoordeel deze tekst"):
1. Verdict: compliance High / Medium / Low, plus the 3 most frequent problem types.
2. Findings table: `# | Original fragment | Problem | Rule | Proposed STE text`. Group repeated problems instead of listing each one.
3. The complete rewritten text in STE.
4. Terms to confirm: technical nouns/verbs used (with category number), and open questions.

**Write mode** ("write a procedure for ..."): numbered steps; WARNING/CAUTION directly before the step it applies to; then a short list of technical nouns/verbs used and assumptions made.

**Teach mode** (on request, for example for students): for each finding, one sentence on why the rule exists (ambiguity, translation, non-native readers, safety).

## Example

Original: "Prior to commencing maintenance, ensure that the electrical power has been disconnected; failing to do so could result in injury."

STE:
> WARNING: DISCONNECT THE ELECTRICAL POWER BEFORE YOU START THE MAINTENANCE PROCEDURE. ELECTRICAL SHOCK CAN CAUSE INJURY.

Findings: "prior to" -> BEFORE, "commencing" -> START, "ensure" -> MAKE SURE (1.1); perfect passive (3.2, 3.6); -ing forms (3.5); "could" not in dictionary -> CAN (1.1); semicolon (8.1); two topics in one sentence (4.1); safety text without signal word, command and risk structure (7.1-7.3).
