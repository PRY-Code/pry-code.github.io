# PRY Landing Site Guidelines

## Scope

This repository contains the public PRY Agent landing page. Keep it a small,
dependency-free static site: `index.html`, `styles.css`, `app.js`, public brand
assets, and browser checks. Application source, credentials, private plans, and
runtime configuration do not belong here.

Read `DESIGN.md` before changing layout, copy, motion, or interaction. Update it
when a durable design or information-architecture decision changes.

## Stack and Local Workflow

- Plain semantic HTML, CSS, and browser JavaScript. Do not add a framework,
  package manager, bundler, or build step without an explicit requirement.
- Serve the repository root locally, for example with
  `python -m http.server 8000`, and inspect the page through HTTP rather than by
  opening `index.html` directly.
- Local fonts and their licenses live under `assets/`. Reuse existing brand
  assets before creating new ones.
- Generated browser screenshots and results belong under ignored `qa/`.

## Product Copy

- Write explanatory landing copy in Russian. Keep product and provider names,
  code identifiers, and the requested `COMING SOON` label unchanged where used.
- Present PRY as coming soon. Do not invent a release date, download, waitlist,
  signup flow, pricing, benchmark, performance promise, or availability claim.
- Make only feature claims supported by the current PRY product. Qualify examples
  as examples, and keep research ideas or planned capabilities out of present-tense
  product claims.
- Do not advertise PRY as open source, closed source, or being developed in
  private. Avoid development-model claims entirely.
- Keep metadata, social preview copy, visible headings, and calls to action
  consistent when the product message changes.

## Visual Direction

- Preserve the sharp dark PRY language: graphite background, warm white text,
  acid-chartreuse accent, square geometry, fine structural lines, italic display
  type, and JetBrains Mono labels.
- Favor one dominant diagram or interaction per scene, generous negative space,
  and editorial hierarchy. Avoid generic card grids, stock gradients, rounded
  panels, decorative badges, and visual effects without an information purpose.
- Keep the outlined PRY mark and existing typography as the visual anchor.
- Maintain strong contrast, visible focus states, and readable type at browser
  zoom. Do not encode meaning through color alone.

## Scene Navigation and Motion

- The enhanced page is a single-viewport sequence. One deliberate wheel or swipe
  gesture advances one scene; momentum must not skip scenes or move the scene
  while the current scene still has scrollable content.
- Preserve navigation by scene links, previous/next controls, Arrow keys,
  PageUp/PageDown, Home/End, and vertical touch swipe.
- Keep URL fragments and scene indexes aligned across HTML and JavaScript.
  Inactive scenes must remain inert, while the current scene is announced and
  keyboard focus moves only after keyboard navigation.
- Without JavaScript, every section must remain visible, ordered, and readable.
- Honor `prefers-reduced-motion` and the page motion toggle. Reduced motion must
  switch scenes immediately; essential content and controls cannot depend on
  animation.

## Responsive Layout

- Header and footer are part of the available viewport. Current-scene content
  must stay between them with no document-level horizontal overflow.
- On narrow or short screens, stack content and allow the active scene to scroll
  internally. Keep scene navigation visible and prevent copy, diagrams, captions,
  and controls from overlapping.
- Keep interactive targets at least 44 by 44 CSS pixels where practical.
- Test intermediate phone heights and landscape, not only a desktop and one phone
  preset. Long Russian words, larger text, and browser zoom must not break the
  composition.

## Verification

Run the browser suite after changes to HTML, CSS, JavaScript, copy length, fonts,
or assets:

```sh
python tests/check_site.py
```

Set `PRY_BROWSER_EXECUTABLE` to an installed Chromium binary when Playwright
cannot find one. Review the generated screenshots in `qa/`; a passing console
summary alone is insufficient for visual changes.

The suite must finish with no console errors, failed resources, layout overflow,
or detected overlap. It also covers rapid and reverse navigation, independent
tabs, keyboard boundaries, touch gestures, reduced motion, mobile content
scrolling, responsive sizes, and no-JavaScript readability. Add or tighten a
check when introducing behavior the existing suite cannot prove.

For documentation-only changes, inspect the rendered Markdown and run:

```sh
git diff --check
```

## Deployment and Git

- GitHub Pages publishes the repository root from `main`; there is no asset build
  or deployment command. Do not deploy from a local workaround or commit generated
  `qa/` output.
- Before publishing, confirm the browser suite passes on the exact commit and that
  canonical and social URLs still target `https://pry-code.github.io/`.
- Keep commits focused and meaningful. State the user-visible reason for the
  change, include the relevant verification, and avoid mixing unrelated copy,
  layout, interaction, and asset work in one commit.
- Do not commit temporary, backup, or editor files. Preserve unrelated working-tree
  changes and never rewrite shared history unless explicitly requested.
