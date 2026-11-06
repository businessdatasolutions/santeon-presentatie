/* Het VIM-proces (2b): van melding tot verbetering.
   d3      tekent het schema: knopen, pijlen, takken en de terugkoppellus (SVG).
   Three.js tekent de meldingen die door het schema stromen (laag boven de SVG):
            bolletjes = meldingen, grijs tot de triage en daarna in de SAC-kleur;
            zwarte blokjes = terugkoppeling naar de melder; de 3D-bol = de casus die je volgt.
   motion  regelt de opbouw, de overgangen en de reis van de casus van station naar station.
   Vast script, geen netwerkaanroepen. De casussen komen uit src/meldingen.js.
   Dit is het proces van vandaag: mensen doen het werk. Daarom staat hier geen AI-markering. */

import * as THREE from "three";
import * as d3 from "d3";
import { animate, stagger } from "motion";
import { SAC, MELDINGEN } from "./meldingen.js";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const T = (s) => (reduce ? 0 : s);
const $ = (id) => document.getElementById(id);
const VW = 1900, VH = 580;
const PAPIER = "#f9f8f4", INKT = "#1a1a1a", GRIJS = "#9ca3af";

/* ================= Het schema ================= */

const KNOPEN = {
  incident: { vorm: "ellips", x: 115, y: 260, w: 190, h: 110, titel: "Incident", sub: ["of bijna-incident"], soort: "start" },
  melden: { vorm: "rect", x: 380, y: 260, w: 220, h: 110, titel: "Melden", sub: ["laagdrempelig:", "iedereen mag melden"] },
  triage: { vorm: "rect", x: 640, y: 260, w: 220, h: 110, titel: "Triage op ernst", sub: ["met de risicomatrix"] },
  ernst: { vorm: "ruit", x: 880, y: 260, w: 170, h: 150, titel: "Ernst?", soort: "beslis" },
  decentraal: { vorm: "rect", x: 1170, y: 110, w: 260, h: 110, titel: "Decentrale analyse", sub: ["door de afdeling (PVC)"], soort: "tak" },
  centraal: { vorm: "rect", x: 1170, y: 410, w: 260, h: 130, titel: "Centrale analyse", sub: ["MIP-commissie en", "raad van bestuur;", "IGJ bij calamiteit"], soort: "tak" },
  verbeter: { vorm: "rect", x: 1475, y: 260, w: 260, h: 110, titel: "Verbetermaatregelen", sub: ["en kennis delen"] },
  terug: { vorm: "rect", x: 1765, y: 260, w: 220, h: 110, titel: "Terugkoppeling", sub: ["naar de melder,", "continu verbeteren"] },
};
const IDS = Object.keys(KNOPEN);
const K = (id) => KNOPEN[id];
const P = {
  links: (id) => [K(id).x - K(id).w / 2, K(id).y],
  rechts: (id) => [K(id).x + K(id).w / 2, K(id).y],
  boven: (id) => [K(id).x, K(id).y - K(id).h / 2],
  onder: (id) => [K(id).x, K(id).y + K(id).h / 2],
};
const LUS_Y = 530;

// Elke pijl is een lijn door hoekpunten; d3.path rondt de hoeken af.
const PIJLEN = {
  "incident-melden": [P.rechts("incident"), P.links("melden")],
  "melden-triage": [P.rechts("melden"), P.links("triage")],
  "triage-ernst": [P.rechts("triage"), P.links("ernst")],
  "ernst-decentraal": [P.boven("ernst"), [K("ernst").x, K("decentraal").y], P.links("decentraal")],
  "ernst-centraal": [P.onder("ernst"), [K("ernst").x, K("centraal").y], P.links("centraal")],
  "decentraal-verbeter": [P.rechts("decentraal"), [K("verbeter").x, K("decentraal").y], P.boven("verbeter")],
  "centraal-verbeter": [P.rechts("centraal"), [K("verbeter").x, K("centraal").y], P.onder("verbeter")],
  "verbeter-terug": [P.rechts("verbeter"), P.links("terug")],
  lus: [P.onder("terug"), [K("terug").x, LUS_Y], [K("melden").x, LUS_Y], P.onder("melden")],
};
const ROUTES = {
  laag: ["incident-melden", "melden-triage", "triage-ernst", "ernst-decentraal", "decentraal-verbeter", "verbeter-terug"],
  hoog: ["incident-melden", "melden-triage", "triage-ernst", "ernst-centraal", "centraal-verbeter", "verbeter-terug"],
};
const VAN = (e) => e.split("-")[0];
const NAAR = (e) => e.split("-")[1];
const routeVan = (sac) => (sac <= 2 ? "hoog" : "laag");

