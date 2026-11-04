---
type: query-trace
question: "Find wiki content for a presentation to a hospital quality-management network on AI for incident triage and cross-unit patient-safety analysis"
date: 2026-11-04
refreshes: 2026-07-01
language: en
trace: "2026-11-04-hospital-quality-ai-presentation-query-trace.json"
pages_used: 15
pages_ignored: 104
rerun: "2026-11-04 15:00 UTC, after ingest 10c44cf (three Stanford Digital Economy Lab dashboards) and a qmd re-index"
---

# Query trace — Hospital quality-management AI presentation (refresh, 4 Nov 2026)

## 1. Question

- **Original:** Help me find content related to my upcoming presentation: The presentation is for a hospital quality management network (quality advisors/managers, ~1.5 hours, frontal with interactive segments), aimed at showing how AI can support their core work — especially incident triage and cross-unit analysis of patient safety reports, where the biggest current bottleneck is manually aggregating data and writing analysis reports across units. It builds on the idea that AI performs best when quality standards and KPIs are made explicit first, framing that documentation effort as a professional (not technical) task and central to "rules of engagement" for using AI. The concrete goal is to leave the audience — who are rule-following rather than exploratory — with a step-by-step, relatable live demo (cross-unit incident analysis) and a feeling that they could start applying this tomorrow.
- **Restated:** Four months after the first run (2026-07-01), what does the wiki now hold for this talk? Does the July answer still stand, and what has the wiki added since then that the session should use?
- **Facets** (unchanged from the July run, so the two traces can be compared):
  1. AI-assisted incident triage / classification of an inbound stream of heterogeneous reports
  2. Cross-unit data aggregation and automated analysis-report drafting (document intelligence / extraction + orchestration)
  3. Making quality standards and KPIs explicit as the "rules of engagement" precondition for reliable AI (governance / specification first)
  4. Framing and staging for a rule-following audience: bounded task scope, staged autonomy, where a human stays in the loop, a "start tomorrow" feeling

## 2. Paths explored

Retrieval ran twice via `node scripts/wiki-retrieve.mjs --json -n 12 "<question>"`: qmd hybrid search ∪ `wiki/.graph.json` 1-hop typed-edge traversal, RRF-fused, decay-ranked, `today` = 2026-11-04. The graph was available in both runs, with no `graph_warning`.

**This is the second run of the day.** The first run (morning of 2026-11-04) was followed by the user's ingest of three Stanford Digital Economy Lab dashboards (commit `10c44cf`). Both runs were then repeated at 15:00 UTC, after qmd had re-indexed (661 ai-wiki files). The tables below are from that second run.

- **Run L** used the full original question (as in July): 10 qmd hits, **86 candidates**. The first run had 67.
  - `concepts/enterprise-ai-adoption`, enlarged by the ingest, is now qmd hit 9, replacing Diasio. Its graph edges bring in 27 new neighbours, and 8 earlier ones drop out.
  - `jagged-frontier` and the org-frameworks synthesis are now reached this way, so they no longer need the gap check.
- **Run S** used the one-line form from this file's frontmatter: 10 qmd hits, 55 candidates. The candidate set is identical to the first run.
- **Combined:** 114 unique candidates. The Step-5 gap check (`index.md`, one round) adds 5 pages, two of which are the new Stanford dashboards.

Notes:
- **The dashboards are not reached by retrieval.** Neither run reaches the Stanford dashboard pages: qmd does not rank them in the top 10, and they are not one hop from a hit. A check with `--hops 2 --no-bump` reached only the original *Canaries* paper (rank 80 of 226 in run S, rank 137 of 294 in run L). Not the dashboards. They are listed in the newest block of `index.md`, which is how the gap check finds them.
- **Stale qmd paths.** Five qmd hits across the two runs are still URL-encoded entity paths (`entities/Y%20Combinator`, `entities/MIT%20Sloan%20Management%20Review`, `entities/Claire%20Vo`, `entities/AI%20Native%20Dev`, `entities/Stanford%20HAI`) that do not exist on disk. The bump step reports them as "page not found". The re-index did not clear them, so they come from something other than staleness and are worth investigating separately.
- **Off-facet bump.** The first run bumped `accessed_at` on `concepts/founder-led-sales`, an off-facet page.
- **Decay reset.** `concepts/document-intelligence` was decayed in the first run (effective confidence 0.18). Its Step-8 bump from that run restored it to 0.72 in this one.

