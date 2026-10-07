import { Factory } from "mine-sweeper"
import { board } from "./support/boards"
import { MINE_FIELD_1 } from "./support/mineFields"
import ReceiverRecorder from "./support/receiverRecorder"

describe("Given a new game on mine field 1", () => {
	let game
	let receiver
	beforeEach(() => {
		receiver = new ReceiverRecorder()
		game = Factory.createGame(receiver, MINE_FIELD_1)
	})

	describe("When the user reveals a mine", () => {
		test("Then the game is lost", () => {
			game.reveal(1, 2)

			expect(receiver.calls).toEqual([["endGame", { won: false, mines: MINE_FIELD_1.mines }]])
		})
	})

	describe("When the user reveals the last safe cell", () => {
		test("Then the game is won", () => {
			revealEverySafeCellExceptTheLast(game, MINE_FIELD_1)
			receiver.clear()

			game.reveal(8, 10)

			expect(receiver.calls).toEqual([
				["reveal", { row: 8, column: 10, adjacentMines: 1 }],
				["endGame", { won: true, mines: MINE_FIELD_1.mines }],
			])
		})
	})

	describe("And some mines are flagged", () => {
		describe("When the user reveals the last safe cell", () => {
			test("Then the game is won", () => {
				game.flag(1, 2)
				game.flag(2, 1)
				game.flag(2, 2)
				revealEverySafeCellExceptTheLast(game, MINE_FIELD_1)
				receiver.clear()

				game.reveal(8, 10)

				expect(receiver.calls).toEqual([
					["reveal", { row: 8, column: 10, adjacentMines: 1 }],
					["endGame", { won: true, mines: MINE_FIELD_1.mines }],
				])
			})
		})
	})

	describe("And the game has been lost", () => {
		beforeEach(() => {
			game.flag(5, 5)
			game.reveal(1, 2)
			receiver.clear()
		})

		test.each([
			["reveal", 4, 4],
			["reveal", 2, 1],
			["flag", 6, 6],
			["unflag", 5, 5],
		])("When the user calls %s(%i, %i) Then nothing happens", (move, row, column) => {
			game[move](row, column)

			expect(receiver.calls).toEqual([])
			expect(game.numberOfFlags).toBe(9)
		})

		test("When the user plays off the board Then it is still rejected", () => {
			expect(() => game.reveal(0, 5)).toThrow(RangeError)
		})
	})

	describe("And the game has been won", () => {
		beforeEach(() => {
			game.flag(1, 2)
			revealEverySafeCellExceptTheLast(game, MINE_FIELD_1)
			game.reveal(8, 10)
			receiver.clear()
		})

		test.each([
			["reveal", 2, 1],
			["flag", 2, 1],
			["unflag", 1, 2],
		])("When the user calls %s(%i, %i) Then nothing happens", (move, row, column) => {
			game[move](row, column)

			expect(receiver.calls).toEqual([])
			expect(game.numberOfFlags).toBe(9)
		})
	})
})

describe("Given a 3x3 game with one mine in the centre", () => {
	describe("When the user reveals every safe cell", () => {
		test("Then each shows 1 adjacent mine and the game is won", () => {
			const receiver = new ReceiverRecorder()
			const field = board`
				. . .
				. * .
				. . .
			`
			const game = Factory.createGame(receiver, field)

			for (let row = 1; row <= 3; row++)
				for (let column = 1; column <= 3; column++)
					if (row !== 2 || column !== 2) game.reveal(row, column)

			const reveals = receiver.callsTo("reveal")
			expect(reveals).toHaveLength(8)
			reveals.forEach((cell) => expect(cell.adjacentMines).toBe(1))
			expect(receiver.callsTo("endGame")).toEqual([{ won: true, mines: field.mines }])
		})
	})
})

describe("Given a 3x3 game with one mine in a corner", () => {
	describe("When the user reveals the opposite corner", () => {
		test("Then the revealed area wins the game and it ends only once", () => {
			const receiver = new ReceiverRecorder()
			const field = board`
				. . .
				. . .
				. . *
			`
			const game = Factory.createGame(receiver, field)

			game.reveal(1, 1)

			expect(receiver.callsTo("reveal")).toHaveLength(8)
			expect(receiver.callsTo("endGame")).toEqual([{ won: true, mines: field.mines }])
		})
	})
})

// Reveals every safe cell, in reading order, except the bottom-right one. On
// mine field 1 that cell is next to a mine, so it is never revealed automatically.
function revealEverySafeCellExceptTheLast(game, field) {
	const isMine = (row, column) =>
		field.mines.some((mine) => mine.row === row && mine.column === column)
	const safeCells = []
	for (let row = 1; row <= field.rows; row++)
		for (let column = 1; column <= field.columns; column++)
			if (!isMine(row, column)) safeCells.push({ row, column })
	safeCells.slice(0, -1).forEach(({ row, column }) => game.reveal(row, column))
}
