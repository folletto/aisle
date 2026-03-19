import { reactRouter } from "@react-router/dev/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";

const isTest = process.env.VITEST === "true";

export default defineConfig({
  plugins: isTest ? [react()] : [reactRouter()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
