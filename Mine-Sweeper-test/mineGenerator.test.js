import MineGenerator from "mine-sweeper/src/mineGenerator"

let mineGenerator

beforeEach(() => {
	mineGenerator = new MineGenerator()
})

it("Should generate 10 valid mines", () => {
	const mines = mineGenerator.generate()

	expect(mines.length).toBe(10)
	const valid = validMines(mines)
	expect(valid.length).toBe(10)
})

it("Should describe each mine by its row and column", () => {
	mineGenerator.generate().forEach((mine) => {
		expect(mine).toEqual({ row: expect.any(Number), column: expect.any(Number) })
	})
})

function validMines(mines) {
	return mines.filter((mine, i, self) => {
		if (validRow(mine) && validColumn(mine) && unique()) return true

		function unique() {
			return self.findIndex((m) => m.row === mine.row && m.column === mine.column) === i
		}
	})
}

function validRow(mine) {
	const row = rowOf(mine)
	return row >= 1 && row <= 8
}

function validColumn(mine) {
	const column = columnOf(mine)
	return column >= 1 && column <= 10
}

function rowOf(mine) {
	return mine.row
}

function columnOf(mine) {
	return mine.column
}

it("Should be able to place mines in every row and column", () => {
	const rows = new Set()
	const columns = new Set()
	for (let i = 0; i < 1000; i++) {
		mineGenerator.generate().forEach((mine) => {
			rows.add(rowOf(mine))
			columns.add(columnOf(mine))
		})
	}

	expect([...rows].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
	expect([...columns].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

it("Should generate random mines", () => {
	assertNoThreeMinesAreEqual(mineGenerator)
})

function assertNoThreeMinesAreEqual(mg) {
	for (let i = 0; i < 1000; i++) {
		const mines1 = mg.generate()
		const mines2 = mg.generate()
		const mines3 = mg.generate()
		expect(mines1).not.toEqual(mines2)
		expect(mines1).not.toEqual(mines3)
		expect(mines2).not.toEqual(mines3)
	}
}
