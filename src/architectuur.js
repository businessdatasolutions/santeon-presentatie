/* Van ruwe melding naar bestuurbaar signaal — twee pagina's, één script.
   <body data-versie="keten">    architectuur.html (3a): deel 1 de happy flow als 3D-stapel (Three.js),
                                 deel 2 twee meldingen langs zes stations (D3 + motion).
   <body data-versie="groeipad"> groeipad.html (2c): dezelfde stapel, van Ask naar Automate,
                                 met de feedbackstroom van de mens terug het systeem in.
   Vast script, geen netwerkaanroepen. Meldingen en uitkomsten zijn gelijk aan
   vim-okf-simulatie.jsx en vim-agent-animatie.html (VIM-2026-0470 en VIM-2026-0485). */

import * as THREE from "three";
import * as d3 from "d3";
import { animate, stagger } from "motion";
import { SAC, MELDINGEN } from "./meldingen.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const T = (s) => (reduce ? 0 : s);
const $ = (id) => document.getElementById(id);

// lucide "bot" en "user-round"
const BOT = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>';
const MENS = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
const VINK = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/* ================= Het script ================= */

// Stappen met deel 0 tonen een scène van de 3D-stapel (zie SCENES in maakStapel).
// Stappen met deel 1 zijn de stations van de reis van twee meldingen.
const VERSIES = {
  keten: {
    kop: ["Van ruwe melding naar bestuurbaar signaal", "Twee meldingen door het proces"],
    deel: ["Deel 1 · Hoog over", "Deel 2 · Twee meldingen"],
    stappen: [
      { deel: 0, scene: "overzicht", laag: "Overzicht · als alles goed gaat", titel: "Vijf lagen", tekst: ["Onderin komen de meldingen binnen.", "Bovenin ziet het bestuur het signaal."] },
      { deel: 0, scene: "lake", laag: "Laag 1 van 5", titel: "Data lake", tekst: ["Meldingen komen binnen als vrije tekst.", "Die tekst kun je niet tellen."] },
      { deel: 0, scene: "onto", laag: "Laag 2 van 5", titel: "Ontologie", tekst: ["Elke melding krijgt vaste begrippen: categorie, afdeling, uitkomst.", "Nu kun je tellen en vergelijken."] },
      { deel: 0, scene: "okf", laag: "Laag 3 van 5", titel: "OKF-kennis", tekst: ["Hier staan de regels en definities.", "Mensen hebben ze opgeschreven."] },
      { deel: 0, scene: "ai", laag: "Laag 4 van 5", titel: "AI-agent", ai: true, tekst: ["De agent leest vier kennisbestanden.", "Je ziet precies welke."] },
      { deel: 0, scene: "rapportage", laag: "Laag 5 van 5", titel: "Rapportage", tekst: ["Het bestuur ziet het signaal.", "Elk getal is terug te volgen tot de melding.", "Dit is de keten als alles goed gaat. Vandaag zit er nog een mens tussen: dat zie je zo."] },
      { deel: 1, onder: "Vandaag, op niveau Ask: twee meldingen uit de data lake. Nog vrije tekst." },
      { deel: 1, onder: "In 0470 staat het woord ‘val’ niet. Via de ontologie is het toch een val." },
      { deel: 1, onder: "Voor 0485 leest de agent één bestand extra: het draaiboek voor de IGJ." },
      { deel: 1, onder: "De AI doet een voorstel, met een citaat uit de melding als bewijs." },
      { deel: 1, onder: "Een mens beslist. Bij een calamiteit altijd." },
      { deel: 1, onder: "Beide meldingen staan in het overzicht. 0485 geeft een IGJ-signaal." },
    ],
  },
  groeipad: {
    kop: ["Van Ask naar Automate in de keten"],
    deel: ["2c · Groeimodel"],
    stappen: [
      { deel: 0, scene: "ask", laag: "Stap 1 · niveau Ask", titel: "Een mens beoordeelt alles", tekst: ["Een mens beoordeelt elk voorstel van de AI.", "Elke correctie gaat terug: naar de instructies, de kennis en de begrippen.", "Soms ook naar de melder: wat ontbrak er in de melding?"] },
      { deel: 0, scene: "meekijken", laag: "Stap 2 · meekijken bij twijfel", titel: "De AI geeft zijn zekerheid", tekst: ["Per SAC-niveau geeft de AI een kans.", "Is de hoogste kans lager dan 90%? Dan kijkt een mens mee.", "Een steekproef van de zekere gevallen ziet de mens ook."],
        legenda: true,
        zeker: { titel: "Voorbeeld: een val zonder letsel", reeks: [[5, 10, 15, 70]], drempel: 90, conclusie: "Meest waarschijnlijk SAC 4, met 70%. Dat is onder de drempel: een mens kijkt mee." } },
      { deel: 0, scene: "leert", laag: "Stap 3 · het model leert", titel: "Scherper door feedback", tekst: ["De correcties worden data: welke voorstellen waren fout-positief of fout-negatief?", "Het model leert daarvan en onderscheidt scherper.", "Minder twijfel, dus minder meldingen langs de mens."],
        legenda: true,
        zeker: { titel: "Dezelfde soort melding, na leren", reeks: [[5, 10, 15, 70], [2, 5, 9, 84], [1, 2, 4, 93]], drempel: 90, conclusie: "SAC 4, met 93%. Boven de drempel: direct naar het overzicht." } },
      { deel: 0, scene: "automate", laag: "Stap 4 · niveau Automate", titel: "Alleen calamiteiten naar een mens", tekst: ["Alle andere meldingen gaan direct naar het overzicht.", "Een calamiteit gaat altijd naar een mens, hoe zeker de AI ook is."],
        zeker: { titel: "Voorbeeld: een calamiteit", reeks: [[88, 8, 3, 1]], drempel: null, conclusie: "SAC 1, met 88%. Calamiteit: altijd naar een mens." } },
      { deel: 0, scene: "patroon", laag: "Stap 5 · het systeem onthoudt", titel: "Drie keer hetzelfde is een patroon", tekst: ["Het systeem onthoudt wat het zag, over afdelingen heen.", "Normaal: één val door bedhoogte per maand. Nu: drie in twee weken, op drie afdelingen.", "De kans stijgt, dus het risico ook. Het patroon gaat als signaal naar een mens."],
        normaal: { titel: "Hoe vaak is normaal? · in twee weken", perTweeWeken: 0.5, gezien: 3, conclusie: "Bij normaal is de kans op drie of meer 1,4%. Dit past niet bij normaal: een signaal met minimaal SAC 2. Elke melding houdt zelf SAC 4." } },
    ],
  },
};
const VERSIE = VERSIES[document.body.dataset.versie] || VERSIES.keten;
const STAPPEN = VERSIE.stappen;
const START_REIS = STAPPEN.findIndex((s) => s.deel === 1);

