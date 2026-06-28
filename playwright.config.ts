import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load .env.local first (Stripe keys, Supabase keys, etc.), then let
// .env.test.local override the test-specific vars (webhook URLs, domain).
dotenv.config({ path: path.resolve(__dirname, ".env.local") });
dotenv.config({
  path: path.resolve(__dirname, ".env.test.local"),
  override: true,
});

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    launchOptions: {
      // Disable Chromium site isolation so Playwright's frameLocator can
      // interact with cross-origin iframes (e.g. Stripe's card input frames).
      args: ["--disable-features=IsolateOrigins,site-per-process"],
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "NODE_ENV=test yarn dev --port 3001",
    url: "http://localhost:3001",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
