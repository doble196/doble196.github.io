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
  visual dominance so the eye lands there first.
- **Engine:** [`assets/js/muscle-tree.js`](assets/js/muscle-tree.js) — layout, springs, lines,
  bounded zoom-to-fit, auto-reveal. Data-blind; you shouldn't need to touch it to change content.
- **Cabinet behavior:** [`assets/js/cabinet.js`](assets/js/cabinet.js) — drawer toggles +
  hash-deeplink auto-open.
- **Styles/tokens:** [`assets/css/styles.css`](assets/css/styles.css) (tree-specific CSS is
  inline in `index.html`).

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

## Next moves (start here tomorrow)
1. **Validate, don't assume — the highest-value next step.** Run the real 30-second test: hand
   someone who's never seen it your phone, take it back at 0:30, ask *"what does this person do,
   and how would you reach them?"* Their answer is the only ground truth. Everything shipped so
   far is verified to *work and fit* — not yet verified to *land*.
2. **Identity-card positioning (a voice decision — yours to make).** Consider leading the card
   with the role competency — *"Payments & on-chain infrastructure engineer · fullstack,
   backend-leaning"* — and demoting the "reasoning-first" line to secondary, so a hiring manager
   buckets you by role in the first read. Left undone on purpose: it's your positioning, not mine.
3. **De-risk the "crypto vs payments" read.** For a non-crypto fintech shop, frame the on-chain
   work as payments-engineering rigor (USD-priced, non-custodial, fuzz-tested) so it reads
   "payments engineer," not "crypto person."

## Local preview
```bash
python3 -m http.server 8100 -d .
# open http://localhost:8100
```

## House rules (see AGENTS.md)
Push `main` directly · rebase before push · atomic commits · no third-party CDNs (vanilla only).
