import { NUMBER_OF_MINES, MAX_ROW, MAX_COlUMN } from "./constants.js"

const OPTION_NAMES = ["rows", "columns", "mines"]

export default function gameOptions(options = {}) {
	rejectUnknownOptions(options)
	const {
		rows = MAX_ROW,
		columns = MAX_COlUMN,
		mines = NUMBER_OF_MINES,
	} = options
	checkSide("rows", rows)
	checkSide("columns", columns)
	checkMines(mines, rows, columns)
	return { rows, columns, mines }
}

function rejectUnknownOptions(options) {
	Object.keys(options).forEach((name) => {
		if (!OPTION_NAMES.includes(name))
			throw new TypeError(`unknown option ${JSON.stringify(name)}`)
	})
}

function checkSide(name, value) {
	checkNumber(name, value)
	if (!Number.isInteger(value) || value < 1)
		throw new RangeError(
			`${name} must be a whole number of at least 1, got ${show(value)}`
		)
}

function checkMines(mines, rows, columns) {
	checkNumber("mines", mines)
	const board = `${rows}x${columns}`
	const maxMines = rows * columns - 1
	if (maxMines < 1)
		throw new RangeError(
			`a ${board} board is too small: it needs room for at least 1 mine and 1 safe cell`
		)
	if (!Number.isInteger(mines) || mines < 1 || mines > maxMines)
		throw new RangeError(
			`mines must be a whole number from 1 to ${maxMines} for a ${board} board, got ${show(mines)}`
		)
}

function checkNumber(name, value) {
	if (typeof value !== "number")
		throw new TypeError(`${name} must be a number, got ${show(value)}`)
}

function show(value) {
	return typeof value === "string" ? JSON.stringify(value) : String(value)
}
