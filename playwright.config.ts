import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const localBaseURL = `http://127.0.0.1:${port}`;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseURL;
const isRemote = !baseURL.startsWith("http://127.0.0.1");

export default defineConfig({
    testDir: "./tests/e2e",
    outputDir: "./test-results/artifacts",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ["list"],
        ["html", { outputFolder: "test-results/html", open: "never" }],
        ["junit", { outputFile: "test-results/junit/results.xml" }],
    ],
    snapshotPathTemplate:
        "{testDir}/approved-snapshots/{projectName}/{testFilePath}/{arg}{ext}",
    use: {
        baseURL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },
    projects: [
        {
            name: "chromium",
            grepInvert: /@(a11y|visual)/,
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "a11y",
            grep: /@a11y/,
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "visual",
            grep: /@visual/,
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: isRemote
        ? undefined
        : {
              command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
              url: localBaseURL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
});
