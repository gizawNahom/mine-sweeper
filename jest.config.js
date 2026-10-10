export default {
	// The engine and its tests; the demos have their own tooling.
	roots: ["<rootDir>/test", "<rootDir>/src"],
	// Tests import the package by name, as users do. This repository is that package.
	moduleNameMapper: {
		"^mine-sweeper$": "<rootDir>/src/index.js",
	},
	collectCoverageFrom: ["src/**/*.js"],
	coverageThreshold: {
		global: { statements: 100, branches: 100, functions: 100, lines: 100 },
	},
}
