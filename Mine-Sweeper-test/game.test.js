import Game from "mine-sweeper/src/game"

/*
	MINE FIELD 1
	11 ** 13 14 15 16 17 18 19 110
	** ** ** 24 25 26 ** ** ** 210
	31 32 33 34 35 36 37 38 39 310
	41 42 43 44 45 46 47 48 49 410
	51 52 53 54 55 56 57 58 59 510
	61 62 63 64 65 66 67 68 69 610
	** ** 73 74 75 76 77 78 ** 710
	81 82 83 84 85 86 87 88 89 810
*/

describe("Given the game has started", () => {
	let g
	let receiver
	beforeEach(() => {
		receiver = new ReceiverSpy()
		let mineGenerator = new MineGeneratorStub1()
		g = new Game(receiver, mineGenerator)
	})

	function assertFlagCount(count) {
		expect(g.numberOfFlags).toBe(count)
	}

	describe.each(["reveal", "flag", "unflag"])(
		"When the user calls %s with an invalid position",
		(move) => {
			test.each([
				[[0, 5], "row must be a whole number from 1 to 8, got 0", RangeError],
				[[9, 5], "row must be a whole number from 1 to 8, got 9", RangeError],
				[[99, 5], "row must be a whole number from 1 to 8, got 99", RangeError],
				[[1.5, 5], "row must be a whole number from 1 to 8, got 1.5", RangeError],
				[[1, 0], "column must be a whole number from 1 to 10, got 0", RangeError],
				[[1, 11], "column must be a whole number from 1 to 10, got 11", RangeError],
				[["13"], 'row must be a number, got "13"', TypeError],
				[[1], "column must be a number, got undefined", TypeError],
			])("Then %j must be rejected with: %s", (position, message, ErrorType) => {
				const play = () => g[move](...position)

				expect(play).toThrow(ErrorType)
				expect(play).toThrow(message)
				assertTotalMessageCount(0)
				assertFlagCount(10)
			})
		}
	)

	function assertTotalMessageCount(count) {
		const totalMessageCount =
			receiver.flagMessages.length +
			receiver.unflagMessages.length +
			receiver.revealMessages.length +
			receiver.endGameMessages.length
		expect(totalMessageCount).toBe(count)
	}
})

describe("Given a large board with a single mine", () => {
	describe("When the user reveals the opposite corner", () => {
		test("Then every unarmed cell is revealed and the game ends successfully", () => {
			const receiver = new ReceiverSpy()
			const mineGenerator = new MineGeneratorSpy([{ row: 100, column: 100 }])
			const g = new Game(receiver, mineGenerator, { rows: 100, columns: 100, mines: 1 })

			g.reveal(1, 1)

			expect(receiver.revealMessages).toHaveLength(9999)
			expect(receiver.endGameMessages).toEqual([
				{ won: true, mines: [{ row: 100, column: 100 }] },
			])
		})
	})
})

class ReceiverSpy {
	flagMessages = []
	unflagMessages = []
	revealMessages = []
	endGameMessages = []

	flag(row, column) {
		this.flagMessages.push(`flagged ${row},${column}`)
	}

	unflag(row, column) {
		this.unflagMessages.push(`unflagged ${row},${column}`)
	}

	reveal({ row, column, adjacentMines }) {
		this.revealMessages.push(`revealed ${row},${column} ${adjacentMines}`)
	}

	endGame(result) {
		this.endGameMessages.push(result)
	}

	clearMessages() {
		this.flagMessages = []
		this.revealMessages = []
		this.unflagMessages = []
		this.endGameMessages = []
	}
}

class MineGeneratorStub1 {
	static mines = [
		{ row: 1, column: 2 }, { row: 2, column: 1 }, { row: 2, column: 2 }, { row: 2, column: 3 }, { row: 7, column: 9 },
		{ row: 7, column: 1 }, { row: 7, column: 2 }, { row: 2, column: 7 }, { row: 2, column: 8 }, { row: 2, column: 9 },
	]
	generate() {
		return MineGeneratorStub1.mines
	}
}

class MineGeneratorSpy {
	constructor(mines) {
		this.mines = mines
	}

	generate(options) {
		this.options = options
		return this.mines
	}
}
