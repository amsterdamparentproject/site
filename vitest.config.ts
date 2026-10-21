import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["node_modules/**", "e2e/**"],
    // Blank Turnstile secret = check skipped, so action tests never depend on
    // keys in a developer's .env.local. __tests__/lib/turnstile.test.ts opts in.
    env: { ...loadEnv(mode, process.cwd(), ""), TURNSTILE_SECRET_KEY: "" },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "__tests__/", "**/*.test.ts", "**/*.test.tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
}));
