// Controle na vite build: staat er iets in dist/ dat niet openbaar mag?
// dist/ gaat naar GitHub Pages, en die site is voor iedereen te lezen.
// - Elke waarde uit .env (als dat bestand er is: lokaal wel, in GitHub Actions niet).
// - Patronen die nooit in de openbare versie horen: een Anthropic-sleutel, het proxypad,
//   de statuscheck en een Cloud Run-adres (de stemtool).
// - Namen van vertrouwelijke bestanden (zie .gitignore).
// Het script toont nooit een gevonden waarde, alleen wat het is en in welk bestand.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";

const DIST = "dist";

const verboden = [
  { wat: "een Anthropic-sleutel (sk-ant-)", tekst: "sk-ant-" },
  { wat: "het proxypad /api/anthropic", tekst: "/api/anthropic" },
  { wat: "de statuscheck /api/status", tekst: "/api/status" },
  { wat: "een Cloud Run-adres (.run.app)", tekst: ".run.app" },
];

if (existsSync(".env")) {
  for (const regel of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = regel.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    const waarde = m[2].replace(/^(['"])(.*)\1$/, "$2");
    if (waarde.length >= 8) verboden.push({ wat: `de waarde van ${m[1]} uit .env`, tekst: waarde });
  }
}

const vertrouwelijk = [/offerte/i, /pitch-mail/i, /notes-22-06-2026/i, /^\.env/];

function* bestanden(map) {
  for (const naam of readdirSync(map)) {
    const pad = join(map, naam);
    if (statSync(pad).isDirectory()) yield* bestanden(pad);
    else yield pad;
  }
}

if (!existsSync(DIST)) {
  console.error("dist/ ontbreekt. Draai eerst vite build.");
  process.exit(1);
}

const fouten = [];
let aantal = 0;
for (const pad of bestanden(DIST)) {
  aantal++;
  const rel = relative(DIST, pad);
  if (vertrouwelijk.some((r) => r.test(basename(pad)))) fouten.push(`${rel}: vertrouwelijk bestand`);
  const inhoud = readFileSync(pad).toString("latin1");
  for (const v of verboden) if (inhoud.includes(v.tekst)) fouten.push(`${rel}: bevat ${v.wat}`);
}

// d3 zegt "sideEffects": false. Dan laat de bundler d3-transition weg als geen naam eruit wordt
// geïmporteerd. Maar .transition() en .interrupt() op een selectie bestaan alleen door een
// neveneffect van d3-transition. Zonder dat breken de pagina's in dist/ (npm start werkt wel).
// Alleen dist/assets: de atlas heeft zijn eigen d3 in background-material/vendor.
const bundels = [...bestanden(join(DIST, "assets"))].filter((p) => p.endsWith(".js")).map((p) => readFileSync(p, "utf8"));
if (!bundels.some((t) => t.includes("prototype.interrupt"))) {
  fouten.push("d3-transition ontbreekt: .transition() en .interrupt() werken niet (import \"d3-transition\" vergeten?)");
}

if (fouten.length) {
  console.error(`Controle mislukt. dist/ mag zo niet online:\n- ${fouten.join("\n- ")}`);
  process.exit(1);
}
console.log(`Controle geslaagd: ${aantal} bestanden in dist/, geen geheimen of live-AI-paden (${verboden.length} controles).`);
