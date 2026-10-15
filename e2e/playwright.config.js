import { defineConfig, devices } from "@playwright/test"

// Run ../scripts/build-site.sh first: the tests check the site as it is deployed.
// To use a Chromium that is already installed instead of Playwright's own, set
// CHROMIUM_PATH to its executable (CI leaves it unset and installs the matching one).
export default defineConfig({
	testDir: ".",
	testMatch: "*.spec.js",
	fullyParallel: true,
	forbidOnly: Boolean(process.env.CI),
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://127.0.0.1:4173/mine-sweeper/",
		trace: "retain-on-failure",
		launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined },
	},
	webServer: {
		command: "node serve.js",
		url: "http://127.0.0.1:4173/mine-sweeper/",
		reuseExistingServer: !process.env.CI,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
