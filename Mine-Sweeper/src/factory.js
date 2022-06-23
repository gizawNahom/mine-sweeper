import Game from "./game"
import MineGenerator from "./mineGenerator"

export default class Factory {
	static createGame(receiver) {
		const mg = new MineGenerator()
		return new Game(receiver, mg)
	}
}
