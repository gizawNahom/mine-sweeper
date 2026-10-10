import { Factory } from "mine-sweeper"
import ReceiverRecorder from "./receiverRecorder"

// Starts a game on a board, for tests that need a game rather than tests about
// creating one. This is the only test helper that knows how to call
// Factory.createGame; creating.test.js calls it directly on purpose.
export function startGame(board, receiver = new ReceiverRecorder()) {
	return Factory.createGame(receiver, board)
}