function rond(pts, r = 28) {
  const p = d3.path();
  p.moveTo(...pts[0]);
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, c, b] = [pts[i - 1], pts[i], pts[i + 1]];
    const l1 = Math.hypot(c[0] - a[0], c[1] - a[1]), l2 = Math.hypot(b[0] - c[0], b[1] - c[1]);
    const rr = Math.min(r, l1 / 2, l2 / 2);
    p.lineTo(c[0] + ((a[0] - c[0]) / l1) * rr, c[1] + ((a[1] - c[1]) / l1) * rr);
    p.quadraticCurveTo(c[0], c[1], c[0] + ((b[0] - c[0]) / l2) * rr, c[1] + ((b[1] - c[1]) / l2) * rr);
  }
  p.lineTo(...pts.at(-1));
  return p.toString();
}

function tekenSchema(svg) {
  const defs = svg.append("defs");
  for (const [id, cls] of [["punt", ""], ["punt-grijs", ""]]) {
    defs.append("marker").attr("id", id).attr("class", cls).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5)
      .attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 15).attr("markerHeight", 15).attr("orient", "auto-start-reverse")
      .append("path").attr("d", "M0,1 L9,5 L0,9 z");
  }

  const pijlen = svg.append("g").attr("class", "pijlen").selectAll("path").data(Object.keys(PIJLEN)).join("path")
    .attr("class", (e) => (e === "lus" ? "pijl lus" : "pijl"))
    .attr("d", (e) => rond(PIJLEN[e]))
    .attr("marker-end", (e) => (e === "lus" ? "url(#punt-grijs)" : "url(#punt)"));

  // Labels bij de twee takken, links van de verticale lijn uit de ruit.
  const takken = svg.append("g").selectAll("g.taklabel").data([
    { tak: "ernst-decentraal", tekst: "laag / gemiddeld", y: K("decentraal").y + 40 },
    { tak: "ernst-centraal", tekst: "hoog / calamiteit", y: K("centraal").y - 40 },
  ]).join("g").attr("class", "taklabel");
  takken.append("rect").attr("rx", 6);
  takken.append("text").attr("x", K("ernst").x - 16).attr("y", (d) => d.y).attr("text-anchor", "end").text((d) => d.tekst);
  takken.each(function () {
    const b = this.querySelector("text").getBBox();
    d3.select(this).select("rect").attr("x", b.x - 8).attr("y", b.y - 4).attr("width", b.width + 16).attr("height", b.height + 8);
  });

  const luslabel = svg.append("text").attr("class", "luslabel")
    .attr("x", (K("melden").x + K("terug").x) / 2).attr("y", LUS_Y - 22) // boven de lijn: de blokjes rijden over de lijn
    .text("terugkoppeling: de melder hoort wat er met de melding gebeurt");

  const knopen = svg.append("g").attr("class", "knopen").selectAll("g.knoop").data(IDS).join("g")
    .attr("class", (id) => `knoop ${K(id).soort || ""}`);
  knopen.each(function (id) {
    const k = K(id), g = d3.select(this);
    for (const cls of ["halo", "vorm"]) {
      if (k.vorm === "rect") {
        g.append("rect").attr("class", cls).attr("x", k.x - k.w / 2).attr("y", k.y - k.h / 2)
          .attr("width", k.w).attr("height", k.h).attr("rx", 14);
      } else if (k.vorm === "ellips") {
        g.append("ellipse").attr("class", cls).attr("cx", k.x).attr("cy", k.y).attr("rx", k.w / 2).attr("ry", k.h / 2);
      } else {
        g.append("polygon").attr("class", cls).attr("stroke-linejoin", "round")
          .attr("points", [[k.x, k.y - k.h / 2], [k.x + k.w / 2, k.y], [k.x, k.y + k.h / 2], [k.x - k.w / 2, k.y]].join(" "));
      }
    }
    const regels = [{ t: k.titel, c: "titel", h: 30 }, ...(k.sub || []).map((t) => ({ t, c: "sub", h: 22 }))];
    let y = k.y - d3.sum(regels, (r) => r.h) / 2;
    for (const r of regels) {
      g.append("text").attr("class", r.c).attr("x", k.x).attr("y", y + r.h / 2).text(r.t);
      y += r.h;
    }
  });

  return { pijlen, takken, luslabel, knopen };
}

