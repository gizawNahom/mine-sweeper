import { useEffect, useReducer, useState } from "react"
import { Factory } from "mine-sweeper"
import { boardReducer, initialBoard } from "./boardReducer"

// Creates a game, follows its domain events, and exposes the board to render
// plus the moves to make. Each mount is one game: remount (with a new `key`)
// to start another.
export function useMineSweeper(options) {
	const [game] = useState(() => Factory.createGame(options))
	const [board, dispatch] = useReducer(boardReducer, game, initialBoard)

	// subscribe returns its own unsubscribe, which is exactly React's cleanup.
	useEffect(() => game.subscribe(dispatch), [game])

	return {
		...board,
		rows: game.rows,
		columns: game.columns,
		flagsLeft: game.numberOfFlags,
		reveal: (row, column) => game.reveal(row, column),
		toggleFlag: (row, column) =>
			board.cells[row - 1][column - 1].state === "flagged"
				? game.unflag(row, column)
				: game.flag(row, column),
	}
}
