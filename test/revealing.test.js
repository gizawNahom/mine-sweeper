import { MINE_FIELD_1, MINE_FIELD_2 } from "./support/mineFields"
import ReceiverRecorder from "./support/receiverRecorder"
import { startGame } from "./support/games"

describe("Given a new game on mine field 1", () => {
	let game
	let receiver
	beforeEach(() => {
		receiver = new ReceiverRecorder()
		game = startGame(MINE_FIELD_1, receiver)
	})

	test.each([
		["the top-left corner", 1, 1, 3],
		["the top-right corner", 1, 10, 1],
		["the bottom-left corner", 8, 1, 2],
		["the bottom-right corner", 8, 10, 1],
		["a cell with 8 adjacent cells", 2, 6, 1],
	])("When the user reveals %s (%i,%i) Then it shows %i adjacent mines", (_, row, column, adjacentMines) => {
		game.reveal(row, column)

		expect(receiver.calls).toEqual([["reveal", { row, column, adjacentMines }]])
	})

	describe("And a cell has been revealed", () => {
		describe("When the user reveals it again", () => {
			test("Then nothing happens", () => {
				game.reveal(1, 1)
				receiver.clear()

				game.reveal(1, 1)

				expect(receiver.calls).toEqual([])
			})
		})
	})

	describe("When the user reveals a cell with no adjacent mines whose area spreads", () => {
		test("Then every reachable cell is revealed, and a flag on the way is removed first", () => {
			game.reveal(3, 7)
			game.flag(3, 8)
			receiver.clear()

			game.reveal(3, 5)

			expect(receiver.calls).toHaveLength(58)
			expect(receiver.callsTo("reveal")).toHaveLength(57)
			expect(receiver.callsTo("unflag")).toEqual([{ row: 3, column: 8 }])
			assertUnflaggedBeforeRevealed(receiver, 3, 8)
		})
	})
})

describe("Given a game on mine field 2 with a flag next to an empty cell", () => {
	let receiver
	beforeEach(() => {
		receiver = new ReceiverRecorder()
		const game = startGame(MINE_FIELD_2, receiver)
		game.flag(2, 6)
		game.reveal(2, 4)
		receiver.clear()

		game.reveal(3, 5)
	})

	describe("When the user reveals the empty cell", () => {
		test("Then all of its hidden adjacent cells are revealed", () => {
			expect(receiver.calls).toHaveLength(9)
			expect(receiver.callsTo("reveal")).toHaveLength(8)
		})

		test("Then the flagged adjacent cell is unflagged before it is revealed", () => {
			expect(receiver.callsTo("unflag")).toEqual([{ row: 2, column: 6 }])
			assertUnflaggedBeforeRevealed(receiver, 2, 6)
		})
	})
})

function assertUnflaggedBeforeRevealed(receiver, row, column) {
	const indexOf = (method) =>
		receiver.calls.findIndex(
			([name, cell]) => name === method && cell.row === row && cell.column === column
		)
	expect(indexOf("unflag")).toBeGreaterThanOrEqual(0)
	expect(indexOf("unflag")).toBeLessThan(indexOf("reveal"))
}
