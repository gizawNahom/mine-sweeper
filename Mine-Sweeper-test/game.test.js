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

	MINE FIELD 2
	11 ** 13 14 ** 16 17 18 19 110
	** ** ** 24 25 26 ** ** ** 210
	31 32 ** 34 35 36 37 38 39 310
	41 42 43 44 45 46 47 48 49 410
	51 52 53 54 ** 56 57 58 59 510
	61 62 63 64 65 66 67 68 69 610
	71 72 73 74 75 76 77 78 79 710
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

	test("Then the number of flags must be 10", () => {
		assertFlagCount(10)
	})

	test("Then the board must be 8x10", () => {
		expect(g.rows).toBe(8)
		expect(g.columns).toBe(10)
	})

	describe("When the user flags an unflagged cell", () => {
		beforeEach(() => {
			g.flag(1, 1)
		})

		test("Then the cell is flagged", () => {
			assertTotalMessageCount(1)
			expect(receiver.flagMessages.length).toBe(1)
			expect(receiver.flagMessages[0]).toBe("flagged 1,1")
		})

		test("Then the number of flags must be 9", () => {
			assertFlagCount(9)
		})
	})

	describe("When the user flags a flagged cell", () => {
		test("Then nothing happens", () => {
			g.flag(1, 1)
			receiver.clearMessages()

			g.flag(1, 1)

			assertTotalMessageCount(0)
			assertFlagCount(9)
		})
	})

	describe("When the user unflags a flagged cell", () => {
		beforeEach(() => {
			g.flag(1, 1)
			receiver.clearMessages()

			g.unflag(1, 1)
		})

		test("Then the cell is unflagged", () => {
			assertTotalMessageCount(1)
			expect(receiver.unflagMessages.length).toBe(1)
			expect(receiver.unflagMessages[0]).toBe("unflagged 1,1")
		})

		test("Then the number of flags equals 10", () => {
			assertFlagCount(10)
		})
	})

	describe("When the user unflags an unflagged cell", () => {
		test("Then nothing happens", () => {
			g.unflag(1, 1)

			assertTotalMessageCount(0)
			assertFlagCount(10)
		})
	})

	describe("And there are no remaining flags", () => {
		describe("When the user tries to flag a cell", () => {
			test("Then nothing happens", () => {
				flagTenCells(g)

				g.flag(2, 1)

				assertTotalMessageCount(0)
				assertFlagCount(0)
			})
		})
	})

	function flagTenCells(g) {
		for (let i = 1; i <= 10; i++) {
			g.flag(1, i)
		}
		receiver.clearMessages()
	}

	describe("And the user has flagged a cell", () => {
		describe("When the user unflags an unflagged cell", () => {
			test("Then nothing happens", () => {
				g.flag(1, 1)
				receiver.clearMessages()

				g.unflag(1, 2)

				assertTotalMessageCount(0)
				assertFlagCount(9)
			})
		})

		describe("When the user reveals the cell", () => {
			test("Then nothing happens", () => {
				g.flag(1, 1)
				receiver.clearMessages()

				g.reveal(1, 1)

				assertTotalMessageCount(0)
				assertFlagCount(9)
			})
		})
	})

	describe("And the user has revealed a cell", () => {
		beforeEach(() => {
			g.reveal(1, 1)
			receiver.clearMessages()
		})

		describe("When the user flags the cell", () => {
			test("Then nothing happens", () => {
				g.flag(1, 1)

				assertTotalMessageCount(0)
				assertFlagCount(10)
			})
		})

		describe("When the user unflags the cell", () => {
			test("Then nothing happens", () => {
				g.unflag(1, 1)

				assertTotalMessageCount(0)
				assertFlagCount(10)
			})
		})

		describe("When the user reveals the cell", () => {
			test("Then nothing happens", () => {
				g.reveal(1, 1)

				assertTotalMessageCount(0)
			})
		})
	})

	describe("And the user has revealed the cell on the top-left", () => {
		test("Then the cell must show the number of mines on the adjacent 3 cells", () => {
			g.reveal(1, 1)

			assertTotalMessageCount(1)
			assertOneReveal("1,1", 3)
		})
	})

	describe("And the user has revealed the cell on the top-right", () => {
		test("Then the cell must show the number of mines on the adjacent 3 cells", () => {
			g.reveal(1, 10)

			assertTotalMessageCount(1)
			assertOneReveal("1,10", 1)
		})
	})

	describe("And the user has revealed a cell on the bottom-left", () => {
		test("Then the cell must show the number of mines on the adjacent 3 cells", () => {
			g.reveal(8, 1)

			assertTotalMessageCount(1)
			assertOneReveal("8,1", 2)
		})
	})

	describe("And the user has revealed a cell on the bottom-right", () => {
		test("Then the cell must show the number of mines on the adjacent 3 cells", () => {
			g.reveal(8, 10)

			assertTotalMessageCount(1)
			assertOneReveal("8,10", 1)
		})
	})

	describe("And the user has revealed a cell on the center", () => {
		test("Then the cell must show the number of mines on the adjacent 8 cells", () => {
			g.reveal(2, 6)

			assertTotalMessageCount(1)
			assertOneReveal("2,6", 1)
		})
	})

	function assertOneReveal(cell, mines) {
		assertRevealMessageCount(1)
		expect(receiver.revealMessages[0]).toBe(`revealed ${cell} ${mines}`)
	}

	describe("And the user has revealed a cell with zero adjacent mines", () => {
		beforeEach(() => {
			const generator = new MineGeneratorStub2()
			let g = new Game(receiver, generator)
			g.flag(2, 6)
			g.reveal(2, 4)
			receiver.clearMessages()

			g.reveal(3, 5)
		})

		test("Then all unrevealed adjacent cells must be revealed", () => {
			assertTotalMessageCount(9)
			assertRevealMessageCount(8)
		})

		describe("Given one of the adjacent cells is flagged", () => {
			test("Then the cell must be unflagged before it's revealed", () => {
				assertUnflag(2, 6)
			})
		})

		describe("And given it has one or more adjacent cells with 0 adjacent mines", () => {
			test("Then the unrevealed adjacent cells of those cells must be revealed", () => {
				g.reveal(3, 7)
				g.flag(3, 8)
				receiver.clearMessages()

				g.reveal(3, 5)

				assertTotalMessageCount(58)
				assertRevealMessageCount(57)
				assertUnflag(3, 8)
			})
		})
	})

	function assertUnflag(row, column) {
		expect(receiver.unflagMessages.length).toBe(1)
		expect(receiver.unflagMessages[0]).toBe(`unflagged ${row},${column}`)
	}

	describe("And the user has flagged and then unflagged a cell", () => {
		describe("When the user flags the cell again", () => {
			test("Then the cell is flagged", () => {
				g.flag(1, 1)
				g.unflag(1, 1)
				receiver.clearMessages()

				g.flag(1, 1)

				assertTotalMessageCount(1)
				assertFlagCount(9)
				expect(receiver.flagMessages.length).toBe(1)
			})
		})
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
			assertEndGame()
		})
	})

	describe("And the user has flagged an armed cell", () => {
		beforeEach(() => {
			g.flag(7, 9)
			receiver.clearMessages()
		})

		describe("When the user reveals a cell adjacent only to it", () => {
			test("Then the cell must count it as an adjacent mine", () => {
				g.reveal(8, 10)

				assertTotalMessageCount(1)
				expect(receiver.revealMessages[0]).toBe("revealed 8,10 1")
			})
		})

		describe("When the user reveals it", () => {
			test("Then nothing happens", () => {
				g.reveal(7, 9)

				assertTotalMessageCount(0)
			})
		})

		describe("When the user unflags and then reveals it", () => {
			test("Then the game must end unsuccessfully", () => {
				g.unflag(7, 9)
				receiver.clearMessages()

				g.reveal(7, 9)

				assertTotalMessageCount(1)
				assertEndGame()
			})
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
				assertEndGame()
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
				assertEndGame()
			})
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

	function assertEndGame() {
		expect(receiver.endGameMessages.length).toBe(1)
		const mines = receiver.endGameMessages[0]
		expect(mines).toHaveLength(MineGeneratorStub1.mines.length)
		expect(mines).toEqual(expect.arrayContaining(MineGeneratorStub1.mines))
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

	test("Then the board must be 3x3 with 1 flag", () => {
		expect(g.rows).toBe(3)
		expect(g.columns).toBe(3)
		expect(g.numberOfFlags).toBe(1)
	})

	test("Then the mines must be generated for that board", () => {
		expect(mineGenerator.options).toEqual({ rows: 3, columns: 3, mines: 1 })
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
			expect(receiver.endGameMessages).toEqual([[{ row: 2, column: 2 }]])
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
			expect(receiver.endGameMessages).toEqual([[{ row: 3, column: 3 }]])
		})
	})
})

