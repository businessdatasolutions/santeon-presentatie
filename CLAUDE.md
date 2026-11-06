# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Material for a 90-minute plenary session, "AI en kwaliteitsmanagement in de zorg", at the Santeon-inspiratiedag (10 November 2026, Maasstad Ziekenhuis, Rotterdam). The audience is 60+ registered quality advisors and managers from all Santeon hospitals. They follow rules more than they explore, and they are unsure what AI can do for incident reporting. The goal is that they leave thinking "ik zou hier morgen mee kunnen beginnen". The tone is concrete and step by step, with no hype.

It is mostly content, not a software project. The only tooling is a small Vite server for presenting locally (see below). There is no build, linter or test suite. All user-facing content is in **Dutch** and uses Dutch patient-safety terms: VIM (Veilig Incident Melden), SAC-score, PRISMA, IGJ, calamiteit, SIRE, NEN 8009. Keep new content in Dutch.

## Public repo: keep confidential files out

`.gitignore` notes that the repo is public. The quote (`Offerte*.pdf`, `2026-07-04-offerte-santeon.html`), the pitch email, `notes-22-06-2026.md` and `.env` (which holds `ANTHROPIC-API-KEY`) are on disk in `background-material/` but must never be staged or committed. The ignore patterns match basenames, so they apply in any folder. Do not quote their contents into tracked files either.

## Running the presentation locally

```
npm install    # once
npm start      # Vite on http://localhost:5173, opens the start page
npx esbuild src/main.jsx --bundle --outfile=/dev/null --log-level=warning   # syntax + import check of the demo
```

- `index.html` is the start page. It links every part in session order and shows an AI-connection check. The check calls `/api/status`, which fetches `/v1/models/{DEMO_MODEL}`, so it costs no tokens.
- `demo.html` and `src/main.jsx` mount the demo. `main.jsx` rewrites `fetch` calls to `https://api.anthropic.com/` into `/api/anthropic/`. `vite.config.js` proxies those calls and adds `x-api-key` (from `.env`, as `ANTHROPIC-API-KEY` or `ANTHROPIC_API_KEY`) and `anthropic-version` on the server side.
- Keep local-only code out of `vim-okf-simulatie.jsx`, so it still runs unchanged as a claude.ai artifact. `DEMO_MODEL` in `vite.config.js` must match the model in the JSX.
- Never put the key in a `VITE_`-prefixed variable or the browser. Never start the server with `--host`: that would open the proxy, and thus the key, to everyone on the venue network.
- The hosted copy at https://witusj.github.io/vim-okf-simulatie/ is a separate, older deployment with no API key, so it shows only the fallback. Present from the local server.
- The atlas (`background-material/2026-07-01-ai-maturity-frameworks-visuals.html`) loads d3, rough.js and mermaid from pinned copies in `background-material/vendor/`. That makes it work offline and from `file://`. Don't go back to CDN URLs: the unpinned `d3.v7.min.js` URL changed version and its integrity hash then blocked d3.

## Source of truth

`2026-07-04-sessie-outline.md` is the authoritative session plan: timed blocks with speaker notes. An identical copy is in `background-material/`. Commits change both copies together, so edit both and keep them byte-identical. The outline is written in STE100-style Dutch (short sentences, one instruction per sentence). Keep that style when you edit it. Scope decisions recorded there that other work must respect:
- Structure (Golden Circle): Opening (5) → **Waarom** (10) → **Hoe** (30: expliciete regels, drie veiligheidsvragen, Ask → Assist → Automate) → **Wat** (35: live demo + interactive segment) → Afsluiting (10). This maps onto the project's fixed structure as follows: Waarom + Hoe 2a–2b = Deel 1, Hoe 2c = Brug (Ask → Assist → Automate applied to the VIM workflow, Route 3 cross-unit trend analysis), Wat = Deel 2.
- Use only the "kernspine" frameworks (maturity reality check from section 0 of the atlas, Ask→Assist→Automate from section 9). The other atlas frameworks are deliberately excluded.
- The live demo must stay at the **Ask** tier: the AI signals, and a human decides. Calamities and borderline cases always go to a human.
- The network's question "is AI veilig — ja of nee?" is answered as three questions (veilig voor de gegevens / de patiënt / de melder), each tied to the audience's own rules: Wkkgz art. 9 and 11 and KNMG "veilig melden". Participants never enter real incident reports into the demo.
- The deliverable is a session flow with speaker notes, not a slide list. The fee proposal is out of scope.

