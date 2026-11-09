/* Even voorstellen — blok 0, Opening. Ontwerp A ("De koers") uit ~/Projects/aiso-voorstellen-ontwerpen.
   Links (D3): de loopbaan als balken en elke repo als stip, per jaar gestapeld op één tijdas.
     De stippen van 2025 en 2026 dragen de AI-markering (warm zwart met geel en het Bot-icoon): sinds dan bouwt AI mee.
     Geel als vulling alleen betekent nooit AI; de balk van Business Data Solutions is geel als merkaccent.
   Rechts (Three.js): vier apps als kaarten. Een kaart kantelt naar de muis; een klik opent de details.
   Stap 1 = overzicht · stap 2–5 = één app open. Spreker stuurt: → / ← / spatie / klikker, #stap-N.
   Vast script, geen netwerkaanroepen. */

import * as THREE from "three";
import * as d3 from "d3";
import "d3-transition"; // voor .transition(); zonder deze regel laat vite build het weg (d3: sideEffects false)
import { animate, stagger } from "motion";
import { repos, LOOPBAAN, APPS } from "./voorstellen-data.js";

const $ = (id) => document.getElementById(id);
const rustig = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ms = (s) => (rustig ? 0 : s * 1000); // d3 rekent in milliseconden
const INK = "#1a1a1a", ACCENT = "#d4db3e";

animate(".intro > *", { opacity: [0, 1], y: [12, 0] }, { duration: rustig ? 0 : 0.5, delay: stagger(0.08) });

/* ---------------- D3: loopbaan en repos op één tijdas ---------------- */
const W = 1000, H = 560, m = { l: 20, r: 20, b: 30 };
const svg = d3.select("#grafiek").append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("aria-hidden", "true");
const x = d3.scaleLinear([1995, 2027], [m.l, W - m.r]);

// Banen boven. De twee handelsbanen hebben hun tekst rechts, de rest links.
const baanH = 34, baanGap = 10, baanTop = 8;
const VULLING = { handel: "#e9e4d8", zuivel: "#e9e4d8", han: "#ffffff", bds: ACCENT, vu: "#f0ebe0" };
const TEKST_RECHTS = new Set(["handel", "zuivel"]);
LOOPBAAN.forEach((b, i) => {
  const g = svg.append("g").attr("transform", `translate(0 ${baanTop + i * (baanH + baanGap)})`);
  g.append("rect").attr("x", x(b.van)).attr("height", baanH).attr("width", 0).attr("rx", 6)
    .attr("fill", VULLING[b.id]).attr("stroke", INK).attr("stroke-width", 1.4)
    .transition().delay(ms(0.4 + i * 0.26)).duration(ms(0.9)).ease(d3.easeCubicOut)
    .attr("width", x(b.tot) - x(b.van));
  const rechts = TEKST_RECHTS.has(b.id);
  const t = g.append("text").attr("x", rechts ? x(b.tot) + 10 : x(b.van) - 10).attr("y", 22)
    .attr("text-anchor", rechts ? "start" : "end").attr("opacity", 0);
  t.append("tspan").attr("class", "loop-tekst").text(b.rol);
  t.append("tspan").attr("class", "loop-sub").attr("dx", 8).text(`${b.waar} · ${b.wat}`);
  t.transition().delay(ms(0.9 + i * 0.26)).duration(ms(0.4)).attr("opacity", 1);
});

// Stippen onder: één per repo, per jaar gestapeld in drie kolommen.
const AI_SINDS = 2025;
const perJaar = d3.group(repos, (r) => +r.d.slice(0, 4));
const bodem = H - m.b, rStip = 3.6, kolom = 3, stap = rStip * 2 + 1.4;
const stippen = [];
for (const [jaar, rs] of perJaar) {
  rs.forEach((r, i) => {
    const kol = i % kolom, rij = Math.floor(i / kolom);
    stippen.push({ ...r, jaar, ai: jaar >= AI_SINDS, cx: x(jaar + 0.5) + (kol - 1) * stap, cy: bodem - 8 - rij * stap });
  });
}
// Vulling: openbaar wit, privé grijs. Vanaf 2025 de AI-markering: zwart met een gele rand.
const vulStip = (s) => (s.ai ? (s.n ? INK : "#4b5563") : s.n ? "#fff" : "#d6d1c4");
svg.append("g").selectAll("circle").data(stippen).join("circle")
  .attr("class", (s) => (s.ai ? "repo ai" : "repo"))
  .attr("cx", (s) => s.cx).attr("cy", -20).attr("r", rStip)
  .attr("fill", vulStip).attr("stroke-opacity", (s) => (s.n || s.ai ? 1 : 0.35))
  .call((c) => c.append("title").text((s) => (s.n ? `${s.n} (${s.d.slice(0, 7)})` : `privé (${s.d.slice(0, 7)})`)))
  .transition().delay((s, i) => ms(1.8 + (s.jaar - 2013) * 0.12 + i * 0.002)).duration(ms(0.7))
  .ease(d3.easeBounceOut).attr("cy", (s) => s.cy);

