// Game's output port, turned into domain events. Game calls these methods in the
// middle of a move; they only record events, which are delivered after the move.
export default class EventRecordingOutputPort {
	#events

	constructor(events) {
		this.#events = events
	}

	flag(row, column) {
		this.#events.record({ type: "CellFlagged", row, column })
	}

	unflag(row, column) {
		this.#events.record({ type: "CellUnflagged", row, column })
	}

	reveal({ row, column, adjacentMines }) {
		this.#events.record({ type: "CellRevealed", row, column, adjacentMines })
	}

	endGame({ won, mines }) {
		this.#events.record({ type: won ? "GameWon" : "GameLost", mines })
	}
}
