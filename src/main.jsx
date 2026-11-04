import React from "react";
import { createRoot } from "react-dom/client";
import App from "../vim-okf-simulatie.jsx";

// vim-okf-simulatie.jsx roept https://api.anthropic.com rechtstreeks aan, zonder sleutel —
// zo werkt het bestand als claude.ai-artifact, en daarom blijft het ongewijzigd.
// Lokaal leiden we die aanroepen om naar de proxy in vite.config.js, die de sleutel
// uit .env aan de serverkant toevoegt.
const ANTHROPIC = "https://api.anthropic.com/";
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : null;
  if (url && url.startsWith(ANTHROPIC)) {
    return nativeFetch("/api/anthropic/" + url.slice(ANTHROPIC.length), init);
  }
  return nativeFetch(input, init);
};

createRoot(document.getElementById("root")).render(<App />);
