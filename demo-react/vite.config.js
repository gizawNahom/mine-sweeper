import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
	plugins: [react()],
	// Relative asset paths, so the build works under any URL (GitHub Pages serves it at /mine-sweeper/react/).
	base: "./",
	// The demo shares ../demo/style.css with the plain demo.
	server: { fs: { allow: [".."] } },
})
