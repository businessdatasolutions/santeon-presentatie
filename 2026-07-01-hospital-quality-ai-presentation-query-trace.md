---
type: query-trace
question: "Find wiki content for a presentation to a hospital quality-management network on AI for incident triage and cross-unit patient-safety analysis"
date: 2026-07-01
language: en
trace: "2026-07-01-hospital-quality-ai-presentation-query-trace.json"
pages_used: 8
pages_ignored: 54
---

# Query trace — Hospital quality-management AI presentation

## 1. Question

- **Original:** Help me find content related to my upcoming presentation: The presentation is for a hospital quality management network (quality advisors/managers, ~1.5 hours, frontal with interactive segments), aimed at showing how AI can support their core work — especially incident triage and cross-unit analysis of patient safety reports, where the biggest current bottleneck is manually aggregating data and writing analysis reports across units. It builds on the idea that AI performs best when quality standards and KPIs are made explicit first, framing that documentation effort as a professional (not technical) task and central to "rules of engagement" for using AI. The concrete goal is to leave the audience — who are rule-following rather than exploratory — with a step-by-step, relatable live demo (cross-unit incident analysis) and a feeling that they could start applying this tomorrow.
- **Restated:** What does the wiki contain that can inform a ~90-minute talk to hospital quality managers on using AI for incident triage and cross-unit patient-safety analysis, built on the premise that making quality standards/KPIs explicit is the professional "rules of engagement" precondition for reliable AI, for a rule-following audience who should leave with a concrete, repeatable demo?
- **Facets:**
  1. AI-assisted incident triage / classification of an inbound stream of heterogeneous reports (parallel use cases the wiki holds)
  2. Cross-unit data aggregation and automated analysis-report drafting (document intelligence / extraction + orchestration)
  3. Making quality standards and KPIs explicit as the "rules of engagement" precondition for reliable AI (governance/specification-first framing)
  4. Framing and staging for a rule-following, non-exploratory audience: bounded task scope, staged autonomy, a relatable step-by-step demo, "start tomorrow" feeling

## 2. Paths explored

Retrieval ran via `node scripts/wiki-retrieve.mjs --json -n 12 "<question>"` — qmd hybrid search (10 hits) ∪ `wiki/.graph.json` 1-hop typed-edge traversal, RRF-fused, decay-ranked. 57 candidates returned; graph available, no `graph_warning`. A Step-5 gap check (index.md fallback, one round) added 5 more pages after facets 2 and 3 came back thin among the qmd top hits — see §Ignore policy note below.

**qmd hits** (relevance stream, top 10)

| # | Page | type | qmd score | fused | verdict |
|---|------|------|-----------|-------|---------|
| 1 | `wiki/sources/2026-05-22-anthropic-evals-for-taste-hill-climbing-slide-generation-agent.md` | source | 0.50 | 0.940 | IGNORE |
| 2 | `wiki/sources/2026-03-31-carrier-mit-industrial-ai-that-works-strategy-survival-success.md` | source | 0.38 | 0.925 | IGNORE |
| 3 | `wiki/sources/2025-12-22-randell-gousset-microsoft-agentic-devops-in-real-life.md` | source | 0.37 | 0.910 | IGNORE |
| 4 | `wiki/sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care.md` | source | 0.35 | 0.896 | **USE** |
| 5 | `wiki/entities/Harvard-Business-Review.md` | entity | 0.34 | 0.826 | IGNORE |
| 6 | `wiki/sources/2026-06-16-mollick-simon-sinek-ai-skills-experience-edge.md` | source | 0.34 | 0.869 | IGNORE |
| 7 | `wiki/sources/2026-06-11-mit-smr-agentic-ai-what-leaders-wish-they-knew-sooner.md` | source | 0.33 | 0.856 | IGNORE |
| 8 | `wiki/entities/Y-Combinator.md` | entity | 0.33 | 0.789 | IGNORE |
| 9 | `wiki/sources/2026-06-17-vo-how-i-ai-ai-agent-loops-claude-code-codex.md` | source | 0.33 | 0.831 | IGNORE |
| 10 | `wiki/sources/2026-05-07-kiron-schrage-compound-benefits.md` | source | 0.33 | 0.802 | IGNORE |

