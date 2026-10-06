import MineGenerator from "mine-sweeper/src/mineGenerator"

const options = { rows: 8, columns: 10, mines: 10 }

let mineGenerator

beforeEach(() => {
	mineGenerator = new MineGenerator()
})

test.each([
	{ rows: 8, columns: 10, mines: 10 },
	{ rows: 3, columns: 4, mines: 5 },
	{ rows: 16, columns: 30, mines: 99 },
])("Should generate $mines unique mines within $rows x $columns", (options) => {
	for (let i = 0; i < 100; i++) {
		const mines = mineGenerator.generate(options)

		expect(mines).toHaveLength(options.mines)
		expect(minesOutside(mines, options)).toEqual([])
		expect(duplicates(mines)).toEqual([])
	}
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

it("Should describe each mine by its row and column", () => {
	mineGenerator.generate(options).forEach((mine) => {
		expect(mine).toEqual({ row: expect.any(Number), column: expect.any(Number) })
	})
})

it("Should be able to place mines in every row and column", () => {
	const rows = new Set()
	const columns = new Set()
	for (let i = 0; i < 1000; i++) {
		mineGenerator.generate(options).forEach(({ row, column }) => {
			rows.add(row)
			columns.add(column)
		})
	}

	expect([...rows].sort((a, b) => a - b)).toEqual(oneTo(options.rows))
	expect([...columns].sort((a, b) => a - b)).toEqual(oneTo(options.columns))
})

function oneTo(n) {
	return Array.from({ length: n }, (_, i) => i + 1)
}

it("Should generate random mines", () => {
	assertNoThreeMinesAreEqual(mineGenerator)
})

function assertNoThreeMinesAreEqual(mg) {
	for (let i = 0; i < 1000; i++) {
		const mines1 = mg.generate(options)
		const mines2 = mg.generate(options)
		const mines3 = mg.generate(options)
		expect(mines1).not.toEqual(mines2)
		expect(mines1).not.toEqual(mines3)
		expect(mines2).not.toEqual(mines3)
	}
}
