/* Wat over de printplaat beweegt in harness.html (deel 1). Eén drager per lens:
   - Computer: een binair signaal. Enen en nullen lopen boven de sporen en duiken in de onderdelen.
   - AI-agent: een droid in warm zwart met geel (de AI-markering): cilinderlijf, koepelkop met één oog.
     Het vliegt boven de sporen en landt op elk onderdeel.
   - Jouw ziekenhuis: een poppetje dat door de gangen tussen de onderdelen loopt en bij elk onderdeel
     iets doet: lezen, afvinken, een dossier pakken en doorlezen, nadenken, bellen. Mensenwerk: geen AI-markering.
   Alleen three, geen netwerk. De routes (in wereldcoördinaten) komen uit harness.js. */

import * as THREE from "three";

const INKT = 0x1a1a1a, GEEL = 0xd4db3e;

const klem = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const glad = (a, b, x) => { const t = klem((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const draai = (a, b, k) => {
  const d = ((((b - a + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;
  return a + d * k;
};

/* ---------- lijnen: een reeks punten, met lengtes ---------- */

export function lijn(pts) {
  const len = pts.slice(1).map((p, k) => p.distanceTo(pts[k]));
  return { pts, len, totaal: len.reduce((s, x) => s + x, 0) };
}
// zet uit op afstand s langs de lijn; geeft de index van het stukje terug
export function opLijn(l, s, uit) {
  let rest = klem(s, 0, l.totaal);
  for (let k = 0; k < l.len.length; k++) {
    if (rest <= l.len[k] || k === l.len.length - 1) {
      uit.lerpVectors(l.pts[k], l.pts[k + 1], l.len[k] ? Math.min(1, rest / l.len[k]) : 1);
      return k;
    }
    rest -= l.len[k];
  }
  return 0;
}

/* ---------- licht, alleen voor het botje en het poppetje (Lambert) ---------- */

export function lichtAan(scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8b2a6, 2.4));
  const zon = new THREE.DirectionalLight(0xffffff, 1.6);
  zon.position.set(3, 9, 6);
  scene.add(zon);
}

/* ---------- computer: het binaire signaal ---------- */

export function maakBits(scene) {
  const tex = ["0", "1"].map((c) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const g = cv.getContext("2d");
    g.font = "700 52px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#1a1a1a";
    g.fillText(c, 32, 35);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
  const PATROON = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1];
  const N = 10, AFSTAND = 0.26;
  const groep = new THREE.Group();
  scene.add(groep);
  const bits = Array.from({ length: N }, () => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[0], transparent: true, depthWrite: false }));
    s.scale.set(0.36, 0.36, 1);
    groep.add(s);
    return s;
  });
  const kop = new THREE.Vector3();
  return {
    groep,
    // s = afstand van de kop langs de lijn. Elk bit houdt zijn waarde, zodat het patroon meeloopt.
    zet(l, s) {
      const eerste = Math.floor(s / AFSTAND);
      bits.forEach((b, i) => {
        const j = eerste - i;
        const plek = (((j * AFSTAND) % l.totaal) + l.totaal) % l.totaal;
        opLijn(l, plek, b.position);
        b.material.map = tex[PATROON[((j % PATROON.length) + PATROON.length) % PATROON.length]];
        const achter = (s - j * AFSTAND) / (N * AFSTAND); // 0 = kop, 1 = staart
        b.material.opacity = glad(0, 0.4 / N, achter) * (1 - glad(0.55, 1, achter));
      });
      return opLijn(l, ((s % l.totaal) + l.totaal) % l.totaal, kop), kop;
    },
  };
}

/* ---------- AI-agent: het botje (een eenvoudige droid) ---------- */

export function maakBot(scene) {
  // Een eenvoudige droid: cilinderlijf, koepelkop met één oog, twee zijpoten en een middenvoet.
  // Warm zwart met geel: de AI-markering. Geen merktekens van een bestaande filmrobot.
  const groep = new THREE.Group();
  groep.scale.setScalar(2.2);
  const lijf = new THREE.Group();
  groep.add(lijf);
  const zwart = new THREE.MeshLambertMaterial({ color: INKT });
  const geel = new THREE.MeshBasicMaterial({ color: GEEL });
  const deel = (geo, m, x, y, z, ouder = lijf) => {
    const d = new THREE.Mesh(geo, m);
    d.position.set(x, y, z);
    ouder.add(d);
    return d;
  };
  const doos = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  // lijf, met twee gele strepen voorop
  // dunne gele omtrek (achterkant van een iets grotere vorm): zo valt de droid niet weg op het zwarte taalmodel
  const omtrek = new THREE.MeshBasicMaterial({ color: GEEL, side: THREE.BackSide });
  const romp = new THREE.CylinderGeometry(0.11, 0.105, 0.16, 32);
  deel(romp, zwart, 0, -0.01, 0);
  deel(romp, omtrek, 0, -0.01, 0).scale.set(1.08, 1.05, 1.08);
  deel(doos(0.09, 0.013, 0.012), geel, 0, 0.025, 0.103);
  deel(doos(0.06, 0.013, 0.012), geel, 0, -0.005, 0.103);
  // koepel: draait los van het lijf, zoals de droid rondkijkt
  const koepel = new THREE.Group();
  koepel.position.y = 0.07;
  lijf.add(koepel);
  const kap = new THREE.SphereGeometry(0.112, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  deel(kap, zwart, 0, 0, 0, koepel);
  deel(kap, omtrek, 0, 0, 0, koepel).scale.setScalar(1.07);
  deel(new THREE.CylinderGeometry(0.114, 0.114, 0.014, 32), geel, 0, 0.004, 0, koepel); // gele rand
  const oog = deel(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 20), geel, 0, 0.056, 0.094, koepel);
  oog.rotation.x = Math.PI / 2 - 0.52; // haaks op de koepel
  const lampje = deel(new THREE.SphereGeometry(0.012, 10, 8), geel, 0.05, 0.088, 0.06, koepel);
  // twee zijpoten met voet, en een kleine middenvoet
  for (const x of [-0.135, 0.135]) {
    deel(doos(0.034, 0.17, 0.06), zwart, x, -0.045, 0);
    deel(doos(0.01, 0.04, 0.04), geel, x + Math.sign(x) * 0.022, 0.02, 0); // schouder
    deel(doos(0.05, 0.03, 0.095), zwart, x, -0.135, 0.008);
  }
  deel(doos(0.045, 0.05, 0.05), zwart, 0, -0.115, 0);

  const schaduw = new THREE.Mesh(
    new THREE.CircleGeometry(0.36, 24),
    new THREE.MeshBasicMaterial({ color: INKT, transparent: true, opacity: 0.16, depthWrite: false }),
  );
  schaduw.rotation.x = -Math.PI / 2;
  scene.add(groep, schaduw);

  let richting = 0, helling = 0;
  return {
    zichtbaar(v) { groep.visible = schaduw.visible = v; },
    // pos = midden van het botje; kijk = gewenste richting (rad); vliegt = onderweg; grond = hoogte eronder
    zet(pos, { kijk, vliegt, t, grond, dt }) {
      groep.position.copy(pos);
      groep.position.y += vliegt ? 0.02 * Math.sin(t * 9) : 0.018 * Math.sin(t * 3.2);
      const k = 1 - Math.exp(-dt * 9);
      richting = draai(richting, kijk, k);
      helling += ((vliegt ? 0.3 : 0) - helling) * k;
      groep.rotation.y = richting;
      lijf.rotation.x = helling; // leunt voorover in de vliegrichting
      // op een onderdeel kijkt de koepel rond; onderweg kijkt hij vooruit
      koepel.rotation.y += ((vliegt ? 0 : 0.65 * Math.sin(t * 1.7)) - koepel.rotation.y) * k;
      oog.scale.x = oog.scale.z = t % 2.4 < 0.12 ? 0.35 : 1; // knipperen: de lens wordt even klein
      lampje.visible = Math.floor(t * 2.5) % 3 !== 0;
      schaduw.position.set(pos.x, grond + 0.004, pos.z);
      schaduw.scale.setScalar(klem(1.15 - (pos.y - grond) * 0.45, 0.55, 1.1));
    },
  };
}

/* ---------- jouw ziekenhuis: het poppetje ---------- */

// Hoeken in radialen. Schouder: x < 0 = arm naar voren; z > 0 = rechterarm naar binnen, linkerarm naar buiten.
// Elleboog < 0 = onderarm omhoog. Heup < 0 = been naar voren. Knie > 0 = buigen. romp > 0 = voorover.
// De armhoudingen zijn gezocht met een rooster over de drie hoeken: de hand komt aan het hoofd, aan het oor, voor de borst.
const STAAN = { y: 0, romp: 0, nekX: 0, nekY: 0, rSx: 0, rSz: -0.08, rE: -0.15, lSx: 0, lSz: 0.08, lE: -0.15, rH: 0, rK: 0, lH: 0, lK: 0 };
export const ARMEN = {
  lezenR: [-0.7, 0.25, -1.4], lezenL: [-0.7, -0.25, -1.4], // twee handen voor de borst
  vinkL: [-0.45, -0.3, -1.4], vinkR: [-1, 0.45, -0.85],     // klembord links, pen rechts
  hoofdR: [-2.35, 0.2, -1.6],                               // hand aan het hoofd: krabt, denkt na
  oorR: [-1.7, 0.15, -2.5],                                 // telefoon aan het oor
  draagL: [0.1, -0.3, -2.05],                               // dossier tegen de borst
  pakR: [-0.55, 0.15, -0.25], pakL: [-0.55, -0.15, -0.25], // naar beneden reiken
};
const arm = (P, kant, [sx, sz, e]) => {
  P[kant + "Sx"] = sx; P[kant + "Sz"] = sz; P[kant + "E"] = e;
  return P;
};
const meng = (A, B, w) => {
  const P = {};
  for (const k in A) P[k] = A[k] + (B[k] - A[k]) * w;
  return P;
};

function lopen(fase, A) {
  const s = Math.sin(fase), c = Math.cos(fase);
  return {
    ...STAAN,
    y: A * (0.012 * Math.cos(2 * fase) - 0.008), romp: 0.07 * A,
    lH: -0.5 * s * A, rH: 0.5 * s * A,
    lK: A * (0.08 + 0.75 * Math.max(0, c)), rK: A * (0.08 + 0.75 * Math.max(0, -c)),
    rSx: -0.45 * s * A, lSx: 0.45 * s * A, rE: -0.15 - 0.3 * A, lE: -0.15 - 0.3 * A,
  };
}

// a = 0..1 binnen de handeling, t = seconden sinds het begin
const HANDELING = {
  lezen: (a, t) => arm(arm({ ...STAAN, romp: 0.04, nekX: 0.5, nekY: 0.16 * Math.sin(t * 2.4) }, "r", ARMEN.lezenR), "l", ARMEN.lezenL),
  afvinken: (a, t) => {
    const P = arm(arm({ ...STAAN, romp: 0.05, nekX: 0.55, nekY: -0.08 }, "l", ARMEN.vinkL), "r", ARMEN.vinkR);
    P.rE += -0.22 * Math.abs(Math.sin(t * 5.5)); // drie, vier vinkjes
    P.rSz += 0.08 * Math.sin(t * 2.2);
    return P;
  },
  oppakken: (a) => {
    const b = Math.sin(Math.PI * klem(a / 0.72));
    return arm(arm({ ...STAAN, romp: 0.95 * b, nekX: 0.15 * b, y: -0.04 * b, lH: -0.4 * b, rH: -0.4 * b, lK: 0.85 * b, rK: 0.85 * b }, "r", ARMEN.pakR.map((x) => x * b)), "l", ARMEN.pakL.map((x) => x * b));
  },
  dossier: (a, t) => arm(arm({ ...STAAN, romp: 0.04, nekX: 0.5, nekY: 0.2 * Math.sin(t * 1.9) }, "r", ARMEN.lezenR), "l", ARMEN.lezenL),
  nadenken: (a, t) => {
    const krab = a < 0.6 ? 0.14 * Math.sin(t * 11) : 0; // krabt op het hoofd
    const ja = a > 0.6 ? 0.22 * Math.sin((a - 0.6) * 30) * (1 - glad(0.82, 0.95, a)) : 0; // knikt: "ja, zo zit het"
    const P = arm({ ...STAAN, nekX: -0.1 + ja + glad(0.55, 0.65, a) * 0.2, nekY: 0.2, romp: -0.04 }, "r", ARMEN.hoofdR);
    P.rE += krab;
    return P;
  },
  bellen: (a, t) => arm({ ...STAAN, nekX: 0.08 + 0.06 * Math.sin(t * 3.3), nekY: -0.18 }, "r", ARMEN.oorR),
};
// welke hand vrij is bij het dragen: bij deze handelingen houdt de linkerhand het dossier vast
const LINKS_DRAAGT = new Set(["nadenken", "bellen"]);

export function maakMens(scene) {
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const JAS = mat(0x4b5563), BROEK = mat(0x6b7280), HUID = mat(0xe5e7eb), DONKER = mat(INKT);
  const cap = (r, l, m) => new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), m);

  const wortel = new THREE.Group();
  wortel.scale.setScalar(1.6); // anders is de handeling op de plaat niet te zien
  const heup = new THREE.Group();
  heup.position.y = 0.385;
  wortel.add(heup);
  const romp = new THREE.Group();
  heup.add(romp);
  const torso = cap(0.075, 0.16, JAS);
  torso.position.y = 0.15;
  torso.scale.set(1.35, 1, 0.78);
  romp.add(torso);
  const nek = new THREE.Group();
  nek.position.y = 0.3;
  romp.add(nek);
  const hoofd = new THREE.Mesh(new THREE.SphereGeometry(0.072, 18, 14), HUID);
  hoofd.position.y = 0.08;
  nek.add(hoofd);
  // haar boven en achter: zo zie je welke kant het poppetje op kijkt
  const haar = new THREE.Mesh(new THREE.SphereGeometry(0.077, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), DONKER);
  haar.position.y = 0.085;
  haar.rotation.x = -0.55;
  nek.add(haar);

  const maakArm = (x) => {
    const s = new THREE.Group();
    s.position.set(x, 0.255, 0);
    romp.add(s);
    const boven = cap(0.028, 0.1, JAS);
    boven.position.y = -0.075;
    s.add(boven);
    const e = new THREE.Group();
    e.position.y = -0.15;
    s.add(e);
    const onder = cap(0.025, 0.09, JAS);
    onder.position.y = -0.07;
    e.add(onder);
    const h = new THREE.Group();
    h.position.y = -0.145;
    e.add(h);
    h.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), HUID));
    return { s, e, h };
  };
  const R = maakArm(-0.115), L = maakArm(0.115); // rechts = -x: het poppetje kijkt naar +z

  const maakBeen = (x) => {
    const h = new THREE.Group();
    h.position.set(x, 0, 0);
    heup.add(h);
    const dij = cap(0.04, 0.12, BROEK);
    dij.position.y = -0.095;
    h.add(dij);
    const k = new THREE.Group();
    k.position.y = -0.19;
    h.add(k);
    const scheen = cap(0.035, 0.12, BROEK);
    scheen.position.y = -0.09;
    k.add(scheen);
    const voet = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.11), DONKER);
    voet.position.set(0, -0.18, 0.02);
    k.add(voet);
    return { h, k };
  };
  const RB = maakBeen(-0.055), LB = maakBeen(0.055);

  // spullen
  const randLijn = (geo) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: INKT }));
  const blad = (w, h, d, kleur, regels = 0) => {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, d);
    g.add(new THREE.Mesh(geo, mat(kleur)), randLijn(geo));
    for (let i = 0; i < regels; i++) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(w * (i % 2 ? 0.55 : 0.72), 0.007, 0.002), mat(0x9ca3af));
      r.position.set(0, h * 0.3 - i * 0.026, d / 2 + 0.001);
      g.add(r);
    }
    return g;
  };
  const papier = blad(0.17, 0.23, 0.005, 0xffffff, 5);
  const klembord = blad(0.17, 0.23, 0.012, 0xffffff, 5);
  const klem_ = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.02), DONKER);
  klem_.position.set(0, 0.115, 0.01);
  klembord.add(klem_);
  const telefoon = blad(0.032, 0.065, 0.012, 0x4b5563);

  // het dossier: twee kaften die om de rug draaien, met een vel erin
  const dossier = new THREE.Group();
  const inhoud = new THREE.Group();
  dossier.add(inhoud);
  const kaftA = new THREE.Group(), kaftB = new THREE.Group();
  inhoud.add(kaftA, kaftB);
  const KAFT = 0.16; // breedte van één kaft
  const a = blad(KAFT, 0.22, 0.01, 0xf0ebe0);
  a.position.x = KAFT / 2;
  kaftA.add(a);
  const vel = blad(KAFT - 0.02, 0.2, 0.002, 0xffffff, 5);
  vel.position.set(KAFT / 2, 0, 0.007);
  kaftA.add(vel);
  const b = blad(KAFT, 0.22, 0.01, 0xf0ebe0);
  b.position.set(KAFT / 2, 0, 0.014);
  kaftB.add(b);

  wortel.add(papier, klembord, telefoon, dossier);
  scene.add(wortel);

  const zet = (P) => {
    heup.position.y = 0.385 + P.y;
    romp.rotation.x = P.romp;
    nek.rotation.set(P.nekX, P.nekY, 0);
    R.s.rotation.set(P.rSx, 0, P.rSz); R.e.rotation.x = P.rE;
    L.s.rotation.set(P.lSx, 0, P.lSz); L.e.rotation.x = P.lE;
    RB.h.rotation.x = P.rH; RB.k.rotation.x = P.rK;
    LB.h.rotation.x = P.lH; LB.k.rotation.x = P.lK;
  };

  const hR = new THREE.Vector3(), hL = new THREE.Vector3(), midden = new THREE.Vector3(), draagPlek = new THREE.Vector3();
  // Plat in de handen, de bovenkant naar het publiek: de camera kijkt van boven, dus zo zie je het blad.
  const LEES = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.2, 0, 0));
  const PLAT = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2 + 0.2, Math.PI, 0)); // bijna plat, net opgepakt
  const OPZIJ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 2, 0)); // rechtop tegen de borst
  const OOR = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, -Math.PI / 2, 0));
  const VINK = new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.05, 0, 0));
  let richting = 0;

  return {
    groep: wortel,
    rig: { R, L, wortel }, // voor het berekenen van de armhoudingen
    // staat: pos (op de plaat), kijk (rad), fase (lopen, rad) of null, kracht (0..1, optrekken), handeling + a + t, draagt (0..1), dt
    zet({ pos, kijk, fase, kracht = 1, handeling, a = 0, t = 0, draagt = 0, dt = 0.016 }) {
      wortel.position.copy(pos);
      richting = draai(richting, kijk, 1 - Math.exp(-dt * 10));
      wortel.rotation.y = richting;

      const loopt = fase != null;
      let P = lopen(fase ?? 0, loopt ? kracht : 0);
      if (draagt > 0) P = meng(P, arm({ ...P }, "l", ARMEN.draagL), draagt);
      let w = 0;
      if (handeling) {
        w = glad(0, 0.12, a) * (1 - glad(0.88, 1, a));
        let H = HANDELING[handeling](a, t);
        if (LINKS_DRAAGT.has(handeling)) H = arm(H, "l", ARMEN.draagL.map((x, i) => x * draagt + [STAAN.lSx, STAAN.lSz, STAAN.lE][i] * (1 - draagt)));
        P = meng(P, H, w);
      }
      zet(P);
      wortel.updateMatrixWorld(true);
      wortel.worldToLocal(R.h.getWorldPosition(hR));
      wortel.worldToLocal(L.h.getWorldPosition(hL));
      midden.addVectors(hR, hL).multiplyScalar(0.5);
      draagPlek.copy(hL).add({ x: 0.03, y: 0.02, z: 0.01 });

      const uitIn = (x) => glad(0.05, 0.2, x) * (1 - glad(0.8, 0.95, x));
      // papier: lezen
      papier.visible = handeling === "lezen";
      if (papier.visible) {
        papier.position.copy(midden).add({ x: 0, y: 0.03, z: 0.05 });
        papier.quaternion.copy(LEES);
        papier.scale.setScalar(Math.max(0.001, uitIn(a)));
      }
      // klembord: afvinken
      klembord.visible = handeling === "afvinken";
      if (klembord.visible) {
        klembord.position.copy(hL).add({ x: -0.06, y: 0.03, z: 0.06 });
        klembord.quaternion.copy(VINK);
        klembord.scale.setScalar(Math.max(0.001, uitIn(a)));
      }
      // telefoon: bellen
      telefoon.visible = handeling === "bellen";
      if (telefoon.visible) {
        telefoon.position.copy(hR).add({ x: 0, y: 0.03, z: 0 });
        telefoon.quaternion.copy(OOR);
        telefoon.scale.setScalar(Math.max(0.001, uitIn(a)));
      }
      // dossier: oppakken, doorlezen, dragen
      let schaal = draagt, open = 0;
      if (handeling === "oppakken") {
        schaal = Math.max(draagt, glad(0.3, 0.4, a));
        const omhoog = glad(0.4, 0.85, a);
        dossier.position.lerpVectors(midden, draagPlek, omhoog);
        dossier.quaternion.copy(PLAT).slerp(OPZIJ, omhoog);
      } else if (handeling === "dossier") {
        schaal = 1;
        open = glad(0.12, 0.3, a) * (1 - glad(0.72, 0.88, a));
        dossier.position.lerpVectors(draagPlek, midden.clone().add({ x: 0, y: 0.03, z: 0.06 }), w);
        dossier.quaternion.copy(OPZIJ).slerp(LEES, w);
      } else {
        dossier.position.copy(draagPlek);
        dossier.quaternion.copy(OPZIJ);
      }
      dossier.visible = schaal > 0.01;
      dossier.scale.setScalar(Math.max(0.001, schaal));
      inhoud.position.x = -(KAFT / 2) * (1 - open); // dicht: midden in de hand; open: de rug in het midden
      kaftA.rotation.y = 0.3 * open;
      kaftB.rotation.y = -(Math.PI - 0.35) * open;
    },
  };
}
