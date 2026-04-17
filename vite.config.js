import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("chart.js") || id.includes("vue-chartjs")) return "charts";
          if (id.includes("vue-router")) return "vue-router";
          if (id.includes("node_modules/vue/")) return "vue-vendor";
        },
      },
    },
  },
});
