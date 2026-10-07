import { NUMBER_OF_MINES, MAX_ROW, MAX_COlUMN } from "./constants.js"
import Board from "./board.js"

const OPTION_NAMES = ["rows", "columns", "mines"]

export default class Game {
	#numberOfFlags
	#cells = {}
	#numberOfUnrevealedCells
	#mines
	#board

	#receiver

	constructor(receiver, mineGenerator, options) {
		const { rows, columns, mines } = this.#readOptions(options)
		this.#receiver = receiver
		this.#board = new Board(rows, columns, mines)

		this.#numberOfFlags = mines
		this.#numberOfUnrevealedCells = this.#board.numberOfCells
		this.#mines = mineGenerator.generate({ rows, columns, mines })
	}

	#readOptions(options = {}) {
		Object.keys(options).forEach((name) => {
			if (!OPTION_NAMES.includes(name))
				throw new TypeError(`unknown option ${JSON.stringify(name)}`)
		})
		const {
			rows = MAX_ROW,
			columns = MAX_COlUMN,
			mines = NUMBER_OF_MINES,
		} = options
		return { rows, columns, mines }
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
		this.#board.checkCell(row, column)
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
		this.#setCellState(this.#cellKey(row, column), CellState.FLAGGED)
	}

	#flagReceiver(row, column) {
		this.#receiver.flag(row, column)
	}

	unflag(row, column) {
		this.#board.checkCell(row, column)
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
		this.#setCellState(this.#cellKey(row, column), undefined)
	}

	#unflagReceiver(row, column) {
		this.#receiver.unflag(row, column)
	}

	reveal(row, column) {
		this.#board.checkCell(row, column)
		if (!this.#shouldReveal(row, column)) return
		if (this.#isCellArmed(row, column)) this.#endGame()
		else this.#revealSafeCell(row, column)
	}

	#revealSafeCell(row, column) {
		this.#changeStateToRevealed(row, column)
		this.#decrementNumberOfUnrevealed()
		this.#revealCell(row, column)
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
		this.#setCellState(this.#cellKey(row, column), CellState.REVEALED)
	}

	#setCellState(cell, state) {
		this.#cells[cell] = state
	}

	#decrementNumberOfUnrevealed() {
		this.#numberOfUnrevealedCells--
	}

	#revealCell(row, column) {
		const adjacents = this.#board.adjacents(row, column)
		const numberOfAdjacentMines = this.#numberOfAdjacentMines(adjacents)
		this.#revealReceiver({
			row,
			column,
			numberOfAdjacentMines,
		})
		if (this.#hasSweepedMines()) this.#endGame()
		else if (this.#noAdjacentMines(numberOfAdjacentMines))
			this.#revealUnrevealedAdjacents(adjacents)
	}

	#numberOfAdjacentMines(adjacents) {
		return this.#countArmed(adjacents)
	}

	#countArmed(cells) {
		return cells.filter(({ row, column }) => this.#isCellArmed(row, column))
			.length
	}

	#isCellArmed(row, column) {
		return this.#mines.some((mine) => mine.row === row && mine.column === column)
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

	#cellKey(row, column) {
		return `${row},${column}`
	}

	#cellState(row, column) {
		return this.#cells[this.#cellKey(row, column)]
	}

	#revealCells(unrevealed) {
		unrevealed.forEach(({ row, column }) => {
			this.unflag(row, column)
			this.reveal(row, column)
		})
	}

	#hasSweepedMines() {
		return this.#numberOfUnrevealedCells === this.#board.mines
	}
}

const CellState = {
	REVEALED: 0,
	FLAGGED: 1,
}

Object.freeze(CellState)
