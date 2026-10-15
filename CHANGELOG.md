# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project follows [semantic versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - 2026-10-15

The first release: a UI-agnostic Minesweeper engine with no dependencies, TypeScript definitions, and two live demos ([plain JavaScript](https://gizawnahom.github.io/mine-sweeper/demos/plain/) and [React](https://gizawnahom.github.io/mine-sweeper/demos/react/)).

### Breaking changes

Compared with the original 2022 code:

- The entry point exports `createGame(options)` instead of `Factory.createGame(receiver, options)`. The receiver is now an option, and optional: `createGame({ rows, columns, mines, receiver })`.
- The receiver's `endGame(mines)` is now `endGame({ won, mines })`, so a win can be told from a loss.
- Mines are `{ row, column }` objects instead of strings such as `"12"`, which were ambiguous on boards with more than 9 rows or columns.
- Only the entry point is exported; importing `mine-sweeper/src/...` fails.
- The engine moved from `Mine-Sweeper/src/` to `src/`, and the repository is a single package.
- Node.js 22 or later is required.

### Added

- `game.subscribe(listener)` and five domain events (`CellFlagged`, `CellUnflagged`, `CellRevealed`, `GameWon`, `GameLost`), delivered in order after each move, to any number of listeners.
- Configurable board size and mine count, with mines placed at random or at given positions; a finished game's mines can be passed back in to replay the board.
- Invalid options and moves off the board throw a `TypeError` or `RangeError` naming the problem; a receiver missing a method is rejected when the game is created.
- Moves after the game is over are ignored.
- TypeScript definitions (`src/index.d.ts`).
- A plain JavaScript demo and a React demo, deployed to GitHub Pages.

### Fixed

- Flagging a mine no longer turns it into a safe cell.
- Flagging mines no longer prevents the game from being won.
- Mines can be placed in the last row and column.
- When one move reveals the rest of the board, the game ends only once.
- Revealing a large empty area no longer overflows the call stack.

[Unreleased]: https://github.com/gizawNahom/mine-sweeper/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/gizawNahom/mine-sweeper/releases/tag/v1.0.0