// Tijdas
const as = svg.append("g").attr("class", "as").attr("transform", `translate(0 ${bodem})`)
  .call(d3.axisBottom(x).tickValues([1996, 2001, 2007, 2013, 2019, 2024]).tickFormat(d3.format("d")).tickSize(6));
as.select(".domain").attr("stroke", INK);

// Noot bij 2025–2026, met het AI-label (zwart, geel, Bot-icoon)
const aiStippen = stippen.filter((s) => s.ai);
const topAi = d3.min(aiStippen, (s) => s.cy);
const rechtsRand = x(2027) - 4;
const noot = svg.append("g").attr("opacity", 0);
noot.append("path").attr("d", `M${x(AI_SINDS) - 2},${topAi - 14} H${rechtsRand}`).attr("stroke", INK).attr("stroke-width", 1.4);
noot.append("text").attr("class", "noot").attr("x", rechtsRand).attr("y", topAi - 50).attr("text-anchor", "end")
  .text(`${aiStippen.length} nieuwe repos in 2025 en 2026`);
aiLabel(noot, "sinds AI meebouwt", rechtsRand, topAi - 40);
noot.transition().delay(ms(3.7)).duration(ms(0.5)).attr("opacity", 1);

// Een pil in warm zwart met het Bot-icoon en gele tekst; rechts uitgelijnd op xRechts.
function aiLabel(ouder, tekst, xRechts, yBoven) {
  const hoogte = 20, pad = 8, icoon = 13, gat = 5;
  const g = ouder.append("g");
  const achter = g.append("rect").attr("height", hoogte).attr("rx", hoogte / 2).attr("fill", INK);
  const bot = g.append("svg").attr("x", pad).attr("y", (hoogte - icoon) / 2).attr("width", icoon).attr("height", icoon)
    .attr("viewBox", "0 0 24 24").attr("fill", "none").attr("stroke", ACCENT).attr("stroke-width", 2.2)
    .attr("stroke-linecap", "round").attr("stroke-linejoin", "round");
  for (const d of ["M12 8V4H8", "M2 14h2", "M20 14h2", "M15 13v2", "M9 13v2"]) bot.append("path").attr("d", d);
  bot.append("rect").attr("width", 16).attr("height", 12).attr("x", 4).attr("y", 8).attr("rx", 2);
  const t = g.append("text").attr("class", "ai-tekst").attr("x", pad + icoon + gat).attr("y", 14).text(tekst);
  const breed = pad + icoon + gat + t.node().getComputedTextLength() + pad;
  achter.attr("width", breed);
  g.attr("transform", `translate(${xRechts - breed} ${yBoven})`);
}

/* ---------------- Three.js: vier kaarten ---------------- */
const houder = $("kaarten");
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
houder.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 0, 10);

const laad = (src) => new Promise((ok) => {
  if (!src) return ok(null);
  const img = new Image();
  img.onload = () => ok(img);
  img.onerror = () => ok(null);
  img.src = src;
});

function tekstRegels(c, tekst, x0, y0, breed, lh) {
  let regel = "", y = y0;
  for (const w of tekst.split(" ")) {
    const t = regel ? `${regel} ${w}` : w;
    if (c.measureText(t).width > breed) { c.fillText(regel, x0, y); regel = w; y += lh; } else regel = t;
  }
  c.fillText(regel, x0, y);
}