`background-material/2026-07-01-hospital-quality-ai-presentation-query-trace.md` records where the cited sources come from (the outline's "Bronnen" table cites this file). The copy with the same name in the repo root is a stale snapshot from the first commit. Don't update or cite it. `background-material/2026-11-06-kritiek-op-ai-inzet-query-trace.md` is a separate trace of the common criticisms of AI (input / gebruik / output / tertiaire effecten), with evidence for and against. Use it when preparing answers to sceptical questions. Both were retrieved from an external wiki whose tooling (`scripts/wiki-retrieve.mjs`) is not in this repo.

`background-material/` holds the sources: VIM guides (NVZ, NIVEL, VMS), KNMG "veilig melden", the Wkkgz, NEN 8009 notes, PSEBench, the VIM workflow diagram (`vim-workflow.excalidraw` / `.svg`, which defines the Routes and Eindpunten the outline refers to), and `2026-07-01-ai-maturity-frameworks-visuals.html` (the "atlas"). `psebench-features.md` holds the design notes behind the demo agent's ASK loop, verification and escalation features.

## The two demo artifacts

They share incident IDs and a colour palette: petrol neutrals, SAC 1–4 colours, and a single bold accent `#6D4AFF` that is **reserved for the AI agent**. When you change incident text or outcomes in one file, update the other.

### `vim-okf-simulatie.jsx`: the live demo (Deel 2)

A single-file React component (`export default function App`) that depends on `react`, `recharts` and `lucide-react`. Locally it is served through `demo.html` (see above).

The architecture follows the story the demo tells: **data lake → semantische laag/ontologie → OKF-kennisbundel → AI-triage-agent → rapportage**. Each stage is one panel (`LAYERS` drives the sidebar; `ArchPanel`, `LakePanel`, `OntoPanel`, `OkfPanel`, `AgentPanel`, `ReportPanel`).

- **Data:** `INCIDENTS` holds the fictional hospital "St. Machteld" free-text reports. `OKF` holds knowledge atoms keyed by filename (metadata plus a Markdown `body`). Two incidents are **deliberately flawed** and should not be "fixed". VIM-2026-0501 is incomplete and must trigger the ASK loop. VIM-2026-0505 is contradictory and must produce `escalatie: true`.
- **Agent pipeline (`agentTriage`):**
  1. An ASK/ANSWER loop. The agent may ask questions of `infoProviderAnswer`, a stateless oracle that answers only from the report text, up to `MAX_ASK_TURNS`. After that, an answer is forced.
  2. A verify-and-retry loop (`verifyTriage`, `MAX_VERIFY_RETRIES`) that checks the answer against the OKF runbook.
  3. `normalizeTriage`.
  
  `judgeRationale` (LLM-as-judge) runs separately from `AgentPanel`. `ReportPanel.genSummary` makes its own API call.
- **The prompt is built from a hard-coded subset of `OKF` keys** (the filter list in `agentTriage`, plus `metric-severity-assessment-code.md` in `verifyTriage`). Renaming an OKF atom means updating those references too.
- **Keep these in sync:** the JSON schema in the system prompt; the enums `SAC`, `CAT`, `PRISMA` and `BOUNDARY_CONDITIONS`; `normalizeTriage`; and `ruleBasedTriage`.
- **API calls** go straight to `https://api.anthropic.com/v1/messages` with no key header, using model `claude-sonnet-4-6` (hard-coded in `callClaudeJSON`, `callClaudeText` and `genSummary`). They only succeed in a host that proxies the API: the local Vite server or a claude.ai artifact.
- **Offline fallback:** any error in `agentTriage` falls back to the keyword-based `ruleBasedTriage`, which is flagged `_fallback` / `_error` in the UI, and an unreachable verifier does not block. This keeps the demo working offline on stage. Keep this behaviour.

### `vim-agent-animatie.html`: scripted walkthrough

Self-contained vanilla HTML, CSS and JS with no network calls. Open it directly in a browser. It replays five cases (`CASES`) with hard-coded results that show the same pipeline step by step: extraction, boundary condition with quote, verify fix, judge score, and IGJ escalation. Its CSS variables mirror the `C` palette object in the JSX.
