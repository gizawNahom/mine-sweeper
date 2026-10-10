// Folds the engine's domain events into the board state React renders.
// A cell is { state: "hidden" | "flagged" | "revealed" | "mine", adjacentMines? }.

export function initialBoard({ rows, columns }) {
	return {
		status: "playing",
		cells: Array.from({ length: rows }, () =>
			Array.from({ length: columns }, () => ({ state: "hidden" }))
		),
	}
}

export function boardReducer(board, event) {
	switch (event.type) {
		case "CellFlagged":
			return withCell(board, event, { state: "flagged" })
		case "CellUnflagged":
			return withCell(board, event, { state: "hidden" })
		case "CellRevealed":
			return withCell(board, event, { state: "revealed", adjacentMines: event.adjacentMines })
		case "GameWon":
			return withMines({ ...board, status: "won" }, event.mines, { state: "flagged" })
		case "GameLost":
			return withMines({ ...board, status: "lost" }, event.mines, { state: "mine" })
		default:
			return board
	}
}

function withMines(board, mines, cell) {
	return mines.reduce((next, mine) => withCell(next, mine, cell), board)
}

// Copies only the changed row, so React can skip re-rendering untouched rows.
function withCell(board, { row, column }, cell) {
	const cells = [...board.cells]
	cells[row - 1] = [...cells[row - 1]]
	cells[row - 1][column - 1] = cell
	return { ...board, cells }
}
