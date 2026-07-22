import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load .env.local first (Stripe keys, Supabase keys, etc.), then let
// .env.test override the test-specific vars (webhook URLs, domain).
//
// Not using dotenv.config()'s `override` option here: the installed
// dotenv version (8.6.0) predates that option (added in 16.4.0), so
// passing it is silently a no-op — .env.local's values would win even
// for keys .env.test sets explicitly (e.g. NEXT_PUBLIC_DOMAIN), pointing
// the webServer's own env at the wrong port. Parsing + assigning to
// process.env manually applies the override regardless of dotenv version.
function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const parsed = dotenv.parse(fs.readFileSync(filePath));
  for (const [key, value] of Object.entries(parsed)) {
    process.env[key] = value;
  }
}

loadEnvFile(path.resolve(__dirname, ".env.local"));
loadEnvFile(path.resolve(__dirname, ".env.test"));

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