**qmd hits — Run L** (full question; relevance stream)

| # | Page | type | qmd score | fused | verdict |
|---|------|------|-----------|-------|---------|
| 1 | `wiki/entities/Y%20Combinator.md` *(not on disk)* | entity | 0.50 | 0.880 | IGNORE |
| 2 | `wiki/sources/2025-12-22-randell-gousset-microsoft-agentic-devops-in-real-life.md` | source | 0.33 | 0.925 | IGNORE |
| 3 | `wiki/sources/2026-06-11-mit-smr-agentic-ai-what-leaders-wish-they-knew-sooner.md` | source | 0.25 | 0.910 | IGNORE |
| 4 | `wiki/sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care.md` | source | 0.20 | 0.896 | **USE** |
| 5 | `wiki/entities/MIT%20Sloan%20Management%20Review.md` *(not on disk)* | entity | 0.14 | 0.826 | IGNORE |
| 6 | `wiki/entities/Claire%20Vo.md` *(not on disk)* | entity | 0.13 | 0.813 | IGNORE |
| 7 | `wiki/sources/2025-12-01-marily-nika-pms-who-use-ai-will-replace-those-who-dont.md` | source | 0.11 | 0.856 | IGNORE |
| 8 | `wiki/sources/2026-04-21-forsgren-macvean-build-core-skills-thrive-ai-era-developer.md` | source | 0.10 | 0.825 | IGNORE |
| 9 | `wiki/concepts/enterprise-ai-adoption.md` | concept | 0.09 | 0.866 | IGNORE |
| 10 | `wiki/sources/2026-05-02-dutt-chatterji-ai-experimentation-to-transformation.md` | source | 0.08 | 0.819 | IGNORE |

**qmd hits — Run S** (one-line question; relevance stream; identical to the first run)

| # | Page | type | qmd score | fused | verdict |
|---|------|------|-----------|-------|---------|
| 1 | `wiki/entities/MIT%20Sloan%20Management%20Review.md` *(not on disk)* | entity | 1.00 | 0.880 | IGNORE |
| 2 | `wiki/concepts/responsible-ai.md` | concept | 0.50 | 0.964 | **USE** |
| 3 | `wiki/sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care.md` | source | 0.33 | 0.910 | **USE** |
| 4 | `wiki/sources/2026-05-13-jha-emergent-democratizing-app-building-with-claude.md` | source | 0.25 | 0.839 | IGNORE |
| 5 | `wiki/entities/AI%20Native%20Dev.md` *(not on disk)* | entity | 0.20 | 0.826 | IGNORE |
| 6 | `wiki/entities/Stanford%20HAI.md` *(not on disk)* | entity | 0.17 | 0.813 | IGNORE |
| 7 | `wiki/sources/2026-02-01-manditereza-ontology-driven-industrial-ai.md` | source | 0.14 | 0.856 | **USE** |
| 8 | `wiki/sources/2026-05-12-techlatest-hacker-search-engines-osint-tools-2026.md` | source | 0.13 | 0.843 | IGNORE |
| 9 | `wiki/concepts/founder-led-sales.md` | concept | 0.11 | 0.831 | IGNORE |
| 10 | `wiki/sources/2026-05-02-schoening-lennys-podcast-cultivating-agency-ai-era.md` | source | 0.08 | 0.819 | IGNORE |

**Graph neighbours** (`--hops 1`, typed-edge stream). The table shows the neighbours that were used or discussed; the full ledger is in the JSON trace. Where both runs reach a page, the higher fused score is shown.

