# Portfolio — worklog & next moves

A running note so the next session starts with an obvious first move.

## Live
- **Tree view (default):** https://doble196.github.io/ — the interactive capability map
- **Cabinet view:** https://doble196.github.io/classic.html — the traditional resume, collapsible drawers
- **Presentation script:** [`PRESENTATION.md`](PRESENTATION.md)

## Where things live
- **Content is data-only:** [`assets/js/tree-data.js`](assets/js/tree-data.js) — add/edit/reorder nodes
  here; the engine never names a node. A node is `{ label, sub?, href?, featured?, children? }`.
  `featured: true` marks the flagship (currently **Payments & Settlement**) — it renders with
  visual dominance AND starts expanded.
- **Engine:** [`assets/js/muscle-tree.js`](assets/js/muscle-tree.js) — REWRITTEN 2026-07-16: the
  tree is now normal in-flow page content (hero header → sticky sector chips → a column of
  expanding branch cards). No camera, no pan, NO ZOOM (pinch disabled site-wide by owner
  decision — viewport meta + gesture guard). Motion is pure CSS (grid-rows 0fr→1fr, same idiom
  as the cabinet drawers). Data-blind; you shouldn't need to touch it to change content.
- **Cabinet behavior:** [`assets/js/cabinet.js`](assets/js/cabinet.js) — drawer toggles +
  hash-deeplink auto-open.
- **Styles/tokens:** [`assets/css/styles.css`](assets/css/styles.css) (tree-specific CSS is
  inline in `index.html`). **Bump the `?v=N` asset query in BOTH html files whenever CSS/JS
  change shape** — GitHub Pages caches assets ~10 min; a stale engine + new HTML = empty page.

## Shipped (Week 2 — UX pass)
- Tree portfolio as the front door; classic resume preserved at `/classic.html`; obvious
  Tree ⇄ Cabinet toggle in both navs.
- Brand favicon (RR), ambient CSS 3D background (respects reduced-motion).
- **Bounded zoom:** dynamic floor = "where the whole tree fits" (never zooms into empty space),
  fixed max; every path (wheel/pinch/buttons/auto-frame) obeys it.
- **Identity card:** face, role, concrete proof (1,746 tests · 8+ testnets · ETHGlobal × ENS),
  "open to roles" — all reach a **zero-click** visitor.
- **Auto-reveal:** the tree expands itself once on load (cancels on interaction; reduced-motion
  opens instantly) so the story doesn't hide behind a click.
- **Visual hierarchy:** Payments is the flagship — weight, not just reading order.

## Shipped (Week 2 — accessibility pass, 2026-07-15)
Four small commits, each overflow-gated (desktop + mobile, context-validated) and merged to
`main` via clean fast-forward, then pushed live:
- **Contrast:** `--text-tertiary` grey lifted to meet WCAG AA (was 3.4–4.0:1, now ~4.9–5.8:1).
- **Small-mono legibility:** `.mono` letter-spacing `0.02em` (the `.hero__tagline` typewriter
  opted out so its `steps(23)` animation stays aligned).
- **Colorblind (WCAG 1.4.1):** underlined inline *prose* links (CodeHawks, Patrick/Cyfrin, the $1
  tx) so they're not signalled by green alone; chrome links left clean (opt-in scoping).
- **13px floor:** five reader-facing labels lifted to `0.8125rem` (`.tag`, `.tag--sm`,
  `.org-card__type`, `.epigraph__cite`, `.project-card__badge`).
- Earlier: role-first identity card ("Payments & On-Chain Infrastructure Engineer") live in both
  views; dead links removed; testnet counts reconciled.

## Shipped (2026-07-16 — tree rewrite + red-team pass)
- **Tree is a real page now** (owner's call: "Apple-like, not inside a window"): in-flow hero +
  sticky filter chips + expanding cards; vertical list on every screen size; flagship opens on load.
- **Pinch zoom disabled everywhere** (owner decision): viewport `maximum-scale=1` +
  `touch-action: manipulation` + iOS gesture guard in both JS entry files.
- **Red team (95 agents, 67 confirmed findings on structure/look), top fixes applied:** credential
  `pre` now scrolls inside its card (was hard-clipped on every phone); codehawks stats wrap;
  cabinet hero de-monumented (natural height, 160px avatar); drawers restyled as cards (tree idiom);
  org/audit hover no longer erases the accent stripe; filtered-out tree branches leave the tab
  order; Tree⇄Cabinet toggle sits far right on both pages; nav collapses at 880px (was 768, band
  collided); square 800×800 `og-image.png` + full social-meta parity; slim footer + skip links +
  `main` landmarks on both pages; dark `404.html`; dark redirect stub; h4→h3 card headings;
  aria-pressed on filters; dead CSS deletions (.card, org-card blue/orange, .tree-stage).
- **Red-team leftovers (deliberately deferred, in priority order):** collapse the dead "neon layer"
  in styles.css (~200 lines defined then overridden); unify the chip idiom (.tag vs .filter-btn vs
  sector chips) and the two chevron treatments; type-scale + radius tokens cleanup; heatmap day
  cells are mouse-only (keyboard/AT); second epigraph demotion; nav resting-state parity.

## Next moves (start here tomorrow — truth before polish)
1. **⚠️ Truth pass FIRST.** The site contradicts itself on test count: **"1,746 tests"** (index +
   `tree-data.js`) vs **"864 tests"** (`classic.html:431` and `:716`). Reconcile to one number, or
   make each claim's scope explicit (864 = router suite? 1,746 = full repo?). Credibility, not
   styling — Cheatcode #20. Fix before anything else.
2. **Verify on PROD, not localhost.** Today's a11y pass was verified on `localhost` only. Load the
   live `doble196.github.io`, re-run the overflow + grayscale checks against production.
   Done-in-the-world, not done-in-the-code (Cheatcode #7).
3. **The real 30-second human test** — still unrun, still the only ground truth for "does the hero
   land." Hand someone your phone, take it back at 0:30, ask *"what does this person do, and how
   would you reach them?"*
4. **Your call (flagged, not done):** borderline colorblind reinforcements (contact/org link rows,
   filter chip); and the fate of the stale `redesign/knicks-home-away` branch (unmerged, 28 behind
   `main`, ~1,244-line `styles.css` rewrite — revive-with-rebase or delete).

## Local preview
```bash
python3 -m http.server 8100 -d .
# open http://localhost:8100
```

## House rules (see AGENTS.md)
Push `main` directly · rebase before push · atomic commits · no third-party CDNs (vanilla only).
