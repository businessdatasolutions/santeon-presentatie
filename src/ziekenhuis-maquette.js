/* De maquette voor ziekenhuis.html: een typisch ziekenhuis van één verdieping, open van boven, als
   architectuurmodel. Acht ruimtes rond een gang. Wit model met zwarte randen; poppetjes in grijs.
   AI-toepassingen zijn warm zwart met geel licht: de AI-markering uit de huisstijl. Rond een ruimte die
   aan de beurt is, licht een gele rand op (merkaccent).
   Alles is code, er zijn geen modelbestanden. Eenheid: ongeveer een meter. x loopt van west naar oost,
   z van achter (noord) naar voor (zuid, de kant van de camera).
   De twee borden in de bestuurskamer zijn canvas-texturen; D3 levert de schalen. */

import * as THREE from "three";
import * as d3 from "d3";

export const KLEUR = {
  inkt: 0x1a1a1a, geel: 0xd4db3e, wit: 0xffffff, creme: 0xf5f0e6, creme2: 0xf0ebe0,
  lijn: 0xe5e7eb, grijs: 0x9ca3af, mid: 0x6b7280, donker: 0x4b5563, papier: 0xf9f8f4, boom: 0xd1d5db,
};

// [x0, x1] en [z0, z1] van elke ruimte. De gang loopt van x -16 tot 16, tussen z -1,2 en 1,2.
export const KAMERS = {
  bestuur: { x: [-16, -7], z: [-10, -1.2] },
  regie: { x: [-7, -1], z: [-10, -1.2] },
  radiologie: { x: [-1, 8], z: [-10, -1.2] },
  lab: { x: [8, 16], z: [-10, -1.2] },
  balie: { x: [-16, -8], z: [1.2, 10] },
  poli: { x: [-8, -1], z: [1.2, 10] },
  admin: { x: [-1, 7], z: [1.2, 10] },
  kwaliteit: { x: [7, 16], z: [1.2, 10] },
  gang: { x: [-16, 16], z: [-1.2, 1.2] },
};

// Cijfers op de borden in de bestuurskamer (AI Monitor Ziekenhuizen 2026, p. 30 en 26).
// Naam op de vloer van elke ruimte, zoals op een bouwtekening.
export const NAMEN = {
  bestuur: "Bestuurskamer", regie: "AI-regiegroep", radiologie: "Radiologie", lab: "Onderzoek",
  balie: "Entree en balie", poli: "Polikliniek", admin: "Administratie", kwaliteit: "Kwaliteit en veiligheid",
};

export const GENAI = [["2024", 57], ["2025", 75], ["2026", 90]];
export const TRECHTER = [["Idee of verkenning", 8], ["Aankoop of ontwikkeling", 3], ["Pilot", 3], ["Implementatie", 1], ["Opgeschaald", 1], ["Beheer", 2]];

const MUUR_H = 1.1, MUUR_D = 0.18, GANG = 1.2;
const NACHT = new THREE.Color(0x24221f);
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Arial, sans-serif';

/* ---------- Materialen: 's nachts worden de dagmaterialen donker, het AI-licht niet ---------- */

const dagMats = [];
const cache = new Map();
function mat(soort, kleur) {
  const k = `${soort}-${kleur}`;
  if (!cache.has(k)) {
    const m = soort === "rond" ? new THREE.MeshLambertMaterial({ color: kleur }) : new THREE.MeshBasicMaterial({ color: kleur });
    m.userData.dag = new THREE.Color(kleur);
    dagMats.push(m);
    cache.set(k, m);
  }
  return cache.get(k);
}
const vlak = (k) => mat("vlak", k);
const rond = (k) => mat("rond", k);
const LIJN = new THREE.LineBasicMaterial({ color: KLEUR.inkt });
const AI_LICHT = new THREE.MeshBasicMaterial({ color: KLEUR.geel });
const AI_KAST = new THREE.MeshBasicMaterial({ color: KLEUR.inkt });
const AI_RAND = new THREE.LineBasicMaterial({ color: KLEUR.geel });

export function zetNacht(scene, licht, f) {
  for (const m of dagMats) m.color.copy(m.userData.dag).lerp(NACHT, 0.86 * f);
  scene.background.setHex(KLEUR.papier).lerp(NACHT, 0.92 * f);
  licht.hemel.intensity = 2.4 - 1.7 * f;
  licht.zon.intensity = 1.6 - 1.3 * f;
}

