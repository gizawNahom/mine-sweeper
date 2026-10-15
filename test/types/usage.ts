// Compiled with `npm run test:types`. It must compile, and each line below an
// "expect error" directive must be rejected, so the type definitions match how
// the engine is meant to be used.
// @ts-expect-error: internal modules are not part of the package
import Game from "mine-sweeper/src/game.js"
import { createGame, type GameEvent, type Position, type Receiver } from "mine-sweeper"

// Creating games
const game = createGame()
createGame({ rows: 16, columns: 30, mines: 99 })
createGame({ rows: 3, columns: 3, mines: [{ row: 1, column: 1 }] })

const receiver: Receiver = {
	flag(row, column) {},
	unflag(row, column) {},
	reveal({ row, column, adjacentMines }) {},
	endGame({ won, mines }) {},
}
createGame({ receiver })

// Playing and reading the game
game.reveal(1, 2)
game.flag(1, 2)
game.unflag(1, 2)
const size: number = game.rows * game.columns
const flagsLeft: number = game.numberOfFlags

// Following the game: the event type narrows to the right fields
const unsubscribe: () => void = game.subscribe((event: GameEvent) => {
	switch (event.type) {
		case "CellFlagged":
		case "CellUnflagged": {
			const position: Position = { row: event.row, column: event.column }
			break
		}
		case "CellRevealed": {
			const adjacentMines: number = event.adjacentMines
			break
		}
		case "GameWon":
		case "GameLost": {
			const mines: readonly Position[] = event.mines
			break
		}
		default: {
			const unhandled: never = event
		}
	}
})
unsubscribe()

// Mistakes the types must catch
// @ts-expect-error: unknown option (rows is spelled with an s)
createGame({ row: 16 })
// @ts-expect-error: rows must be a number
createGame({ rows: "8" })
// @ts-expect-error: a receiver needs all four methods
createGame({ receiver: { flag() {} } })
// @ts-expect-error: a move takes a row and a column
game.reveal("13")
// @ts-expect-error: numberOfFlags is read-only
game.numberOfFlags = 3
// @ts-expect-error: only CellRevealed has adjacentMines
game.subscribe((event) => event.adjacentMines)
// @ts-expect-error: events cannot be changed by listeners
game.subscribe((event) => { event.type = "GameWon" })
