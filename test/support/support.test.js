import { board } from "./boards"
import ReceiverRecorder from "./receiverRecorder"

describe("board", () => {
	test("Then it turns a picture into rows, columns and mine positions", () => {
		expect(board`
			. * .
			* . .
		`).toEqual({
			rows: 2,
			columns: 3,
			mines: [
				{ row: 1, column: 2 },
				{ row: 2, column: 1 },
			],
		})
	})

	test.each([
		["an empty picture", "", "board is empty"],
		["ragged rows", ". .\n. . .", "board row 2 has 3 cells, expected 2"],
		["an unknown cell", ". x", 'board cell "x" is not "*" (mine) or "." (safe)'],
	])("Then %s is rejected", (_, picture, message) => {
		expect(() => board([picture])).toThrow(message)
	})
})

describe("ReceiverRecorder", () => {
	test("Then it records every call in order", () => {
		const recorder = new ReceiverRecorder()

		recorder.flag(1, 2)
		recorder.reveal({ row: 3, column: 4, adjacentMines: 0 })
		recorder.unflag(1, 2)
		recorder.endGame({ won: true, mines: [] })

		expect(recorder.calls).toEqual([
			["flag", { row: 1, column: 2 }],
			["reveal", { row: 3, column: 4, adjacentMines: 0 }],
			["unflag", { row: 1, column: 2 }],
			["endGame", { won: true, mines: [] }],
		])
		expect(recorder.callsTo("flag")).toEqual([{ row: 1, column: 2 }])
	})

	test("Then clear forgets earlier calls", () => {
		const recorder = new ReceiverRecorder()
		recorder.flag(1, 1)

		recorder.clear()

		expect(recorder.calls).toEqual([])
	})
})
