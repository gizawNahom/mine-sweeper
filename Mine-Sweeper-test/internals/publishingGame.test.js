// An internals test: it imports engine modules by relative path, which every
// other test avoids on purpose. It exists because PublishingGame forwards each
// public member of Game by hand, and nothing seen through the public API would
// notice a member that was added to Game but never forwarded.
import Game from "../../Mine-Sweeper/src/game.js"
import PublishingGame from "../../Mine-Sweeper/src/publishingGame.js"

const ADDED_BY_PUBLISHING_GAME = ["subscribe"]

describe("Given the members of Game and PublishingGame", () => {
	test("Then PublishingGame forwards every public member of Game, as the same kind", () => {
		expect(publicMembers(PublishingGame).filter(notAddedByPublishingGame)).toEqual(
			publicMembers(Game)
		)
	})

	test("Then PublishingGame adds nothing but subscribe", () => {
		const added = publicMembers(PublishingGame).filter(
			(member) => !publicMembers(Game).some((other) => other.name === member.name)
		)

		expect(added.map((member) => member.name)).toEqual(ADDED_BY_PUBLISHING_GAME)
	})
})

function publicMembers(aClass) {
	return Object.entries(Object.getOwnPropertyDescriptors(aClass.prototype))
		.filter(([name]) => name !== "constructor")
		.map(([name, descriptor]) => ({ name, kind: descriptor.get ? "getter" : "method" }))
		.sort((a, b) => a.name.localeCompare(b.name))
}

function notAddedByPublishingGame(member) {
	return !ADDED_BY_PUBLISHING_GAME.includes(member.name)
}
