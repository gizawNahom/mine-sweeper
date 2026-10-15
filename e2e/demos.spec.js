import { expect, test } from "@playwright/test"

// Both demos look and behave the same, so they share these tests.
const DEMOS = [
	// randomCallsBeforeGame: Math.random calls the page makes before the game creates
	// its mines. React's build makes 2 while loading; the plain demo makes none.
	{ name: "plain", path: "demos/plain/", randomCallsBeforeGame: 0 },
	{ name: "React", path: "demos/react/", randomCallsBeforeGame: 2 },
]

for (const demo of DEMOS) {
	test.describe(`Given the ${demo.name} demo`, () => {
		test("Then it shows an 8x10 board with 10 flags and no errors", async ({ page }) => {
			const errors = await open(page, demo)

			await expect(cells(page)).toHaveCount(80)
			await expect(page.locator("#flags-left")).toHaveText("10")
			expect(errors).toEqual([])
		})

		test.describe("And the mines are all in row 1", () => {
			test("When the user reveals a mine Then the game is lost and every mine is shown", async ({ page }) => {
				const errors = await open(page, demo, { minesInRowOne: true })

				await cell(page, 1, 4).click()

				await expect(page.locator("#result")).toContainText("Boom")
				await expectMinesInRowOne(page, "mine")
				await cell(page, 8, 10).click()
				await expect(page.locator('.cell[data-state="revealed"]')).toHaveCount(0)
				expect(errors).toEqual([])
			})

			test("When the user flags in every way Then the counter follows", async ({ page }) => {
				const errors = await open(page, demo, { minesInRowOne: true })
				const flagsLeft = page.locator("#flags-left")

				await cell(page, 1, 1).click({ button: "right" })
				await expect(cell(page, 1, 1)).toHaveAttribute("data-state", "flagged")
				await expect(flagsLeft).toHaveText("9")

				await cell(page, 1, 1).click({ button: "right" })
				await expect(cell(page, 1, 1)).toHaveAttribute("data-state", "hidden")
				await expect(flagsLeft).toHaveText("10")

				await cell(page, 1, 2).focus()
				await page.keyboard.press("f")
				await expect(cell(page, 1, 2)).toHaveAttribute("data-state", "flagged")

				await page.click("#flag-mode")
				await cell(page, 1, 3).click()
				await expect(cell(page, 1, 3)).toHaveAttribute("data-state", "flagged")
				await expect(flagsLeft).toHaveText("8")
				expect(errors).toEqual([])
			})

			test("When the user reveals the far corner Then the board opens and the game is won", async ({ page }) => {
				const errors = await open(page, demo, { minesInRowOne: true })

				await cell(page, 8, 10).click()

				await expect(page.locator("#result")).toContainText("You won")
				await expect(page.locator('.cell[data-state="revealed"]')).toHaveCount(70)
				await expectMinesInRowOne(page, "flagged")
				await expect(cell(page, 2, 1)).toHaveText("2")
				await expect(cell(page, 2, 5)).toHaveText("3")
				expect(errors).toEqual([])
			})

			test("When the user starts a new game Then the board is fresh", async ({ page }) => {
				await open(page, demo, { minesInRowOne: true })
				await cell(page, 2, 5).click()

				await page.click("#new-game")

				await expect(page.locator('.cell[data-state="hidden"]')).toHaveCount(80)
				await expect(page.locator("#result")).toHaveText("")
			})
		})

		test.describe("And a phone in dark mode", () => {
			test.use({ viewport: { width: 375, height: 760 }, colorScheme: "dark" })

			test("When the user picks Expert Then the 16x30 board fits without page scrolling", async ({ page }) => {
				const errors = await open(page, demo)

				await page.selectOption("#difficulty", "expert")

				await expect(cells(page)).toHaveCount(480)
				await expect(page.locator("#flags-left")).toHaveText("99")
				const overflow = await page.evaluate(
					() => document.documentElement.scrollWidth - window.innerWidth
				)
				expect(overflow).toBeLessThanOrEqual(0)
				expect(errors).toEqual([])
			})
		})
	})
}

async function open(page, demo, { minesInRowOne = false } = {}) {
	const errors = []
	page.on("pageerror", (error) => errors.push(error.message))
	page.on("console", (message) => message.type() === "error" && errors.push(message.text()))
	if (minesInRowOne) await page.addInitScript(placeMinesInRowOne, demo.randomCallsBeforeGame)
	await page.goto(demo.path)
	await expect(cells(page).first()).toBeVisible()
	return errors
}

// Runs in the page before its scripts: feeds the mine generator values that put
// the default board's 10 mines in row 1, one per column (it draws a row, then a
// column, for each mine). Earlier calls get a harmless value. Once the values run
// out, any further mine goes to the bottom row, (8,10), (8,9), …, never row 1: so if
// randomCallsBeforeGame is wrong, the mines are visibly misplaced every time.
function placeMinesInRowOne(randomCallsBeforeGame) {
	const values = Array.from({ length: randomCallsBeforeGame }, () => 0.5)
	for (let column = 1; column <= 10; column++) values.push(0.001, (column - 1) / 10 + 0.001)
	let extraCalls = 0
	const bottomRow = () => {
		const call = extraCalls++
		return call % 2 === 0 ? 0.999 : (9 - Math.floor(call / 2)) / 10 + 0.001
	}
	Math.random = () => (values.length > 0 ? values.shift() : bottomRow())
}

async function expectMinesInRowOne(page, state) {
	// If this fails while everything else looks fine, the page's Math.random calls
	// before the game changed: update randomCallsBeforeGame above.
	await expect(page.locator(`.cell[data-state="${state}"]`)).toHaveCount(10)
	await expect(page.locator(`.cell[data-row="1"][data-state="${state}"]`)).toHaveCount(10)
}

function cells(page) {
	return page.locator(".cell")
}

function cell(page, row, column) {
	return page.locator(`.cell[data-row="${row}"][data-column="${column}"]`)
}
