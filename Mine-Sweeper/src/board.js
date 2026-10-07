export default class Board {
	#rows
	#columns
	#mines

	constructor(rows, columns, mines) {
		this.#assertValidSize("rows", rows)
		this.#assertValidSize("columns", columns)
		this.#rows = rows
		this.#columns = columns
		if (this.#maxMines < 1)
			throw new RangeError(
				`a ${this.#name} board is too small: it needs room for at least 1 mine and 1 safe cell`
			)
		this.#assertValidMineCount(mines)
		this.#mines = mines
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

	get mines() {
		return this.#mines
	}

	get #maxMines() {
		return this.numberOfCells - 1
	}

	get #name() {
		return `${this.#rows}x${this.#columns}`
	}

	assertOnBoard(row, column) {
		this.#assertValidCoordinate("row", row, this.#rows)
		this.#assertValidCoordinate("column", column, this.#columns)
	}

	#assertValidSize(name, value) {
		this.#assertWholeNumber(name, value, (value) => value >= 1, "of at least 1")
	}

	#assertValidMineCount(mines) {
		const max = this.#maxMines
		this.#assertWholeNumber(
			"mines",
			mines,
			(value) => this.#isWithin(value, max),
			`from 1 to ${max} for a ${this.#name} board`
		)
	}

	#assertValidCoordinate(name, value, max) {
		this.#assertWholeNumber(
			name,
			value,
			(value) => this.#isWithin(value, max),
			`from 1 to ${max}`
		)
	}

	#assertWholeNumber(name, value, isAllowed, allowed) {
		if (typeof value !== "number")
			throw new TypeError(`${name} must be a number, got ${this.#show(value)}`)
		if (!Number.isInteger(value) || !isAllowed(value))
			throw new RangeError(
				`${name} must be a whole number ${allowed}, got ${this.#show(value)}`
			)
	}

	#show(value) {
		return typeof value === "string" ? JSON.stringify(value) : String(value)
	}

	adjacentCells(row, column) {
		return this.#allAdjacentCells(row, column).filter(({ row, column }) =>
			this.#contains(row, column)
		)
	}

	#allAdjacentCells(row, column) {
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
		return this.#isWithin(row, this.#rows)
	}

	#isColumnValid(column) {
		return this.#isWithin(column, this.#columns)
	}

	#isWithin(value, max) {
		return value >= 1 && value <= max
	}
}
