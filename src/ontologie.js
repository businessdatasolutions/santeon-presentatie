/* Ontologie uitgelegd (2a). Vast script, geen netwerkaanroepen, geen imports.
   Opbouw: ruwe tekst → gemarkeerde fragmenten → begrippen en relaties → één regel per melding
   → het patroon → wat het oplost. Elke stap zet body[data-stap], de klasse "aan" op de fragmenten
   en toont de vakken waarvan data-vanaf ≤ stap ≤ data-tot (stappen tellen vanaf 1).
   Geen SAC-score: die van 0470 stelt een mens vast in issue #11. */

const $ = (id) => document.getElementById(id);
const FRAGMENTEN = [...document.querySelectorAll("mark.frag")];
const VAKKEN = [...document.querySelectorAll(".vak")];

// aan = welke soorten fragmenten oplichten · waarden = de fragmenten tonen de waarde uit de ontologie
const STAPPEN = [
  { aan: [], tekst: "In geen van beide meldingen staat het woord “val”. Zoeken op “val” vindt ze dus niet." },
  { aan: ["wat", "waar", "gevolg", "omstandigheid"], tekst: "Jij ziet twee valincidenten. De computer ziet twee verschillende zinnen." },
  { aan: ["wat", "waar"], tekst: "Een ontologie legt vast welke begrippen er zijn, welke waarden ze mogen hebben en hoe ze samenhangen." },
  { aan: ["wat", "waar", "gevolg"], waarden: true, tekst: "Elke melding wordt één regel. Elke waarde wijst naar een stuk tekst." },
  { aan: ["wat", "waar", "omstandigheid"], waarden: true, tekst: "Nu zie je één patroon: een te hoog bed op Geriatrie. Dat is een signaal op het niveau Ask." },
  { aan: [], tekst: "Je kwaliteitshandboek, maar dan zo opgeschreven dat een computer het kan lezen." },
];

let stap = -1;

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  stap = n;
  const s = STAPPEN[n];
  const nr = n + 1;

  document.body.dataset.stap = nr;
  document.body.classList.toggle("met-waarden", Boolean(s.waarden));
  $("teller").textContent = `${nr} / ${STAPPEN.length}`;
  $("balk").style.width = `${(nr / STAPPEN.length) * 100}%`;
  $("onderschrift").textContent = s.tekst;
  history.replaceState(null, "", `#stap-${nr}`);

  for (const f of FRAGMENTEN) f.classList.toggle("aan", s.aan.includes(f.dataset.soort));
  for (const v of VAKKEN) v.hidden = !(nr >= Number(v.dataset.vanaf) && nr <= Number(v.dataset.tot));
}

addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  const volgende = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"];
  const vorige = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"];
  if (volgende.includes(e.key)) { e.preventDefault(); ga(stap + 1); }
  else if (vorige.includes(e.key)) { e.preventDefault(); ga(stap - 1); }
  else if (e.key === "Home") ga(0);
  else if (e.key === "End") ga(STAPPEN.length - 1);
});
$("verder").addEventListener("click", () => ga(stap + 1));
$("terug").addEventListener("click", () => ga(stap - 1));

// #stap-N in de adresbalk: handig om te oefenen vanaf een bepaalde stap
const stapUitHash = () => {
  const n = parseInt((location.hash.match(/stap-(\d+)/) || [])[1], 10);
  return Number.isFinite(n) ? n - 1 : 0;
};
addEventListener("hashchange", () => ga(stapUitHash()));
ga(stapUitHash());
