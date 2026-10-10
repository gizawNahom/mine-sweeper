import { Factory } from "mine-sweeper"

describe("Given the mine-sweeper package", () => {
	test("Then its entry point exports the Factory", () => {
		expect(typeof Factory.createGame).toBe("function")
	})

	test.each(["mine-sweeper/src/game.js", "mine-sweeper/src/board.js", "mine-sweeper/package.json"])(
		"Then the internal module %s cannot be imported",
		(path) => {
			expect(() => require(path)).toThrow(/Cannot find module|not exported/)
		}
	)
})
