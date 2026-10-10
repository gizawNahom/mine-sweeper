import { board } from "./support/boards"
import { startGame } from "./support/games"

const FIELD = board`
	. . . *
	. . . .
	. . . .
`

function newGame() {
	return startGame(FIELD)
}

function subscribedGame() {
	const game = newGame()
	const events = []
	game.subscribe((event) => events.push(event))
	return { game, events }
}

describe("Given a listener subscribed to a game", () => {
	test("When the user flags a cell Then it gets CellFlagged", () => {
		const { game, events } = subscribedGame()

		game.flag(1, 1)

		expect(events).toEqual([{ type: "CellFlagged", row: 1, column: 1 }])
	})

	test("When the user unflags a cell Then it gets CellUnflagged", () => {
		const { game, events } = subscribedGame()
		game.flag(1, 1)
		events.length = 0

		game.unflag(1, 1)

		expect(events).toEqual([{ type: "CellUnflagged", row: 1, column: 1 }])
	})

	test("When the user reveals a cell Then it gets CellRevealed", () => {
		const { game, events } = subscribedGame()

		game.reveal(1, 3)

		expect(events).toEqual([{ type: "CellRevealed", row: 1, column: 3, adjacentMines: 1 }])
	})

	test("When the user reveals a mine Then it gets GameLost with the mines", () => {
		const { game, events } = subscribedGame()

		game.reveal(1, 4)

		expect(events).toEqual([{ type: "GameLost", mines: [{ row: 1, column: 4 }] }])
	})

	test("When auto-reveal wins the game Then it gets every reveal, a removed flag, and GameWon, in order", () => {
		const { game, events } = subscribedGame()
		game.flag(3, 1)
		events.length = 0

		game.reveal(3, 2)

		expect(events.map((event) => event.type)).toEqual([
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"CellUnflagged",
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"CellRevealed",
			"GameWon",
		])
		expect(events.at(-1)).toEqual({ type: "GameWon", mines: [{ row: 1, column: 4 }] })
	})

	test("When a move changes nothing Then it gets nothing", () => {
		const { game, events } = subscribedGame()

		game.unflag(1, 1)

		expect(events).toEqual([])
	})
})

describe("Given a game with a receiver and a listener", () => {
	test("Then both are told the same things, receiver first", () => {
		const order = []
		const receiver = {
			flag: () => order.push("receiver"),
			unflag() {},
			reveal() {},
			endGame() {},
		}
		const game = startGame(FIELD, receiver)
		game.subscribe(() => order.push("listener"))

		game.flag(1, 1)

		expect(order).toEqual(["receiver", "listener"])
	})
})

describe("Given several listeners", () => {
	test("Then each gets every event, in the order they subscribed", () => {
		const game = newGame()
		const calls = []
		game.subscribe((event) => calls.push(["first", event.type]))
		game.subscribe((event) => calls.push(["second", event.type]))

		game.flag(1, 1)

		expect(calls).toEqual([
			["first", "CellFlagged"],
			["second", "CellFlagged"],
		])
	})

	test("Then the same function subscribed twice is called twice", () => {
		const game = newGame()
		const listener = jest.fn()
		game.subscribe(listener)
		game.subscribe(listener)

		game.flag(1, 1)

		expect(listener).toHaveBeenCalledTimes(2)
	})
})

describe("Given a listener that unsubscribes", () => {
	test("Then it gets no further events", () => {
		const { game, events } = subscribedGame()
		const listener = jest.fn()
		const unsubscribe = game.subscribe(listener)

		unsubscribe()
		game.flag(1, 1)

		expect(listener).not.toHaveBeenCalled()
		expect(events).toHaveLength(1)
	})

	test("Then unsubscribing twice is harmless and removes only its own subscription", () => {
		const game = newGame()
		const listener = jest.fn()
		const first = game.subscribe(listener)
		game.subscribe(listener)

		first()
		first()
		game.flag(1, 1)

		expect(listener).toHaveBeenCalledTimes(1)
	})
})

describe("Given a listener that reads the game", () => {
	test("Then it sees the game after the whole move, even during auto-reveal", () => {
		const game = newGame()
		const flagsSeen = []
		game.flag(3, 1)
		game.subscribe((event) => flagsSeen.push([event.type, game.numberOfFlags]))

		game.reveal(3, 2)

		expect(flagsSeen[0]).toEqual(["CellRevealed", 1])
	})
})

describe("Given a listener that makes a move while handling an event", () => {
	test("Then that move's events come after the current move's events", () => {
		const game = newGame()
		let moved = false
		game.subscribe((event) => {
			if (event.type === "CellFlagged" && !moved) {
				moved = true
				game.unflag(event.row, event.column)
			}
		})
		const events = []
		game.subscribe((event) => events.push(event))

		game.flag(1, 1)

		expect(events).toEqual([
			{ type: "CellFlagged", row: 1, column: 1 },
			{ type: "CellUnflagged", row: 1, column: 1 },
		])
	})
})

describe("Given listeners that throw", () => {
	test("Then the other listeners still get every event and the error reaches the caller", () => {
		const game = newGame()
		const failure = new Error("listener failed")
		game.subscribe(() => {
			throw failure
		})
		const events = []
		game.subscribe((event) => events.push(event))

		expect(() => game.flag(1, 1)).toThrow(failure)
		expect(events).toEqual([{ type: "CellFlagged", row: 1, column: 1 }])
		expect(game.numberOfFlags).toBe(0)
	})

	test("Then several failures are reported together", () => {
		const game = newGame()
		game.subscribe(() => {
			throw new Error("first")
		})
		game.subscribe(() => {
			throw new Error("second")
		})

		let thrown
		try {
			game.flag(1, 1)
		} catch (error) {
			thrown = error
		}

		expect(thrown).toBeInstanceOf(AggregateError)
		expect(thrown.errors.map((error) => error.message)).toEqual(["first", "second"])
	})
})

describe("Given an event", () => {
	test("Then it cannot be changed by a listener", () => {
		const game = startGame(FIELD)
		let event
		game.subscribe((received) => (event = received))

		game.reveal(1, 4)

		expect(Object.isFrozen(event)).toBe(true)
		expect(Object.isFrozen(event.mines)).toBe(true)
		expect(Object.isFrozen(event.mines[0])).toBe(true)
	})
})

describe("Given something that is not a function", () => {
	test.each([[undefined], [null], ["listener"], [{}]])("Then subscribing %p is rejected", (listener) => {
		expect(() => newGame().subscribe(listener)).toThrow(TypeError)
		expect(() => newGame().subscribe(listener)).toThrow(/^listener must be a function, got /)
	})
})
