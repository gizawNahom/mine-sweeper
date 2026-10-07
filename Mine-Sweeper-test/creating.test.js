import { Factory } from "mine-sweeper"
import { board } from "./support/boards"
import { playUntilGameEnds, revealUntilGameEnds } from "./support/playing"
import ReceiverRecorder from "./support/receiverRecorder"

describe("Given no options", () => {
	test("Then the board is 8x10 with 10 flags", () => {
		const game = Factory.createGame(new ReceiverRecorder())

		expect(game.rows).toBe(8)
		expect(game.columns).toBe(10)
		expect(game.numberOfFlags).toBe(10)
	})
})

describe("Given 16 rows, 30 columns and 99 mines", () => {
	test("Then the board has that size, 99 flags and 99 mines", () => {
		const receiver = new ReceiverRecorder()
		const game = Factory.createGame(receiver, { rows: 16, columns: 30, mines: 99 })

		revealUntilGameEnds(game, receiver)

		expect(game.rows).toBe(16)
		expect(game.columns).toBe(30)
		expect(game.numberOfFlags).toBe(99)
		expect(receiver.callsTo("endGame")[0].mines).toHaveLength(99)
	})
})

describe("Given the mines are given as a list of positions", () => {
	let receiver
	let game
	beforeEach(() => {
		receiver = new ReceiverRecorder()
		game = Factory.createGame(receiver, board`
			* . .
			. . .
			. . .
		`)
	})

	test("Then the board has the drawn size", () => {
		expect(game.rows).toBe(3)
		expect(game.columns).toBe(3)
	})

	test("Then there is one flag per listed mine", () => {
		expect(game.numberOfFlags).toBe(1)
	})

	test("Then the mines are exactly where they were listed", () => {
		game.reveal(2, 2)
		game.reveal(1, 1)

		expect(receiver.calls).toEqual([
			["reveal", { row: 2, column: 2, adjacentMines: 1 }],
			["endGame", { won: false, mines: [{ row: 1, column: 1 }] }],
		])
	})
})

describe("Given a game created from the mines of a finished game", () => {
	test("Then it has the same mines", () => {
		const first = playUntilGameEnds({ rows: 8, columns: 10, mines: 10 })

		const replay = playUntilGameEnds({ rows: 8, columns: 10, mines: first.mines })

		expect(replay.mines).toEqual(first.mines)
	})
})

describe("Given the list of mines is changed after the game is created", () => {
	test("Then the game is not affected", () => {
		const receiver = new ReceiverRecorder()
		const mines = [{ row: 1, column: 1 }]
		const game = Factory.createGame(receiver, { rows: 3, columns: 3, mines })

		mines.push({ row: 2, column: 2 })
		mines[0].row = 3
		game.reveal(1, 1)

		expect(receiver.calls).toEqual([
			["endGame", { won: false, mines: [{ row: 1, column: 1 }] }],
		])
	})
})

describe("Given invalid options", () => {
	test.each([
		[{ row: 16 }, 'unknown option "row"', TypeError],
		[{ rows: "8" }, 'rows must be a number, got "8"', TypeError],
		[{ columns: "10" }, 'columns must be a number, got "10"', TypeError],
		[{ mines: "10" }, 'mines must be a number, got "10"', TypeError],
		[{ rows: 0 }, "rows must be a whole number of at least 1, got 0", RangeError],
		[{ columns: -3 }, "columns must be a whole number of at least 1, got -3", RangeError],
		[{ rows: 2.5 }, "rows must be a whole number of at least 1, got 2.5", RangeError],
		[{ columns: NaN }, "columns must be a whole number of at least 1, got NaN", RangeError],
		[{ rows: 1, columns: 1, mines: 1 }, "a 1x1 board is too small: it needs room for at least 1 mine and 1 safe cell", RangeError],
		[{ rows: 3, columns: 3, mines: 0 }, "mines must be a whole number from 1 to 8 for a 3x3 board, got 0", RangeError],
		[{ rows: 3, columns: 3, mines: 9 }, "mines must be a whole number from 1 to 8 for a 3x3 board, got 9", RangeError],
		[{ rows: 3, columns: 3, mines: 20 }, "mines must be a whole number from 1 to 8 for a 3x3 board, got 20", RangeError],
		[{ mines: 2.5 }, "mines must be a whole number from 1 to 79 for a 8x10 board, got 2.5", RangeError],
	])("Then %o must be rejected with: %s", (options, message, ErrorType) => {
		const create = () => Factory.createGame(new ReceiverRecorder(), options)

		expect(create).toThrow(ErrorType)
		expect(create).toThrow(message)
	})
})

describe("Given unusual but valid options", () => {
	test.each([
		[{}],
		[{ rows: 20 }],
		[{ rows: 1, columns: 2, mines: 1 }],
		[{ rows: 3, columns: 3, mines: 8 }],
	])("Then %o must not throw", (options) => {
		expect(() => Factory.createGame(new ReceiverRecorder(), options)).not.toThrow()
	})
})

describe("Given an invalid list of mines", () => {
	test.each([
		[[], "mines must be a whole number from 1 to 8 for a 3x3 board, got 0", RangeError],
		[
			[1, 2, 3, 4, 5, 6, 7, 8, 9].map((column) => ({ row: 1, column })),
			"mines must be a whole number from 1 to 8 for a 3x3 board, got 9",
			RangeError,
		],
		[[{ row: 4, column: 1 }], "mines[0]: row must be a whole number from 1 to 3, got 4", RangeError],
		[[{ row: 1, column: 1 }, { row: 1, column: 0 }], "mines[1]: column must be a whole number from 1 to 3, got 0", RangeError],
		[[{ row: "1", column: 1 }], 'mines[0]: row must be a number, got "1"', TypeError],
		[[null], "mines[0]: row must be a number, got undefined", TypeError],
		[[{ row: 2, column: 2 }, { row: 2, column: 2 }], "mines lists 2,2 more than once", RangeError],
	])("Then mines: %j must be rejected with: %s", (mines, message, ErrorType) => {
		const create = () =>
			Factory.createGame(new ReceiverRecorder(), { rows: 3, columns: 3, mines })

		expect(create).toThrow(ErrorType)
		expect(create).toThrow(message)
	})
})
