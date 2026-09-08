# PRY landing design

Status: Active · 2026-09-08

Visual thesis: a dark editorial film poster with sharp technical geometry, generous
space, italic type and one acid-chartreuse accent, drawn from PRY's workbench.

Content plan: product promise → Why PRY and practical benefits → model choice → project memory → visible work and
verification → implemented principles → COMING SOON and the public organization link. All explanatory copy
is Russian; product/provider names and the requested COMING SOON label are retained.

Interaction thesis: one wheel/touch gesture advances one scene; text and diagrams
arrive in a short cinematic sequence; graphic paths and focused hover states give
the page presence. Wheel momentum must not skip multiple scenes.

## Evidence and decisions

- Existing app DESIGN.md, graphite/chartreuse CSS tokens, outlined P mark, local
  IBM Plex Sans and JetBrains Mono fonts, and the user's presentation reference.
- The user explicitly requests viewport transitions, Russian copy and COMING SOON.
- frontend-skill supplies brand-first composition and purposeful motion.
- ui-ux-pro-max matched a Hero/Features/CTA structure on the focused product-launch
  query; its stock colors/fonts and instant transitions do not override PRY's brand
  or the user's explicit cinematic transition request.
- The website is a separate static marketing surface. It contains only public
  copy, site code and licensed brand assets. No application source or credentials.

## Product and information architecture

Audience: people who want to work with their preferred AI models in one workspace.
Goal: communicate model choice, project context and visible actions in a few frames.
Primary action: explore the product story, then follow PRY-Code on GitHub.
No invented release date, mailing-list endpoint, performance claim or download.

## Visual language

- Background #0b0b0b; raised plane #141414; ink #f3f4ec; muted #a4aaa0.
- Accent #d7ff4a; square corners and fine structural lines.
- IBM Plex Sans for copy and italic display, JetBrains Mono for labels.
- One dominant diagram per scene, no decorative card grid or stock gradients.
- Display copy omits full stops and decorative point markers. The Why PRY scene
  uses four numbered benefit rows linked to the relevant product details.
- Principles use six accessible tabs and short process diagrams. Copy is grounded
  in the implemented runtime: completion gate, evidence provenance, bounded file
  alternatives, recovery budgets, selective context and source-bound experience.
  Research hypotheses and unimplemented general search modes are not product claims.
- Transitions use transforms/opacity and modest clip reveals; ambient motion can
  be disabled, and reduced-motion preference produces immediate scene changes.

## Responsive and accessibility behavior

- Desktop: full-viewport composition; mobile: stacked copy and a smaller diagram.
- Short viewports keep text available and may scroll within a scene if needed.
- Navigation works with wheel, swipe, arrows, PageUp/PageDown, Home/End and buttons.
- Inactive scenes are inert; current section is announced and keyboard focus is
  moved only for keyboard navigation. Focus indicators and native browser zoom remain.
- Header/footer count toward the viewport. Touch targets are at least 44px.
- On phones, header, presentation and footer share a dynamic-height flex frame.
  Content rows retain their intrinsic minimum height; excess content scrolls
  inside the scene, fully clipped above the navigation. Animations preserve the
  gap between copy and panels. Test intermediate browser heights, not just presets.
- No JavaScript: sections remain ordinary readable content.

## Verification

Check desktop/mobile overflow, rapid-wheel gating, reverse navigation, keyboard
and touch input, reduced motion, interactive model/control examples, links and
browser errors. Inspect screenshots before publication.