| Page | reached via | run | fused | verdict |
|------|-------------|-----|-------|---------|
| `wiki/concepts/agent-oversight-and-delegation.md` | responsible-ai --part-of--> | S | 0.470 | **USE** (new page, created 2026-08-30) |
| `wiki/sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents.md` | responsible-ai --supports--> | S | 0.428 | **USE** |
| `wiki/concepts/document-intelligence.md` | responsible-ai --supports--> (S); enterprise-ai-adoption --part-of--> (L) | L, S | 0.423 | **USE** |
| `wiki/sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals.md` | peron --supports--> | L, S | 0.404 | **USE** |
| `wiki/sources/2026-07-14-keneally-bcg-so-what-llm-or-md-patient-journey.md` | peron --supports--> | L, S | 0.382 | **USE** (new source, ingested 2026-11-04) |
| `wiki/sources/2026-10-20-parikh-google-cloud-hippocratic-ai-voice-agents-healthcare.md` | peron --supports--> | L, S | 0.377 | **USE** (new source, ingested 2026-11-04) |
| `wiki/concepts/jagged-frontier.md` | enterprise-ai-adoption --uses--> | L | 0.262 | **USE** (reached by retrieval in this run; was a gap page) |
| `wiki/syntheses/organizational-frameworks-for-ai-adoption.md` | enterprise-ai-adoption --instance-of--> | L | 0.224 | **USE** (reached by retrieval in this run; was a gap page) |
| `wiki/sources/2025-11-25-yee-mgi-agents-robots-and-us-skill-partnerships.md` | peron --supports--> | L, S | 0.410 | IGNORE (redundant) |
| `wiki/sources/2026-05-28-giles-wp-intelligence-new-human-machine-workforce-agentic-ai-jobs.md` | peron --supports--> | L, S | 0.387 | IGNORE (redundant) |
| `wiki/concepts/automation-vs-augmentation.md` | jha-emergent --supports--> (S); enterprise-ai-adoption --supports--> (L) | L, S | 0.374 | IGNORE (redundant) |
| `wiki/sources/2026-06-02-architecting-ai-native-organizations-redesign-work-at-scale-joe-beutler.md` | mit-smr-agentic-ai, dutt-chatterji --supports--> | L | 0.371 | IGNORE (redundant) |
| `wiki/sources/2026-08-31-blum-how-i-ai-claude-cowork-pm-system.md` | marily-nika --supports--> | L | 0.330 | IGNORE (off-facet) |
| `wiki/sources/2026-09-30-shah-sixtyfour-ai-investigation-agents.md` | techlatest-osint --supports--> | S | 0.305 | IGNORE (off-facet) |
| `wiki/concepts/ai-employment-effects.md`, `micro-productivity-trap`, `technology-adoption-theories`, `syntheses/ai-worker-maturity-levels` | enterprise-ai-adoption --caused/supports--> (L) | L, S | 0.22–0.46 | IGNORE (off-facet / below-threshold) |
| *(about 85 more graph-only candidates: entity cards plus software-engineering, harness, labour-market, sales and founder sources)* | | | | IGNORE |

**index.md / gap-expansion** (Step 5, one round). After the USE set was read, facets 2 and 4 still lacked pages that neither run reached.

| Page | why added |
|------|-----------|
| `wiki/sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes.md` | Facet 2: the extract → validate → orchestrate pattern with a quantified case (carried over from July; not reached by either run) |
| `wiki/concepts/ai-deskilling.md` | Facet 4: who stops learning when AI does the first pass, which the staged-autonomy facet needs |
| `wiki/sources/2026-10-21-stanford-del-canaries-dashboard.md` | Facet 4: payroll evidence on who loses entry-level work where AI is used, for the "who still learns the craft" point (newest `index.md` block; not reached even at 2 hops) |
| `wiki/sources/2026-07-01-stanford-del-adoption-monitor.md` | Facet 4: adoption figures by instrument, for the session's maturity reality check (newest `index.md` block; not reached even at 2 hops) |
| `wiki/sources/2026-10-21-stanford-del-transformation-tracker.md` | read with the other two from the same `index.md` block; IGNORE (off-facet, see §4) |

## 3. Ignore policy applied

- **`off-facet`** — the most common class again. Both runs' qmd hits lean toward the wiki's large cluster of agentic engineering, harness, software-delivery, labour-market and founder content. It shares vocabulary with the question ("AI", "agents", "workflow") but not its substance (healthcare, triage, explicit standards).
- **`wrong-granularity`** — publisher, channel and person catalogue cards, including the five URL-encoded entity paths qmd returned that are not on disk.
- **`redundant`** — candidates whose claim already reaches the answer through a stronger USE page. Examples: Beutler's ladder is carried by the org-frameworks synthesis, MGI by Peron, Giles's skill-erosion point by `ai-deskilling`, and the broad `enterprise-ai-adoption` hub by the atlas trace and the synthesis.
- **`below-threshold`** — graph-only neighbours with `fused_score` < 0.30 that no facet needs.

