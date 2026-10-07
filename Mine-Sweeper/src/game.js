import { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_MINES } from "./constants.js"
import Board from "./board.js"

const OPTION_NAMES = ["rows", "columns", "mines"]

export default class Game {
	#numberOfFlags
	#cells = {}
	#numberOfUnrevealedCells
	#mineCells
	#board

	#receiver
	#isOver = false

	constructor(receiver, mineGenerator, options) {
		const { rows, columns, mines } = this.#readOptions(options)
		this.#receiver = receiver
		this.#board = new Board(rows, columns, this.#countOf(mines))

		this.#numberOfFlags = this.#board.numberOfMines
		this.#numberOfUnrevealedCells = this.#board.numberOfCells
		this.#mineCells = Array.isArray(mines)
			? this.#placeMines(mines)
			: mineGenerator.generate({ rows, columns, mines })
	}

	#readOptions(options = {}) {
		Object.keys(options).forEach((name) => {
			if (!OPTION_NAMES.includes(name))
				throw new TypeError(`unknown option ${JSON.stringify(name)}`)
		})
		const {
			rows = DEFAULT_ROWS,
			columns = DEFAULT_COLUMNS,
			mines = DEFAULT_MINES,
		} = options
		return { rows, columns, mines }
	}

	#countOf(mines) {
		return Array.isArray(mines) ? mines.length : mines
	}

	#placeMines(mines) {
		const placed = mines.map((mine, index) => this.#placeMine(mine, index))
		this.#rejectDuplicateMines(placed)
		return placed
	}

	#placeMine(mine, index) {
		const { row, column } = mine ?? {}
		try {
			this.#board.assertOnBoard(row, column)
		} catch (error) {
			throw new error.constructor(`mines[${index}]: ${error.message}`)
		}
		return { row, column }
	}

	#rejectDuplicateMines(mines) {
		mines.forEach((mine, index) => {
			const first = mines.findIndex(
				(other) => other.row === mine.row && other.column === mine.column
			)
			if (first !== index)
				throw new RangeError(`mines lists ${mine.row},${mine.column} more than once`)
		})
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
		this.#receiver.flag(row, column)
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
		this.#receiver.unflag(row, column)
	}

	reveal(row, column) {
		this.#board.assertOnBoard(row, column)
		if (this.#isOver) return
		if (!this.#shouldReveal(row, column)) return
		if (this.#isMine(row, column)) this.#lose()
		else this.#revealArea(row, column)
	}

	#shouldReveal(row, column) {
		return !this.#isCellRevealed(row, column) && !this.#isFlagged(row, column)
	}

	#isCellRevealed(row, column) {
		return this.#cellState(row, column) === CellState.REVEALED
	}

	#isMine(row, column) {
		return this.#mineCells.some((mine) => mine.row === row && mine.column === column)
	}

	#lose() {
		this.#isOver = true
		this.#receiver.endGame({ won: false, mines: this.#mineCells })
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
		const numberOfAdjacentMines = this.#countMines(adjacentCells)
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

	#countMines(cells) {
		return cells.filter(({ row, column }) => this.#isMine(row, column))
			.length
	}

	#notifyRevealed({ row, column, numberOfAdjacentMines }) {
		this.#receiver.reveal({
			row: row,
			column: column,
			adjacentMines: numberOfAdjacentMines,
		})
	}

	#isWon() {
		return this.#numberOfUnrevealedCells === this.#board.numberOfMines
	}

	#win() {
		this.#isOver = true
		this.#receiver.endGame({ won: true, mines: this.#mineCells })
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
