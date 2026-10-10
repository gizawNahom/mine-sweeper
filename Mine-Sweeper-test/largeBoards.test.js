import ReceiverRecorder from "./support/receiverRecorder"
import { startGame } from "./support/games"

describe("Given a 100x100 board with a single mine", () => {
	describe("When the user reveals the opposite corner", () => {
		test("Then every safe cell is revealed and the game is won", () => {
			const receiver = new ReceiverRecorder()
			const game = startGame({
				rows: 100,
				columns: 100,
				mines: [{ row: 100, column: 100 }],
			}, receiver)

			game.reveal(1, 1)

			expect(receiver.callsTo("reveal")).toHaveLength(9999)
			expect(receiver.callsTo("endGame")).toEqual([
				{ won: true, mines: [{ row: 100, column: 100 }] },
			])
		})
	})
})
