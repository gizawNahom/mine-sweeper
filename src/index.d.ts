/** A cell on the board. Rows and columns start at 1. */
export interface Position {
	readonly row: number
	readonly column: number
}

/** A cell was flagged. */
export interface CellFlagged {
	readonly type: "CellFlagged"
	readonly row: number
	readonly column: number
}

/** A flag was removed, by `game.unflag` or because the cell was revealed automatically. */
export interface CellUnflagged {
	readonly type: "CellUnflagged"
	readonly row: number
	readonly column: number
}

/** A cell was revealed. One move can reveal many cells. */
export interface CellRevealed {
	readonly type: "CellRevealed"
	readonly row: number
	readonly column: number
	/** How many of the cell's adjacent cells hold a mine. */
	readonly adjacentMines: number
}

/** Every safe cell has been revealed. */
export interface GameWon {
	readonly type: "GameWon"
	readonly mines: readonly Position[]
}

/** A mine was revealed. */
export interface GameLost {
	readonly type: "GameLost"
	readonly mines: readonly Position[]
}

/** Everything a game announces. Check `type` to tell them apart. */
export type GameEvent = CellFlagged | CellUnflagged | CellRevealed | GameWon | GameLost

/** One object told about every change. When given, all four methods are required. */
export interface Receiver {
	flag(row: number, column: number): void
	unflag(row: number, column: number): void
	reveal(cell: { row: number; column: number; adjacentMines: number }): void
	endGame(result: { won: boolean; mines: readonly Position[] }): void
}

export interface GameOptions {
	/** Number of rows, a whole number of at least 1. Default: 8. */
	rows?: number
	/** Number of columns, a whole number of at least 1. Default: 10. */
	columns?: number
	/**
	 * How many mines to place at random (from 1 to rows × columns − 1), or
	 * exactly where to place them. Default: 10.
	 */
	mines?: number | readonly Position[]
	/** Told about every change; leave it out to follow the game with `subscribe` only. */
	receiver?: Receiver
}

export interface Game {
	readonly rows: number
	readonly columns: number
	/** Flags left to place; starts at the number of mines. */
	readonly numberOfFlags: number
	/** Reveals a cell. Throws for a position that is not on the board. */
	reveal(row: number, column: number): void
	/** Flags a hidden cell. Throws for a position that is not on the board. */
	flag(row: number, column: number): void
	/** Removes a flag. Throws for a position that is not on the board. */
	unflag(row: number, column: number): void
	/**
	 * Calls `listener` with every event, after each move is complete.
	 * Returns a function that unsubscribes.
	 */
	subscribe(listener: (event: GameEvent) => void): () => void
}

/** Creates a game. Invalid options throw a `TypeError` or `RangeError`. */
export declare function createGame(options?: GameOptions): Game
