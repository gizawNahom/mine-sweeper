import { Factory } from "mine-sweeper"
import Game from "mine-sweeper/src/game"

test("factory", () => {
	const game = Factory.createGame({})
	expect(game instanceof Game).toBe(true)
})
