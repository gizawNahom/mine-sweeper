import { NUMBER_OF_MINES } from "./constants.js"
import Board from "./board.js"

export default class MineGenerator {
	#board

	constructor(board = new Board()) {
		this.#board = board
	}

	generate() {
		const mines = []
		for (let i = 0; i < NUMBER_OF_MINES; i++) this.#generateMine(mines)
		return mines
	}

	#generateMine(mines) {
		let mine = this.#aUniqueAndRandomMine(mines)
		mines.push(mine)
	}

	#aUniqueAndRandomMine(generated) {
		let row
		let column
		do {
			row = this.#randomRow()
			column = this.#randomColumn()
		} while (
			generated.some((mine) => mine.row === row && mine.column === column)
		)
		return { row, column }
	}

	#randomRow() {
		return Math.floor(Math.random() * this.#board.rows) + 1
	}

	#randomColumn() {
		return Math.floor(Math.random() * this.#board.columns) + 1
	}
}
