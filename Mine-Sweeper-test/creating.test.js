import { Factory } from "mine-sweeper"
import { board } from "./support/boards"
import ReceiverRecorder from "./support/receiverRecorder"

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

function playUntilGameEnds(options) {
	const receiver = new ReceiverRecorder()
	const game = Factory.createGame(receiver, options)
	const ended = () => receiver.callsTo("endGame").length > 0
	for (let row = 1; row <= game.rows && !ended(); row++)
		for (let column = 1; column <= game.columns && !ended(); column++)
			game.reveal(row, column)
	return receiver.callsTo("endGame")[0]
}
