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

	describe("And given the user reveals an armed cell", () => {
		test("Then the game must end unsuccessfully", () => {
			g.reveal(1, 2)

			assertTotalMessageCount(1)
			assertGameLost()
		})
	})

	function assertRevealMessageCount(count) {
		expect(receiver.revealMessages.length).toBe(count)
	}

	describe("And given the number of hidden cells is one greater than the number of flags", () => {
		describe("When the user reveals an unarmed cell", () => {
			test("Then the game ends successfully", () => {
				revealAllUnarmedExceptOne()

				g.reveal(8, 10)

				assertTotalMessageCount(2)
				assertRevealMessageCount(1)
				assertGameWon()
			})
		})
	})

	describe("And the user has flagged some armed cells", () => {
		describe("When the user reveals the last unarmed cell", () => {
			test("Then the game ends successfully", () => {
				g.flag(1, 2)
				g.flag(2, 1)
				g.flag(2, 2)
				revealAllUnarmedExceptOne()

				g.reveal(8, 10)

				assertTotalMessageCount(2)
				assertRevealMessageCount(1)
				assertGameWon()
			})
		})
	})

	describe("And the game has been lost", () => {
		beforeEach(() => {
			g.flag(5, 5)
			g.reveal(1, 2)
			receiver.clearMessages()
		})

		test.each([
			["reveal", 4, 4],
			["reveal", 2, 1],
			["flag", 6, 6],
			["unflag", 5, 5],
		])("When the user calls %s(%i, %i) Then nothing happens", (move, row, column) => {
			g[move](row, column)

			assertTotalMessageCount(0)
			assertFlagCount(9)
		})

		test("When the user plays off the board Then it is still rejected", () => {
			expect(() => g.reveal(0, 5)).toThrow(RangeError)
		})
	})

	describe("And the game has been won", () => {
		beforeEach(() => {
			g.flag(1, 2)
			revealAllUnarmedExceptOne()
			g.reveal(8, 10)
			receiver.clearMessages()
		})

		test.each([
			["reveal", 2, 1],
			["flag", 2, 1],
			["unflag", 1, 2],
		])("When the user calls %s(%i, %i) Then nothing happens", (move, row, column) => {
			g[move](row, column)

			assertTotalMessageCount(0)
			assertFlagCount(9)
		})
	})

	function revealAllUnarmedExceptOne() {
		let toBeRevealed = buildCells()
			.filter((cell) => !isMine(cell))
			.slice(0, 69)

		toBeRevealed.forEach(({ row, column }) => g.reveal(row, column))

		receiver.clearMessages()
	}

	function isMine({ row, column }) {
		return MineGeneratorStub1.mines.some(
			(mine) => mine.row === row && mine.column === column
		)
	}

	function buildCells() {
		const cells = []
		for (let row = 1; row < 9; row++) {
			for (let column = 1; column < 11; column++) cells.push({ row, column })
		}
		return cells
	}

	function assertGameWon() {
		assertGameEnded({ won: true })
	}

	function assertGameLost() {
		assertGameEnded({ won: false })
	}

	function assertGameEnded({ won }) {
		expect(receiver.endGameMessages.length).toBe(1)
		const result = receiver.endGameMessages[0]
		expect(result.won).toBe(won)
		expect(result.mines).toHaveLength(MineGeneratorStub1.mines.length)
		expect(result.mines).toEqual(expect.arrayContaining(MineGeneratorStub1.mines))
	}

	function assertTotalMessageCount(count) {
		const totalMessageCount =
			receiver.flagMessages.length +
			receiver.unflagMessages.length +
			receiver.revealMessages.length +
			receiver.endGameMessages.length
		expect(totalMessageCount).toBe(count)
	}
})

describe("Given a 3x3 game with one mine in the centre", () => {
	let g
	let receiver
	let mineGenerator
	beforeEach(() => {
		receiver = new ReceiverSpy()
		mineGenerator = new MineGeneratorSpy([{ row: 2, column: 2 }])
		g = new Game(receiver, mineGenerator, { rows: 3, columns: 3, mines: 1 })
	})

	describe("When the user reveals every unarmed cell", () => {
		test("Then each must show 1 adjacent mine and the game ends successfully", () => {
			for (let row = 1; row <= 3; row++) {
				for (let column = 1; column <= 3; column++) {
					if (row !== 2 || column !== 2) g.reveal(row, column)
				}
			}

			expect(receiver.revealMessages).toHaveLength(8)
			receiver.revealMessages.forEach((message) =>
				expect(message).toMatch(/ 1$/)
			)
			expect(receiver.endGameMessages).toEqual([
				{ won: true, mines: [{ row: 2, column: 2 }] },
			])
		})
	})
})

describe("Given a 3x3 game with one mine in a corner", () => {
	describe("When the user reveals the opposite corner", () => {
		test("Then the revealed area wins the game and it ends only once", () => {
			const receiver = new ReceiverSpy()
			const mineGenerator = new MineGeneratorSpy([{ row: 3, column: 3 }])
			const g = new Game(receiver, mineGenerator, { rows: 3, columns: 3, mines: 1 })

			g.reveal(1, 1)

			expect(receiver.revealMessages).toHaveLength(8)
			expect(receiver.endGameMessages).toEqual([
				{ won: true, mines: [{ row: 3, column: 3 }] },
			])
		})
	})
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
