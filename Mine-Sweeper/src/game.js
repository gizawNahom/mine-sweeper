export default class Game {
	#numberOfFlags
	#cells = {}
	#numberOfUnrevealedCells
	#minefield
	#board

	// Where the game reports every change: an object with flag, unflag, reveal and endGame.
	#outputPort
	#isOver = false

	constructor(outputPort, board, minefield) {
		this.#outputPort = outputPort
		this.#board = board
		this.#minefield = minefield

		this.#numberOfFlags = minefield.size
		this.#numberOfUnrevealedCells = board.numberOfCells
	}

	get numberOfFlags() {
		return this.#numberOfFlags
	}

	get rows() {
		return this.#board.rows
	}

	get columns() {
		return this.#board.columns
	}

	flag(row, column) {
		this.#board.assertOnBoard(row, column)
		if (this.#isOver) return
		if (this.#shouldFlag(row, column)) this.#flagCell(row, column)
	}

	#shouldFlag(row, column) {
		return this.#hasFlagsLeft() && this.#isCellHidden(row, column)
	}

	#hasFlagsLeft() {
		return this.#numberOfFlags > 0
	}

	#isCellHidden(row, column) {
		return this.#cellState(row, column) === CellState.HIDDEN
	}

	#cellState(row, column) {
		return this.#cells[this.#cellKey(row, column)] ?? CellState.HIDDEN
	}

	#cellKey(row, column) {
		return `${row},${column}`
	}

	#flagCell(row, column) {
		this.#decrementFlag()
		this.#changeStateToFlagged(row, column)
		this.#notifyFlagged(row, column)
	}

	#decrementFlag() {
		this.#numberOfFlags--
	}

	#changeStateToFlagged(row, column) {
		this.#setCellState(this.#cellKey(row, column), CellState.FLAGGED)
	}

	#setCellState(cell, state) {
		this.#cells[cell] = state
	}

	#notifyFlagged(row, column) {
		this.#outputPort.flag(row, column)
	}

	unflag(row, column) {
		this.#board.assertOnBoard(row, column)
		if (this.#isOver) return
		if (this.#isFlagged(row, column)) this.#unflagCell(row, column)
	}

	#isFlagged(row, column) {
		return this.#cellState(row, column) === CellState.FLAGGED
	}

	#unflagCell(row, column) {
		this.#incrementFlag()
		this.#changeStateToHidden(row, column)
		this.#notifyUnflagged(row, column)
	}

	#incrementFlag() {
		this.#numberOfFlags++
	}

	#changeStateToHidden(row, column) {
		this.#setCellState(this.#cellKey(row, column), CellState.HIDDEN)
	}

	#notifyUnflagged(row, column) {
		this.#outputPort.unflag(row, column)
	}

	reveal(row, column) {
		this.#board.assertOnBoard(row, column)
		if (this.#isOver) return
		if (!this.#shouldReveal(row, column)) return
		if (this.#minefield.contains(row, column)) this.#lose()
		else this.#revealArea(row, column)
	}

	#shouldReveal(row, column) {
		return !this.#isCellRevealed(row, column) && !this.#isFlagged(row, column)
	}

	#isCellRevealed(row, column) {
		return this.#cellState(row, column) === CellState.REVEALED
	}

	#lose() {
		this.#isOver = true
		this.#outputPort.endGame({ won: false, mines: this.#minefield.cells })
	}

	#revealArea(row, column) {
		const pending = [{ row, column }]
		while (pending.length > 0) {
			const next = this.#revealCell(pending.pop())
			pending.push(...next.reverse())
		}
	}

	#revealCell({ row, column }) {
		this.unflag(row, column)
		if (!this.#shouldReveal(row, column)) return []
		this.#markRevealed(row, column)
		const adjacentCells = this.#board.adjacentCells(row, column)
		const numberOfAdjacentMines = this.#minefield.countAmong(adjacentCells)
		this.#notifyRevealed({ row, column, numberOfAdjacentMines })
		if (this.#isWon()) this.#win()
		else if (this.#noAdjacentMines(numberOfAdjacentMines))
			return this.#unrevealedAdjacentCells(adjacentCells)
		return []
	}

	#markRevealed(row, column) {
		this.#changeStateToRevealed(row, column)
		this.#decrementNumberOfUnrevealed()
	}

	#changeStateToRevealed(row, column) {
		this.#setCellState(this.#cellKey(row, column), CellState.REVEALED)
	}

	#decrementNumberOfUnrevealed() {
		this.#numberOfUnrevealedCells--
	}

	#notifyRevealed({ row, column, numberOfAdjacentMines }) {
		this.#outputPort.reveal({
			row: row,
			column: column,
			adjacentMines: numberOfAdjacentMines,
		})
	}

	#isWon() {
		return this.#numberOfUnrevealedCells === this.#minefield.size
	}

	#win() {
		this.#isOver = true
		this.#outputPort.endGame({ won: true, mines: this.#minefield.cells })
	}

	#noAdjacentMines(numberOfAdjacentMines) {
		return numberOfAdjacentMines == 0
	}

	#unrevealedAdjacentCells(adjacentCells) {
		return adjacentCells.filter(
			({ row, column }) => !this.#isCellRevealed(row, column)
		)
	}
}

const CellState = {
	HIDDEN: 0,
	FLAGGED: 1,
	REVEALED: 2,
}

Object.freeze(CellState)
