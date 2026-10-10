export default class Minefield {
	#cells

	static random(board, count, mineGenerator) {
		board.assertMineCount(count)
		const { rows, columns } = board
		return new Minefield(mineGenerator.generate({ rows, columns, mines: count }))
	}

	static at(board, positions) {
		board.assertMineCount(positions.length)
		const cells = positions.map((position, index) =>
			Minefield.#placeMine(position, index, board)
		)
		Minefield.#rejectDuplicates(cells)
		return new Minefield(cells)
	}

	static #placeMine(position, index, board) {
		const { row, column } = position ?? {}
		try {
			board.assertOnBoard(row, column)
		} catch (error) {
			throw new error.constructor(`mines[${index}]: ${error.message}`)
		}
		return { row, column }
	}

	static #rejectDuplicates(cells) {
		cells.forEach((cell, index) => {
			const first = cells.findIndex(
				(other) => other.row === cell.row && other.column === cell.column
			)
			if (first !== index)
				throw new RangeError(`mines lists ${cell.row},${cell.column} more than once`)
		})
	}

	constructor(cells) {
		this.#cells = cells
	}

	get size() {
		return this.#cells.length
	}

	contains(row, column) {
		return this.#cells.some((mine) => mine.row === row && mine.column === column)
	}

	countAmong(cells) {
		return cells.filter(({ row, column }) => this.contains(row, column)).length
	}

	get cells() {
		return this.#cells.map(({ row, column }) => ({ row, column }))
	}
}