**USE-set size.** This run uses 15 pages, more than the usual 4–8. That is deliberate for a refresh:
- 8 pages are July's USE set, each re-read and checked against its git history since 2026-07-01. None changed in substance; the edits were link and relationship clean-ups.
- 5 pages are new or newly relevant: two healthcare sources, two concept pages, and `responsible-ai`, the top qmd hit in Run S.
- 2 pages are the Stanford Canaries Dashboard and Adoption Monitor, ingested the same day and added through the `index.md` gap check (§2).

No `superseded` or `decayed` class fired in this run. `concepts/document-intelligence` was decayed in the first run of the day (effective confidence 0.18 against a stored 0.72; last read 2026-07-01). That run's Step-8 bump restored it to 0.72.

## 4. Information ignored

*(The full per-page ledger with reasons is in the JSON trace. Representative rows follow; the rubric is in `references/ignore-policy.md`.)*

| Page | reason-class | one-line reason |
|------|--------------|------------------|
| `wiki/sources/2025-12-22-randell-gousset-microsoft-agentic-devops-in-real-life.md` | off-facet | GitHub Copilot / DevOps demo, no healthcare content |
| `wiki/sources/2026-06-11-mit-smr-agentic-ai-what-leaders-wish-they-knew-sooner.md` | off-facet | general agentic-AI leadership lessons |
| `wiki/sources/2026-05-13-jha-emergent-democratizing-app-building-with-claude.md` | off-facet | consumer app-building with Claude |
| `wiki/sources/2026-05-12-techlatest-hacker-search-engines-osint-tools-2026.md` | off-facet | OSINT search tools |
| `wiki/sources/2026-09-30-shah-sixtyfour-ai-investigation-agents.md` | off-facet | fraud and due-diligence investigation of people and entities. It mentions hospices, but it is the opposite of the "systems, not persons" rule this talk needs |
| `wiki/concepts/founder-led-sales.md` | off-facet | sales; reached by vocabulary overlap only |
| `wiki/sources/2026-05-02-dutt-chatterji-ai-experimentation-to-transformation.md` | redundant | its workflow-not-task thesis is carried in the org-frameworks synthesis [W7]; also outside the session's framework scope |
| `wiki/sources/2026-06-02-architecting-ai-native-organizations-redesign-work-at-scale-joe-beutler.md` | redundant | the Ask→Assist→Automate ladder is cited through the synthesis [W7], as in July |
| `wiki/concepts/enterprise-ai-adoption.md` | redundant | the broad adoption hub (29k words); its maturity figures feed the atlas trace, not this one |
| `wiki/concepts/automation-vs-augmentation.md` | redundant | "AI plus clinicians" reaches the answer directly through Peron and Keneally [W2, W9] |
| `wiki/sources/2025-11-25-yee-mgi-agents-robots-and-us-skill-partnerships.md` | redundant | carried through Peron's citation of it |
| `wiki/sources/2026-05-28-giles-wp-intelligence-new-human-machine-workforce-agentic-ai-jobs.md` | redundant | its skill-erosion prescription is summarised on `ai-deskilling` [W13] |
| `wiki/sources/2026-08-31-blum-how-i-ai-claude-cowork-pm-system.md` | off-facet | individual worker maturity; used in the atlas trace instead |
| `wiki/sources/2026-10-21-stanford-del-transformation-tracker.md` | off-facet | macro indicators for the US economy (productivity, capital share, energy); nothing on organisations, pilots or health care (read via the `index.md` gap check) |
| `wiki/entities/Y%20Combinator.md` (and four other URL-encoded entity paths) | wrong-granularity | catalogue cards; also missing on disk (stale qmd paths) |
| `wiki/entities/MIT-Sloan-Management-Review.md`, `entities/Sam-Ransbotham`, `entities/Microsoft`, `entities/GitHub` | wrong-granularity | publisher and author cards reached via `published-by` / `authored-by` |
| ~75 further sources and concepts (software engineering, harness, labour market, sales, founder stories) | off-facet / below-threshold | see the JSON trace |

## 5. Information used

