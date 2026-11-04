import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Lokale presentatieserver.
// - /api/anthropic/*  → proxy naar de Anthropic-API. De API-sleutel uit .env wordt hier,
//   aan de serverkant, toegevoegd en komt nooit in de browser.
// - /api/status       → controle vooraf: is er een sleutel, en is het demo-model bereikbaar?
//   (Haalt alleen modelinformatie op; kost geen tokens.)

const API = "https://api.anthropic.com";
const API_VERSION = "2026-10-21";
const DEMO_MODEL = "claude-sonnet-4-6"; // moet overeenkomen met het model in vim-okf-simulatie.jsx

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // .env gebruikt de naam ANTHROPIC-API-KEY; de gebruikelijke ANTHROPIC_API_KEY werkt ook.
  const apiKey = env.ANTHROPIC_API_KEY || env["ANTHROPIC-API-KEY"] || "";

  return {
    plugins: [react(), statusEndpoint(apiKey)],
    server: {
      open: "/",
      proxy: {
        "/api/anthropic": {
          target: API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              // Zonder browser-headers behandelt de API dit als een gewone server-aanroep.
              proxyReq.removeHeader("origin");
              proxyReq.removeHeader("referer");
              proxyReq.removeHeader("cookie");
              proxyReq.setHeader("x-api-key", apiKey);
              proxyReq.setHeader("anthropic-version", API_VERSION);
            });
          },
        },
      },
    },
  };
});

function statusEndpoint(apiKey) {
  return {
    name: "anthropic-status",
    configureServer(server) {
      server.middlewares.use("/api/status", async (_req, res) => {
        const status = { model: DEMO_MODEL, sleutel: Boolean(apiKey), verbonden: false, melding: "" };
        if (!apiKey) {
          status.melding = "Geen API-sleutel gevonden in .env";
        } else {
          try {
            const r = await fetch(`${API}/v1/models/${DEMO_MODEL}`, {
              headers: { "x-api-key": apiKey, "anthropic-version": API_VERSION },
            });
            status.verbonden = r.ok;
            status.melding = r.ok
              ? "AI-verbinding werkt"
              : r.status === 401
                ? "API-sleutel wordt geweigerd (401)"
                : r.status === 404
                  ? `Model ${DEMO_MODEL} niet gevonden (404)`
                  : `API antwoordt met status ${r.status}`;
          } catch {
            status.melding = "Geen internet of API onbereikbaar — de demo gebruikt dan de regelgebaseerde fallback";
          }
        }
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(status));
      });
    },
  };
}
