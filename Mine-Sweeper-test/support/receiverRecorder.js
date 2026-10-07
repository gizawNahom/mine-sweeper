// A receiver that records every call the game makes, in order, as
// [method, argument] pairs, e.g. ["reveal", { row: 1, column: 2, adjacentMines: 3 }].
export default class ReceiverRecorder {
	calls = []

	flag(row, column) {
		this.calls.push(["flag", { row, column }])
	}

	unflag(row, column) {
		this.calls.push(["unflag", { row, column }])
	}

	reveal(cell) {
		this.calls.push(["reveal", cell])
	}

	endGame(result) {
		this.calls.push(["endGame", result])
	}

	clear() {
		this.calls = []
	}

	callsTo(method) {
		return this.calls.filter(([name]) => name === method).map(([, argument]) => argument)
	}
}
