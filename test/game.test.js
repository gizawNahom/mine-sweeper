import Game from "../src/game"

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

	test("Then the number of mines must be 10", () => {
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

		test("Then the number of mines must be 9", () => {
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

		test("Then the number of mines equals 10", () => {
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

	describe("And given the user reveals an armed cell", () => {
		test("Then the game must end unsuccessfully", () => {
			g.reveal(1, 2)

			assertTotalMessageCount(1)
			assertEndGame()
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

	function revealAllUnarmedExceptOne() {
		let toBeRevealed = buildCells()
			.filter((e) => !MineGeneratorStub1.mines.includes(e))
			.slice(0, 69)

		toBeRevealed.forEach((e) => g.reveal(e))

		receiver.clearMessages()
	}

	function buildCells() {
		const cells = []
		for (let i = 1; i < 9; i++) {
			for (let j = 1; j < 11; j++) cells.push(`${i}${j}`)
		}
		return cells
	}

	function assertEndGame() {
		expect(receiver.endGameMessages.length).toBe(1)
		expect(receiver.endGameMessages[0].sort()).toEqual(
			MineGeneratorStub1.mines.sort()
		)
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
	static mines = ["12", "21", "22", "23", "79", "71", "72", "27", "28", "29"]
	generate() {
		return MineGeneratorStub1.mines
	}
}

class MineGeneratorStub2 {
	generate() {
		return ["12", "21", "22", "23", "55", "15", "33", "27", "28", "29"]
	}
}
