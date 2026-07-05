import { defineConfig } from '@playwright/test';
import * as os from "node:os";
import { Environment } from '@configs/environment.config';

export default defineConfig({
  testDir: '../tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: Environment.WORKERS,
  globalTeardown: require.resolve('../global/global.teardown'),
  reporter: [
    ["html", { open: "never", outputFolder: "../../artifacts/reports/html" }],
    ["json", { outputFile: "../../artifacts/reports/json/report.json" }],
    [
      "allure-playwright",
      {
        environmentInfo: {
          "OS PLatform": os.platform(),
          "OS Release": os.release(),
          "OS Version": os.version(),
          "Node Version": process.version,
          "Hostname": os.hostname(),
          "Language": "TypeScript",
          "Framework": "Playwright",
          "Flavor": "Vanilla",
          "Suite": "API",
          "Application": Environment.APPLICATION,
          "Environment": Environment.APPLICATION_ENVIRONMENT,
          "Instance": `${Environment.BASE_URL}/${Environment.APPLICATION_ENVIRONMENT}`,
        },
        resultsDir: "./artifacts/reports/allure/allure-results",
        details: true
      }
    ]
  ],
  outputDir: '../../artifacts/reports/playwright/test-results',
  use: {
    // Base URL used for all request fixture calls
    baseURL: Environment.BASE_API_URL,
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
  },
});