/* ================= Banen: de weg die een melding aflegt ================= */

const STAP = 2; // afstand tussen twee punten op een baan (eenheden van de viewBox)

function binnen(id, x, y) {
  const k = K(id), dx = Math.abs(x - k.x), dy = Math.abs(y - k.y), rx = k.w / 2 - 2, ry = k.h / 2 - 2;
  if (k.vorm === "rect") return dx <= rx && dy <= ry;
  if (k.vorm === "ellips") return (dx / rx) ** 2 + (dy / ry) ** 2 <= 1;
  return dx / rx + dy / ry <= 1;
}
const knoopOp = (x, y) => IDS.findIndex((id) => binnen(id, x, y));

function monster(padEl) {
  const L = padEl.getTotalLength(), n = Math.max(2, Math.ceil(L / 6));
  return d3.range(n + 1).map((i) => {
    const p = padEl.getPointAtLength((i / n) * L);
    return [p.x, p.y];
  });
}

// Zet een reeks punten om in een baan met vaste stapgrootte. K[i] = de knoop waarin punt i ligt (-1 = op een pijl).
function maakBaan(punten) {
  const cum = [0];
  for (let i = 1; i < punten.length; i++) cum.push(cum[i - 1] + Math.hypot(punten[i][0] - punten[i - 1][0], punten[i][1] - punten[i - 1][1]));
  const L = cum.at(-1), n = Math.ceil(L / STAP) + 1;
  const X = new Float32Array(n), Y = new Float32Array(n), Kn = new Int8Array(n);
  for (let i = 0, j = 0; i < n; i++) {
    const d = Math.min(i * STAP, L);
    while (j < cum.length - 2 && cum[j + 1] < d) j++;
    const t = (d - cum[j]) / (cum[j + 1] - cum[j] || 1);
    X[i] = punten[j][0] + (punten[j + 1][0] - punten[j][0]) * t;
    Y[i] = punten[j][1] + (punten[j + 1][1] - punten[j][1]) * t;
    Kn[i] = knoopOp(X[i], Y[i]);
  }
  return { X, Y, K: Kn, L, i: (d) => Math.max(0, Math.min(n - 1, Math.round(d / STAP))) };
}

// Een route loopt van het midden van het incident, door elke knoop heen, tot het midden van de terugkoppeling.
// rand[pijl] = afstand waar die pijl begint en eindigt; daarmee vind je de stops van de casus.
function maakRoute(pijlen, monsters) {
  const punten = [], rand = {};
  let afstand = 0;
  const voeg = (p) => {
    if (punten.length) afstand += Math.hypot(p[0] - punten.at(-1)[0], p[1] - punten.at(-1)[1]);
    punten.push(p);
  };
  for (const e of pijlen) {
    voeg([K(VAN(e)).x, K(VAN(e)).y]);
    const s = monsters[e];
    voeg(s[0]);
    const start = afstand;
    s.slice(1).forEach(voeg);
    rand[e] = { start, eind: afstand };
  }
  voeg([K(NAAR(pijlen.at(-1))).x, K(NAAR(pijlen.at(-1))).y]);
  return { ...maakBaan(punten), pijlen, rand };
}

// De casus staat stil net vóór de knoop, op de pijl ernaartoe.
function stopBij(route, station) {
  if (station === "incident") return route.rand[route.pijlen[0]].start + 26;
  const e = route.pijlen.find((p) => NAAR(p) === station);
  return route.rand[e].eind - 26;
}

/* ================= De laag met meldingen (Three.js) ================= */