/* ---------- Bouwstenen ---------- */

// Blok met zwarte randen. y is de onderkant (meubels staan op de vloer).
function blok(ouder, [w, h, d], [x, y, z], kleur = KLEUR.wit, { rand = true, materiaal } = {}) {
  return blokM(ouder, [w, h, d], [x, y + h / 2, z], kleur, { rand, materiaal });
}
// Blok met het midden op [x, y, z].
function blokM(ouder, [w, h, d], [x, y, z], kleur = KLEUR.wit, { rand = true, materiaal } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d);
  g.add(new THREE.Mesh(geo, materiaal || vlak(kleur)));
  if (rand) g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), LIJN));
  g.position.set(x, y, z);
  ouder.add(g);
  return g;
}
function cilinder(ouder, r, h, [x, y, z], kleur = KLEUR.wit, { rand = true, rTop = r } = {}) {
  const geo = new THREE.CylinderGeometry(rTop, r, h, 32);
  const m = new THREE.Mesh(geo, vlak(kleur));
  m.position.set(x, y + h / 2, z);
  ouder.add(m);
  if (rand) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), LIJN);
    e.position.copy(m.position);
    ouder.add(e);
  }
  return m;
}

// Muur langs x of langs z, met openingen [midden, breedte].
function muur(ouder, x1, z1, x2, z2, gaten = []) {
  const langsX = z1 === z2;
  const a = langsX ? Math.min(x1, x2) : Math.min(z1, z2), b = langsX ? Math.max(x1, x2) : Math.max(z1, z2);
  const stukken = [];
  let start = a;
  for (const [m, br] of [...gaten].sort((p, q) => p[0] - q[0])) {
    stukken.push([start, m - br / 2]);
    start = m + br / 2;
  }
  stukken.push([start, b]);
  for (const [s, e] of stukken) {
    if (e - s < 0.02) continue;
    const len = e - s, mid = (s + e) / 2;
    blok(ouder, langsX ? [len, MUUR_H, MUUR_D] : [MUUR_D, MUUR_H, len], langsX ? [mid, 0.02, z1] : [x1, 0.02, mid]);
  }
}

// Gele rand op de vloer van een ruimte. Eigen materiaal: zo licht elke ruimte apart op.
function randOp(ouder, [x0, x1], [z0, z1], inset = 0.32) {
  const m = new THREE.MeshBasicMaterial({ color: KLEUR.geel, transparent: true, opacity: 0, depthWrite: false });
  const a0 = x0 + inset, a1 = x1 - inset, c0 = z0 + inset, c1 = z1 - inset, b = 0.18;
  const strook = (w, d, x, z) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), m);
    s.position.set(x, 0.05, z);
    ouder.add(s);
  };
  strook(a1 - a0, b, (a0 + a1) / 2, c0);
  strook(a1 - a0, b, (a0 + a1) / 2, c1);
  strook(b, c1 - c0, a0, (c0 + c1) / 2);
  strook(b, c1 - c0, a1, (c0 + c1) / 2);
  return m;
}

// Stoel: zitting, rugleuning aan de achterkant (-z), één poot. Kijkt naar +z.
function stoel(ouder, x, z, rot = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0.02, z);
  g.rotation.y = rot;
  ouder.add(g);
  blok(g, [0.5, 0.08, 0.5], [0, 0.38, 0]);
  blok(g, [0.5, 0.5, 0.08], [0, 0.46, -0.22]);
  blok(g, [0.1, 0.38, 0.1], [0, 0, 0], KLEUR.lijn, { rand: false });
  return g;
}

function tafel(ouder, [w, d], [x, z]) {
  blok(ouder, [Math.max(0.3, w - 0.7), 0.68, Math.max(0.3, d - 0.7)], [x, 0.02, z], KLEUR.lijn, { rand: false });
  blok(ouder, [w, 0.06, d], [x, 0.7, z]);
}

