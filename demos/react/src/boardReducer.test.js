import { describe, expect, test } from "vitest"
import { boardReducer, initialBoard } from "./boardReducer"

const afterEvents = (events, board = initialBoard({ rows: 2, columns: 3 })) =>
	events.reduce(boardReducer, board)

describe("Given a new board", () => {
	test("Then every cell is hidden and the game is being played", () => {
		const board = initialBoard({ rows: 2, columns: 3 })

		expect(board.status).toBe("playing")
		expect(board.cells).toHaveLength(2)
		expect(board.cells.flat()).toHaveLength(6)
		board.cells.flat().forEach((cell) => expect(cell).toEqual({ state: "hidden" }))
	})
})

describe("Given domain events", () => {
	test("Then CellFlagged and CellUnflagged toggle a cell's flag", () => {
		const flagged = afterEvents([{ type: "CellFlagged", row: 1, column: 2 }])
		const unflagged = afterEvents([{ type: "CellUnflagged", row: 1, column: 2 }], flagged)

		expect(flagged.cells[0][1]).toEqual({ state: "flagged" })
		expect(unflagged.cells[0][1]).toEqual({ state: "hidden" })
	})

	test("Then CellRevealed shows the number of adjacent mines", () => {
		const board = afterEvents([{ type: "CellRevealed", row: 2, column: 3, adjacentMines: 2 }])

		expect(board.cells[1][2]).toEqual({ state: "revealed", adjacentMines: 2 })
	})

	test("Then GameLost shows every mine", () => {
		const board = afterEvents([{ type: "GameLost", mines: [{ row: 1, column: 1 }, { row: 2, column: 2 }] }])

		expect(board.status).toBe("lost")
		expect(board.cells[0][0]).toEqual({ state: "mine" })
		expect(board.cells[1][1]).toEqual({ state: "mine" })
	})

	test("Then GameWon flags every mine", () => {
		const board = afterEvents([{ type: "GameWon", mines: [{ row: 1, column: 3 }] }])

		expect(board.status).toBe("won")
		expect(board.cells[0][2]).toEqual({ state: "flagged" })
	})

	test("Then other cells and earlier boards are left untouched", () => {
		const before = initialBoard({ rows: 2, columns: 3 })

		const after = boardReducer(before, { type: "CellFlagged", row: 1, column: 1 })

		expect(before.cells[0][0]).toEqual({ state: "hidden" })
		expect(after.cells[1]).toBe(before.cells[1])
		expect(after.cells[0][1]).toBe(before.cells[0][1])
	})

	test("Then an unknown event leaves the board as it is", () => {
		const board = initialBoard({ rows: 2, columns: 3 })

		expect(boardReducer(board, { type: "SomethingElse" })).toBe(board)
	})
})
