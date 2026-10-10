import { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_MINES } from "./constants.js"
import Board from "./board.js"
import Game from "./game.js"
import Minefield from "./minefield.js"
import MineGenerator from "./mineGenerator.js"

const OPTION_NAMES = ["rows", "columns", "mines"]

export default class Factory {
	static createGame(receiver, options) {
		const { rows, columns, mines } = Factory.#readOptions(options)
		const board = new Board(rows, columns)
		return new Game(receiver, board, Factory.#layMines(mines, board))
	}

	static #readOptions(options = {}) {
		Object.keys(options).forEach((name) => {
			if (!OPTION_NAMES.includes(name))
				throw new TypeError(`unknown option ${JSON.stringify(name)}`)
		})
		const {
			rows = DEFAULT_ROWS,
			columns = DEFAULT_COLUMNS,
			mines = DEFAULT_MINES,
		} = options
		return { rows, columns, mines }
	}

	static #layMines(mines, board) {
		return Array.isArray(mines)
			? Minefield.at(board, mines)
			: Minefield.random(board, mines, new MineGenerator())
	}
}