// Poppetje: kijkt naar +z. rot draait om de y-as; zit = op een stoel; armen = hoek naar voren (radialen).
export function poppetje(ouder, { x = 0, z = 0, y = 0.02, rot = 0, zit = false, armen = 0, jas = KLEUR.donker, broek = KLEUR.mid } = {}) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = rot;
  const cap = (r, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), m);
  const HUID = rond(KLEUR.lijn), JAS = rond(jas), BROEK = rond(broek), HAAR = rond(KLEUR.inkt);
  const heup = zit ? 0.5 : 0.92;
  for (const s of [-1, 1]) {
    if (zit) {
      const dij = cap(0.085, 0.36, BROEK);
      dij.rotation.x = Math.PI / 2;
      dij.position.set(s * 0.1, heup, 0.2);
      const scheen = cap(0.075, 0.34, BROEK);
      scheen.position.set(s * 0.1, 0.26, 0.42);
      g.add(dij, scheen);
    } else {
      const been = cap(0.085, 0.7, BROEK);
      been.position.set(s * 0.1, 0.46, 0);
      g.add(been);
    }
  }
  const romp = cap(0.2, 0.36, JAS);
  romp.scale.set(1, 1, 0.72);
  romp.position.y = heup + 0.32;
  const hoofd = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 14), HUID);
  hoofd.position.y = heup + 0.78;
  // haar boven en achter: zo zie je welke kant het poppetje op kijkt
  const haar = new THREE.Mesh(new THREE.SphereGeometry(0.148, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), HAAR);
  haar.position.y = heup + 0.795;
  haar.rotation.x = -0.5;
  g.add(romp, hoofd, haar);
  for (const s of [-1, 1]) {
    const schouder = new THREE.Group();
    schouder.position.set(s * 0.26, heup + 0.52, 0);
    schouder.rotation.x = -armen;
    const arm = cap(0.06, 0.44, JAS);
    arm.position.y = -0.27;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), HUID);
    hand.position.y = -0.54;
    schouder.add(arm, hand);
    g.add(schouder);
  }
  ouder.add(g);
  return g;
}

// Liggend poppetje (op een tafel of bed), hoofd naar -x.
function liggend(ouder, [x, y, z], opties = {}) {
  const lig = new THREE.Group();
  lig.position.set(x, y, z);
  lig.rotation.y = Math.PI / 2;
  ouder.add(lig);
  const p = poppetje(lig, { ...opties, y: 0 });
  p.rotation.x = -Math.PI / 2;
  return lig;
}

// Een AI-toepassing: warm zwart kastje of scherm met geel licht en een gele rand. Het licht wijst naar +z.
function aiKastje(ouder, [w, h, d], [x, y, z], rot = 0) {
  const g = new THREE.Group();
  g.position.set(x, y + h / 2, z);
  g.rotation.y = rot;
  const geo = new THREE.BoxGeometry(w, h, d);
  const scherm = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.78, h * 0.62), AI_LICHT);
  scherm.position.z = d / 2 + 0.003;
  g.add(new THREE.Mesh(geo, AI_KAST), new THREE.LineSegments(new THREE.EdgesGeometry(geo), AI_RAND), scherm);
  ouder.add(g);
  return g;
}

// Een vel of een beeld dat kan bewegen. markeer(true) = de AI heeft het gekozen: zwart met een gele rand.
function vel(ouder, [w, h, d]) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, vlak(KLEUR.wit));
  const rand = new THREE.LineSegments(new THREE.EdgesGeometry(geo), LIJN);
  const licht = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.6, d * 0.6), AI_LICHT);
  licht.rotation.x = -Math.PI / 2;
  licht.position.y = h / 2 + 0.003;
  licht.visible = false;
  g.add(mesh, rand, licht);
  g.visible = false;
  ouder.add(g);
  return {
    g,
    markeer(aan) {
      mesh.material = aan ? AI_KAST : vlak(KLEUR.wit);
      rand.material = aan ? AI_RAND : LIJN;
      licht.visible = aan;
    },
  };
}

function vloerNaam(ouder, tekst, [x0, x1], z) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#6b7280";
  ctx.font = `700 66px ${FONT}`;
  ctx.letterSpacing = "10px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tekst.toUpperCase(), 512, 66);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  const w = Math.min(x1 - x0 - 1.2, 5.0);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 8), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set((x0 + x1) / 2, 0.035, z);
  ouder.add(m);
}

