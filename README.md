# Mine-Sweeper

![Build](https://github.com/gizawNahom/mine-sweeper/actions/workflows/CI.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

A UI-agnostic Minesweeper game engine written in plain JavaScript (ES modules, no dependencies).

**[▶ Play the demo](https://gizawnahom.github.io/mine-sweeper/demo/)**, a small browser UI built on the engine ([source](demo/)).

The engine holds the game rules — mine placement, flagging, revealing, flood-fill of empty areas, and win/loss detection — and reports every change to a **receiver** object you provide. That keeps it decoupled from any particular UI: plug in a terminal renderer, a DOM board, or a test spy.

## Rules

- By default the board is **8 rows × 10 columns** with **10 mines**. Rows, columns and mines are configurable.
- You get one flag per mine.
- Rows and columns must be whole numbers of at least 1, and mines a whole number from 1 to one less than the number of cells, so there is always at least one safe cell. Invalid or misspelled options throw a `TypeError` or `RangeError` when the game is created.
- `reveal`, `flag` and `unflag` throw the same way for a position that is not on the board (for example `reveal(0, 5)` or `reveal("13")`); a rejected move changes nothing.
- Rows and columns are **1-indexed**.
- Revealing a cell with no adjacent mines automatically reveals its adjacent cells.
- Revealing a mine ends the game. The game is also won (and ended) once every safe cell has been revealed.
- Once the game is over, further `reveal`, `flag` and `unflag` calls are ignored (positions off the board still throw).

## Usage

Requires Node.js 18 or later.

```js
import { Factory } from "./Mine-Sweeper/src/index.js"

const receiver = {
	flag(row, column) {},                         // a cell was flagged
	unflag(row, column) {},                       // a flag was removed
	reveal({ row, column, adjacentMines }) {},    // a cell was revealed
	endGame({ won, mines }) {},                   // game over; won is true or false, mines is a list of { row, column }
}

const game = Factory.createGame(receiver)                                     // 8×10, 10 mines
const expert = Factory.createGame(receiver, { rows: 16, columns: 30, mines: 99 })

game.flag(1, 1)
game.unflag(1, 1)
game.reveal(4, 5)

game.rows          // 8
game.columns       // 10
game.numberOfFlags // flags remaining (starts at the number of mines)
```

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