**Graph neighbours** (`--hops 1`, typed-edge stream — 47 more candidates; showing the ones actually used or discussed below; the full 47-row ledger is in the JSON trace)

| Page | reached via | fused | verdict |
|------|-------------|-------|---------|
| `wiki/sources/2026-02-01-manditereza-ontology-driven-industrial-ai.md` | carrier-mit-industrial-ai --supports--> this | 0.398 | **USE** |
| `wiki/sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals.md` | peron-philips --supports--> this | 0.350 | **USE** |
| `wiki/concepts/industrial-ai-agents.md` | carrier-mit-industrial-ai --instance-of--> this | 0.342 | IGNORE (redundant) |
| `wiki/sources/2025-11-25-yee-mgi-agents-robots-and-us-skill-partnerships.md` | peron-philips --supports--> this | 0.354 | IGNORE (redundant) |
| `wiki/sources/2026-06-25-guilbeault-stanford-gsb-what-ai-cant-do-and-why.md` | mollick-sinek --supports--> this | 0.302 | IGNORE (redundant) |
| `wiki/sources/2026-06-02-architecting-ai-native-organizations...beutler.md` | mit-smr-agentic-ai-leaders --supports--> this | 0.280 | IGNORE (redundant) |
| *(41 further graph-only candidates: entity catalogue cards and off-facet software-engineering/harness/labor-market sources — full list in JSON)* | | | IGNORE |

