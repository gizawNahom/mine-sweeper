import { expect, test } from "@playwright/test"

// Addresses from before the demos moved into demos/ must keep working.
const REDIRECTS = [
	{ from: "", to: "/mine-sweeper/demos/plain/" },
	{ from: "demo/", to: "/mine-sweeper/demos/plain/" },
	{ from: "react/", to: "/mine-sweeper/demos/react/" },
]

for (const { from, to } of REDIRECTS) {
	test(`Given /mine-sweeper/${from} Then it redirects to ${to} and shows a board`, async ({ page }) => {
		await page.goto(from)

		await expect(page).toHaveURL(new RegExp(`${to}$`))
		await expect(page.locator(".cell")).toHaveCount(80)
	})
}
