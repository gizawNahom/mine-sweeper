export default class Board {
	#rows
	#columns

	constructor(rows, columns) {
		this.#rows = rows
		this.#columns = columns
	}

	get rows() {
		return this.#rows
	}

	get columns() {
		return this.#columns
	}

	get numberOfCells() {
		return this.#rows * this.#columns
	}

	adjacents(row, column) {
		return this.#allAdjacents(row, column).filter(({ row, column }) =>
			this.#contains(row, column)
		)
	}

	#allAdjacents(row, column) {
		const rightCell = { row, column: column + 1 }
		const bottomRightCell = { row: row + 1, column: column + 1 }
		const bottomCell = { row: row + 1, column }
		const bottomLeftCell = { row: row + 1, column: column - 1 }
		const leftCell = { row, column: column - 1 }
		const topLeftCell = { row: row - 1, column: column - 1 }
		const topCell = { row: row - 1, column }
		const topRightCell = { row: row - 1, column: column + 1 }
		return [
			rightCell,
			bottomRightCell,
			bottomCell,
			bottomLeftCell,
			leftCell,
			topLeftCell,
			topCell,
			topRightCell,
		]
	}

	#contains(row, column) {
		return this.#isRowValid(row) && this.#isColumnValid(column)
	}

	#isRowValid(row) {
		return row >= 1 && row <= this.#rows
	}

	#isColumnValid(column) {
		return column >= 1 && column <= this.#columns
	}
}