/* ================= Deel 1: de stapel (Three.js) ================= */

function maakStapel(doek, labelLaag) {
  const Y = [0, 1.3, 2.6, 3.9, 5.2];
  const PAD = new THREE.Vector3(4.5, (Y[3] + Y[4]) / 2, 0);
  const LAGEN = ["Data lake", "Ontologie", "OKF-kennis", "AI-agent", "Rapportage"];
  const BESTANDEN = [
    { naam: "runbook triage", leest: true }, { naam: "categorieën", leest: true }, { naam: "ernst (SAC)", leest: true },
    { naam: "PRISMA", leest: true }, { naam: "runbook IGJ", leest: false }, { naam: "calamiteitenratio", leest: false },
  ];
  // Scènes. cam = camerapositie en kijkhoogte; actief = laag die oplicht; route = hoe de puntjes bewegen
  // (lake: blijven liggen, stijg: tot hoogte top, keten: helemaal door tot de rapportage);
  // bestanden = welke OKF-labels zichtbaar zijn; mens = welke meldingen langs de mens gaan
  // (geen mens = happy flow, alles gaat direct door); feedback = sterkte van de terugstroom.
  // Groeipad (2c):
  //   ask        — een mens beoordeelt elke melding.
  //   meekijken  — de AI geeft per SAC-niveau een kans. Een mens kijkt mee als de hoogste kans
  //                onder de drempel (90%) ligt, plus een steekproef van de zekere gevallen.
  //   leert      — het model leert van fout-positieven en fout-negatieven: dezelfde meldingen,
  //                scherpere kansen (z1), dus minder twijfel en minder meldingen langs de mens.
  //   automate   — alleen calamiteiten gaan naar een mens; de rest gaat direct naar het overzicht.
  //   patroon    — geheugen van bewijs (#10): drie SAC 4-meldingen met dezelfde oorzaak op drie
  //                afdelingen. Samen past dat niet bij de normale frequentie, dus de kans en het risico
  //                stijgen. Het patroon gaat als signaal naar een mens; elke melding houdt haar SAC 4.
  // zekerheid = welke kans de puntjes tonen (licht bolletje = onder de drempel).
  // u.sac is een index: 0 = SAC 1 … 3 = SAC 4.
  const DREMPEL = 0.9;
  const GROEI_CAM = { x: 10.5, y: 6.8, z: 11.5, ty: 2.9 };
  const SCENES = {
    overzicht: { cam: { x: 9, y: 7.5, z: 11.5, ty: 2.7 }, route: "keten" },
    lake: { cam: { x: 8, y: 3, z: 9.6, ty: 0.4 }, actief: 0, route: "lake" },
    onto: { cam: { x: 8, y: 4.4, z: 9.6, ty: 1.5 }, actief: 1, route: "stijg", top: Y[1] + 0.5 },
    okf: { cam: { x: 8, y: 6, z: 9.6, ty: 2.7 }, actief: 2, route: "stijg", top: Y[2] + 0.5, bestanden: "alle" },
    ai: { cam: { x: 9.6, y: 3.8, z: 8.8, ty: 3.1 }, actief: 3, route: "stijg", top: Y[3] - 0.15, bestanden: "gelezen" },
    rapportage: { cam: { x: 8.6, y: 9.4, z: 10, ty: 4.8 }, actief: 4, route: "keten" },
    ask: { cam: GROEI_CAM, route: "keten", mens: () => true, feedback: 1 },
    meekijken: { cam: GROEI_CAM, route: "keten", zekerheid: "z0", feedback: 0.7,
      mens: (u) => u.sac === 0 || u.z0 < DREMPEL || u.steekproef },
    leert: { cam: GROEI_CAM, route: "keten", zekerheid: "z1", feedback: 0.4,
      mens: (u) => u.sac === 0 || u.z1 < DREMPEL || u.steekproef },
    automate: { cam: GROEI_CAM, route: "keten", zekerheid: "z2", feedback: 0.15,
      mens: (u) => u.sac === 0 },
    patroon: { cam: { x: 10.5, y: 6.2, z: 11.5, ty: 2.5 }, actief: 1, route: "keten", zekerheid: "z2", feedback: 0.15,
      patroon: true, mens: (u) => u.sac === 0 || u.cluster },
  };
  // drie meldingen uit hetzelfde patroon: zelfde oorzaak, drie afdelingen (banen 0, 2 en 4 op de ontologie)
  const CLUSTER = [
    { i: 25, afdeling: "Geriatrie", x: -2.4, z: -0.5 },
    { i: 22, afdeling: "Interne", x: 0, z: 0.6 },
    { i: 24, afdeling: "Cardiologie", x: 2.4, z: -0.2 },
  ];
  const SACKLEUR = [0xb23a2e, 0xd97a28, 0xd0a400, 0x2e8b72];
  const GRIJS = 0x9ca3af, INKT = 0x1a1a1a, GEEL = 0xd4db3e;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  doek.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1.5, 0.1, 100);
  let huidig = SCENES.overzicht, loopt = false, t0 = performance.now();
  const cam = { ...huidig.cam }, doel = { ...huidig.cam };

  const label = (html, cls) => {
    const el = document.createElement("div");
    el.className = "lbl " + (cls || "");
    el.innerHTML = html;
    labelLaag.appendChild(el);
    return el;
  };
  const rand = (mesh, kleur) => {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: kleur }));
    e.position.copy(mesh.position);
    scene.add(e);
    return e;
  };

  const platen = LAGEN.map((naam, i) => {
    const ai = i === 3;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.12, 4),
      new THREE.MeshBasicMaterial({ color: ai ? INKT : 0xf0ebe0, transparent: true, opacity: ai ? 0.96 : 0.45, depthWrite: ai }),
    );
    m.position.y = Y[i];
    scene.add(m);
    return { m, e: rand(m, ai ? GEEL : GRIJS), l: label((ai ? BOT : "") + naam, ai ? "ai" : ""), ai };
  });

  const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 48), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  pad.position.copy(PAD);
  scene.add(pad);
  const padRand = rand(pad, INKT);
  const padLabel = label(MENS + "Mens beslist", "mens");

  // Feedback van de mens terug het systeem in: naar de instructies van de agent, de OKF-kennis,
  // de ontologie en (dunner) naar de melder. Bij de start (Ask) is die stroom groot; hij krimpt
  // naarmate het vertrouwen groeit. Feedback is mensenwerk: geen AI-markering, blokjes in plaats van bolletjes.
  const FEEDBACK = [
    { laag: 3, gewicht: 1, z: 0.9 },
    { laag: 2, gewicht: 1, z: 0.3 },
    { laag: 1, gewicht: 0.75, z: -0.3 },
    { laag: 0, gewicht: 0.5, z: -0.9 },
  ];
  const FB_PER_LIJN = 4;
  const terug = FEEDBACK.map((fb) => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(PAD.x, PAD.y - 0.08, PAD.z),
      new THREE.Vector3(PAD.x + 1.4, (PAD.y + Y[fb.laag]) / 2, fb.z),
      new THREE.Vector3(3.05, Y[fb.laag] + 0.08, fb.z),
    );
    const lijn = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(48)),
      new THREE.LineBasicMaterial({ color: INKT, transparent: true, opacity: 0 }),
    );
    scene.add(lijn);
    const blokjes = Array.from({ length: FB_PER_LIJN }, () => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), new THREE.MeshBasicMaterial({ color: INKT }));
      b.visible = false;
      scene.add(b);
      return b;
    });
    return { ...fb, curve, lijn, blokjes };
  });
  const fbLabel = label("Feedback van de mens", "feedback");

  // Patroon (geheugen van bewijs): drie markeringen op de ontologie, verbonden door lijnen.
  // De AI herkent het verband; daarom krijgt het label de AI-markering.
  const clusterPunten = CLUSTER.map((c) => new THREE.Vector3(c.x, Y[1] + 0.2, c.z));
  const clusterBollen = clusterPunten.map((pt) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 18), new THREE.MeshBasicMaterial({ color: SACKLEUR[3], transparent: true, opacity: 0 }));
    b.position.copy(pt);
    scene.add(b);
    return b;
  });
  const clusterLijn = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(clusterPunten),
    new THREE.LineBasicMaterial({ color: INKT, transparent: true, opacity: 0 }),
  );
  scene.add(clusterLijn);
  const clusterLabels = CLUSTER.map((c) => label(c.afdeling, "bestand"));
  const clusterMidden = clusterPunten.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(clusterPunten.length);
  const patroonLabel = label(BOT + "AI-signaal: 3× val door bedhoogte", "ai patroon");

  const tegels = BESTANDEN.map((b, i) => {
    const x = -2 + (i % 3) * 2, z = i < 3 ? -1.1 : 1.1;
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.16, 0.85), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    m.position.set(x, Y[2] + 0.14, z);
    scene.add(m);
    const e = rand(m, GRIJS);
    let lijn = null;
    const pulsen = [];
    if (b.leest) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, Y[2] + 0.22, z), new THREE.Vector3(x, Y[3] - 0.06, z)]);
      lijn = new THREE.Line(g, new THREE.LineBasicMaterial({ color: INKT, transparent: true, opacity: 0 }));
      scene.add(lijn);
      for (let k = 0; k < 3; k++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), new THREE.MeshBasicMaterial({ color: GEEL }));
        p.visible = false;
        scene.add(p);
        pulsen.push(p);
      }
    }
    return { m, e, lijn, pulsen, l: label(b.naam, "bestand"), x, z, leest: b.leest };
  });

  // meldingen als puntjes; vaste toevalsreeks zodat het beeld elke keer gelijk is
  const rnd = d3.randomLcg(7);
  const N = 48;
  const sacVan = (i) => (i === 0 ? 0 : i < 6 ? 1 : i < 22 ? 2 : 3);
  const deeltjes = Array.from({ length: N }, (_, i) => {
    const p = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.15 : 0.09, 14, 14), new THREE.MeshBasicMaterial({ color: GRIJS, transparent: true }));
    // z0 = hoogste kans vóór het leren (0,60–0,99); z1 en z2 = dezelfde melding na leren: scherper
    const z0 = 0.6 + rnd() * 0.39;
    p.userData = {
      x: (rnd() - 0.5) * 5.2, z: (rnd() - 0.5) * 3.4, off: i / N, baan: i % 5, sac: sacVan(i),
      z0, z1: 1 - (1 - z0) * 0.4, z2: 1 - (1 - z0) * 0.12, steekproef: i % 9 === 4,
      cluster: CLUSTER.some((c) => c.i === i),
    };
    scene.add(p);
    return p;
  });

  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  // positie van een puntje op tijd t in scène sc; geeft de fase terug (ruw / orde / ai)
  function plaats(u, t, sc, uit) {
    const f = reduce ? u.off : (u.off + t * 0.05) % 1;
    const ox = -2.4 + u.baan * 1.2, oz = u.z * 0.35;
    if (sc.route === "lake") {
      uit.set(u.x, 0.16 + (reduce ? 0 : Math.abs(Math.sin(t * 1.3 + u.off * 20)) * 0.12), u.z);
      return "ruw";
    }
    if (sc.route === "keten") {
      const top = Y[3] + 0.15;
      if (f < 0.6) {
        const y = (f / 0.6) * top, orde = y > Y[1];
        uit.set(orde ? ox : u.x, y, orde ? oz : u.z);
        return orde ? "orde" : "ruw";
      }
      A.set(ox, top, oz);
      B.set(PAD.x, PAD.y + 0.15, PAD.z);
      C.set(ox * 0.6, Y[4] + 0.15, oz);
      if (!sc.mens || !sc.mens(u)) {
        // direct van de AI-laag naar de rapportage
        const g = (f - 0.6) / 0.4;
        uit.lerpVectors(A, C, g);
        uit.y += Math.sin(g * Math.PI) * 0.35;
      } else if (f < 0.8) {
        const g = (f - 0.6) / 0.2;
        uit.lerpVectors(A, B, g);
        uit.y += Math.sin(g * Math.PI) * 0.7;
      } else {
        const g = (f - 0.8) / 0.2;
        uit.lerpVectors(B, C, g);
        uit.y += Math.sin(g * Math.PI) * 0.5;
      }
      return "ai";
    }
    const y = f * sc.top, orde = y > Y[1];
    uit.set(orde ? ox : u.x, y, orde ? oz : u.z);
    return orde ? "orde" : "ruw";
  }

  const v = new THREE.Vector3();
  function zet(el, x, y, z, w, h) {
    v.set(x, y, z).project(camera);
    el.style.left = ((v.x + 1) / 2) * w + "px";
    el.style.top = ((1 - v.y) / 2) * h + "px";
  }

  function teken(nu) {
    if (!loopt) return;
    const t = (nu - t0) / 1000, k = reduce ? 1 : 0.07, sc = huidig;
    for (const p in doel) cam[p] += (doel[p] - cam[p]) * k;
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(0.1, cam.ty, 0);

    deeltjes.forEach((p) => {
      const fase = plaats(p.userData, t, sc, p.position);
      p.material.color.setHex(fase === "ai" ? SACKLEUR[p.userData.sac] : fase === "orde" ? INKT : GRIJS);
      // licht bolletje = de AI twijfelt (hoogste kans onder de drempel)
      const twijfelt = fase === "ai" && sc.zekerheid && p.userData[sc.zekerheid] < DREMPEL;
      p.material.opacity = twijfelt ? 0.35 : 1;
      p.scale.setScalar(sc.patroon && p.userData.cluster ? 1.8 : 1);
    });

    const patroon = Boolean(sc.patroon);
    const patroonDoel = patroon ? 1 : 0;
    clusterBollen.forEach((b) => { b.material.opacity += (patroonDoel - b.material.opacity) * (reduce ? 1 : 0.08); });
    clusterLijn.material.opacity += (patroonDoel - clusterLijn.material.opacity) * (reduce ? 1 : 0.08);
    clusterLabels.forEach((l) => { l.style.opacity = patroonDoel; });
    patroonLabel.style.opacity = patroonDoel;

    platen.forEach((p, i) => {
      const aan = i === sc.actief;
      if (!p.ai) {
        p.e.material.color.setHex(aan ? INKT : GRIJS);
        p.m.material.opacity = aan ? 0.85 : 0.45;
      }
      p.l.classList.toggle("aan", aan);
    });
    const sterkte = sc.feedback || 0;
    terug.forEach((fb, i) => {
      const doel = sterkte > 0 ? 0.25 + 0.65 * sterkte * fb.gewicht : 0;
      fb.lijn.material.opacity += (doel - fb.lijn.material.opacity) * (reduce ? 1 : 0.08);
      const aantal = sterkte > 0 ? Math.max(1, Math.round(sterkte * fb.gewicht * FB_PER_LIJN)) : 0;
      fb.blokjes.forEach((b, n) => {
        b.visible = n < aantal && !reduce;
        const f = (t * 0.35 + n / FB_PER_LIJN + i * 0.17) % 1;
        b.position.copy(fb.curve.getPoint(f));
        b.rotation.set(t, t * 0.7, 0);
      });
    });
    fbLabel.style.opacity = sterkte > 0 ? 1 : 0;

    // het mensplatform bestaat alleen in scènes met een mens; de happy flow heeft er geen
    const mens = Boolean(sc.mens);
    pad.visible = padRand.visible = mens;
    padLabel.style.opacity = mens ? 1 : 0;
    padLabel.classList.toggle("aan", mens);

    tegels.forEach((tg, i) => {
      const gelezen = sc.bestanden === "gelezen" && tg.leest;
      tg.m.material.color.setHex(gelezen ? INKT : 0xffffff);
      tg.e.material.color.setHex(gelezen ? GEEL : sc.bestanden === "alle" ? INKT : GRIJS);
      if (tg.lijn) {
        tg.lijn.material.opacity += ((gelezen ? 1 : 0) - tg.lijn.material.opacity) * (reduce ? 1 : 0.08);
        tg.pulsen.forEach((p, n) => {
          p.visible = gelezen && !reduce;
          const f = (t * 0.5 + n / 3 + i * 0.13) % 1;
          p.position.set(tg.x, Y[2] + 0.22 + f * (Y[3] - Y[2] - 0.28), tg.z);
        });
      }
      tg.l.style.opacity = sc.bestanden === "alle" || gelezen ? 1 : 0;
      tg.l.classList.toggle("ai", gelezen);
    });

    const w = doek.clientWidth, h = doek.clientHeight;
    platen.forEach((p, i) => zet(p.l, -3.1, Y[i], 2, w, h));
    tegels.forEach((tg, i) => zet(tg.l, tg.x, Y[2] + 0.3 + (i % 2) * 0.4, tg.z, w, h));
    zet(padLabel, PAD.x, PAD.y - 0.1, PAD.z, w, h);
    const midden = terug[1].curve.getPoint(0.45);
    zet(fbLabel, midden.x + 0.5, midden.y, midden.z, w, h);
    clusterLabels.forEach((l, i) => zet(l, clusterPunten[i].x, clusterPunten[i].y - 0.55, clusterPunten[i].z + 0.3, w, h));
    zet(patroonLabel, clusterMidden.x + 1.1, clusterMidden.y - 0.75, clusterMidden.z + 2.2, w, h);

    renderer.render(scene, camera);
    requestAnimationFrame(teken);
  }

  function maat() {
    const w = doek.clientWidth, h = doek.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(maat).observe(doek);
  maat();

  return {
    ga(naam) {
      huidig = SCENES[naam];
      Object.assign(doel, huidig.cam);
      if (reduce) Object.assign(cam, huidig.cam);
    },
    start() {
      if (loopt) return;
      loopt = true;
      maat();
      requestAnimationFrame(teken);
    },
    stop() {
      loopt = false;
    },
  };
}

