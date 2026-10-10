import { createHash } from "node:crypto"
import { Factory } from "mine-sweeper"

// A safety net for refactors: replays 500 seeded random games and compares a
// fingerprint of every receiver call, in order, with the one recorded below.
// It catches any change a receiver could observe, including ones the other
// tests don't check, such as the order in which auto-reveal opens cells.
//
// If this fails after an intended behavior change, update RECORDED_FINGERPRINT
// to the value in the failure message, in the same commit as the change.
const RECORDED_FINGERPRINT = "96caa0c64b965e0b2bd7fc2d1253b93f23fda7a153e6fe2a0ef805f3daa3f912"

const GAMES = 500
const MOVES_PER_GAME = 40

describe("Given 500 seeded random games", () => {
	test("Then the receiver sees exactly the recorded calls", () => {
		const output = replayGames()

		expect(output.games).toBe(GAMES)
		expect(fingerprint(output.text)).toBe(RECORDED_FINGERPRINT)
	})
})

function replayGames() {
	const lines = []
	for (let seed = 1; seed <= GAMES; seed++) lines.push(replayGame(seed))
	return { games: lines.length, text: lines.join("\n") }
}

function replayGame(seed) {
	const random = seededRandom(seed)
	const upTo = (n) => Math.floor(random() * n) + 1
	const rows = upTo(30)
	const columns = Math.max(upTo(30), rows === 1 ? 2 : 1) // a board needs at least 2 cells
	const mines = randomMines(rows, columns, upTo)
	const calls = []
	const game = Factory.createGame({ rows, columns, mines, receiver: recorder(calls) })
	for (let move = 0; move < MOVES_PER_GAME; move++) {
		const [row, column] = [upTo(rows), upTo(columns)]
		const kind = random()
		if (kind < 0.25) game.flag(row, column)
		else if (kind < 0.3) game.unflag(row, column)
		else game.reveal(row, column)
	}
	return `${seed} ${rows}x${columns}/${mines.length}: ${calls.join(" ")}`
}

function randomMines(rows, columns, upTo) {
	const cells = rows * columns
	const count = upTo(Math.max(1, Math.min(cells - 1, Math.floor(cells / 6))))
	const mines = []
	while (mines.length < count) {
		const mine = { row: upTo(rows), column: upTo(columns) }
		if (!mines.some((m) => m.row === mine.row && m.column === mine.column)) mines.push(mine)
	}
	return mines
}

function recorder(calls) {
	return {
		flag: (row, column) => calls.push(`F${row},${column}`),
		unflag: (row, column) => calls.push(`U${row},${column}`),
		reveal: ({ row, column, adjacentMines }) => calls.push(`R${row},${column}:${adjacentMines}`),
		endGame: ({ won, mines }) => calls.push(`E${won ? "won" : "lost"}:${mines.length}`),
	}
}

// mulberry32: a small, fast, deterministic random number generator
function seededRandom(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

function fingerprint(text) {
	return createHash("sha256").update(text).digest("hex")
}
