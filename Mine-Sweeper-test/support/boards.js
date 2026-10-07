// Draws a board as a picture: "*" is a mine, "." is a safe cell.
//
//   Factory.createGame(receiver, board`
//       . * .
//       . . .
//   `)
//
// returns { rows: 2, columns: 3, mines: [{ row: 1, column: 2 }] }.
export function board(strings, ...values) {
	const rows = linesOf(String.raw({ raw: strings }, ...values)).map((line) => line.split(/\s+/))
	assertRectangular(rows)
	return {
		rows: rows.length,
		columns: rows[0].length,
		mines: minesIn(rows),
	}
}

function linesOf(picture) {
	return picture
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line !== "")
}

function assertRectangular(rows) {
	if (rows.length === 0) throw new Error("board is empty")
	rows.forEach((cells, index) => {
		if (cells.length !== rows[0].length)
			throw new Error(
				`board row ${index + 1} has ${cells.length} cells, expected ${rows[0].length}`
			)
	})
}

function minesIn(rows) {
	return rows.flatMap((cells, rowIndex) =>
		cells.flatMap((cell, columnIndex) => {
			if (cell !== "*" && cell !== ".")
				throw new Error(`board cell "${cell}" is not "*" (mine) or "." (safe)`)
			return cell === "*" ? [{ row: rowIndex + 1, column: columnIndex + 1 }] : []
		})
	)
}
