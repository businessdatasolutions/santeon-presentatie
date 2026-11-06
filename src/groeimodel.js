/* Groeimodel Ask → Assist → Automate (2c). Vast script, geen netwerkaanroepen.
   Elke stap zet body[data-stap] en de klassen op de drie treden; de CSS doet de overgangen.
   Stap 1: overzicht · 2–4: één niveau uitgelicht · 5: samenvatting met de harde grens. */

const $ = (id) => document.getElementById(id);
const TREDEN = [...document.querySelectorAll(".trede")];

// actief = het niveau dat openklapt; samen = alle niveaus met motto en werkverdeling
const STAPPEN = [
  { actief: null },
  { actief: "ask" },
  { actief: "assist" },
  { actief: "automate" },
  { samen: true },
];

let stap = -1;

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  stap = n;
  const s = STAPPEN[n];

  document.body.dataset.stap = n;
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);

  for (const t of TREDEN) {
    const niveau = t.dataset.niveau;
    t.classList.toggle("actief", s.actief === niveau);
    t.classList.toggle("vol", s.actief === niveau);
    t.classList.toggle("dim", Boolean(s.actief) && s.actief !== niveau);
    t.classList.toggle("samen", Boolean(s.samen));
  }
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
