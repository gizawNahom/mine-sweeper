import { Factory } from "../Mine-Sweeper/src/index.js"

const DIFFICULTIES = {
	default: undefined, // the engine's default: 8x10 with 10 mines
	beginner: { rows: 9, columns: 9, mines: 10 },
	intermediate: { rows: 16, columns: 16, mines: 40 },
	expert: { rows: 16, columns: 30, mines: 99 },
}

const boardElement = document.querySelector("#board")
const difficultySelect = document.querySelector("#difficulty")
const flagModeButton = document.querySelector("#flag-mode")
const flagsLeftElement = document.querySelector("#flags-left")
const resultElement = document.querySelector("#result")

let game
let cells = []

// The engine reports every change here; the UI only draws what it is told.
const receiver = {
	flag(row, column) {
		drawCell(row, column, { state: "flagged", text: "🚩" })
		showFlagsLeft()
	},

	unflag(row, column) {
		drawCell(row, column, { state: "hidden", text: "" })
		showFlagsLeft()
	},

	reveal({ row, column, adjacentMines }) {
		drawCell(row, column, {
			state: "revealed",
			text: adjacentMines > 0 ? String(adjacentMines) : "",
			adjacentMines,
		})
	},

	endGame({ won, mines }) {
		const mine = won ? { state: "flagged", text: "🚩" } : { state: "mine", text: "💣" }
		mines.forEach(({ row, column }) => drawCell(row, column, mine))
		boardElement.classList.add("over")
		resultElement.textContent = won ? "You won 🎉" : "Boom 💥 You hit a mine."
	},
}

document.querySelector("#new-game").addEventListener("click", newGame)
difficultySelect.addEventListener("change", newGame)
flagModeButton.addEventListener("click", toggleFlagMode)
boardElement.addEventListener("click", onCellClick)
boardElement.addEventListener("contextmenu", onCellRightClick)
boardElement.addEventListener("keydown", onCellKey)

newGame()

function newGame() {
	game = Factory.createGame({ ...DIFFICULTIES[difficultySelect.value], receiver })
	drawBoard(game.rows, game.columns)
	showFlagsLeft()
	resultElement.textContent = ""
}

function drawBoard(rows, columns) {
	boardElement.classList.remove("over")
	boardElement.style.setProperty("--columns", columns)
	boardElement.replaceChildren()
	cells = []
	for (let row = 1; row <= rows; row++) {
		cells.push([])
		for (let column = 1; column <= columns; column++) {
			const cell = createCell(row, column)
			cells[row - 1].push(cell)
			boardElement.append(cell)
		}
	}
}

function createCell(row, column) {
	const cell = document.createElement("button")
	cell.type = "button"
	cell.className = "cell"
	cell.dataset.row = row
	cell.dataset.column = column
	cell.dataset.state = "hidden"
	cell.setAttribute("aria-label", `Row ${row}, column ${column}, hidden`)
	return cell
}

function drawCell(row, column, { state, text, adjacentMines }) {
	const cell = cells[row - 1][column - 1]
	cell.dataset.state = state
	cell.textContent = text
	if (adjacentMines !== undefined) cell.dataset.adjacentMines = adjacentMines
	cell.setAttribute("aria-label", `Row ${row}, column ${column}, ${describe(state, adjacentMines)}`)
}

function describe(state, adjacentMines) {
	if (state === "revealed") return `${adjacentMines} adjacent mines`
	return state
}

function showFlagsLeft() {
	flagsLeftElement.textContent = game.numberOfFlags
}

function toggleFlagMode() {
	const pressed = flagModeButton.getAttribute("aria-pressed") === "true"
	flagModeButton.setAttribute("aria-pressed", String(!pressed))
}

function isFlagMode() {
	return flagModeButton.getAttribute("aria-pressed") === "true"
}

function onCellClick(event) {
	const cell = event.target.closest(".cell")
	if (!cell) return
	if (isFlagMode()) toggleFlag(cell)
	else game.reveal(...positionOf(cell))
}

function onCellRightClick(event) {
	const cell = event.target.closest(".cell")
	if (!cell) return
	event.preventDefault()
	toggleFlag(cell)
}

function onCellKey(event) {
	const cell = event.target.closest(".cell")
	if (cell && event.key.toLowerCase() === "f") toggleFlag(cell)
}

function toggleFlag(cell) {
	if (cell.dataset.state === "flagged") game.unflag(...positionOf(cell))
	else game.flag(...positionOf(cell))
}

function positionOf(cell) {
	return [Number(cell.dataset.row), Number(cell.dataset.column)]
}
