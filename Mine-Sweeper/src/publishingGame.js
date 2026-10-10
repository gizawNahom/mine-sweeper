// The game users get: Game plus subscribe. Each move is made on the Game, then
// the events it produced are published. Every public member of Game must be
// forwarded here.
export default class PublishingGame {
	#game
	#events

	constructor(game, events) {
		this.#game = game
		this.#events = events
	}

	subscribe(listener) {
		return this.#events.subscribe(listener)
	}

	flag(row, column) {
		this.#game.flag(row, column)
		this.#events.publish()
	}

	unflag(row, column) {
		this.#game.unflag(row, column)
		this.#events.publish()
	}

	reveal(row, column) {
		this.#game.reveal(row, column)
		this.#events.publish()
	}

	get rows() {
		return this.#game.rows
	}

	get columns() {
		return this.#game.columns
	}

	get numberOfFlags() {
		return this.#game.numberOfFlags
	}
}
