// Serves ../site under /mine-sweeper/, the way GitHub Pages serves the
// project site, so the browser tests see the same paths as visitors.
import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize } from "node:path"

const SITE = join(import.meta.dirname, "..", "site")
const BASE = "/mine-sweeper/"
const PORT = Number(process.env.PORT ?? 4173)
const TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".svg": "image/svg+xml",
	".json": "application/json",
}

createServer(async (request, response) => {
	const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
	if (!path.startsWith(BASE)) return notFound(response)
	const file = normalize(join(SITE, path.slice(BASE.length)))
	if (!file.startsWith(SITE)) return notFound(response)
	try {
		const target = (await stat(file)).isDirectory() ? join(file, "index.html") : file
		response.writeHead(200, { "content-type": TYPES[extname(target)] ?? "application/octet-stream" })
		response.end(await readFile(target))
	} catch {
		notFound(response)
	}
}).listen(PORT, "127.0.0.1", () => console.log(`serving ${SITE} at http://127.0.0.1:${PORT}${BASE}`))

function notFound(response) {
	response.writeHead(404, { "content-type": "text/plain" })
	response.end("not found")
}
