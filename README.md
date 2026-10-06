# Mine-Sweeper

![Build](https://github.com/gizawNahom/mine-sweeper/actions/workflows/CI.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)

A UI-agnostic Minesweeper game engine written in plain JavaScript (ES modules, no dependencies).

The engine holds the game rules — mine placement, flagging, revealing, flood-fill of empty areas, and win/loss detection — and reports every change to a **receiver** object you provide. That keeps it decoupled from any particular UI: plug in a terminal renderer, a DOM board, or a test spy.

## Rules

- The board is **8 rows × 10 columns**, with **10 mines** and **10 flags**.
- Rows and columns are **1-indexed**.
- Revealing a cell with no adjacent mines automatically reveals its neighbours.
- Revealing a mine ends the game. The game is also won (and ended) once every safe cell has been revealed.

## Usage

Requires Node.js 18 or later.

```js
import { Factory } from "./Mine-Sweeper/src/index.js"

const receiver = {
	flag(row, column) {},                         // a cell was flagged
	unflag(row, column) {},                       // a flag was removed
	reveal({ row, column, adjacentMines }) {},    // a cell was revealed
	endGame(mines) {},                            // game over; mines is a list of cell ids
}

const game = Factory.createGame(receiver)

game.flag(1, 1)
game.unflag(1, 1)
game.reveal(4, 5)

game.rows          // 8
game.columns       // 10
game.numberOfFlags // flags remaining
```

## Project layout

```
Mine-Sweeper/        the engine (src/)
Mine-Sweeper-test/   Jest test suite, depends on the engine via file:../Mine-Sweeper
jest.config.js       Jest config; tests run from the repo root so coverage includes the engine
```

The tests live in a separate package so the engine itself ships with zero dependencies.

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
