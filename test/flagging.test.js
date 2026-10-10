import { board } from "./support/boards"
import { MINE_FIELD_1 } from "./support/mineFields"
import ReceiverRecorder from "./support/receiverRecorder"
import { startGame } from "./support/games"

describe("Given a new game", () => {
	let game
	let receiver
	beforeEach(() => {
		receiver = new ReceiverRecorder()
		game = startGame(MINE_FIELD_1, receiver)
	})

	describe("When the user flags a hidden cell", () => {
		beforeEach(() => {
			game.flag(1, 1)
		})

		test("Then the cell is flagged", () => {
			expect(receiver.calls).toEqual([["flag", { row: 1, column: 1 }]])
		})

		test("Then 9 flags are left", () => {
			expect(game.numberOfFlags).toBe(9)
		})
	})

	describe("When the user flags a flagged cell", () => {
		test("Then nothing happens", () => {
			game.flag(1, 1)
			receiver.clear()

			game.flag(1, 1)

			expect(receiver.calls).toEqual([])
			expect(game.numberOfFlags).toBe(9)
		})
	})

	describe("When the user unflags a flagged cell", () => {
		beforeEach(() => {
			game.flag(1, 1)
			receiver.clear()

			game.unflag(1, 1)
		})

		test("Then the cell is unflagged", () => {
			expect(receiver.calls).toEqual([["unflag", { row: 1, column: 1 }]])
		})

		test("Then 10 flags are left", () => {
			expect(game.numberOfFlags).toBe(10)
		})
	})

	describe("When the user unflags a hidden cell", () => {
		test("Then nothing happens", () => {
			game.unflag(1, 1)

			expect(receiver.calls).toEqual([])
			expect(game.numberOfFlags).toBe(10)
		})
	})

	describe("When the user flags a cell again after unflagging it", () => {
		test("Then the cell is flagged", () => {
			game.flag(1, 1)
			game.unflag(1, 1)
			receiver.clear()

			game.flag(1, 1)

			expect(receiver.calls).toEqual([["flag", { row: 1, column: 1 }]])
			expect(game.numberOfFlags).toBe(9)
		})
	})

	describe("And every flag has been placed", () => {
		describe("When the user flags another cell", () => {
			test("Then nothing happens", () => {
				for (let column = 1; column <= 10; column++) game.flag(1, column)
				receiver.clear()

				game.flag(2, 1)

				expect(receiver.calls).toEqual([])
				expect(game.numberOfFlags).toBe(0)
			})
		})
	})

	describe("And a cell is flagged", () => {
		beforeEach(() => {
			game.flag(1, 1)
			receiver.clear()
		})

		describe("When the user unflags a different, hidden cell", () => {
			test("Then nothing happens", () => {
				game.unflag(1, 2)

				expect(receiver.calls).toEqual([])
				expect(game.numberOfFlags).toBe(9)
			})
		})

		describe("When the user reveals the flagged cell", () => {
			test("Then nothing happens", () => {
				game.reveal(1, 1)

				expect(receiver.calls).toEqual([])
				expect(game.numberOfFlags).toBe(9)
			})
		})
	})

	describe("And a cell has been revealed", () => {
		beforeEach(() => {
			game.reveal(1, 1)
			receiver.clear()
		})

		describe("When the user flags it", () => {
			test("Then nothing happens", () => {
				game.flag(1, 1)

				expect(receiver.calls).toEqual([])
				expect(game.numberOfFlags).toBe(10)
			})
		})

		describe("When the user unflags it", () => {
			test("Then nothing happens", () => {
				game.unflag(1, 1)

				expect(receiver.calls).toEqual([])
				expect(game.numberOfFlags).toBe(10)
			})
		})
	})

	describe("And a mine is flagged", () => {
		beforeEach(() => {
			game.flag(7, 9)
			receiver.clear()
		})

		describe("When the user reveals a cell whose only adjacent mine it is", () => {
			test("Then the cell still counts it", () => {
				game.reveal(8, 10)

				expect(receiver.calls).toEqual([["reveal", { row: 8, column: 10, adjacentMines: 1 }]])
			})
		})

		describe("When the user reveals the flagged mine", () => {
			test("Then nothing happens", () => {
				game.reveal(7, 9)

				expect(receiver.calls).toEqual([])
			})
		})

		describe("When the user unflags and then reveals it", () => {
			test("Then the game is lost", () => {
				game.unflag(7, 9)
				receiver.clear()

				game.reveal(7, 9)

				expect(receiver.calls).toEqual([["endGame", { won: false, mines: MINE_FIELD_1.mines }]])
			})
		})
	})
})

describe("Given a receiver that reads the flag count when it is notified", () => {
	let game
	let seen
	beforeEach(() => {
		seen = []
		const receiver = {
			flag: () => seen.push(["flag", game.numberOfFlags]),
			unflag: () => seen.push(["unflag", game.numberOfFlags]),
			reveal() {},
			endGame() {},
		}
		game = startGame(board`
			. . . *
			. . . .
			. . . .
		`, receiver)
	})

	test("Then flag and unflag callbacks already see the updated count", () => {
		game.flag(1, 1)
		game.unflag(1, 1)

		expect(seen).toEqual([
			["flag", 0],
			["unflag", 1],
		])
	})

	test("Then an unflag caused by auto-reveal also sees the updated count", () => {
		game.flag(1, 1)
		seen = []

		game.reveal(3, 1)

		expect(seen).toEqual([["unflag", 1]])
	})
})

describe("Given a game with more than 9 rows and columns", () => {
	describe("When the user flags 1,11 and reveals 11,1", () => {
		test("Then 11,1 is revealed, since they are different cells", () => {
			const receiver = new ReceiverRecorder()
			const game = startGame({
				rows: 12,
				columns: 12,
				mines: [{ row: 12, column: 12 }],
			}, receiver)
			game.flag(1, 11)
			receiver.clear()

			game.reveal(11, 1)

			expect(receiver.calls[0]).toEqual(["reveal", { row: 11, column: 1, adjacentMines: 0 }])
		})
	})
})