function maakStroom(bord, overlay, banen) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  bord.insertBefore(renderer.domElement, overlay);
  const scene = new THREE.Scene();
  // Orthografische camera in de eenheden van de viewBox: x naar rechts, y naar beneden (vandaar -y).
  const camera = new THREE.OrthographicCamera(0, VW, 0, -VH, -500, 500);
  camera.position.z = 200;
  scene.add(new THREE.AmbientLight(0xffffff, 1.3));
  const zon = new THREE.DirectionalLight(0xffffff, 2.4);
  zon.position.set(-0.5, 0.7, 1);
  scene.add(zon);

  const kleur = {
    grijs: new THREE.Color(GRIJS), inkt: new THREE.Color(INKT), papier: new THREE.Color(PAPIER),
    sac: Object.fromEntries([1, 2, 3, 4].map((n) => [n, new THREE.Color(SAC[n].kleur)])),
  };

  // --- de stroom: platte bolletjes met een witte rand ---
  const N = 240;
  const schijf = new THREE.CircleGeometry(1, 28);
  const ring = new THREE.InstancedMesh(schijf, new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }), N);
  const vul = new THREE.InstancedMesh(schijf, new THREE.MeshBasicMaterial({ depthTest: false }), N);
  ring.renderOrder = 1;
  vul.renderOrder = 2;
  for (let i = 0; i < N; i++) vul.setColorAt(i, kleur.grijs);
  scene.add(ring, vul);

  // --- terugkoppeling: kleine draaiende blokjes (mensenwerk: zwart, geen AI-markering) ---
  const NB = 40;
  const blokken = new THREE.InstancedMesh(new THREE.BoxGeometry(13, 13, 13), new THREE.MeshLambertMaterial({ color: 0x2a2a2a }), NB);
  blokken.renderOrder = 3;
  scene.add(blokken);

  // --- de casus: een belichte bol met een witte en zwarte rand ---
  const casusGroep = new THREE.Group();
  const rand = new THREE.Mesh(new THREE.CircleGeometry(22, 48), new THREE.MeshBasicMaterial({ color: INKT, depthTest: false }));
  const wit = new THREE.Mesh(new THREE.CircleGeometry(20, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
  const bol = new THREE.Mesh(new THREE.SphereGeometry(16, 40, 28), new THREE.MeshStandardMaterial({ color: INKT, roughness: 0.4 }));
  rand.renderOrder = 4; wit.renderOrder = 5; bol.renderOrder = 6;
  bol.position.z = 40;
  casusGroep.add(rand, wit, bol);
  casusGroep.visible = false;
  scene.add(casusGroep);
  const fiche = document.createElement("div");
  fiche.className = "fiche";
  overlay.appendChild(fiche);

  // --- tellers bij de knopen (alleen in de stap "Elke dag") ---
  const TELLERS = { melden: "gemeld", decentraal: "decentraal", centraal: "centraal", terug: "teruggekoppeld" };
  const telling = Object.fromEntries(Object.keys(TELLERS).map((id) => [id, 0]));
  const pillen = Object.fromEntries(Object.entries(TELLERS).map(([id, woord]) => {
    const el = document.createElement("div");
    el.className = "teller-pil";
    el.style.left = (K(id).x / VW) * 100 + "%";
    el.style.top = ((K(id).y - K(id).h / 2 - 24) / VH) * 100 + "%";
    el.innerHTML = `<span>0</span><small>${woord}</small>`;
    overlay.appendChild(el);
    return [id, el];
  }));

  // Instellingen per modus. per = seconden tussen twee nieuwe meldingen; dim = hoe ver de stroom vervaagt.
  const MODI = {
    overzicht: { per: 0.3, snel: 200, kleur: false, dim: 0, terug: 0.25, tel: false },
    casus: { per: 1.1, snel: 200, kleur: false, dim: 0.85, terug: 0, tel: false },
    stroom: { per: 0.1, snel: 320, kleur: true, dim: 0, terug: 0.3, tel: true },
  };
  // Voorbeeldverdeling van de ernst: veel SAC 4, weinig calamiteiten. Illustratief.
  const VERDELING = [[1, 0.03], [2, 0.12], [3, 0.3], [4, 0.55]];
  const rnd = d3.randomLcg(11);
  const trekSac = () => {
    let r = rnd();
    for (const [n, kans] of VERDELING) if ((r -= kans) <= 0) return n;
    return 4;
  };

  const deeltjes = Array.from({ length: N }, () => ({ aan: false }));
  const blokjes = Array.from({ length: NB }, () => ({ aan: false }));
  let modus = MODI.overzicht, wacht = 0, casusLus = false, lusWacht = 0;
  const casus = { route: null, d: 0, sac: 4, kleurStop: Infinity, kleur: new THREE.Color(INKT), schaal: 1, kort: "" };

  function nieuweMelding() {
    const p = deeltjes.find((q) => !q.aan);
    if (!p) return;
    const sac = trekSac();
    Object.assign(p, { aan: true, sac, route: banen[routeVan(sac)], d: 0, k: -2, snel: modus.snel * (0.85 + rnd() * 0.3) });
    p.kleurVanaf = p.route.rand["triage-ernst"].start;
  }
  function nieuwBlokje() {
    const b = blokjes.find((q) => !q.aan);
    if (b) Object.assign(b, { aan: true, d: 0, draai: rnd() * 6 });
  }

  function verder(dt) {
    if (!reduce) {
      wacht -= dt;
      while (wacht <= 0) {
        nieuweMelding();
        wacht += modus.per * (0.6 + rnd() * 0.8);
      }
    }
    for (const p of deeltjes) {
      if (!p.aan) continue;
      const r = p.route, i = r.i(p.d), k = r.K[i];
      // In een knoop is het bolletje onzichtbaar: daar gaat het snel, zodat je de meldingen vooral op de pijlen ziet.
      p.d += dt * p.snel * (k >= 0 ? 2.5 : 1);
      if (k !== p.k) {
        if (k >= 0 && modus.tel && IDS[k] in telling) telling[IDS[k]]++;
        p.k = k;
      }
      if (p.d >= r.L) {
        p.aan = false;
        if (rnd() < modus.terug) nieuwBlokje();
      }
    }
    if (casusLus && !reduce) {
      lusWacht -= dt;
      if (lusWacht <= 0) {
        nieuwBlokje();
        lusWacht = 4;
      }
    }
    for (const b of blokjes) {
      if (!b.aan) continue;
      b.d += dt * 240;
      b.draai += dt * 2.2;
      if (b.d >= banen.lus.L) b.aan = false;
    }
  }

  const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), quat = new THREE.Quaternion(), sch = new THREE.Vector3(), eul = new THREE.Euler();
  const tmp = new THREE.Color();

  function teken() {
    deeltjes.forEach((p, n) => {
      let r = 0;
      if (p.aan) {
        const route = p.route, i = route.i(p.d);
        if (route.K[i] < 0) {
          r = modus === MODI.stroom ? 9 : 8;
          pos.set(route.X[i], -route.Y[i], 0);
        }
        tmp.copy(modus.kleur && p.d > p.kleurVanaf ? kleur.sac[p.sac] : kleur.grijs).lerp(kleur.papier, modus.dim);
        vul.setColorAt(n, tmp);
      }
      quat.identity();
      sch.set(r, r, 1);
      vul.setMatrixAt(n, m4.compose(pos, quat, sch));
      sch.set(r ? r + 2.5 : 0, r ? r + 2.5 : 0, 1);
      ring.setMatrixAt(n, m4.compose(pos, quat, sch));
    });
    vul.instanceMatrix.needsUpdate = ring.instanceMatrix.needsUpdate = true;
    vul.instanceColor.needsUpdate = true;

    blokjes.forEach((b, n) => {
      const lus = banen.lus;
      let s = 0;
      if (b.aan) {
        const i = lus.i(b.d);
        pos.set(lus.X[i], -lus.Y[i], 30);
        s = 1;
      }
      quat.setFromEuler(eul.set(b.draai || 0, (b.draai || 0) * 0.7, 0));
      sch.setScalar(s);
      blokken.setMatrixAt(n, m4.compose(pos, quat, sch));
    });
    blokken.instanceMatrix.needsUpdate = true;

    if (casus.route) {
      const r = casus.route, i = r.i(casus.d);
      casusGroep.position.set(r.X[i], -r.Y[i], 0);
      const doel = r.K[i] >= 0 ? 0.55 : 1; // in een knoop: kleiner, zodat de tekst leesbaar blijft
      casus.schaal += (doel - casus.schaal) * (reduce ? 1 : 0.2);
      casusGroep.scale.setScalar(casus.schaal);
      const gekleurd = casus.d >= casus.kleurStop;
      casus.kleur.lerp(gekleurd ? kleur.sac[casus.sac] : kleur.inkt, reduce ? 1 : 0.12);
      bol.material.color.copy(casus.kleur);
      bol.rotation.y += 0.01;
      fiche.style.left = (r.X[i] / VW) * 100 + "%";
      fiche.style.top = (r.Y[i] / VH) * 100 + "%";
      fiche.style.background = gekleurd ? SAC[casus.sac].kleur : INKT;
      fiche.style.color = gekleurd ? SAC[casus.sac].inkt : "#fff";
    }

    for (const id in pillen) {
      const s = pillen[id].firstElementChild, v = String(telling[id]);
      if (s.textContent !== v) s.textContent = v;
    }
    renderer.render(scene, camera);
  }

  let vorige = performance.now();
  function lus(nu) {
    const dt = Math.min(0.05, (nu - vorige) / 1000);
    vorige = nu;
    verder(dt);
    teken();
    requestAnimationFrame(lus);
  }

  function maat() {
    const w = bord.clientWidth, h = bord.clientHeight;
    if (w && h) renderer.setSize(w, h, false);
  }
  new ResizeObserver(maat).observe(bord);
  maat();
  requestAnimationFrame(lus);

  // Laat de stroom alvast lopen, zodat het schema niet leeg begint.
  function voorspoelen(sec) {
    for (let t = 0; t < sec; t += 0.05) verder(0.05);
  }

  let reis = null;
  return {
    modus(naam) {
      const oud = modus;
      modus = MODI[naam];
      if (modus.tel && oud !== modus) {
        for (const id in telling) telling[id] = 0;
        animate(Object.values(pillen), { opacity: [0, 1], y: [8, 0] }, { duration: T(0.4), delay: stagger(T(0.1)) });
      } else if (!modus.tel && oud.tel) {
        animate(Object.values(pillen), { opacity: 0 }, { duration: T(0.25) });
      }
      for (const p of deeltjes) if (p.aan) p.snel = modus.snel * (0.85 + rnd() * 0.3);
      // Bij een casus telt alleen het blokje van die casus: haal de blokjes uit de stroom weg.
      if (naam === "casus") for (const b of blokjes) b.aan = false;
      if (oud !== modus && naam !== "casus" && !reduce) voorspoelen(naam === "stroom" ? 7 : 4);
    },
    // Zet de casus op station `van` en laat hem naar station `naar` reizen.
    casus(melding, van, naar, { lus: metLus = false } = {}) {
      reis?.stop();
      casusLus = false;
      if (!melding) {
        casus.route = null;
        casusGroep.visible = false;
        animate(fiche, { opacity: 0 }, { duration: T(0.2) });
        return;
      }
      const route = banen[routeVan(melding.sac)];
      const nieuw = casus.route !== route || casus.kort !== melding.kort;
      Object.assign(casus, { route, sac: melding.sac, kort: melding.kort, kleurStop: stopBij(route, "triage") - 4 });
      fiche.textContent = melding.kort;
      if (nieuw) {
        casus.kleur.copy(kleur.inkt);
        animate(fiche, { opacity: [0, 1] }, { duration: T(0.3) });
      }
      casusGroep.visible = true;
      const start = stopBij(route, van), eind = stopBij(route, naar);
      casus.d = start;
      if (start === eind) return;
      reis = animate(start, eind, {
        duration: T(Math.min(3.4, Math.max(0.8, (eind - start) / 330))),
        ease: [0.45, 0, 0.25, 1],
        onUpdate: (v) => { casus.d = v; },
        onComplete: () => {
          if (metLus) {
            casusLus = true;
            lusWacht = 0;
          }
        },
      });
    },
    voorspoelen,
  };
}