**index.md / gap-expansion** (Step 5, one round — facets 2 & 3 were thin in the ledger's top hits)

| Page | why added |
|------|-----------|
| `wiki/concepts/document-intelligence.md` | Facet 2 — names the extraction-accuracy gate + grounding-as-trust-primitive that bounds any cross-unit-aggregation pipeline; not surfaced by qmd or 1-hop graph from this question's seeds |
| `wiki/sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes.md` | Facet 2 — concrete extract→validate→orchestrate demo pattern with a quantified case |
| `wiki/sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents.md` | Facet 3 — literal rule/trigger/check/enforce DSL, the most direct technical instantiation of "rules of engagement" in the wiki |
| `wiki/syntheses/organizational-frameworks-for-ai-adoption.md` | Facets 3 & 4 — Ask→Assist→Automate maturity ladder + governance-ownership rule, a ready staging device |
| `wiki/concepts/jagged-frontier.md` | Facet 4 — bounded-task-fit framing + a supervision-calibration heuristic for a compliance-minded audience |

## 3. Ignore policy applied

- **`off-facet`** — the dominant reason-class this run. The ledger's top qmd hits skew toward the wiki's large agentic-engineering/harness/software-DevOps/labor-market cluster, which shares surface vocabulary with the question ("AI," "agents," "workflow automation") but not its substance (healthcare, incident triage, explicit-standards-first framing). ~35 of 57 candidates fired this class.
- **`wrong-granularity`** — publisher/channel/author entity catalogue cards (Harvard Business Review, Y Combinator, MIT Sloan Management Review, Microsoft, GitHub, and named individuals reached via `published-by`/`part-of`/`authored-by` edges) reached via graph traversal from a qmd hit. These identify *who published* a source, not a claim relevant to any facet.
- **`redundant`** — candidates whose substantive claim is already carried into the wiki by a stronger page already in the USE set: `concepts/industrial-ai-agents` (thin single-source stub restating the Manditereza source directly), the MGI labor-market report and the Guilbeault/Beutler sources (both already cited and summarized inside the Peron and org-frameworks-synthesis pages respectively, so citing the primary already-USE page is stronger than adding the secondary one).

No `superseded` or `decayed` candidates fired this run — none of the 57 ledger candidates carry `status: stale`, and none of the near-miss candidates were uniquely-decayed pages covering an otherwise-uncovered facet.

## 4. Information ignored

*(Full 54-row ledger with individual reasons is in the JSON trace; representative rows below — see `references/ignore-policy.md` for the rubric.)*

| Page | reason-class | one-line reason |
|------|--------------|------------------|
| `wiki/sources/2026-05-22-anthropic-evals-for-taste-hill-climbing-slide-generation-agent.md` | off-facet | evals methodology for a slide-generation coding agent; no healthcare/triage/standards content |
| `wiki/sources/2026-03-31-carrier-mit-industrial-ai-that-works-strategy-survival-success.md` | redundant | industrial-AI adoption-speed thesis already covered by Manditereza (standards) + the adoption-frameworks synthesis (maturity) |
| `wiki/sources/2025-12-22-randell-gousset-microsoft-agentic-devops-in-real-life.md` | off-facet | GitHub Copilot / DevOps demo, no healthcare content |
| `wiki/entities/Harvard-Business-Review.md` | wrong-granularity | publisher catalogue card |
| `wiki/sources/2026-06-16-mollick-simon-sinek-ai-skills-experience-edge.md` | off-facet | general AI-skills/taste discourse for knowledge workers |
| `wiki/sources/2026-06-11-mit-smr-agentic-ai-what-leaders-wish-they-knew-sooner.md` | off-facet | general agentic-AI leadership lessons, no healthcare/standards specificity |
| `wiki/entities/Y-Combinator.md` | wrong-granularity | accelerator catalogue card |
| `wiki/sources/2026-06-17-vo-how-i-ai-ai-agent-loops-claude-code-codex.md` | off-facet | coding-agent loop mechanics |
| `wiki/sources/2026-05-07-kiron-schrage-compound-benefits.md` | off-facet | ROI/iteration economics for coding agents |
| `wiki/concepts/industrial-ai-agents.md` | redundant | thin stub restating the Manditereza source already selected directly |
| `wiki/sources/2025-11-25-yee-mgi-agents-robots-and-us-skill-partnerships.md` | redundant | its finding is already carried via the Peron source's citation of it |
| `wiki/sources/2026-06-25-guilbeault-stanford-gsb-what-ai-cant-do-and-why.md` | redundant | its account is folded into `concepts/jagged-frontier`, cited directly |
| `wiki/sources/2026-06-02-architecting-ai-native-organizations-redesign-work-at-scale-joe-beutler.md` | redundant | its Ask→Assist→Automate ladder is already carried in the org-frameworks synthesis, cited directly |
| ~40 further sources/entities (software-engineering, harness-engineering, DevOps, labor-market, sales, founder-story content reached via qmd or 1-hop graph) | off-facet / wrong-granularity | see JSON trace for the complete per-page listing |

## 5. Information used

| Page | type | effConf | contribution |
|------|------|---------|---------------|
| `wiki/sources/2026-02-01-manditereza-ontology-driven-industrial-ai.md` | source | n/a (source) | explicit-ontology-first thesis, incl. a worked Quality/Inspection/Defect domain example — the technical mirror of "standards and KPIs first" |
| `wiki/sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care.md` | source | n/a (source) | only dedicated healthcare-AI source; names data-standardization as the top barrier; supplies the "AI adds, doesn't replace" reassurance frame |
| `wiki/sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals.md` | source | n/a (source) | concrete hospital-ops triage analogue: fax intake → urgency classification → structured extraction → department routing |
| `wiki/concepts/document-intelligence.md` | concept | 0.72 (stored; not decayed — `accessed_at` 2026-06-15) | names the extraction-accuracy gate and grounding-as-trust-primitive for cross-unit report aggregation |
| `wiki/sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes.md` | source | n/a (source) | concrete extract→validate→orchestrate demo pattern with a quantified efficiency case |
| `wiki/sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents.md` | source | n/a (source) | peer-reviewed rule/trigger/check/enforce DSL — literal "rules of engagement" instantiation |
| `wiki/syntheses/organizational-frameworks-for-ai-adoption.md` | synthesis | 0.90 (stored; fresh) | Ask→Assist→Automate maturity ladder + governance-ownership rule for a staged rollout narrative |
| `wiki/concepts/jagged-frontier.md` | concept | 0.93 (stored; fresh) | bounded-task-fit framing + probability×impact×detectability supervision heuristic for a rule-following audience |

## 6. Answer-element map

| Anchor | Answer element (claim) | Wiki page(s) | Section / span used |
|--------|--------------------------|--------------|----------------------|
| [W1] | Explicit object/property/relationship/action-precondition modeling (an ontology) — including a worked Quality/Inspection/Defect domain — is the precondition industrial AI agents need to reason reliably; "traditional databases store records, ontologies model operational reality" | [[sources/2026-02-01-manditereza-ontology-driven-industrial-ai]] | TL;DR / Domain examples table |
| [W2] | Philips's CMO names "data quality and standardization from the get-go" as the top barrier to healthcare AI, and repeats "AI is here to add, not to take over" | [[sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care]] | TL;DR point 6 / "Recurring Peron frame" |
| [W3] | Luminai's frontline agent triages inbound faxes by urgency, extracts structured data, and routes to the correct hospital department | [[sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals]] | Substantive content §1 |
| [W4] | Generic extraction tops out at 80–90% accuracy vs. the ~99.x% an agentic pipeline needs; grounding (tying outputs to source location) is the trust primitive | [[concepts/document-intelligence]] | ## The accuracy gap / ## Grounding as the trust primitive |
| [W5] | Extraction + orchestration (normalize, validate, route to systems of record) is what removes manual-aggregation pain, quantified at 85% faster / 75% more efficient | [[sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes]] | TL;DR / "octo-zone" orchestration thesis |
| [W6] | AgentSpec formalizes rules of engagement as a rule/trigger/check/enforce DSL, intercepting >90% of unsafe actions at ms overhead | [[sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents]] | TL;DR / The DSL |
| [W7] | Ask → Assist → Automate maturity ladder + "business owns the outcome" governance rule | [[syntheses/organizational-frameworks-for-ai-adoption]] | ## Findings — Deployment-maturity row |
| [W8] | AI is reliable inside a bounded task and unreliable outside it; probability × impact × detectability sets how much supervision a task needs | [[concepts/jagged-frontier]] | ## Practical implications |

## 7. Final answer

The wiki has no source specifically about hospital incident-reporting systems or patient-safety root-cause methodology, but it holds four adjacent clusters that map cleanly onto your four presentation themes.

**1. Incident triage as a structuring problem.** The closest direct analogue is *[[sources/2026-04-09-dinakaran-yc-luminai-automating-americas-biggest-hospitals|Luminai / Cleveland Clinic]]* [W3]: an AI agent sits in front of every incoming fax, classifies it by urgency ("sales spam vs. a thank-you note vs. a high-criticality cancer patient"), extracts structured data, and routes it to the correct one of "thousands of departments." That is structurally identical to incident triage — an inbound stream of heterogeneous reports needing first-pass classification and routing before a human reads them — and it's the single most reusable demo skeleton the wiki holds for your session.

**2. Cross-unit report writing as a document-intelligence problem.** *[[concepts/document-intelligence|document-intelligence]]* [W4] names the two-step chain your bottleneck sits in: (a) extraction accuracy is a hard gate — generic OCR/LLM extraction tops out at 80–90%, well below the "high 99.x%" an agentic pipeline needs before people will trust its output [W4]; and (b) extraction alone isn't the win. *[[sources/2026-05-26-landingai-touchpoint-to-outcome-front-office-processes|LandingAI/TCG's "octo-zone"]]* [W5] shows the orchestration layer — normalize varied inputs, validate, route to systems of record — is where manual-aggregation pain actually disappears, quantified at 85% faster processing / 75% efficiency gain on an insurance claims workflow. That's the nearest wiki analogue to "manually aggregating data and writing analysis reports across units."

