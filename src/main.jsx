import React from "react";
import { createRoot } from "react-dom/client";
import App from "../vim-okf-simulatie.jsx";

// vim-okf-simulatie.jsx roept https://api.anthropic.com rechtstreeks aan, zonder sleutel —
// zo werkt het bestand als claude.ai-artifact, en daarom blijft het ongewijzigd.
// Lokaal (npm start) leiden we die aanroepen om naar de proxy in vite.config.js, die de
// sleutel uit .env aan de serverkant toevoegt.
// In de openbare versie (npm run build → GitHub Pages) is er geen proxy. Daar weigeren we
// de aanroep direct, zonder netwerkverkeer. De demo valt dan terug op ruleBasedTriage.
const ANTHROPIC = "https://api.anthropic.com/";
const LIVE_AI = import.meta.env.DEV;
const nativeFetch = window.fetch.bind(window);

const naarAnthropic = LIVE_AI
  ? (rest, init) => nativeFetch("/api/anthropic/" + rest, init)
  : () => Promise.reject(new Error("Openbare versie: live AI werkt alleen op de lokale presentatieserver"));

window.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : null;
  if (url && url.startsWith(ANTHROPIC)) return naarAnthropic(url.slice(ANTHROPIC.length), init);
  return nativeFetch(input, init);
};

function OpenbareVersie() {
  return (
    <div style={{
      background: "#f0ebe0", color: "#1a1a1a", borderBottom: "1px solid #e5e7eb",
      padding: "8px 16px", textAlign: "center",
      font: "500 13px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
    }}>
      Openbare versie zonder live AI. De demo gebruikt de regelgebaseerde fallback.
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <>
    {!LIVE_AI && <OpenbareVersie />}
    <App />
  </>
);
