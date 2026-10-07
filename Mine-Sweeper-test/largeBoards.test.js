import { Factory } from "mine-sweeper"
import ReceiverRecorder from "./support/receiverRecorder"

describe("Given a 100x100 board with a single mine", () => {
	describe("When the user reveals the opposite corner", () => {
		test("Then every safe cell is revealed and the game is won", () => {
			const receiver = new ReceiverRecorder()
			const game = Factory.createGame(receiver, {
				rows: 100,
				columns: 100,
				mines: [{ row: 100, column: 100 }],
			})

			game.reveal(1, 1)

			expect(receiver.callsTo("reveal")).toHaveLength(9999)
			expect(receiver.callsTo("endGame")).toEqual([
				{ won: true, mines: [{ row: 100, column: 100 }] },
			])
		})
	})
})
