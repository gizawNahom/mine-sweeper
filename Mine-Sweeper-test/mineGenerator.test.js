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

function validMines(mines) {
	return mines.filter((mine, i, self) => {
		if (validRow(mine) && validColumn(mine) && unique()) return true

		function unique() {
			return self.indexOf(mine) === i
		}
	})
}

function validRow(mine) {
	const row = +mine[0]
	return row >= 1 && row <= 8
}

function validColumn(mine) {
	let column
	if (mine.length == 3) column = +mine.substring(1)
	else column = +mine[1]
	return column >= 1 && column <= 10
}

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
