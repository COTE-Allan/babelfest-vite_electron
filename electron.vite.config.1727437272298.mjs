// electron.vite.config.mjs
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  publicDir: "public",
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src")
      }
    },
    plugins: [
      react(),
      ViteImageOptimizer({
        png: {
          quality: 80
          // Réduit la qualité pour compresser les images
        }
      })
    ],
    optimizeDeps: {
      exclude: ["js-big-decimal"]
    }
  }
});
export {
  electron_vite_config_default as default
};