/* ================= Deel 2: de reis (D3 + motion) ================= */

function maakReis() {
  const STATIONS = ["Data lake", "Ontologie", "OKF-kennis", "AI-agent", "Mens beslist", "Rapportage"];
  const X = STATIONS.map((_, i) => 110 + i * 196), RY = 92;
  const svg = d3.select("#rail");

  svg.append("line").attr("x1", X[0]).attr("x2", X[5]).attr("y1", RY).attr("y2", RY)
    .attr("stroke", "#e5e7eb").attr("stroke-width", 8).attr("stroke-linecap", "round");
  const voortgang = svg.append("line").attr("x1", X[0]).attr("x2", X[0]).attr("y1", RY).attr("y2", RY)
    .attr("stroke", "#d4db3e").attr("stroke-width", 8).attr("stroke-linecap", "round");

  const st = svg.selectAll("g.station").data(STATIONS).join("g").attr("class", "station")
    .attr("transform", (_, i) => `translate(${X[i]},${RY})`);
  st.append("circle").attr("r", 24)
    .attr("fill", (_, i) => (i === 3 ? "#1a1a1a" : "#fff"))
    .attr("stroke", (_, i) => (i === 3 ? "#1a1a1a" : "#9ca3af")).attr("stroke-width", 2.5);
  st.filter((_, i) => i === 3).append("g").attr("transform", "translate(-12,-12)").attr("color", "#d4db3e")
    .html(BOT.replace('class="i"', 'width="24" height="24"'));
  st.filter((_, i) => i === 4).append("g").attr("transform", "translate(-12,-12)").attr("color", "#1a1a1a")
    .html(MENS.replace('class="i"', 'width="24" height="24"'));
  st.append("text").attr("y", 52).attr("text-anchor", "middle").attr("font-size", 19).attr("font-weight", 700)
    .attr("fill", "#1a1a1a").text((d) => d);

  const fiches = svg.selectAll("g.fiche").data(MELDINGEN).join("g").attr("class", "fiche")
    .attr("transform", (_, i) => `translate(${X[0] + (i ? 44 : -44)},${RY - 58})`);
  fiches.append("rect").attr("x", -38).attr("y", -15).attr("width", 76).attr("height", 30).attr("rx", 7)
    .attr("fill", "#1a1a1a");
  fiches.append("text").attr("text-anchor", "middle").attr("dy", 6).attr("fill", "#fff").attr("font-size", 16)
    .attr("font-weight", 700).attr("font-family", "SF Mono, Monaco, Consolas, monospace").text((d) => d.kort);

  const banen = $("banen"), dashboard = $("dashboard"), onder = $("onderschrift");
  banen.innerHTML = MELDINGEN.map((m) => `
    <div class="baan">
      <div class="baan-kop"><span class="id">${m.id}</span><span class="meta">${m.afdeling} · ${m.melder} · ${m.datum}</span></div>
      <div class="inhoud"></div>
    </div>`).join("");
  const inhoud = [...banen.querySelectorAll(".inhoud")];

  const metMarkering = (m) =>
    m.markeer.reduce((t, frase) => t.replace(frase, `<mark>${frase}</mark>`), m.tekst);

  const VIEWS = [
    (m) => `<div class="kaart"><div class="klein">Vrije tekst</div><p class="ruw">${m.tekst}</p>
      <div class="leeg">Geen categorie · geen ernst · niet te tellen</div></div>`,
    (m) => `<div class="kaart"><div class="klein">Woorden worden begrippen</div><p class="ruw">${metMarkering(m)}</p>
      <div class="chips">${m.begrippen.map(([k, w]) => `<span class="chip">${k}: <b>${w}</b></span>`).join("")}</div></div>`,
    (m) => `<div class="kaart"><div class="klein">De agent leest deze kennis</div><div class="bestanden">
      ${[...m.okf, ...(m.extra ? [m.extra] : [])].map((f) => `<div class="bestand"><span class="bot">${BOT}</span>${f}${
        f === m.extra ? '<span class="extra">alleen bij SAC 1</span>' : ""}</div>`).join("")}</div></div>`,
    (m) => `<div class="kaart ai"><div class="klein">${BOT} AI-voorstel</div>
      <div class="voorstel"><span class="sac" style="background:${SAC[m.sac].kleur};color:${SAC[m.sac].inkt}">SAC ${m.sac}</span>${SAC[m.sac].label.split(" · ")[1]}</div>
      <div class="regel"><span>Grens</span><span>${m.grens}</span></div>
      <div class="regel"><span>Bewijs</span><span class="citaat">“${m.citaat}”</span></div>
      <div class="regel"><span>Basisoorzaak</span><span>${m.basis}</span></div>
      <div class="toets">${BOT} Controle door een tweede AI: ${m.toets}/100</div></div>`,
    (m) => `<div class="kaart"><div class="mens-kop">${MENS}${m.mens.kop}</div>
      <div>Voorstel van de AI: SAC ${m.sac}</div>
      <div class="chips">${m.mens.acties.map((a) => `<span class="chip">${a}</span>`).join("")}</div>
      ${m.mens.draaiboek ? `<div class="draaiboek">${m.mens.draaiboek}</div>` : ""}
      <div class="besluit">${VINK} Bevestigd: SAC ${m.sac}</div></div>`,
  ];

  function dashboardTekenen() {
    dashboard.innerHTML = "";
    const kolommen = d3.select(dashboard).selectAll("div.kolom").data([1, 2, 3, 4]).join("div").attr("class", "kolom");
    kolommen.append("div").attr("class", "kop").style("background", (n) => SAC[n].kleur).style("color", (n) => SAC[n].inkt).text((n) => SAC[n].label);
    kolommen.append("div").attr("class", "vak")
      .html((n) => MELDINGEN.filter((m) => m.sac === n)
        .map((m) => `<div class="melding"><b>${m.kort}</b> · ${m.categorie} · ${m.afdeling}</div>`).join(""));
    d3.select(dashboard).append("div").attr("class", "kpis").html(`
      <div class="kpi"><div class="n">2</div><div class="t">meldingen verwerkt</div></div>
      <div class="kpi alarm"><div class="n">1</div><div class="t">calamiteit · IGJ-signaal</div></div>
      <div class="kpi"><div class="n">2</div><div class="t">besluiten door een mens</div></div>`);
    animate(dashboard.querySelectorAll(".kolom"), { opacity: [0, 1], y: [16, 0] }, { duration: T(0.4), delay: stagger(T(0.08)) });
    animate(dashboard.querySelectorAll(".melding"), { opacity: [0, 1], y: [-40, 0], scale: [0.9, 1] },
      { duration: T(0.5), delay: stagger(T(0.35), { startDelay: T(0.5) }) });
    animate(dashboard.querySelectorAll(".kpi"), { opacity: [0, 1], x: [20, 0] }, { duration: T(0.4), delay: stagger(T(0.15), { startDelay: T(1.2) }) });
  }

  let vorige = -1;
  return {
    ga(i) {
      const richting = i >= vorige ? 1 : -1;
      vorige = i;
      voortgang.transition().duration(T(0.7) * 1000).ease(d3.easeCubicInOut).attr("x2", X[i]);
      fiches.transition().duration(T(0.7) * 1000).ease(d3.easeCubicInOut)
        .attr("transform", (_, n) => `translate(${X[i] + (n ? 44 : -44)},${RY - 58})`);
      // de ernst wordt pas zichtbaar als de AI een voorstel doet (station 3)
      fiches.select("rect").transition().duration(T(0.4) * 1000)
        .attr("fill", (m) => (i >= 3 ? SAC[m.sac].kleur : "#1a1a1a"));
      fiches.select("text").attr("fill", (m) => (i >= 3 ? SAC[m.sac].inkt : "#fff"));
      st.select("circle").transition().duration(T(0.3) * 1000)
        .attr("stroke", (_, n) => (n === i ? "#d4db3e" : n === 3 ? "#1a1a1a" : "#9ca3af"))
        .attr("stroke-width", (_, n) => (n === i ? 6 : 2.5));

      onder.textContent = STAPPEN[START_REIS + i].onder;
      animate(onder, { opacity: [0, 1], y: [8, 0] }, { duration: T(0.4) });

      const dash = i === STATIONS.length - 1;
      banen.hidden = dash;
      dashboard.hidden = !dash;
      if (dash) return dashboardTekenen();

      MELDINGEN.forEach((m, n) => {
        const el = inhoud[n];
        el.innerHTML = VIEWS[i](m);
        animate(el.firstElementChild, { opacity: [0, 1], x: [40 * richting, 0] }, { duration: T(0.45), delay: T(n * 0.12) });
        const chips = el.querySelectorAll(".chip");
        if (chips.length) animate(chips, { opacity: [0, 1], y: [12, 0] }, { duration: T(0.35), delay: stagger(T(0.15), { startDelay: T(0.9 + n * 0.12) }) });
        el.querySelectorAll("mark").forEach((mk, k) => setTimeout(() => mk.classList.add("aan"), T(0.4 + k * 0.35) * 1000));
        el.querySelectorAll(".bestand").forEach((b, k) => setTimeout(() => b.classList.add("gelezen"), T(0.5 + k * 0.35 + n * 0.1) * 1000));
        const besluit = el.querySelector(".besluit");
        if (besluit) animate(besluit, { opacity: [0, 1], scale: [1.4, 1] }, { duration: T(0.35), delay: T(1.1 + n * 0.3) });
      });
    },
  };
}

