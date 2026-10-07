import { Factory } from "mine-sweeper"
import Game from "mine-sweeper/src/game"

test("factory", () => {
	const game = Factory.createGame({})
	expect(game instanceof Game).toBe(true)
})

test("factory creates an 8x10 game with 10 mines by default", () => {
	const game = Factory.createGame({})

	expect(game.rows).toBe(8)
	expect(game.columns).toBe(10)
	expect(game.numberOfFlags).toBe(10)
})

test("factory creates a game with the given rows, columns and mines", () => {
	let mines
	const game = Factory.createGame(
		{ reveal() {}, endGame: (result) => (mines = result.mines) },
		{ rows: 16, columns: 30, mines: 99 }
	)

	revealUntilGameEnds(game, () => mines)

	expect(game.rows).toBe(16)
	expect(game.columns).toBe(30)
	expect(game.numberOfFlags).toBe(99)
	expect(mines).toHaveLength(99)
	mines.forEach(({ row, column }) => {
		expect(row).toBeGreaterThanOrEqual(1)
		expect(row).toBeLessThanOrEqual(16)
		expect(column).toBeGreaterThanOrEqual(1)
		expect(column).toBeLessThanOrEqual(30)
	})
})

function revealUntilGameEnds(game, ended) {
	for (let row = 1; row <= game.rows; row++) {
		for (let column = 1; column <= game.columns; column++) {
			if (ended()) return
			game.reveal(row, column)
		}
	}
}