| Page | type | effConf | status since July | contribution |
|------|------|---------|-------------------|--------------|
| `wiki/sources/2026-02-01-manditereza-ontology-driven-industrial-ai.md` | source | n/a | unchanged | explicit-ontology-first thesis with a worked Quality/Inspection/Defect domain |
| `wiki/sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care.md` | source | n/a | unchanged (links only) | "data quality and standardization from the get-go"; "AI is here to add, not to take over". **No longer the only healthcare source** |
| `wiki/sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals.md` | source | n/a | unchanged (links only) | the hospital-ops triage skeleton: intake → urgency classification → extraction → routing |
| `wiki/concepts/document-intelligence.md` | concept | 0.72 (was 0.18 in the first run: decayed, last read 2026-07-01) | unchanged (source_count 3→7) | the 80–90% vs ~99.x% extraction-accuracy gate; grounding as the trust primitive |
| `wiki/sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes.md` | source | n/a | unchanged | extract → validate → orchestrate, 85% faster / 75% more efficient |
| `wiki/sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents.md` | source | n/a | unchanged (links only) | rule / trigger / check / enforce as a literal "rules of engagement" form |
| `wiki/syntheses/organizational-frameworks-for-ai-adoption.md` | synthesis | 0.90 (stored) | refreshed 2026-07-09 and 07-15 (14 → 20 sources); ladder unchanged | Ask → Assist → Automate + "business owns the outcome" |
| `wiki/concepts/jagged-frontier.md` | concept | 0.95 | **extended** (15 → 22 sources; four new sections) | bounded-task fit; Böckeler's probability × impact × detectability; *new:* the frontier is invisible from inside the task (METR), "talks really well" (Lakhani), the jag is not closing (Allen & McDonald) |
| `wiki/sources/2026-07-14-keneally-bcg-so-what-llm-or-md-patient-journey.md` | source | n/a | **new** (ingested 2026-11-04) | health systems should shape AI, not stop it: publish guidelines for the models and run models behind the firewall on local guidelines; AI removes admin so clinicians keep the relationship |
| `wiki/sources/2026-10-20-parikh-google-cloud-hippocratic-ai-voice-agents-healthcare.md` | source | n/a | **new** (ingested 2026-11-04) | a healthcare vendor's design rules: agents do not diagnose or prescribe, a human joins on real clinical need, one model tests another at volume |
| `wiki/concepts/agent-oversight-and-delegation.md` | concept | 0.85 | **new page** (created 2026-08-30) | where the human gate goes (irreversibility × external visibility), oversight decay (rubber-stamping), never let the agent grade its own homework, accountability drift |
| `wiki/concepts/responsible-ai.md` | concept | 0.95 | extended (135 lines since July) | "Say I don't know" as a design requirement (Turnbaugh); a stated risk appetite before deployment (Hill) |
| `wiki/concepts/ai-deskilling.md` | concept | 0.85 | extended | distributed de-skilling (Goel/BCG); self-automators learn least, so do the first ones by hand (Lakhani) |
| `wiki/sources/2026-10-21-stanford-del-canaries-dashboard.md` | source | n/a | **new** (ingested 2026-11-04, commit `10c44cf`; via `index.md` gap check) | US payroll data to September 2026: early-career employment in the most AI-exposed occupations at 87.7 (Nov 2022 = 100) against 106.7–110.1 in less-exposed ones; small gap across all ages; automation share predicts decline, augmentation share shows no clear relationship |
| `wiki/sources/2026-07-01-stanford-del-adoption-monitor.md` | source | n/a | **new** (ingested 2026-11-04, commit `10c44cf`; via `index.md` gap check) | 61.8% of US adults use generative AI but 15.4% daily; work-use surveys diverge; adoption figures from ~20% to 88% depending on instrument |

## 6. Answer-element map

