const path = require("path")

const testPackage = path.join(__dirname, "Mine-Sweeper-test")

// Jest runs from the repo root (see Mine-Sweeper-test/package.json) because
// coverage only instruments files under the directory Jest is launched from,
// and the engine lives in a sibling package. Tooling resolves from the test
// package, which is the only one with dependencies.
module.exports = {
	roots: ["<rootDir>/Mine-Sweeper-test", "<rootDir>/Mine-Sweeper/src"],
	// Load the engine from source, not the node_modules symlink, which coverage ignores.
	// Load the public entry point from source, so coverage includes the engine.
	moduleNameMapper: {
		"^mine-sweeper$": "<rootDir>/Mine-Sweeper/src/index.js",
	},
	transform: {
		"\\.js$": [
			require.resolve("babel-jest", { paths: [testPackage] }),
			{ configFile: path.join(testPackage, "babel.config.json") },
		],
	},
	collectCoverageFrom: ["Mine-Sweeper/src/**/*.js"],
	coverageThreshold: {
		global: { statements: 100, branches: 100, functions: 100, lines: 100 },
	},
}