/* ================= Het script ================= */

const [M0470, M0485] = MELDINGEN;
const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const datum = (iso) => {
  const [j, m, d] = iso.split("-").map(Number);
  return `${d} ${MAANDEN[m - 1]} ${j}`;
};

// Stappen van de casus: `bij` is het station waar de casus aan het eind van de stap staat.
const STAPPEN = [
  { modus: "overzicht", wat: "Het proces in het kort", titel: "Elke melding volgt dezelfde weg",
    tekst: ["Iemand meldt een incident. De ernst bepaalt wie de melding analyseert.", "Aan het eind hoort de melder wat er met de melding is gebeurd."] },
  { modus: "casus", m: M0470, bij: "incident", titel: "Het incident",
    tekst: ["Een patiënt glijdt bij het opstaan langs de bedrand naar beneden.", "De familie vangt de patiënt op. Er is geen letsel."] },
  { modus: "casus", m: M0470, bij: "melden", titel: "Melden",
    tekst: ["De verzorgende meldt het incident.", "Iedereen mag melden, ook als er geen schade is."] },
  { modus: "casus", m: M0470, bij: "triage", titel: "Triage op ernst",
    tekst: ["Een lid van de PVC bepaalt de ernst met de risicomatrix."], uitkomst: "Gering: geen schade." },
  { modus: "casus", m: M0470, bij: "decentraal", titel: "Decentrale analyse",
    tekst: ["De ernst is laag. De afdeling analyseert de melding zelf.", "De oorzaak: na de verzorging stond het bed te hoog."] },
  { modus: "casus", m: M0470, bij: "verbeter", titel: "Verbetermaatregel",
    tekst: ["Na elke verzorging gaat het bed in de laagste stand.", "De afdeling deelt dit met andere afdelingen."] },
  { modus: "casus", m: M0470, bij: "terug", titel: "Terugkoppeling",
    tekst: ["De verzorgende hoort wat er met de melding is gebeurd.", "Wie dat hoort, meldt de volgende keer weer."] },
  { modus: "casus", m: M0485, bij: "melden", titel: "Incident en melding",
    tekst: ["Na een overplaatsing controleert niemand de instelling van de beademing. De patiënt overlijdt.", "De intensivist meldt het direct aan de raad van bestuur."] },
  { modus: "casus", m: M0485, bij: "triage", titel: "Triage op ernst",
    tekst: ["Ook hier bepaalt een lid van de PVC de ernst met de risicomatrix."], uitkomst: "Dit is een calamiteit." },
  { modus: "casus", m: M0485, bij: "centraal", titel: "Centrale analyse",
    tekst: ["Een calamiteit gaat altijd naar de centrale analyse.", "De raad van bestuur meldt de calamiteit binnen 3 werkdagen bij de IGJ.", "De MIP-commissie zoekt de oorzaak met PRISMA."] },
  { modus: "casus", m: M0485, bij: "terug", titel: "Maatregel en terugkoppeling",
    tekst: ["Na elke overplaatsing controleren twee zorgverleners de beademing.", "De intensivist hoort de uitkomst van het onderzoek."] },
  { modus: "stroom", wat: "Elke dag", titel: "Zo stromen de meldingen",
    tekst: ["De meeste meldingen hebben een lage ernst. De afdeling analyseert die zelf.", "Een klein deel gaat naar de centrale analyse.", "Na de triage zie je de ernst als kleur."] },
];
// Waar de casus vandaan komt: het vorige station van dezelfde melding, of het incident.
STAPPEN.forEach((s, n) => {
  if (s.modus !== "casus") return;
  const vorige = STAPPEN[n - 1];
  s.van = vorige?.m === s.m ? vorige.bij : "incident";
  const eigen = STAPPEN.filter((x) => x.m === s.m);
  s.nr = eigen.indexOf(s) + 1;
  s.van_ = eigen.length;
});

