import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */

export const STORAGE_STATE = path.join(
  __dirname,
  "playwright/.auth/loginAuth.json",
);

export default defineConfig({
  testDir: "./tests/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  maxFailures: process.env.CI ? 10 : undefined,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000/",

    // Capture screenshot after each test failure.
    screenshot: "only-on-failure",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    // Record video only when retrying a test for the first time.
    video: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testDir: "./tests",
      testMatch: "global.setup.ts",
      teardown: "teardown",
    },
    {
      name: "teardown",
      testDir: "./tests",
      testMatch: "global.teardown.ts",
      use: { storageState: STORAGE_STATE },
    },
    {
      name: "chromium",
      testIgnore: "**/*noAuth.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
    },
    {
      name: "chromium noAuth",
      testMatch: "**/*noAuth.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testIgnore: "**/*noAuth.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Desktop Firefox"], storageState: STORAGE_STATE },
    },
    {
      name: "firefox noAuth",
      testMatch: "**/*noAuth.spec.ts",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testIgnore: "**/*noAuth.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Desktop Safari"], storageState: STORAGE_STATE },
    },
    {
      name: "webkit noAuth",
      testMatch: "**/*noAuth.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "mobile chrome",
      testIgnore: "**/*noAuth.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["Pixel 5"], storageState: STORAGE_STATE },
    },
    {
      name: "mobile chrome",
      testMatch: "**/*noAuth.spec.ts",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile safari",
      testIgnore: "**/*noAuth.spec.ts",
      dependencies: ["setup"],
      use: { ...devices["iPhone 12"], storageState: STORAGE_STATE },
    },
    {
      name: "mobile safari",
      testMatch: "**/*noAuth.spec.ts",
      use: { ...devices["iPhone 12"] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
});
