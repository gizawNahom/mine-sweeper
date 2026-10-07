import { Factory } from "mine-sweeper"
import ReceiverRecorder from "./receiverRecorder"

// Creates a game and reveals cells in reading order until it ends.
// Returns what endGame reported: { won, mines }.
export function playUntilGameEnds(options) {
	const receiver = new ReceiverRecorder()
	revealUntilGameEnds(Factory.createGame(receiver, options), receiver)
	return receiver.callsTo("endGame")[0]
}

export function revealUntilGameEnds(game, receiver) {
	const ended = () => receiver.callsTo("endGame").length > 0
	for (let row = 1; row <= game.rows && !ended(); row++)
		for (let column = 1; column <= game.columns && !ended(); column++)
			game.reveal(row, column)
}
