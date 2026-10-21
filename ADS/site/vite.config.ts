import { defineConfig } from "vite";
import { page } from "./src/render";

// Сторінка рендериться в HTML під час збірки/dev — без JS видно весь зміст.
export default defineConfig({
  plugins: [{ name: "page", transformIndexHtml: (html) => html.replace("<!--page-->", page()) }],
  server: { port: 3200 },
});
