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
