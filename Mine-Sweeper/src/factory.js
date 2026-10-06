import Game from "./game.js"
import MineGenerator from "./mineGenerator.js"

export default class Factory {
	static createGame(receiver, options) {
		const mg = new MineGenerator()
		return new Game(receiver, mg, options)
	}
}
