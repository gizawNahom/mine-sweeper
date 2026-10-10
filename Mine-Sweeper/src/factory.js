import { DEFAULT_ROWS, DEFAULT_COLUMNS, DEFAULT_MINES } from "./constants.js"
import Board from "./board.js"
import EventPublisher from "./eventPublisher.js"
import EventRecordingOutputPort from "./eventRecordingOutputPort.js"
import Game from "./game.js"
import Minefield from "./minefield.js"
import MineGenerator from "./mineGenerator.js"
import PublishingGame from "./publishingGame.js"

const OPTION_NAMES = ["rows", "columns", "mines", "receiver"]

export default class Factory {
	static createGame(options) {
		const { rows, columns, mines, receiver } = Factory.#readOptions(options)
		const board = new Board(rows, columns)
		const events = new EventPublisher()
		const game = new Game(
			new EventRecordingOutputPort(events),
			board,
			Factory.#layMines(mines, board)
		)
		const publishingGame = new PublishingGame(game, events)
		publishingGame.subscribe(Factory.#forwardEventsTo(receiver))
		return publishingGame
	}

	static #readOptions(options) {
		Object.keys(options).forEach((name) => {
			if (!OPTION_NAMES.includes(name))
				throw new TypeError(`unknown option ${JSON.stringify(name)}`)
		})
		const {
			rows = DEFAULT_ROWS,
			columns = DEFAULT_COLUMNS,
			mines = DEFAULT_MINES,
			receiver,
		} = options
		return { rows, columns, mines, receiver }
	}

	static #layMines(mines, board) {
		return Array.isArray(mines)
			? Minefield.at(board, mines)
			: Minefield.random(board, mines, new MineGenerator())
	}

	static #forwardEventsTo(receiver) {
		return (event) => {
			const { type, row, column } = event
			if (type === "CellFlagged") receiver.flag(row, column)
			else if (type === "CellUnflagged") receiver.unflag(row, column)
			else if (type === "CellRevealed")
				receiver.reveal({ row, column, adjacentMines: event.adjacentMines })
			else receiver.endGame({ won: type === "GameWon", mines: event.mines })
		}
	}
}
