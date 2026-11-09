// Inhoud van "Even voorstellen" (blok 0, Opening). Overgenomen uit ontwerp A ("De koers") in
// ~/Projects/aiso-voorstellen-ontwerpen/data.js.
// Bronnen: het openbare LinkedIn-profiel, de repos van de apps, gh repo list (aanmaakdatums).
// Geen woonplaats, geen telefoon, geen privéprojecten. Privérepos alleen als datum, zonder naam.

import repos from "./voorstellen/repos.json"; // [{d: "2024-05-01", n: "naam" | null, o, t}]
import bonmonBeeld from "./voorstellen/bonmon-icon.png";
// Het merk uit de kop van plinkie.nl (daar in CSS getekend: .plk-merk). Niet het favicon: dat is nog de oude munt.
import plinkieBeeld from "./voorstellen/plinkie-logo.svg";
import opgeruimdBeeld from "./voorstellen/opgeruimd-netjes.jpg";

export { repos };

// Jaren zoals Witek ze zelf openbaar noemt. Tot = 2026.9: loopt nog.
export const LOOPBAAN = [
  { id: "handel", van: 1996, tot: 2001, rol: "Effectenhandelaar", waar: "Van der Moolen", wat: "XETRA en NYSE" },
  { id: "zuivel", van: 2004, tot: 2007.6, rol: "Senior trader zuivel", waar: "zuivelcommodities", wat: "Midden- en Oost-Europa" },
  { id: "han", van: 2007.6, tot: 2026.9, rol: "Docent-onderzoeker", waar: "HAN, Bedrijfskunde", wat: "AI, data en onderzoek" },
  { id: "bds", van: 2019.8, tot: 2026.9, rol: "Eigenaar", waar: "Business Data Solutions", wat: "AI-engineering voor het mkb" },
  { id: "vu", van: 2020, tot: 2024, rol: "Promotieonderzoek", waar: "VU, operations research", wat: "planning in de thuiszorg" },
];

export const APPS = [
  {
    id: "bonmon", naam: "Bonnenmonster", status: "Live in Google Play",
    zin: "Bon fotograferen, AI leest alles uit, klaar voor je btw-aangifte.",
    feiten: ["Btw per regel, voor Nederland, Duitsland, België en Frankrijk", "Gegevens blijven in de EU"],
    beeld: bonmonBeeld,
    beeldHoek: 0.229, // het icoon heeft witte hoeken; de ronding is 88 van 384 px
  },
  {
    id: "plinkie", naam: "Plinkie", status: "Live sinds 26 september 2026",
    zin: "Eén eerlijke prijs voor private lease van een elektrische auto. Elke nacht opnieuw berekend.",
    feiten: ["Eerste run: 19 bronnen, 826 pagina's, 30.149 aanbiedingen", "De AI publiceert nooit zelf een getal: elk getal komt uit code, met bron en datum"],
    beeld: plinkieBeeld,
  },
  {
    id: "opgeruimd", naam: "Opgeruimd", status: "Werktitel · bèta in voorbereiding",
    zin: "Maak een foto van je rommelige kamer. De app bouwt hem na in 3D, en jij ruimt op als spel.",
    feiten: ["885 commits in drie weken", "Foto's alleen in de EU, en de leverancier bewaart ze niet"],
    beeld: opgeruimdBeeld,
  },
  {
    id: "newmuzes", naam: "Newmuzes", status: "Werktitel · prototype",
    zin: "Een muziekstudio in de browser: 28 instrumenten, 10 gitaarversterkers en je eigen stem.",
    feiten: ["Werkend prototype in een week", "Maak een lied, zing het, geef het weg"],
    beeld: null, // geen beeld: de kaart tekent een golfvorm en toetsen
  },
];