/* ================= Opbouw ================= */

const svg = d3.select("#schema");
const schema = tekenSchema(svg);
const monsters = Object.fromEntries(schema.pijlen.nodes().map((el) => [el.__data__, monster(el)]));
const banen = {
  laag: maakRoute(ROUTES.laag, monsters),
  hoog: maakRoute(ROUTES.hoog, monsters),
  lus: maakBaan(monsters.lus),
};
const stroom = maakStroom($("bord"), $("overlay"), banen);

// Het schema bouwt zich één keer op: eerst de knopen, dan tekenen de pijlen zich.
function opbouw() {
  animate(schema.knopen.nodes(), { opacity: [0, 1], y: [14, 0] }, { duration: T(0.5), delay: stagger(T(0.09)) });
  schema.pijlen.each(function (_, n) {
    const L = this.getTotalLength();
    this.style.strokeDasharray = `${L} ${L}`;
    animate(this, { strokeDashoffset: [L, 0], opacity: [0, 1] }, {
      duration: T(0.6), delay: T(0.35 + n * 0.08), ease: "easeOut",
      onComplete: () => { this.style.strokeDasharray = ""; },
    });
  });
  animate([...schema.takken.nodes(), schema.luslabel.node()], { opacity: [0, 1] }, { duration: T(0.4), delay: stagger(T(0.1), { startDelay: T(1) }) });
}

