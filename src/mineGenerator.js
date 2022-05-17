const NUMBER_OF_MINES = 10
const MAX_ROW = 8
const MAX_COlUMN = 10

export default class MineGenerator {
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
		} while (generated.includes(`${row}${column}`))
		return `${row}${column}`
	}

	#randomRow() {
		return Math.floor(Math.random() * (MAX_ROW - 1)) + 1
	}

	#randomColumn() {
		return Math.floor(Math.random() * (MAX_COlUMN - 1)) + 1
	}
}