async function kaartTextuur(app) {
  const cv = document.createElement("canvas");
  cv.width = 640; cv.height = 800;
  const c = cv.getContext("2d");
  c.fillStyle = "#fff"; c.beginPath(); c.roundRect(4, 4, 632, 792, 40); c.fill();
  c.lineWidth = 6; c.strokeStyle = INK; c.stroke();
  const img = await laad(app.beeld);
  c.save(); c.beginPath(); c.roundRect(34, 34, 572, 380, 24); c.clip();
  if (app.id === "opgeruimd" && img) {
    c.drawImage(img, 120, 0, 720, 540, 34, 34, 572, 380);
  } else if (img) {
    // Achter het logo: de achtergrondkleur van de app zelf (Plinkie: "ochtend" van plinkie.nl)
    c.fillStyle = app.id === "plinkie" ? "#fff6ea" : "#eef3ff"; c.fillRect(34, 34, 572, 380);
    const s = 300; c.drawImage(img, 320 - s / 2, 224 - s / 2, s, s);
  } else { // Newmuzes: een golfvorm en toetsen
    c.fillStyle = INK; c.fillRect(34, 34, 572, 380);
    c.strokeStyle = ACCENT; c.lineWidth = 5; c.beginPath();
    for (let i = 0; i <= 560; i++) {
      const t = i / 560;
      const y = 170 + Math.sin(t * 26) * 60 * Math.sin(t * Math.PI) * (0.6 + 0.4 * Math.sin(t * 7));
      i ? c.lineTo(40 + i, y) : c.moveTo(40, y);
    }
    c.stroke();
    for (let k = 0; k < 14; k++) { c.fillStyle = "#fff"; c.fillRect(44 + k * 40, 290, 36, 116); }
    for (const k of [0, 1, 3, 4, 5, 7, 8, 10, 11, 12]) { c.fillStyle = INK; c.fillRect(44 + k * 40 + 26, 290, 22, 70); }
  }
  c.restore();
  const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
  c.fillStyle = "#6b7280"; c.font = `700 22px ${font}`; c.fillText(app.status.toUpperCase(), 40, 468);
  c.fillStyle = INK; c.font = `800 54px ${font}`; c.fillText(app.naam, 38, 528);
  c.fillStyle = "#4b5563"; c.font = `400 28px ${font}`; tekstRegels(c, app.zin, 40, 584, 560, 38);
  c.fillStyle = ACCENT; c.fillRect(40, 756, 120, 8);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// [x, y, draaiing om de y-as]; de kaarten staan iets naar elkaar toe gedraaid
const POSITIES = [[-1.05, 1.36, 0.12], [1.05, 1.36, -0.12], [-1.05, -1.36, 0.08], [1.05, -1.36, -0.08]];
const kaarten = [];
(async () => {
  const texturen = await Promise.all(APPS.map(kaartTextuur));
  APPS.forEach((app, i) => {
    const mat = new THREE.MeshBasicMaterial({ map: texturen[i], transparent: true });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.375), mat);
    const [px, py, ry] = POSITIES[i];
    mesh.position.set(px, py - 4, -2);
    mesh.rotation.y = ry;
    mesh.userData = { index: i, basisRy: ry, fase: i * 1.7 };
    scene.add(mesh);
    kaarten.push(mesh);
    animate(mesh.position, { y: py, z: 0 },
      rustig ? { duration: 0 } : { type: "spring", visualDuration: 0.9, bounce: 0.3, delay: 1.2 + i * 0.15 });
  });
})();

// Camera zo ver weg dat het blok kaarten (4,4 breed) ook in een smal paneel past.
function maat() {
  const r = houder.getBoundingClientRect();
  if (!r.width || !r.height) return;
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  camera.position.z = Math.max(10, 4.4 / 2 / (tanHalf * camera.aspect));
  camera.updateProjectionMatrix();
}
new ResizeObserver(maat).observe(houder);
maat();

const ray = new THREE.Raycaster(), muis = new THREE.Vector2(-9, -9);
const zetMuis = (e) => {
  const r = renderer.domElement.getBoundingClientRect();
  muis.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
};
const geraakt = () => { ray.setFromCamera(muis, camera); return ray.intersectObjects(kaarten)[0]?.object ?? null; };
renderer.domElement.addEventListener("pointermove", zetMuis);
renderer.domElement.addEventListener("pointerleave", () => muis.set(-9, -9));
renderer.domElement.addEventListener("click", (e) => {
  zetMuis(e);
  const k = geraakt();
  if (k) ga(k.userData.index + 1);
});