// Wat oplicht en wat vervaagt, per stap.
function schemaToestand(s) {
  const route = s.modus === "casus" ? ROUTES[routeVan(s.m.sac)] : null;
  const opRoute = (id) => !route || id === "incident" || route.some((e) => VAN(e) === id || NAAR(e) === id);
  const tot = route ? route.findIndex((e) => NAAR(e) === s.bij) : -1;
  const lusAan = !route || s.bij === "terug";

  schema.knopen.classed("stil", (id) => !opRoute(id));
  schema.pijlen
    .classed("stil", (e) => (e === "lus" ? !lusAan : route ? !route.includes(e) : false))
    .classed("gelopen", (e) => route && route.indexOf(e) >= 0 && route.indexOf(e) <= tot);
  schema.takken
    .classed("aan", (d) => route && route.indexOf(d.tak) >= 0 && route.indexOf(d.tak) <= tot)
    .classed("stil", (d) => route && !route.includes(d.tak));
  schema.luslabel.style("opacity", lusAan ? 1 : 0.3);

  // De halo markeert het station waar de casus nu is.
  schema.knopen.each(function (id) {
    const halo = this.querySelector(".halo"), aan = route && id === s.bij;
    animate(halo, { opacity: aan ? 1 : 0 }, { duration: T(aan ? 0.5 : 0.2), delay: T(aan ? 0.6 : 0) });
  });
}