| Anchor | Answer element (claim) | Wiki page(s) | Section / span used |
|--------|--------------------------|--------------|----------------------|
| [W1] | Explicit modelling of objects, properties, relationships and action preconditions (an ontology), with a worked Quality/Inspection/Defect domain, is the precondition for reliable industrial AI agents; "traditional databases store records, ontologies model operational reality" | [[sources/2026-02-01-manditereza-ontology-driven-industrial-ai]] | TL;DR / Domain examples table |
| [W2] | Philips's CMO names "data quality and standardization from the get-go" as the top barrier to healthcare AI and repeats "AI is here to add, not to take over"; radiologists trained on AI-filtered images may not learn what normal looks like | [[sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care]] | TL;DR point 6 / "Recurring Peron frame" |
| [W3] | Luminai's agent triages inbound faxes by urgency, extracts structured data and routes to the right hospital department | [[sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals]] | Substantive content §1 |
| [W4] | Generic extraction tops out at 80–90% against the ~99.x% an agentic pipeline needs; grounding (tying output to its source location) is the trust primitive | [[concepts/document-intelligence]] | ## The accuracy gap / ## Grounding as the trust primitive |
| [W5] | Extraction plus orchestration (normalise, validate, route to systems of record) is what removes manual aggregation: 85% faster / 75% more efficient | [[sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes]] | TL;DR / "octo-zone" thesis |
| [W6] | AgentSpec formalises rules of engagement as rule / trigger / check / enforce, intercepting >90% of unsafe actions | [[sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents]] | TL;DR / The DSL |
| [W7] | Ask → Assist → Automate ladder plus "if the head of a business unit isn't accountable for the result, you have a demo, not an agent"; the synthesis's 2026-07 refresh adds no new layer | [[syntheses/organizational-frameworks-for-ai-adoption]] | ## Findings: Deployment-maturity row / Refreshed 2026-07-09, 2026-07-15 |
| [W8] | AI is reliable inside a bounded task and unreliable outside it; supervision = probability × impact × detectability (Böckeler); the frontier is invisible from inside the task (METR: developers slowed 19% believed they were 20% faster); the model "talks really well", and GPT-4 argued harder under pushback even when wrong, so ask it to argue against you first (Lakhani); on one strategy benchmark newer models scored worse, so the jag is not closing | [[concepts/jagged-frontier]] | ## Practical implications / ## The 2026 randomised evidence / ## The jag measured without a human in the loop / ## The frontier from one of its authors |
| [W9] | Patients now use LLMs as a first step in care; health systems should shape this, not stop it, by making their guidelines available to public models and running LLMs behind the firewall weighted to local guidelines; "health is a human-to-human contact service", so AI should remove administration and gatekeeping; risk should be weighed against human error (18 years from evidence to practice) | [[sources/2026-07-14-keneally-bcg-so-what-llm-or-md-patient-journey]] | TL;DR 1, 5 / Risk, in proportion / AI plus clinicians |
| [W10] | Hippocratic AI's agents do routine, non-diagnostic outreach, "do not diagnose or prescribe", bring a human in on real clinical need, and are tested by a separate model at volume ("you need another world class reasoning model to test that model"); safety claims are undefined marketing | [[sources/2026-10-20-parikh-google-cloud-hippocratic-ai-voice-agents-healthcare]] | TL;DR 1, 4 / Scope and reliability |
| [W11] | Trust is calibrated per task; the gate trigger is irreversibility × external visibility, not stakes; preview, not permission. Human review decays into rubber-stamping as trust accrues; never let an agent grade its own homework (a weaker model can monitor a stronger one); more than half of 70 leaders say blame goes to AI the moment an error is spotted; an AI's escalation was raised and nobody acted on it | [[concepts/agent-oversight-and-delegation]] | ## Three findings / ## Never let the agent grade its own homework / ## Oversight decay / ## Full delegation tried / ## Accountability that drifts |
| [W12] | "Say I don't know": the dangerous failure is a fluent answer built on an inferred definition, and the countermeasure is a rule in the harness ("do not infer — come back"); the accountable body must state its risk appetite before deploying | [[concepts/responsible-ai]] | ## "Say I don't know" / ## Risk appetite as something a board must state |
| [W13] | Distributed de-skilling: 90% of 70 leaders report over-reliance on output that is not stress-tested, and problem framing and judgment are most at risk; counter-measures include AI-free zones; self-automators learn least, so do the first cases by hand and then watch the machine | [[concepts/ai-deskilling]] | ## Distributed de-skilling, and who stops learning / ## The Peron radiologist gap |
| [W14] | In US payroll data to September 2026, employment of workers aged 22–25 in the most AI-exposed fifth of occupations stands at 87.7 (Nov 2022 = 100) against 106.7–110.1 in the three least-exposed fifths; past about age 34 there is little or no exposure penalty, and across all ages the gap is modest. Among early-career workers the automation share of usage predicts decline, while the augmentation share shows "no clear relationship" (the paper's earlier augmentation-grows-fastest result no longer holds). Early-career home health aides are at 122.0. The dashboard is correlational: its authors find the decline significant only from 2024 and the earlier part "likely driven by non-AI factors"; their August 2026 revision is headlined "No Widespread Displacement, but the AI Employment Gap for Young Workers Has Widened to 19%" | [[sources/2026-10-21-stanford-del-canaries-dashboard]] | TL;DR 1–4, 6 / Key data / Reading the snapshot: "The augmentation result has moved" and "Where the losses are, by age" / Method |
| [W15] | 61.8% of US adults used generative AI in May 2026, but only 15.4% daily, about a quarter of users; work-use surveys diverge (Gallup 52% and BBD 45% rising, Hartley et al. falling from 45.9% to 32.7%); AI-adoption figures in the corpus range from ~20% (OECD firms; 50%+ of big firms, ~17% of small) to 88% (AI Index organisations) because they count different things | [[sources/2026-07-01-stanford-del-adoption-monitor]] | TL;DR 1–3 / Key data / Reading the snapshot: adoption figures by instrument |

## 7. Final answer

**The July answer still stands.** None of the eight pages it rested on has changed in substance since 2026-07-01 [W1–W8]. Since then the wiki has added two healthcare sources, a concept page on where a human must stay in the loop, and new evidence on the jagged frontier [W8–W13]. The additions sharpen the session's "is it safe?" segment and the Ask → Assist → Automate bridge more than the demo.

**1. What still stands.**
- **Demo skeleton.** The closest analogue is still Luminai's triage agent: classify incoming documents by urgency, extract structured data, route them [W3].
- **Accuracy limit.** Generic extraction reaches 80–90% against the ~99.x% an unattended pipeline needs, and grounding (every claim traceable to its source) is what makes output trustworthy [W4]. The aggregation pain is removed by the orchestration layer, not by extraction alone [W5].
- **Rules of engagement.** These are still best shown with Manditereza's ontology-first argument and its Quality/Inspection/Defect example [W1] and AgentSpec's rule → trigger → check → enforce shape [W6].
- **Staging.** It is still Ask → Assist → Automate, with the rule that the business owns the outcome. The synthesis grew from 14 to 20 sources but added no new layer [W7].
- **Supervision heuristic.** Böckeler's probability × impact × detectability is unchanged [W8].
- **One flag.** The `document-intelligence` page had not been read between July and this refresh [W4]. Its confidence decayed in the meantime and has been restored by re-reading it. No newer page contradicts it, but the 80–90% figure is still the oldest number in this answer.

**2. Peron is no longer the wiki's only healthcare source.**
- **Keneally (BCG).** Patients increasingly use AI as their first step in care. He argues that health systems should shape this rather than stop it: make their own guidelines available to public models, and run models behind the firewall that are weighted to local guidelines [W9]. That is the "explicit standards first" thesis seen from health strategy: a guideline that is not written down cannot be picked up by any model.
- **Keneally on clinicians.** He keeps the human core: "health is a human-to-human contact service", and AI should take administration and gatekeeping, not the relationship [W9].
- **Keneally on risk.** He weighs risk against human error, citing an average of 18 years for best practice to reach most patients [W9].
- **Hippocratic AI.** This vendor states design rules that match the session's Ask tier: its agents "do not diagnose or prescribe", a human joins when there is a real clinical need, and a separate model tests the agent at very large volume [W10].
- **Caveat.** Both are a consultancy partner and a vendor speaking on their own channels, not evaluations. Hippocratic's "zero safety issues in production" is undefined [W9, W10].

**3. Where the human stays in the loop now has its own page** [W11].
- **The gate.** Trust is calibrated per task, and the trigger for a human check is *irreversibility × external visibility*, not stakes as such: people guard what cannot be recalled and is seen by others. *Preview* works better than permission granted in advance.
- **Two warnings for an Ask-tier rollout.** First, human review decays: a YC team found it had "started just kind of rubber stamping" its agent's proposals as trust built up. Second, accountability drifts: in a BCG study of 70 leaders, more than half say "the blame goes to AI the moment an error is spot[ted]".
- **The design rule.** Never let an agent grade its own homework. A separate evaluator is needed, and a weaker model can monitor a stronger one.
- **An escalation needs someone who acts on it.** In one all-AI company experiment, the AI raised a warning on day 19 and the human did not act on it.

**4. "Safe for the patient" has sharper evidence.**
- **The frontier can't be seen from inside the task.** In METR's trial, developers who were slowed down 19% believed they had been sped up 20% [W8]. Feeling that it works is not evidence.
- **Fluency is not accuracy.** One of the frontier's authors: the model's intelligence "is not perfect but it talks really well". In the BCG experiment, GPT-4 argued harder when consultants pushed back, even when it was wrong, so he recommends prompting it to argue against you first [W8].
- **The jag is not closing.** On one strategy benchmark, newer models scored below older ones, so re-test with each model release [W8].
- **Design consequences.** The dangerous failure is a fluent answer built on a guessed definition, and the countermeasure is a rule in the harness: "do not infer — come back and say you don't know" [W12]. A board or accountable body has to state its risk appetite before deployment; otherwise whoever writes the policy sets it [W12].

**5. Who stops learning.**
- **Peron's radiology concern** (trainees who only see AI-flagged abnormal images may never learn what normal looks like) now sits in a wider pattern [W2, W13].
- **BCG's "distributed de-skilling".** 90% of 70 leaders report over-reliance on AI output that nobody stress-tests, and problem framing and judgment are the skills most at risk. AI-free zones are among the counter-measures [W13].
- **Lakhani on learning.** Of the ways consultants worked with AI, self-automators learned least. His rule: do the first cases by hand, then let the machine do the rest and learn by watching it [W13].

**6. Labour-market and adoption figures** (from two Stanford dashboards ingested the same day).
- **Starters, not everyone.** In US payroll data to September 2026, employment of 22- to 25-year-olds in the most AI-exposed occupations is 12% below its November 2022 level, while the least-exposed occupations grew 7–10% [W14]. Past about age 34 there is little or no penalty, and across all ages the gap is modest [W14]. That is the labour-market face of the "who still learns" point in section 5.
- **Automation, not augmentation, tracks the decline.** The automation share of usage predicts the drop. The augmentation share shows "no clear relationship": the paper's earlier finding that augmentation-heavy occupations grew fastest no longer holds [W14]. The data do *not* show that working with AI protects jobs.
- **Relational care work is growing.** Early-career home health aides are up 22% since late 2022 [W14]. No hospital or quality occupations are reported separately.
- **Correlation, not cause.** The authors find the decline significant only from 2024 and call its earlier part "likely driven by non-AI factors". Their August 2026 revision is headlined "No Widespread Displacement, but the AI Employment Gap for Young Workers Has Widened to 19%" [W14].
- **Adoption is broad but shallow.** 61.8% of US adults use generative AI, but only 15.4% daily [W15]. Work-use surveys disagree on the direction of travel [W15]. Adoption figures in the wiki run from about 20% to 88% depending on what is counted, so no adoption figure should be quoted without its instrument [W15].

**What this means for the session.** Each point below is an inference from the claims above, not a wiki claim:
- **The Ask tier needs a guard against rubber-stamping**, not just a human signature [W11].
- **Automate-tier actions that are unrecallable and visible to others** (such as informing departments) should keep a preview [W11].
- **The demo's follow-up-question loop and its separate verifier** are the "say I don't know" and "don't grade your own homework" rules in action [W11, W12].
- **Having the room score VIM-2026-0505 before seeing the agent** follows the do-it-by-hand-first order [W13].
- **The case for starting at Ask rests on oversight and learning, not on job protection.** The payroll data link automation-heavy use to fewer starter jobs, but do not show augmentation protecting them [W14].
- **The reality check gains a rule of thumb for the room:** ask what an adoption figure measures [W15].

**Gaps.** These are unchanged from July:
- There is still no source on hospital incident-reporting systems, patient-safety root-cause methodology, or clinical quality frameworks.
- There is still no case of AI doing cross-unit aggregation and report writing in hospital quality and safety.
- The two new healthcare sources are about patient-facing care and outreach, not quality management [W9, W10].
- The Stanford figures are US data. The payroll data do not report hospital or quality occupations separately [W14], and the Adoption Monitor has no sector breakdown [W15].
- The Dutch legal anchors the session uses (Wkkgz, KNMG "veilig melden") come from outside the wiki, from the session's own background material.

## 8. Trace artifact

Machine-readable provenance: `inspiration/2026-11-04-hospital-quality-ai-presentation-query-trace.json` in the ai-wiki repository. The run this refreshes is `inspiration/2026-07-01-hospital-quality-ai-presentation-query-trace.{md,json}`.
