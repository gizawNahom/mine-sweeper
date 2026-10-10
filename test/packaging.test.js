import { execFileSync } from "node:child_process"
import { join } from "node:path"

// Asks Node itself to import the package by name, exactly as a user's code
// would. From inside this repository, Node resolves "mine-sweeper" to this
// package and applies its "exports" field.
const repositoryRoot = join(__dirname, "..")

function importInNode(specifier) {
	const script = `import(${JSON.stringify(specifier)})
		.then((module) => console.log("ok", Object.keys(module).join(",")))
		.catch((error) => console.log("error", error.code))`
	return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
		cwd: repositoryRoot,
		encoding: "utf8",
	}).trim()
}

describe("Given the mine-sweeper package", () => {
	test("Then its entry point exports the Factory", () => {
		expect(importInNode("mine-sweeper")).toBe("ok Factory")
	})

	test.each(["mine-sweeper/src/game.js", "mine-sweeper/src/board.js", "mine-sweeper/package.json"])(
		"Then the internal module %s cannot be imported",
		(path) => {
			expect(importInNode(path)).toBe("error ERR_PACKAGE_PATH_NOT_EXPORTED")
		}
	)
})
