import { NUMBER_OF_MINES } from "./constants.js"

export default class MineGenerator {
	generate(size) {
		const mines = []
		for (let i = 0; i < NUMBER_OF_MINES; i++) this.#generateMine(mines, size)
		return mines
	}

	#generateMine(mines, size) {
		let mine = this.#aUniqueAndRandomMine(mines, size)
		mines.push(mine)
	}

	#aUniqueAndRandomMine(generated, { rows, columns }) {
		let row
		let column
		do {
			row = this.#randomUpTo(rows)
			column = this.#randomUpTo(columns)
		} while (
			generated.some((mine) => mine.row === row && mine.column === column)
		)
		return { row, column }
	}

	#randomUpTo(max) {
		return Math.floor(Math.random() * max) + 1
	}
}
