import Board from "./board.js"
import Game from "./game.js"
import MineGenerator from "./mineGenerator.js"

export default class Factory {
	static createGame(receiver) {
		const board = new Board()
		const mg = new MineGenerator(board)
		return new Game(receiver, mg, board)
	}
}
