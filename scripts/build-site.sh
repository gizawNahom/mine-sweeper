#!/usr/bin/env bash
# Builds the GitHub Pages site into site/: the plain demo with the engine source
# it imports, the React demo (built with Vite), and redirects from older
# addresses. Used by the deploy workflow and by the browser tests.
set -euo pipefail
cd "$(dirname "$0")/.."

(cd demos/react && npm ci && npm run build)

rm -rf site
mkdir -p site/demos
cp -r src site/src
cp -r demos/plain site/demos/plain
cp -r demos/react/dist site/demos/react

redirect() {   # redirect <folder in site> <target relative to that folder>
	mkdir -p "site/$1"
	printf '%s\n' '<!doctype html>' '<meta charset="utf-8" />' \
		"<meta http-equiv=\"refresh\" content=\"0; url=$2\" />" \
		'<title>Mine-Sweeper</title>' \
		"<a href=\"$2\">Play the Mine-Sweeper demo</a>" > "site/$1/index.html"
}
redirect . demos/plain/
redirect demo ../demos/plain/
redirect react ../demos/react/