/* ================= Regie ================= */

const stapel = maakStapel($("doek"), $("labels"));
// deel 2 bestaat alleen op de pagina met de reis (architectuur.html)
const reis = START_REIS >= 0 && $("reis") ? maakReis() : null;
let stap = -1;

let zekerTimer = null;

function uitlegTekenen(s) {
  const el = $("uitleg");
  clearTimeout(zekerTimer);
  el.classList.toggle("met-grafiek", Boolean(s.zeker || s.normaal));
  el.innerHTML = `<div class="laag">${s.laag}</div>
    <h2>${s.titel}${s.ai ? ` <span class="ai-tag">${BOT} AI</span>` : ""}</h2>
    ${s.tekst.map((t) => `<p>${t}</p>`).join("")}
    ${s.legenda ? '<p class="legenda"><span><span class="bol"></span>de AI is zeker</span><span><span class="bol licht"></span>de AI twijfelt</span></p>' : ""}`;
  if (s.zeker) zekerheidTekenen(el, s.zeker);
  if (s.normaal) normaalTekenen(el, s.normaal);
  animate([...el.children], { opacity: [0, 1], y: [10, 0] }, { duration: T(0.4), delay: stagger(T(0.08)) });
}

// "Hoe vaak is normaal?" — geheugen van bewijs (#10). Bij een normale frequentie van λ per twee weken
// geeft de Poisson-verdeling de kans op 0, 1, 2 en 3+ meldingen. De staaf van wat het systeem nu
// zag licht op. Dit is een berekening van het systeem: AI-markering (zwart vlak, geel, Bot-icoon).
function normaalTekenen(el, n) {
  const fac = (k) => (k <= 1 ? 1 : k * fac(k - 1));
  const p = (k) => (Math.exp(-n.perTweeWeken) * n.perTweeWeken ** k) / fac(k);
  const data = [0, 1, 2].map((k) => ({ label: `${k}×`, kans: p(k) * 100 }));
  data.push({ label: `${n.gezien}× of meer`, kans: (1 - p(0) - p(1) - p(2)) * 100, gezien: true });
  const pct = (v) => (v < 10 ? v.toFixed(1).replace(".", ",") : Math.round(v)) + "%";

  const box = document.createElement("div");
  box.className = "zeker";
  box.innerHTML = `<div class="zeker-kop">${BOT} ${n.titel}</div>
    <svg class="grafiek" viewBox="0 0 400 190" role="img" aria-label="Kans op 0, 1, 2 of 3 en meer meldingen bij een normale frequentie"></svg>
    <div class="zeker-conclusie" aria-live="polite"></div>`;
  el.appendChild(box);
  const svg = d3.select(box).select("svg.grafiek");
  const x = d3.scaleBand().domain(data.map((d) => d.label)).range([20, 380]).padding(0.3);
  const y = d3.scaleLinear().domain([0, 70]).range([150, 22]);
  svg.selectAll("text.as").data(data).join("text").attr("class", "as")
    .attr("x", (d) => x(d.label) + x.bandwidth() / 2).attr("y", 174).attr("text-anchor", "middle").text((d) => d.label);
  const staaf = svg.selectAll("rect.balk").data(data).join("rect").attr("class", "balk").attr("rx", 3)
    .attr("x", (d) => x(d.label)).attr("width", x.bandwidth())
    .attr("fill", (d) => (d.gezien ? "#d4db3e" : "#6b7280")).attr("y", 150).attr("height", 0);
  svg.selectAll("text.pct").data(data).join("text").attr("class", "pct").attr("text-anchor", "middle")
    .attr("x", (d) => x(d.label) + x.bandwidth() / 2).attr("y", (d) => Math.min(y(d.kans), 150) - 6).text((d) => pct(d.kans))
    .attr("opacity", 0).transition().delay(T(0.9) * 1000).duration(T(0.3) * 1000).attr("opacity", 1);
  svg.append("text").attr("class", "drempel-tekst").attr("text-anchor", "middle")
    .attr("x", x(data[3].label) + x.bandwidth() / 2).attr("y", 104).text("nu")
    .attr("opacity", 0).transition().delay(T(1.3) * 1000).duration(T(0.3) * 1000).attr("opacity", 1);
  staaf.transition().delay((_, i) => T(0.3 + i * 0.12) * 1000).duration(T(0.6) * 1000).ease(d3.easeCubicOut)
    .attr("y", (d) => y(d.kans)).attr("height", (d) => 150 - y(d.kans));

  const conclusie = box.querySelector(".zeker-conclusie");
  zekerTimer = setTimeout(() => {
    conclusie.textContent = n.conclusie;
    animate(conclusie, { opacity: [0, 1] }, { duration: T(0.4) });
  }, T(1.6) * 1000);
}

