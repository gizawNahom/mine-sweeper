// Delivers domain events to listeners. Events are recorded while a move is being
// made and delivered only when it is complete, so listeners always see a
// finished game.
export default class EventPublisher {
	#subscriptions = []
	#pending = []
	#isPublishing = false

	subscribe(listener) {
		if (typeof listener !== "function")
			throw new TypeError(`listener must be a function, got ${this.#show(listener)}`)
		const subscription = { listener }
		this.#subscriptions.push(subscription)
		return () => this.#unsubscribe(subscription)
	}

	#unsubscribe(subscription) {
		this.#subscriptions = this.#subscriptions.filter((other) => other !== subscription)
	}

	#show(value) {
		return typeof value === "string" ? JSON.stringify(value) : String(value)
	}

	record(event) {
		this.#pending.push(this.#deepFreeze(event))
	}

	#deepFreeze(value) {
		if (value !== null && typeof value === "object") {
			Object.values(value).forEach((child) => this.#deepFreeze(child))
			Object.freeze(value)
		}
		return value
	}

	publish() {
		// A listener that makes a move adds to the events being delivered,
		// which then arrive after the current ones, in order.
		if (this.#isPublishing) return
		this.#isPublishing = true
		const errors = []
		try {
			while (this.#pending.length > 0) this.#deliver(this.#pending.shift(), errors)
		} finally {
			this.#isPublishing = false
		}
		this.#rethrow(errors)
	}

	#deliver(event, errors) {
		// A copy, so subscribing or unsubscribing during delivery applies from the next event.
		for (const { listener } of [...this.#subscriptions]) {
			try {
				listener(event)
			} catch (error) {
				errors.push(error)
			}
		}
	}

	#rethrow(errors) {
		if (errors.length === 1) throw errors[0]
		if (errors.length > 1)
			throw new AggregateError(errors, `${errors.length} event listeners failed`)
	}
}
