import { NUMBER_OF_MINES, MAX_ROW, MAX_COlUMN } from "./constants.js"

export default class Game {
	#numberOfFlags
	#cells = {}
	#numberOfUnrevealedCells
	#mines

	#receiver

	constructor(receiver, mineGenerator) {
		this.#receiver = receiver

		this.#numberOfFlags = NUMBER_OF_MINES
		this.#numberOfUnrevealedCells = this.rows * this.columns
		this.#mines = mineGenerator.generate()
	}

	get numberOfFlags() {
		return this.#numberOfFlags
	}

	get rows() {
		return MAX_ROW
	}

	get columns() {
		return MAX_COlUMN
	}

	flag(row, column) {
		if (this.#shouldFlag(row, column)) this.#flagCell(row, column)
	}

	#shouldFlag(row, column) {
		return this.#enoughFlags() && this.#isCellHidden(row, column)
	}

	#enoughFlags() {
		return this.#numberOfFlags > 0
	}

	#isCellHidden(row, column) {
		return this.#cellState(row, column) === undefined
	}

	#flagCell(row, column) {
		this.#decrementFlag()
		this.#changeStateToFlagged(row, column)
		this.#flagReceiver(row, column)
	}

	#decrementFlag() {
		this.#numberOfFlags--
	}

	#changeStateToFlagged(row, column) {
		this.#setCellState(`${row}${column}`, CellState.FLAGGED)
	}

	#flagReceiver(row, column) {
		this.#receiver.flag(row, column)
	}

	unflag(row, column) {
		if (this.#isFlagged(row, column)) this.#unflagCell(row, column)
	}

	#unflagCell(row, column) {
		this.#incrementFlag()
		this.#changeStateToHidden(row, column)
		this.#unflagReceiver(row, column)
	}

	#incrementFlag() {
		this.#numberOfFlags++
	}

	#changeStateToHidden(row, column) {
		this.#setCellState(`${row}${column}`, undefined)
	}

	#unflagReceiver(row, column) {
		this.#receiver.unflag(row, column)
	}

	reveal(row, column) {
		if (!this.#shouldReveal(row, column)) return
		if (this.#isCellArmed(row, column)) this.#endGame()
		else this.#revealSafeCell(row, column)
	}

	#revealSafeCell(row, column) {
		this.#changeStateToRevealed(row, column)
		this.#decrementNumberOfUnrevealed()
		this.#revealCell(row, column)
		if (this.#hasSweepedMines()) this.#endGame()
	}

	#endGame() {
		this.#receiver.endGame(this.#mines)
	}

	#shouldReveal(row, column) {
		return !this.#isCellRevealed(row, column) && !this.#isFlagged(row, column)
	}

	#isFlagged(row, column) {
		return this.#cellState(row, column) === CellState.FLAGGED
	}

	#changeStateToRevealed(row, column) {
		this.#setCellState(`${row}${column}`, CellState.REVEALED)
	}

	#setCellState(cell, state) {
		this.#cells[cell] = state
	}

	#decrementNumberOfUnrevealed() {
		this.#numberOfUnrevealedCells--
	}

	#revealCell(row, column) {
		const adjacents = this.#adjacents(row, column)
		const numberOfAdjacentMines = this.#numberOfAdjacentMines(adjacents)
		this.#revealReceiver({
			row,
			column,
			numberOfAdjacentMines,
		})
		if (this.#noAdjacentMines(numberOfAdjacentMines))
			this.#revealUnrevealedAdjacents(adjacents)
	}

	#adjacents(row, column) {
		const allAdjacents = this.#allAdjacents(row, column)
		return this.#validAdjacents(allAdjacents)
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

	#validAdjacents(allAdjacents) {
		return allAdjacents.filter(
			({ row, column }) => this.#isRowValid(row) && this.#isColumnValid(column)
		)
	}

	#isRowValid(row) {
		return row >= 1 && row <= this.rows
	}

	#isColumnValid(column) {
		return column >= 1 && column <= this.columns
	}

	#numberOfAdjacentMines(adjacents) {
		return this.#countArmed(adjacents)
	}

	#countArmed(cells) {
		return cells.filter(({ row, column }) => this.#isCellArmed(row, column))
			.length
	}

	#isCellArmed(row, column) {
		return this.#mines.includes(`${row}${column}`)
	}

	#revealReceiver({ row, column, numberOfAdjacentMines }) {
		this.#receiver.reveal({
			row: row,
			column: column,
			adjacentMines: numberOfAdjacentMines,
		})
	}

	#noAdjacentMines(numberOfAdjacentMines) {
		return numberOfAdjacentMines == 0
	}

	#revealUnrevealedAdjacents(adjacents) {
		const unrevealed = this.#unrevealedAdjacents(adjacents)
		this.#revealCells(unrevealed)
	}

	#unrevealedAdjacents(adjacents) {
		return adjacents.filter(
			({ row, column }) => !this.#isCellRevealed(row, column)
		)
	}

	#isCellRevealed(row, column) {
		return this.#cellState(row, column) === CellState.REVEALED
	}

	#cellState(row, column) {
		return this.#cells[`${row}${column}`]
	}

	#revealCells(unrevealed) {
		unrevealed.forEach(({ row, column }) => {
			this.unflag(row, column)
			this.reveal(row, column)
		})
	}

	#hasSweepedMines() {
		return this.#numberOfUnrevealedCells === NUMBER_OF_MINES
	}
}

const CellState = {
	REVEALED: 0,
	FLAGGED: 1,
}

Object.freeze(CellState)
