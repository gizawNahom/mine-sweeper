import { MINE_FIELD_1 } from "./support/mineFields"
import ReceiverRecorder from "./support/receiverRecorder"
import { startGame } from "./support/games"

describe("Given a new 8x10 game", () => {
	let game
	let receiver
	beforeEach(() => {
		receiver = new ReceiverRecorder()
		game = startGame(MINE_FIELD_1, receiver)
	})

	describe.each(["reveal", "flag", "unflag"])("When the user calls %s with a position off the board", (move) => {
		test.each([
			[[0, 5], "row must be a whole number from 1 to 8, got 0", RangeError],
			[[9, 5], "row must be a whole number from 1 to 8, got 9", RangeError],
			[[99, 5], "row must be a whole number from 1 to 8, got 99", RangeError],
			[[1.5, 5], "row must be a whole number from 1 to 8, got 1.5", RangeError],
			[[1, 0], "column must be a whole number from 1 to 10, got 0", RangeError],
			[[1, 11], "column must be a whole number from 1 to 10, got 11", RangeError],
			[["13"], 'row must be a number, got "13"', TypeError],
			[[1], "column must be a number, got undefined", TypeError],
		])("Then %j is rejected with: %s, and nothing changes", (position, message, ErrorType) => {
			const play = () => game[move](...position)

			expect(play).toThrow(ErrorType)
			expect(play).toThrow(message)
			expect(receiver.calls).toEqual([])
			expect(game.numberOfFlags).toBe(10)
		})
	})
})