describe("Given a game with more than 9 rows and columns", () => {
	describe("When the user flags 1,11 and reveals 11,1", () => {
		test("Then 11,1 must be revealed, since they are different cells", () => {
			const receiver = new ReceiverSpy()
			const mineGenerator = new MineGeneratorSpy([{ row: 12, column: 12 }])
			const g = new Game(receiver, mineGenerator, { rows: 12, columns: 12, mines: 1 })
			g.flag(1, 11)
			receiver.clearMessages()

			g.reveal(11, 1)

			expect(receiver.revealMessages[0]).toBe("revealed 11,1 0")
		})
	})
})

describe("Given the game is created with invalid options", () => {
	test.each([
		[{ row: 16 }, 'unknown option "row"', TypeError],
		[{ rows: "8" }, 'rows must be a number, got "8"', TypeError],
		[{ columns: "10" }, 'columns must be a number, got "10"', TypeError],
		[{ mines: "10" }, 'mines must be a number, got "10"', TypeError],
		[{ rows: 0 }, "rows must be a whole number of at least 1, got 0", RangeError],
		[{ columns: -3 }, "columns must be a whole number of at least 1, got -3", RangeError],
		[{ rows: 2.5 }, "rows must be a whole number of at least 1, got 2.5", RangeError],
		[{ columns: NaN }, "columns must be a whole number of at least 1, got NaN", RangeError],
		[{ rows: 1, columns: 1, mines: 1 }, "a 1x1 board is too small: it needs room for at least 1 mine and 1 safe cell", RangeError],
		[{ rows: 3, columns: 3, mines: 0 }, "mines must be a whole number from 1 to 8 for a 3x3 board, got 0", RangeError],
		[{ rows: 3, columns: 3, mines: 9 }, "mines must be a whole number from 1 to 8 for a 3x3 board, got 9", RangeError],
		[{ rows: 3, columns: 3, mines: 20 }, "mines must be a whole number from 1 to 8 for a 3x3 board, got 20", RangeError],
		[{ mines: 2.5 }, "mines must be a whole number from 1 to 79 for a 8x10 board, got 2.5", RangeError],
	])("Then %o must be rejected with: %s", (options, message, ErrorType) => {
		const create = () => new Game(new ReceiverSpy(), new MineGeneratorSpy([]), options)

		expect(create).toThrow(ErrorType)
		expect(create).toThrow(message)
	})
})

describe("Given the game is created with unusual but valid options", () => {
	test.each([
		[{}],
		[{ rows: 20 }],
		[{ rows: 1, columns: 2, mines: 1 }],
		[{ rows: 3, columns: 3, mines: 8 }],
	])("Then %o must not throw", (options) => {
		expect(
			() => new Game(new ReceiverSpy(), new MineGeneratorSpy([]), options)
		).not.toThrow()
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

	endGame(mines) {
		this.endGameMessages.push(mines)
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

class MineGeneratorStub2 {
	generate() {
		return [
			{ row: 1, column: 2 }, { row: 2, column: 1 }, { row: 2, column: 2 }, { row: 2, column: 3 }, { row: 5, column: 5 },
			{ row: 1, column: 5 }, { row: 3, column: 3 }, { row: 2, column: 7 }, { row: 2, column: 8 }, { row: 2, column: 9 },
		]
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
