import { useMineSweeper } from "./useMineSweeper"

const RESULTS = { won: "You won 🎉", lost: "Boom 💥 You hit a mine.", playing: "" }

export default function MineSweeper({ options, flagMode }) {
	const game = useMineSweeper(options)

	return (
		<>
			<p className="status">
				<span>
					Flags left: <strong id="flags-left">{game.flagsLeft}</strong>
				</span>
				<span id="result" aria-live="polite">
					{RESULTS[game.status]}
				</span>
			</p>

			<div className="board-scroller">
				<div
					id="board"
					aria-label="Minefield"
					className={game.status === "playing" ? "" : "over"}
					style={{ "--columns": game.columns }}
				>
					{game.cells.map((cells, rowIndex) =>
						cells.map((cell, columnIndex) => (
							<Cell
								key={`${rowIndex + 1},${columnIndex + 1}`}
								row={rowIndex + 1}
								column={columnIndex + 1}
								cell={cell}
								onReveal={flagMode ? game.toggleFlag : game.reveal}
								onToggleFlag={game.toggleFlag}
							/>
						))
					)}
				</div>
			</div>
		</>
	)
}

function Cell({ row, column, cell, onReveal, onToggleFlag }) {
	return (
		<button
			type="button"
			className="cell"
			data-row={row}
			data-column={column}
			data-state={cell.state}
			data-adjacent-mines={cell.adjacentMines}
			aria-label={`Row ${row}, column ${column}, ${describe(cell)}`}
			onClick={() => onReveal(row, column)}
			onContextMenu={(event) => {
				event.preventDefault()
				onToggleFlag(row, column)
			}}
			onKeyDown={(event) => {
				if (event.key.toLowerCase() === "f") onToggleFlag(row, column)
			}}
		>
			{textOf(cell)}
		</button>
	)
}

function textOf(cell) {
	if (cell.state === "flagged") return "🚩"
	if (cell.state === "mine") return "💣"
	if (cell.state === "revealed" && cell.adjacentMines > 0) return cell.adjacentMines
	return ""
}

function describe(cell) {
	if (cell.state === "revealed") return `${cell.adjacentMines} adjacent mines`
	return cell.state
}
