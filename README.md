# Mine-Sweeper

![Build](https://github.com/gizawNahom/mine-sweeper/actions/workflows/CI.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

A UI-agnostic Minesweeper game engine written in plain JavaScript (ES modules, no dependencies).

**[▶ Play the demo](https://gizawnahom.github.io/mine-sweeper/demo/)**, a small browser UI built on the engine ([source](demo/)).

The engine holds the game rules — mine placement, flagging, revealing, flood-fill of empty areas, and win/loss detection — and reports every change to a **receiver** object you provide. That keeps it decoupled from any particular UI: plug in a terminal renderer, a DOM board, or a test spy.

## Quick start

```js
import { Factory } from "./Mine-Sweeper/src/index.js"

const receiver = {
	flag(row, column) { console.log(`flagged ${row},${column}`) },
	unflag(row, column) { console.log(`unflagged ${row},${column}`) },
	reveal({ row, column, adjacentMines }) { console.log(`revealed ${row},${column}: ${adjacentMines}`) },
	endGame({ won, mines }) { console.log(won ? "won" : "lost", mines) },
}

const game = Factory.createGame({ receiver })
game.flag(1, 1)
game.reveal(4, 5)
```

Or leave the receiver out and subscribe to [domain events](#domain-events):

```js
import { Factory } from "./Mine-Sweeper/src/index.js"

const game = Factory.createGame()
game.subscribe((event) => console.log(event))
game.reveal(4, 5)
```

The engine is not published to npm yet: copy `Mine-Sweeper/src/` into your project (or import it from this repository, as the demo does). It runs in modern browsers and in Node.js; CI tests it on Node.js 22, 24 and 26.

## How the game plays

- The board has **8 rows × 10 columns** and **10 mines** by default; all three are configurable. Rows and columns are **1-indexed**.
- **Revealing** a mine loses the game. Revealing a safe cell shows how many mines are adjacent to it; if there are none, its adjacent cells are revealed automatically, which can spread across a whole empty area. Flags on cells revealed this way are removed.
- **Flagging** marks a hidden cell. You get one flag per mine; with no flags left, flagging does nothing. A flagged cell can't be revealed until it is unflagged, and revealed cells can't be flagged.
- The game is **won** once every safe cell has been revealed; flagging the mines is not required.
- Once the game is won or lost, further moves are ignored.

## API

The package's only entry point is `src/index.js`, which exports `Factory`. The other modules are internal: the package does not export them, so importing `mine-sweeper/src/...` fails.

### `Factory.createGame(options)`

Creates a new game. `options` is optional, and so is each field in it:

| Option    | Default | Allowed values                                     |
| --------- | ------- | -------------------------------------------------- |
| `rows`    | `8`     | a whole number of at least 1                       |
| `columns` | `10`    | a whole number of at least 1                       |
| `mines`   | `10`    | a whole number from 1 to `rows × columns − 1`, placed at random, **or** a list of `{ row, column }` positions (same length limits, each on the board, no duplicates) |
| `receiver` | none   | an object told about every change (see [The receiver](#the-receiver)); leave it out to follow the game with [`subscribe`](#domain-events) only |

There must be at least one safe cell, so a board needs at least 2 cells. Note that the default of 10 mines does not fit on small boards: `{ rows: 3, columns: 3 }` needs a `mines` value too.

Listing the positions gives you a fixed board, for puzzles, tests or bug reports. Since `endGame` reports the mines in the same shape, you can replay a finished board:

```js
const replay = Factory.createGame({ rows: 8, columns: 10, mines: result.mines, receiver })
```

### The game

| Member                  | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `game.reveal(row, column)` | reveals a cell (see [How the game plays](#how-the-game-plays)) |
| `game.flag(row, column)`   | flags a hidden cell                                     |
| `game.unflag(row, column)` | removes a flag                                          |
| `game.rows`             | number of rows                                           |
| `game.columns`          | number of columns                                        |
| `game.numberOfFlags`    | flags left to place (starts at the number of mines)     |
| `game.subscribe(listener)` | calls `listener(event)` for every [domain event](#domain-events); returns a function that unsubscribes |

### The receiver

The receiver is any object with these four methods; when one is given, all four are required, and this is checked when the game is created. They are called with the same information as the [domain events](#domain-events), at the same time: synchronously, once the move is complete, and before any listeners added with `subscribe`.

| Method                                 | Called when                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `flag(row, column)`                    | a cell was flagged                                                                                  |
| `unflag(row, column)`                  | a flag was removed, by `game.unflag` or because the cell was revealed automatically                 |
| `reveal({ row, column, adjacentMines })` | a cell was revealed. One move can reveal many cells, so expect several calls per `game.reveal`    |
| `endGame({ won, mines })`              | the game was won or lost (called once). `mines` lists every mine as `{ row, column }`                |

### Domain events

`game.subscribe(listener)` lets any number of listeners follow the game. Each event is a plain, frozen object with a `type`:

| `type`            | Other fields                       | When                                                              |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------- |
| `"CellFlagged"`   | `row`, `column`                    | a cell was flagged                                                |
| `"CellUnflagged"` | `row`, `column`                    | a flag was removed, by `game.unflag` or by automatic revealing    |
| `"CellRevealed"`  | `row`, `column`, `adjacentMines`   | a cell was revealed; one move can reveal many cells               |
| `"GameWon"`       | `mines`                            | every safe cell has been revealed                                 |
| `"GameLost"`      | `mines`                            | a mine was revealed                                               |

```js
const unsubscribe = game.subscribe((event) => console.log(event))
game.reveal(4, 5)   // { type: "CellRevealed", row: 4, column: 5, adjacentMines: 2 } …
unsubscribe()
```

- Events are delivered synchronously **after** the move is complete, in the order they happened, to listeners in the order they subscribed. A listener therefore always sees the finished move: `game.numberOfFlags` is already up to date.
- If a listener makes a move, that move's events are delivered after the current ones.
- If a listener throws, the other listeners still receive every event; the error is then rethrown to the caller of the move (several errors as an `AggregateError`). The move itself is complete either way.
- Subscribing with something that is not a function throws a `TypeError`.

### Errors

Invalid input throws instead of being ignored, and a rejected call changes nothing:

- `Factory.createGame` throws a `TypeError` when a receiver is given but is not an object or lacks one of its four methods (`receiver.unflag must be a function, got undefined`).
- `Factory.createGame` throws when `options` is invalid: a `TypeError` for unknown option names or non-numbers (`{ row: 16 }`, `{ rows: "8" }`), and a `RangeError` for values out of range (`{ rows: 0 }`, `{ rows: 3, columns: 3, mines: 9 }`).
- `reveal`, `flag` and `unflag` throw for a position that is not on the board: a `RangeError` for `reveal(0, 5)` or `reveal(9, 1)` on an 8-row board, and a `TypeError` for `reveal("13")`. This applies even after the game is over.

Error messages name the option or coordinate and the value, for example `mines must be a whole number from 1 to 8 for a 3x3 board, got 9`.

## Project layout

```
Mine-Sweeper/        the engine (src/)
Mine-Sweeper-test/   Jest test suite, depends on the engine via file:../Mine-Sweeper
demo/                the sample browser UI, deployed to GitHub Pages
jest.config.js       Jest config; tests run from the repo root so coverage includes the engine
```

The tests live in a separate package so the engine itself ships with zero dependencies.

## Running the demo locally

The demo loads the engine as ES modules, so it has to be served over HTTP (opening the file directly won't work):

```sh
python3 -m http.server
```

Then open <http://localhost:8000/demo/>.

## Running the tests

```sh
cd Mine-Sweeper-test
npm ci
npm test           # run the tests
npm run coverage   # run the tests with a coverage report
```

## Test coverage

| Statements | Branches | Functions | Lines |
| ---------- | -------- | --------- | ----- |
| 100%       | 100%     | 100%      | 100%  |

CI enforces 100% coverage of the engine (`Mine-Sweeper/src`), so the build fails if any code goes untested. Coverage measures which code runs during the tests, not whether it behaves correctly.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up, test and submit changes.

## License

[ISC](LICENSE)