/* ---------------- Detail van één app ---------------- */
const detail = $("detail");
function toonDetail(i) {
  const app = APPS[i];
  detail.querySelector(".status").textContent = app.status;
  detail.querySelector("h3").textContent = app.naam;
  detail.querySelector("p").textContent = app.zin;
  detail.querySelector("ul").replaceChildren(...app.feiten.map((f) => Object.assign(document.createElement("li"), { textContent: f })));
  // Bij een kaart onderaan staat het detail bovenaan, zodat de kaart zichtbaar blijft.
  const onder = i >= 2;
  detail.classList.toggle("top", onder);
  detail.classList.add("open");
  animate(detail, { opacity: [0, 1], y: [onder ? -24 : 24, 0] },
    rustig ? { duration: 0 } : { type: "spring", visualDuration: 0.35, bounce: 0.2 });
}
function sluitDetail() {
  if (!detail.classList.contains("open")) return;
  detail.classList.remove("open");
  animate(detail, { opacity: 0 }, { duration: rustig ? 0 : 0.2 });
}
detail.querySelector(".sluit").addEventListener("click", () => ga(0));

/* ---------------- Stappen ---------------- */
const STAPPEN = [null, 0, 1, 2, 3]; // per stap: de app die open staat (null = overzicht)
let stapNu = -1, gekozen = null;

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stapNu) return;
  stapNu = n;
  gekozen = STAPPEN[n];
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);
  if (gekozen === null) sluitDetail(); else toonDetail(gekozen);
}

addEventListener("keydown", (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  // Spatie of Enter op een knop is een klik op die knop, geen stap.
  if (e.target instanceof HTMLButtonElement && (e.key === " " || e.key === "Enter")) return;
  const volgende = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"];
  const vorige = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"];
  if (volgende.includes(e.key)) { e.preventDefault(); ga(stapNu + 1); }
  else if (vorige.includes(e.key)) { e.preventDefault(); ga(stapNu - 1); }
  else if (e.key === "Escape") ga(0);
  else if (e.key === "Home") ga(0);
  else if (e.key === "End") ga(STAPPEN.length - 1);
});
$("verder").addEventListener("click", () => ga(stapNu + 1));
$("terug").addEventListener("click", () => ga(stapNu - 1));

// #stap-N in de adresbalk: handig om te oefenen vanaf een bepaalde stap
const stapUitHash = () => {
  const n = parseInt((location.hash.match(/stap-(\d+)/) || [])[1], 10);
  return Number.isFinite(n) ? n - 1 : 0;
};
addEventListener("hashchange", () => ga(stapUitHash()));
ga(stapUitHash());

/* ---------------- Tekenlus ---------------- */
let bovenNu = null;
const begin = performance.now();
renderer.setAnimationLoop(() => {
  const t = (performance.now() - begin) / 1000;
  const boven = geraakt();
  if (boven !== bovenNu) { bovenNu = boven; houder.classList.toggle("boven", Boolean(boven)); }
  for (const k of kaarten) {
    const u = k.userData;
    const zweeft = k === boven, open = u.index === gekozen;
    // Onder de muis kantelt de kaart naar de muis; een open kaart staat recht naar de zaal.
    const doelRx = zweeft ? -muis.y * 0.35 : 0;
    const doelRy = zweeft ? u.basisRy + muis.x * 0.45 : open ? 0 : u.basisRy;
    k.rotation.x += (doelRx - k.rotation.x) * 0.12;
    k.rotation.y += (doelRy - k.rotation.y) * 0.12;
    const s = zweeft || open ? 1.07 : 1;
    k.scale.x += (s - k.scale.x) * 0.15;
    k.scale.y = k.scale.x;
    // Staat er een app open, dan wijken de andere drie.
    const o = gekozen !== null && !open ? 0.4 : 1;
    k.material.opacity += (o - k.material.opacity) * 0.12;
    if (!rustig) k.position.y += Math.sin(t * 0.9 + u.fase) * 0.0018;
  }
  renderer.render(scene, camera);
});