**3. Explicit standards as "rules of engagement."** Your central framing has a near-literal technical parallel in *[[sources/2026-02-01-manditereza-ontology-driven-industrial-ai|Manditereza's industrial-AI ontology paper]]* [W1]: agents can't reason reliably about operational reality until someone first defines the object types, properties, relationships, and — crucially — the *action-type preconditions* ("what must be true before this action is allowed, and what state results"). Its own worked example includes a **Quality domain ontology** (Inspection, Defect, Validates, Reports, certification requirements) — i.e., its example *is* your subject matter. Core claim: *"traditional databases store records; ontologies model operational reality."* That is the technical mirror of your framing: writing down quality standards and KPIs *is* building the ontology the AI needs, and it is a clinical/professional modeling task, not an engineering one. For a more literal "rules of engagement" hook, *[[sources/2025-07-31-wang-agentspec-runtime-enforcement-llm-agents|AgentSpec]]* [W6] is a peer-reviewed paper formalizing exactly that phrase as a `rule / trigger / check / enforce` structure (intercepts >90% of unsafe agent actions at millisecond overhead). You likely don't need its implementation detail on stage, but its three-part shape — *when X happens, check Y, then enforce Z (pause for a human / stop / proceed)* — is a clean, non-technical way to make "rules of engagement" concrete: every quality standard becomes one of these three-part rules.

**4. Healthcare grounding and audience framing.** *[[sources/2026-05-31-peron-mit-smr-me-myself-and-ai-philips-interoperability-health-care|Peron / Philips (MIT SMR)]]* [W2] is the wiki's only dedicated healthcare-AI source and gives you language your audience will recognize directly: her named top barrier to healthcare AI is *"data quality and standardization from the get-go"* — your same "explicit standards first" argument, from a clinician rather than an engineer. Her recurring frame *"AI is here to add, not to take over,"* plus the nine-German-women postpartum-blood-loss anecdote (AI as an auditor that flags where a clinical standard's evidence base is thin), are both reassurance devices for a rule-following, risk-averse audience: they show AI strengthening the standards discipline they already value, not replacing their judgment. For staging the rollout so it feels like "start tomorrow" rather than a big-bang change, *[[syntheses/organizational-frameworks-for-ai-adoption|the wiki's adoption-frameworks synthesis]]* [W7] carries the **Ask → Assist → Automate** maturity ladder (read-only suggestions → human-in-the-loop → full autonomy with exceptions routed to humans) plus the governance rule *"if the head of a business unit isn't accountable for the result, you have a demo, not an agent"* — both good scaffolding for naming exactly what tomorrow's first step looks like (Ask-tier: AI drafts the triage classification and cross-unit summary; a human reviews and signs off).

Finally, to keep your promises calibrated for a compliance-minded audience, *[[concepts/jagged-frontier|jagged-frontier]]* [W8] is useful groundwork: AI is reliable inside a bounded, well-specified task and unreliable outside it, and — per the Böckeler heuristic the page cites — how much supervision a task warrants is a function of *(probability of error in this context) × (impact if wrong) × (detectability of the error)*. That's a ready-made three-question checklist for "is this specific triage/aggregation task safe to hand to AI yet," which is exactly the kind of rule-following-friendly decision aid this audience will want.

**Gaps.** The wiki has no source on hospital incident-reporting systems, patient-safety root-cause-analysis methodology, or healthcare quality/accreditation frameworks (Joint Commission, ISO 9001 in a clinical setting, etc.) — those will need to come from outside the wiki. It also has no case study of AI applied to cross-unit aggregation-and-report-writing specifically in a hospital-quality context; the closest analogues are industrial (Manditereza) and hospital-administrative (Luminai/Dinakaran), not hospital-quality-and-safety specifically — worth naming as the boundary of what's "off the shelf" versus what you'll need to adapt.

## 8. Trace artifact

Machine-readable provenance: [`2026-07-01-hospital-quality-ai-presentation-query-trace.json`](2026-07-01-hospital-quality-ai-presentation-query-trace.json)
