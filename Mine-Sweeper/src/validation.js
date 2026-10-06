export function checkNumber(name, value) {
	if (typeof value !== "number")
		throw new TypeError(`${name} must be a number, got ${show(value)}`)
}

export function show(value) {
	return typeof value === "string" ? JSON.stringify(value) : String(value)
}