function boom(ouder, x, z, s = 1) {
  cilinder(ouder, 0.09 * s, 0.9 * s, [x, 0, z], KLEUR.mid, { rand: false });
  const kroon = new THREE.Mesh(new THREE.SphereGeometry(0.75 * s, 18, 14), rond(KLEUR.boom));
  kroon.position.set(x, 1.45 * s, z);
  ouder.add(kroon);
}

/* ---------- De borden in de bestuurskamer (D3-schalen, getekend op canvas) ---------- */

function doek(b, h) {
  const c = document.createElement("canvas");
  c.width = b;
  c.height = h;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return { c, ctx: c.getContext("2d"), t, b, h };
}

// Scherm: aandeel ziekenhuizen met generatieve AI per jaar. p = 0..1, de staven groeien mee.
function tekenScherm(d, p) {
  const { ctx, b: W, h: H } = d;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `700 62px ${FONT}`;
  ctx.fillText("Generatieve AI in ziekenhuizen", 64, 104);
  ctx.fillStyle = "#4b5563";
  ctx.font = `400 38px ${FONT}`;
  ctx.fillText("aandeel van de ziekenhuizen dat het gebruikt", 64, 158);
  const x = d3.scaleBand().domain(GENAI.map((g) => g[0])).range([150, W - 150]).padding(0.34);
  const y = d3.scaleLinear().domain([0, 100]).range([H - 120, 250]);
  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(110, y(0), W - 220, 3);
  GENAI.forEach(([jaar, v], i) => {
    const w = v * p, top = y(w), hoog = y(0) - top;
    ctx.fillStyle = i === GENAI.length - 1 ? "#d4db3e" : "#6b7280";
    if (hoog > 0) {
      ctx.beginPath();
      ctx.roundRect(x(jaar), top, x.bandwidth(), hoog, [10, 10, 0, 0]);
      ctx.fill();
    }
    ctx.fillStyle = "#1a1a1a";
    ctx.textAlign = "center";
    ctx.font = `700 64px ${FONT}`;
    if (p > 0.05) ctx.fillText(`${Math.round(w)}%`, x(jaar) + x.bandwidth() / 2, top - 22);
    ctx.font = `600 42px ${FONT}`;
    ctx.fillText(jaar, x(jaar) + x.bandwidth() / 2, y(0) + 58);
    ctx.textAlign = "left";
  });
  ctx.fillStyle = "#6b7280";
  ctx.font = `400 26px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("AI Monitor Ziekenhuizen 2026, p. 30", W - 48, H - 26);
  ctx.textAlign = "left";
  d.t.needsUpdate = true;
}

// Bord: de AI-trechter van een gemiddeld ziekenhuis. "Opgeschaald" krijgt het accent.
function tekenBord(d, p) {
  const { ctx, b: W, h: H } = d;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `700 54px ${FONT}`;
  ctx.fillText("18 AI-toepassingen per ziekenhuis", 52, 92);
  ctx.fillStyle = "#4b5563";
  ctx.font = `400 34px ${FONT}`;
  ctx.fillText("gemiddeld, per fase", 52, 140);
  const y = d3.scaleBand().domain(TRECHTER.map((t) => t[0])).range([190, H - 70]).padding(0.28);
  const x = d3.scaleLinear().domain([0, 8]).range([0, W - 560]);
  const x0 = 470;
  TRECHTER.forEach(([fase, n]) => {
    const acc = fase === "Opgeschaald";
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `${acc ? 700 : 500} 36px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(fase, x0 - 24, y(fase) + y.bandwidth() / 2 + 12);
    ctx.textAlign = "left";
    const w = x(n) * p;
    ctx.fillStyle = acc ? "#d4db3e" : "#6b7280";
    if (w > 0) {
      ctx.beginPath();
      ctx.roundRect(x0, y(fase), w, y.bandwidth(), [0, 8, 8, 0]);
      ctx.fill();
    }
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `700 40px ${FONT}`;
    if (p > 0.05) ctx.fillText(String(n), x0 + w + 16, y(fase) + y.bandwidth() / 2 + 14);
  });
  ctx.fillStyle = "#6b7280";
  ctx.font = `400 24px ${FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("AI Monitor Ziekenhuizen 2026, p. 26", W - 40, H - 22);
  ctx.textAlign = "left";
  d.t.needsUpdate = true;
}

// Een bord op een ezel, licht achterover (zo leest de camera het beter).
function ezel(ouder, d, [w, h], [x, z], kantel = 0.3) {
  const g = new THREE.Group();
  g.position.set(x, 0.02, z);
  ouder.add(g);
  blok(g, [0.08, 1.05, 0.08], [-w / 2 + 0.35, 0, 0], KLEUR.mid, { rand: false });
  blok(g, [0.08, 1.05, 0.08], [w / 2 - 0.35, 0, 0], KLEUR.mid, { rand: false });
  const paneel = new THREE.Group();
  paneel.position.set(0, 1.05 + h / 2, 0);
  paneel.rotation.x = -kantel;
  g.add(paneel);
  blokM(paneel, [w + 0.14, h + 0.14, 0.06], [0, 0, -0.04], KLEUR.inkt, { rand: false });
  paneel.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: d.t })));
  return g;
}

/* ---------- De maquette ---------- */

export function bouwMaquette(scene) {
  scene.background = new THREE.Color(KLEUR.papier);
  const hemel = new THREE.HemisphereLight(0xffffff, 0xb8b2a6, 2.4);
  const zon = new THREE.DirectionalLight(0xffffff, 1.6);
  zon.position.set(6, 14, 9);
  scene.add(hemel, zon);

  const W = new THREE.Group();
  scene.add(W);
  const ankers = {};
  const kamers = {};

  // grondplaat, vloeren en de gele randen
  blok(W, [42, 0.3, 30], [0, -0.3, 0.6], KLEUR.lijn);
  for (const [id, k] of Object.entries(KAMERS)) {
    const [x0, x1] = k.x, [z0, z1] = k.z;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    blok(W, [x1 - x0, 0.02, z1 - z0], [cx, 0, cz], id === "gang" ? KLEUR.creme2 : KLEUR.wit, { rand: false });
    kamers[id] = { midden: new THREE.Vector3(cx, 0, cz), rand: randOp(W, k.x, k.z, id === "gang" ? 0.2 : 0.32) };
    ankers[`kamer-${id}`] = new THREE.Vector3(cx, 2.7, cz);
    // vooraan in de ruimte, net buiten de schaduw van de muur (de camera kijkt schuin over de muur)
    if (NAMEN[id]) vloerNaam(W, NAMEN[id], k.x, z1 - 1.45);
  }
  ankers["kamer-gang"].set(-4, 1.7, 0);

  // muren: buitenmuren, gangmuren met een deur per ruimte, tussenmuren
  const deur = (id) => [KAMERS[id].x[0] + 1.3, 1.3];
  muur(W, -16, -10, 16, -10);
  muur(W, -16, 10, 16, 10, [[-12, 2.4]]);
  muur(W, -16, -10, -16, 10);
  muur(W, 16, -10, 16, 10);
  muur(W, -16, -GANG, 16, -GANG, ["bestuur", "regie", "radiologie", "lab"].map(deur));
  muur(W, -16, GANG, 16, GANG, [[-12, 3.2], ...["poli", "admin", "kwaliteit"].map(deur)]);
  for (const x of [-7, -1, 8]) muur(W, x, -10, x, -GANG);
  for (const x of [-8, -1, 7]) muur(W, x, GANG, x, 10);

  // bomen rond het gebouw
  [[-18.5, -7], [-18.5, -1], [-18.5, 5], [18.5, -6], [18.5, 1], [18.5, 7], [-7, 12.8], [-3, 13.2], [2, 12.6], [7, 13.1], [12, 12.7],
    [-14, -12.3], [-8, -12.6], [-2, -12.2], [4, -12.6], [10, -12.3], [15, -12.6]].forEach(([x, z], i) => boom(W, x, z, 0.85 + (i % 3) * 0.12));

  /* Bestuurskamer: het MT vergadert. Op het scherm de groei van generatieve AI, op het bord de trechter. */
  tafel(W, [5.0, 1.8], [-11.6, -5.0]);
  [[-13.4, -6.25, 0], [-11.6, -6.25, 0], [-9.8, -6.25, 0], [-13.4, -3.75, Math.PI], [-11.6, -3.75, Math.PI], [-9.8, -3.75, Math.PI], [-14.75, -5.0, Math.PI / 2]]
    .forEach(([x, z, rot], i) => {
      stoel(W, x, z, rot);
      poppetje(W, { x, z, rot, zit: true, armen: 1.15, jas: i % 2 ? KLEUR.donker : KLEUR.mid, broek: KLEUR.donker });
    });
  const scherm = doek(1280, 720), bord = doek(1100, 760);
  tekenScherm(scherm, 1);
  tekenBord(bord, 1);
  ezel(W, scherm, [4.0, 2.25], [-13.2, -8.9]);
  ezel(W, bord, [2.75, 1.9], [-9.1, -8.9]);
  poppetje(W, { x: -11.05, z: -8.1, rot: 0.25, jas: KLEUR.donker, broek: KLEUR.donker });
  ankers.scherm = new THREE.Vector3(-13.2, 3.9, -9.2);
  ankers.bord = new THREE.Vector3(-9.1, 3.6, -9.2);

  /* AI-regiegroep: ronde tafel, vier rollen en één lege stoel vooraan */
  const rc = { x: -4.0, z: -5.6 };
  cilinder(W, 0.22, 0.7, [rc.x, 0.02, rc.z], KLEUR.lijn, { rand: false });
  cilinder(W, 1.05, 0.06, [rc.x, 0.7, rc.z]);
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5;
    const x = rc.x + 1.7 * Math.sin(a), z = rc.z + 1.7 * Math.cos(a);
    const rot = Math.atan2(rc.x - x, rc.z - z);
    stoel(W, x, z, rot);
    if (i > 0) poppetje(W, { x, z, rot, zit: true, armen: 1.1, jas: i === 1 || i === 3 ? KLEUR.wit : KLEUR.mid, broek: KLEUR.donker });
    ankers[`regie${i}`] = new THREE.Vector3(x, i ? 1.75 : 1.0, z);
  }

  /* Radiologie: CT-scanner, glaswand, console met de radioloog, AI-kastje, bak met uitslagen */
  blok(W, [0.9, 0.45, 2.0], [4.6, 0.02, -6.2], KLEUR.lijn);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.38, 20, 56), rond(KLEUR.wit));
  ring.rotation.y = Math.PI / 2;
  ring.position.set(4.6, 1.38, -6.2);
  W.add(ring);
  blok(W, [2.6, 0.82, 0.45], [6.3, 0.02, -6.2], KLEUR.lijn, { rand: false });
  blok(W, [3.4, 0.1, 0.7], [5.9, 0.84, -6.2]);
  liggend(W, [6.62, 1.1, -6.2], { jas: KLEUR.grijs, broek: KLEUR.grijs });
  const glas = new THREE.MeshBasicMaterial({ color: 0xdfe7ea, transparent: true, opacity: 0.35, depthWrite: false });
  blok(W, [0.06, 1.1, 6.2], [2.4, 0.02, -6.9], KLEUR.wit, { materiaal: glas });
  blok(W, [0.9, 0.75, 2.4], [1.1, 0.02, -7.4]);
  blok(W, [0.06, 0.45, 0.7], [1.42, 0.77, -7.95], KLEUR.donker);
  blok(W, [0.06, 0.45, 0.7], [1.42, 0.77, -6.95], KLEUR.donker);
  stoel(W, 0.2, -7.4, Math.PI / 2);
  poppetje(W, { x: 0.2, z: -7.4, rot: Math.PI / 2, zit: true, armen: 1.05, jas: KLEUR.wit, broek: KLEUR.grijs });
  blok(W, [0.7, 0.75, 0.6], [1.3, 0.02, -4.9], KLEUR.lijn);
  aiKastje(W, [0.62, 0.44, 0.5], [1.3, 0.77, -4.9]);
  blok(W, [1.9, 0.75, 0.7], [-0.25, 0.02, -3.0]);
  ankers.ct = new THREE.Vector3(4.6, 2.85, -6.2);
  ankers.aiRadio = new THREE.Vector3(1.3, 1.5, -4.9);
  ankers.radioloog = new THREE.Vector3(0.2, 1.75, -7.4);
  const scans = Array.from({ length: 5 }, () => vel(W, [0.46, 0.04, 0.38]));

  /* Onderzoek: twee labtafels met microscopen en kolven, twee onderzoekers */
  for (const z of [-7.8, -4.6]) blok(W, [6.2, 0.9, 0.8], [12.3, 0.02, z]);
  [[10.2, -7.9], [12.0, -7.7], [14.1, -4.7], [11.0, -4.5]].forEach(([x, z]) => {
    blok(W, [0.26, 0.08, 0.26], [x, 0.92, z], KLEUR.grijs);
    cilinder(W, 0.06, 0.42, [x, 1.0, z - 0.04], KLEUR.donker, { rand: false });
  });
  [[13.2, -7.8], [13.6, -7.7], [12.6, -4.5], [9.8, -4.6]].forEach(([x, z]) => cilinder(W, 0.14, 0.32, [x, 0.92, z], KLEUR.wit, { rTop: 0.05 }));
  poppetje(W, { x: 11.2, z: -7.0, rot: Math.PI, jas: KLEUR.wit, broek: KLEUR.grijs });
  poppetje(W, { x: 13.5, z: -3.8, rot: Math.PI, jas: KLEUR.wit, broek: KLEUR.grijs });

  /* Entree en balie: ingang met luifel, balie, wachtstoelen, chatbotzuil */
  blok(W, [3.2, 1.0, 0.7], [-11.6, 0.02, 4.4]);
  stoel(W, -11.6, 3.5, 0);
  poppetje(W, { x: -11.6, z: 3.5, zit: true, armen: 1.0, jas: KLEUR.mid });
  poppetje(W, { x: -12.3, z: 5.45, rot: Math.PI, jas: KLEUR.grijs, broek: KLEUR.donker });
  poppetje(W, { x: -10.9, z: 5.8, rot: Math.PI, jas: KLEUR.donker, broek: KLEUR.mid });
  [4.6, 5.5, 6.4, 7.3].forEach((z, i) => {
    stoel(W, -15.2, z, Math.PI / 2);
    if (i === 1) poppetje(W, { x: -15.2, z, rot: Math.PI / 2, zit: true, jas: KLEUR.grijs });
  });
  aiKastje(W, [0.6, 1.4, 0.35], [-9.1, 0.02, 8.5]);
  blok(W, [2.4, 0.03, 1.4], [-12, 0, 10.8], KLEUR.grijs, { rand: false });
  ankers.balieAI = new THREE.Vector3(-9.1, 2.0, 8.5);

  /* Polikliniek: spreekkamer met arts, patiënt, AI-kastje dat meeschrijft, onderzoeksbank */
  blok(W, [1.4, 0.75, 1.6], [-4.4, 0.02, 6.2]);
  stoel(W, -5.5, 6.2, Math.PI / 2);
  poppetje(W, { x: -5.5, z: 6.2, rot: Math.PI / 2, zit: true, armen: 1.0, jas: KLEUR.wit, broek: KLEUR.grijs });
  stoel(W, -3.3, 6.2, -Math.PI / 2);
  poppetje(W, { x: -3.3, z: 6.2, rot: -Math.PI / 2, zit: true, armen: 0.5, jas: KLEUR.grijs, broek: KLEUR.donker });
  aiKastje(W, [0.34, 0.2, 0.26], [-4.4, 0.77, 5.75]);
  blok(W, [2.0, 0.6, 0.8], [-6.4, 0.02, 3.0]);
  blok(W, [0.5, 0.1, 0.6], [-7.1, 0.62, 3.0], KLEUR.creme);
  ankers.poliArts = new THREE.Vector3(-5.5, 1.75, 6.2);
  ankers.aiPoli = new THREE.Vector3(-4.4, 1.2, 5.75);

  /* Administratie: vier bureaus; twee schermen tonen AI-uitvoer (codering) */
  [[1.4, 3.9, true], [4.9, 3.9, false], [1.4, 7.1, false], [4.9, 7.1, true]].forEach(([x, z, ai]) => {
    blok(W, [1.8, 0.75, 0.8], [x, 0.02, z]);
    if (ai) aiKastje(W, [0.8, 0.48, 0.06], [x, 0.77, z - 0.15]);
    else blok(W, [0.8, 0.48, 0.06], [x, 0.77, z - 0.15], KLEUR.lijn);
    blok(W, [0.34, 0.12, 0.26], [x + 0.6, 0.77, z + 0.05]);
    stoel(W, x, z + 0.75, Math.PI);
    poppetje(W, { x, z: z + 0.75, rot: Math.PI, zit: true, armen: 1.1, jas: KLEUR.mid, broek: KLEUR.donker });
  });
  [2.6, 4.4, 6.2].forEach((z) => blok(W, [0.5, 1.0, 1.6], [6.45, 0.02, z]));
  ankers.adminAI = new THREE.Vector3(1.4, 1.6, 3.75);

  /* Kwaliteit en veiligheid: de kwaliteitsadviseur met een stapel VIM-meldingen. Hier staat geen AI. */
  blok(W, [2.2, 0.75, 1.0], [10.0, 0.02, 5.0]);
  stoel(W, 10.0, 4.15, 0);
  poppetje(W, { x: 10.0, z: 4.15, zit: true, armen: 1.0, jas: KLEUR.donker, broek: KLEUR.mid });
  blok(W, [2.2, 0.75, 1.0], [13.6, 0.02, 5.0]);
  stoel(W, 13.6, 4.15, 0);
  poppetje(W, { x: 13.6, z: 4.15, zit: true, armen: 1.0, jas: KLEUR.mid, broek: KLEUR.donker });
  for (let i = 0; i < 22; i++) blok(W, [0.5, 0.014, 0.38], [9.3 + (i % 3) * 0.012, 0.77 + i * 0.016, 5.22]);
  [2.4, 3.3].forEach((z) => blok(W, [0.5, 1.2, 0.8], [15.45, 0.02, z]));
  // overleg aan een ronde tafel, bijvoorbeeld een analyse van een melding
  const oc = { x: 12.4, z: 7.1 };
  cilinder(W, 0.18, 0.7, [oc.x, 0.02, oc.z], KLEUR.lijn, { rand: false });
  cilinder(W, 0.85, 0.06, [oc.x, 0.7, oc.z]);
  [1.2, 3.1, 5.0].forEach((a, i) => {
    const x = oc.x + 1.4 * Math.sin(a), z = oc.z + 1.4 * Math.cos(a);
    const rot = Math.atan2(oc.x - x, oc.z - z);
    stoel(W, x, z, rot);
    poppetje(W, { x, z, rot, zit: true, armen: 1.05, jas: i === 1 ? KLEUR.donker : KLEUR.mid, broek: KLEUR.donker });
  });
  for (let i = 0; i < 3; i++) blok(W, [0.34, 0.012, 0.26], [oc.x - 0.3 + i * 0.3, 0.76, oc.z + (i % 2 ? 0.2 : -0.1)]);
  const aiKw = aiKastje(W, [0.5, 0.36, 0.4], [10.8, 0.77, 5.2]);
  aiKw.visible = false;
  ankers.kwStapel = new THREE.Vector3(9.3, 1.6, 5.22);
  ankers.kwAdviseur = new THREE.Vector3(9.4, 1.9, 4.15);
  ankers.aiKw = new THREE.Vector3(11.7, 0.85, 5.7);
  const vims = Array.from({ length: 5 }, () => vel(W, [0.46, 0.02, 0.34]));

  /* Gang: een bed met een patiënt, geduwd door een collega (zorglogistiek) */
  const bed = new THREE.Group();
  bed.position.set(10, 0.02, 0);
  W.add(bed);
  blokM(bed, [2.0, 0.08, 0.9], [0, 0.55, 0]);
  blokM(bed, [1.9, 0.14, 0.86], [0, 0.66, 0], KLEUR.creme);
  blokM(bed, [0.08, 0.5, 0.9], [-1.0, 0.75, 0]);
  for (const [x, z] of [[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]]) blok(bed, [0.06, 0.5, 0.06], [x, 0, z], KLEUR.mid, { rand: false });
  liggend(bed, [0.9, 0.86, 0], { jas: KLEUR.grijs, broek: KLEUR.grijs });
  poppetje(bed, { x: 1.45, z: 0, y: 0, rot: -Math.PI / 2, armen: 0.9, jas: KLEUR.mid, broek: KLEUR.donker });

  return {
    kamers,
    ankers,
    licht: { hemel, zon },
    scherm: (p) => tekenScherm(scherm, p),
    bord: (p) => tekenBord(bord, p),
    scans,
    vims,
    aiKw,
    // het bed rijdt heen en weer door de gang; t in seconden
    stap(t) {
      const f = (t * 0.032) % 2;
      bed.position.x = f < 1 ? 13 - 26 * f : -13 + 26 * (f - 1);
      bed.rotation.y = f < 1 ? 0 : Math.PI;
    },
  };
}
