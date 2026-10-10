export default class MineGenerator {
	generate({ rows, columns, mines: numberOfMines }) {
		const mineCells = []
		for (let i = 0; i < numberOfMines; i++)
			this.#generateMine(mineCells, { rows, columns })
		return mineCells
	}

	#generateMine(mineCells, size) {
		let mine = this.#aUniqueAndRandomMine(mineCells, size)
		mineCells.push(mine)
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
