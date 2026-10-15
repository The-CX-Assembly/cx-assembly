import { defineConfig, devices } from '@playwright/test';

const PORT = 3000;
const CI = Boolean(process.env.CI);
// Set to test a deployed site instead of a local server (see .github/workflows/smoke.yml).
const REMOTE = process.env.PLAYWRIGHT_BASE_URL;

/**
 * Browser tests.
 * - Locally: reuses `npm run dev` if it's running, otherwise starts it. Uses the
 *   installed Google Chrome, so no browser download is needed.
 * - CI: runs the production build (`npm run start`) against the Firestore
 *   emulator (see `npm run test:e2e:ci`), so lead submissions are really saved.
 * - Smoke: PLAYWRIGHT_BASE_URL=<site> npx playwright test --grep @smoke
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: REMOTE || `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    ...(CI ? {} : { channel: 'chrome' }),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], ...(CI ? {} : { channel: 'chrome' }) } }],
  webServer: REMOTE
    ? undefined
    : {
        command: CI ? 'npm run start' : 'npm run dev',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !CI,
        timeout: 180_000,
      },
});
