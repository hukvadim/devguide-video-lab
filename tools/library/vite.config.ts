import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { REPO, scanLibrary } from "./scan";

// «Вибране» лежить у репо, щоб Claude читав його при монтажі: data/library-picks.json
const PICKS = path.join(REPO, "data/library-picks.json");

// /api/library сканує папки репо на кожен запит: новий файл видно після F5, без перезапуску.
// Медіа віддає сам Vite через /@fs/<абсолютний шлях> (з Range, тож відео перемотується).
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "library-api",
      configureServer(server) {
        server.middlewares.use("/api/library", (_req, res) => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          const picks = fs.existsSync(PICKS)
            ? JSON.parse(fs.readFileSync(PICKS, "utf8"))
            : [];
          res.end(JSON.stringify({ ...scanLibrary(), picks }));
        });
        server.middlewares.use("/api/picks", (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end();
            return;
          }
          let body = "";
          req.on("data", (c) => {
            body += c;
          });
          req.on("end", () => {
            try {
              const picks = JSON.parse(body);
              if (!Array.isArray(picks)) throw new Error("not an array");
              fs.writeFileSync(PICKS, `${JSON.stringify(picks, null, 2)}\n`);
              res.end("ok");
            } catch (e) {
              res.statusCode = 400;
              res.end(String(e));
            }
          });
        });
      },
    },
  ],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  server: { fs: { allow: [REPO] } },
});