// Kans per SAC-niveau voor één voorbeeldmelding. Dit is AI-uitvoer: zwart vlak, geel, Bot-icoon.
// Een reeks met meer verdelingen speelt af als "het model leert": de staven worden scherper.
function zekerheidTekenen(el, z) {
  const box = document.createElement("div");
  box.className = "zeker";
  box.innerHTML = `<div class="zeker-kop">${BOT} Zekerheid van de AI · ${z.titel}</div>
    <svg class="grafiek" viewBox="0 0 400 190" role="img" aria-label="Kans per SAC-niveau"></svg>
    <div class="zeker-conclusie" aria-live="polite"></div>`;
  el.appendChild(box);
  const svg = d3.select(box).select("svg.grafiek");
  const niveaus = [1, 2, 3, 4];
  const x = d3.scaleBand().domain(niveaus).range([20, 380]).padding(0.3);
  const y = d3.scaleLinear().domain([0, 100]).range([150, 22]);
  const start = z.reeks[0];

  svg.selectAll("text.as").data(niveaus).join("text").attr("class", "as")
    .attr("x", (n) => x(n) + x.bandwidth() / 2).attr("y", 174).attr("text-anchor", "middle").text((n) => `SAC ${n}`);
  if (z.drempel) {
    svg.append("line").attr("class", "drempel").attr("x1", 14).attr("x2", 386).attr("y1", y(z.drempel)).attr("y2", y(z.drempel));
    svg.append("text").attr("class", "drempel-tekst").attr("x", 16).attr("y", y(z.drempel) - 6).attr("text-anchor", "start")
      .text(`drempel ${z.drempel}%`);
  }
  const balk = svg.selectAll("rect.balk").data(niveaus).join("rect").attr("class", "balk").attr("rx", 3)
    .attr("x", (n) => x(n)).attr("width", x.bandwidth()).attr("fill", (n) => SAC[n].kleur)
    .attr("y", (_, i) => y(start[i])).attr("height", (_, i) => 150 - y(start[i]));
  const pct = svg.selectAll("text.pct").data(niveaus).join("text").attr("class", "pct").attr("text-anchor", "middle")
    .attr("x", (n) => x(n) + x.bandwidth() / 2).attr("y", (_, i) => y(start[i]) - 6).text((_, i) => `${start[i]}%`);

  const conclusie = box.querySelector(".zeker-conclusie");
  let k = 1;
  const klaar = () => {
    conclusie.textContent = z.conclusie;
    animate(conclusie, { opacity: [0, 1] }, { duration: T(0.4) });
  };
  const volgende = () => {
    if (k >= z.reeks.length) return klaar();
    const v = z.reeks[k++];
    const duur = T(0.9) * 1000;
    balk.transition().duration(duur).ease(d3.easeCubicInOut).attr("y", (_, i) => y(v[i])).attr("height", (_, i) => 150 - y(v[i]));
    pct.transition().duration(duur).ease(d3.easeCubicInOut).attr("y", (_, i) => y(v[i]) - 6)
      .tween("text", function (_, i) {
        const van = parseInt(this.textContent, 10);
        return (t) => { this.textContent = `${Math.round(van + (v[i] - van) * t)}%`; };
      });
    zekerTimer = setTimeout(volgende, duur + T(0.5) * 1000);
  };
  zekerTimer = setTimeout(volgende, T(0.8) * 1000);
}

function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  const oud = stap >= 0 ? STAPPEN[stap].deel : -1;
  stap = n;
  const s = STAPPEN[n];

  $("deel").textContent = VERSIE.deel[s.deel];
  $("kop").textContent = VERSIE.kop[s.deel];
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);

  if (s.deel !== oud) {
    const naar = s.deel === 0 ? $("stapel") : $("reis");
    const van = s.deel === 0 ? $("reis") : $("stapel");
    if (van) van.hidden = true;
    naar.hidden = false;
    animate(naar, { opacity: [0, 1] }, { duration: T(0.5) });
    if (s.deel === 0) stapel.start();
    else stapel.stop();
  }

  if (s.deel === 0) {
    stapel.ga(s.scene);
    uitlegTekenen(s);
  } else {
    reis.ga(n - START_REIS);
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
