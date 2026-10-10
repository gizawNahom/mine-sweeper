import { playUntilGameEnds } from "./support/playing"

// Random mines are only visible through the public API when the game ends,
// so each test plays random games to the end and checks the mines reported.
const minesOf = (options) => playUntilGameEnds(options).mines

const DEFAULT_BOARD = { rows: 8, columns: 10, mines: 10 }

describe("Given random mines", () => {
	test.each([
		{ rows: 8, columns: 10, mines: 10 },
		{ rows: 3, columns: 4, mines: 5 },
		{ rows: 16, columns: 30, mines: 99 },
	])("Then there are $mines unique mines within $rows x $columns", (options) => {
		for (let i = 0; i < 100; i++) {
			const mines = minesOf(options)

			expect(mines).toHaveLength(options.mines)
			expect(minesOutside(mines, options)).toEqual([])
			expect(duplicates(mines)).toEqual([])
		}
	})

	test("Then each mine is described by its row and column", () => {
		minesOf(DEFAULT_BOARD).forEach((mine) => {
			expect(mine).toEqual({ row: expect.any(Number), column: expect.any(Number) })
		})
	})

	test("Then mines can be placed in every row and column", () => {
		const rows = new Set()
		const columns = new Set()
		for (let i = 0; i < 1000; i++) {
			minesOf(DEFAULT_BOARD).forEach(({ row, column }) => {
				rows.add(row)
				columns.add(column)
			})
		}

		expect([...rows].sort((a, b) => a - b)).toEqual(oneTo(DEFAULT_BOARD.rows))
		expect([...columns].sort((a, b) => a - b)).toEqual(oneTo(DEFAULT_BOARD.columns))
	})

	test("Then each game gets a different layout", () => {
		for (let i = 0; i < 1000; i++) {
			const mines1 = minesOf(DEFAULT_BOARD)
			const mines2 = minesOf(DEFAULT_BOARD)
			const mines3 = minesOf(DEFAULT_BOARD)
			expect(mines1).not.toEqual(mines2)
			expect(mines1).not.toEqual(mines3)
			expect(mines2).not.toEqual(mines3)
		}
	})
})

function minesOutside(mines, { rows, columns }) {
	return mines.filter(
		({ row, column }) => row < 1 || row > rows || column < 1 || column > columns
	)
}

function duplicates(mines) {
	return mines.filter(
		(mine, i) =>
			mines.findIndex((m) => m.row === mine.row && m.column === mine.column) !== i
	)
}

function oneTo(n) {
	return Array.from({ length: n }, (_, i) => i + 1)
}
