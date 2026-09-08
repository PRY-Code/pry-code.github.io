# PRY landing

Russian PRY Agent introduction with full-viewport scene transitions.

Serve this directory with a static HTTP server. The page needs no package install
or application build. GitHub Pages publishes `main` from the repository root.

Interaction: wheel, vertical swipe, navigation links, arrows, PageUp/PageDown,
Home/End. Ambient effects can be disabled; reduced-motion preference is respected.

Local fonts are distributed under their licenses in `assets/licenses/`.
Only marketing site files and public brand assets belong in this repository.

Browser verification: with Python Playwright already installed, run
`python tests/check_site.py`. Set `PRY_BROWSER_EXECUTABLE` to an existing Chromium
binary if needed. Screenshots and check results are saved under ignored `qa/`.
