// @ts-check
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 90_000,
  // One retry locally and two in CI: both Google Maps rendering and the model answer are non-deterministic.
  retries: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    // Explicit viewport: which city labels fit into the frame depends on it.
    viewport: { width: 1280, height: 720 },
    // Stable English labels regardless of the machine locale / geo-IP.
    locale: 'en-US',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium' }],
});
