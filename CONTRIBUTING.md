# Contributing

Thanks for your interest in improving Mine-Sweeper! Bug reports, fixes and small improvements are all welcome.

## Reporting a bug

Open an issue with:

- the steps to reproduce it (which cells were flagged or revealed, in what order),
- what you expected to happen,
- what happened instead.

A failing test case is the best bug report.

## Setup

You need Node.js 20 or later.

```sh
cd Mine-Sweeper-test
npm ci
npm test           # run the tests
npm run coverage   # run the tests with a coverage report
```

The engine (`Mine-Sweeper/src`) has no dependencies; all tooling lives in `Mine-Sweeper-test`.

## How changes are made

This project is built test-first:

1. **Write a failing test** that describes the behavior you want, or reproduces the bug.
2. **Make it pass** with the smallest change that works.
3. **Refactor** while the tests stay green.

Tests use nested `describe` blocks that read as *Given / When / Then*:

```js
describe("And the user has flagged an armed cell", () => {
	describe("When the user reveals it", () => {
		test("Then nothing happens", () => { ... })
	})
})
```

CI requires **100% coverage** of the engine, so every change to `Mine-Sweeper/src` needs tests. Coverage only shows that code ran, so make sure your tests also check the result.

## Code style

Match the surrounding code:

- tabs for indentation, no semicolons,
- small, well-named private methods (`#isMine`, `#revealArea`) over comments,
- the engine never talks to a UI directly; it reports changes to the receiver object.

## Commit messages

Use a short prefix describing the change:

| Prefix      | Use for                                |
| ----------- | -------------------------------------- |
| `fix:`      | a bug fix                              |
| `new:`      | a new feature                          |
| `refactor:` | a code change that keeps behavior      |
| `test:`     | adding or fixing tests only            |
| `ci:`       | CI or workflow changes                 |
| `chore:`    | tooling, dependencies, docs and setup  |

Example: `fix: detect the win when mines are flagged`

## Pull requests

- Keep each pull request focused on one change.
- Make sure `npm run coverage` passes locally; CI runs the same check on Node 20, 22 and 24.
- Describe what changed and why, and link the issue if there is one.
