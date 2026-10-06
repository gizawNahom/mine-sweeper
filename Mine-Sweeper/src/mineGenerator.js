export default class MineGenerator {
	generate({ rows, columns, mines: numberOfMines }) {
		const mines = []
		for (let i = 0; i < numberOfMines; i++)
			this.#generateMine(mines, { rows, columns })
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
