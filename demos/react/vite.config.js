import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
	plugins: [react()],
	// Relative asset paths, so the build works under any URL (GitHub Pages serves it at /mine-sweeper/demos/react/).
	base: "./",
	// The dev server may read outside this folder: ../plain/style.css (shared with the
	// plain demo) and the engine, which the mine-sweeper dependency links to.
	server: { fs: { allow: ["../.."] } },
})