function bijschriftTekenen(s) {
  const el = $("bijschrift");
  const casus = s.modus === "casus";
  el.classList.toggle("enkel", !casus);
  const sac = casus ? SAC[s.m.sac] : null;
  const gekleurd = casus && STAPPEN.indexOf(s) >= STAPPEN.findIndex((x) => x.m === s.m && x.bij === "triage");
  const legenda = s.modus === "stroom"
    ? `<div class="legenda-sac"><span><i style="background:${GRIJS}"></i>nog geen triage</span>${[1, 2, 3, 4]
      .map((n) => `<span><i style="background:${SAC[n].kleur}"></i>${SAC[n].label}</span>`).join("")}<span><i class="blok"></i>terugkoppeling</span></div>
      <div class="voetnoot">De verdeling is een voorbeeld, geen echte cijfers.</div>`
    : s.modus === "overzicht"
      ? `<div class="legenda-sac"><span><i style="background:${GRIJS}"></i>een melding</span><span><i class="blok"></i>terugkoppeling naar de melder</span></div>`
      : "";
  el.innerHTML = `
    ${casus ? `<div class="melding-kaart">
      <div class="kop"><span class="id" style="${gekleurd ? `background:${sac.kleur};color:${sac.inkt}` : ""}">${s.m.id}</span>
      <span class="meta">${s.m.afdeling} · ${s.m.melder} · ${datum(s.m.datum)}</span></div>
      <p>${s.m.tekst}</p></div>` : ""}
    <div class="station">
      <div class="wat">${casus ? `Casus ${s.m.kort} · stap ${s.nr} van ${s.van_}` : s.wat}</div>
      <h2>${s.titel}</h2>
      ${s.tekst.map((t) => `<p>${t}</p>`).join("")}
      ${s.uitkomst ? `<p>Uitkomst: <span class="sac-pil" style="background:${sac.kleur};color:${sac.inkt}">SAC ${s.m.sac}</span> ${s.uitkomst}</p>` : ""}
      ${legenda}
    </div>`;
  animate([...el.children], { opacity: [0, 1], y: [10, 0] }, { duration: T(0.4), delay: stagger(T(0.08)) });
}

/* ================= Regie ================= */

let stap = -1;
function ga(n) {
  n = Math.max(0, Math.min(STAPPEN.length - 1, n));
  if (n === stap) return;
  stap = n;
  const s = STAPPEN[n];
  $("teller").textContent = `${n + 1} / ${STAPPEN.length}`;
  $("balk").style.width = `${((n + 1) / STAPPEN.length) * 100}%`;
  history.replaceState(null, "", `#stap-${n + 1}`);

  stroom.modus(s.modus);
  if (s.modus === "casus") stroom.casus(s.m, s.van, s.bij, { lus: s.bij === "terug" });
  else stroom.casus(null);
  schemaToestand(s);
  bijschriftTekenen(s);
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
stroom.voorspoelen(reduce ? 0 : 4);
opbouw();
ga(stapUitHash());
