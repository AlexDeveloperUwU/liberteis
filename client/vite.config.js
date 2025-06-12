import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss(), vueDevTools()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
      },
    },
    host: true,
    allowedHosts: ["localhost", "wsl", "f03ab6969888cb.lhr.life"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
