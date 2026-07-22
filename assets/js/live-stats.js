/*
 * live-stats.js — the ONE source of truth for the Access0x1 trust numbers shown
 * on this site (test count, testnet + verification status). Load this BEFORE
 * tree-data.js and before the render.
 *
 * GENERATED, not hand-typed: refreshed ~daily by the Access0x1 stats workflow
 * (it runs the test suite for the real pass count and queries each chain's block
 * explorer for the router's source-verification status), which commits this file
 * back. The object below is ALSO the committed LAST-KNOWN-GOOD FALLBACK — if a run
 * ever fails, the page keeps showing this stale-but-true number, never a blank.
 *
 * "checkedAt" is the honesty stamp: the numbers are "checked daily", not "live".
 * Every claim on index.html / classic.html renders from these values via the
 * data-stat spans + stats-render.js, so the two pages can never disagree again.
 */
window.LIVE_STATS = {
  tests: 1992, // passing tests (forge test --list on Access0x1 @ main)
  testnets: 9, // CREATE3 mirror 0xe92244e3… live on 9 public testnets
  verified: 9, // source-verified of those 9
  chainsTotal: 12, // incl. 3 pre-mirror per-chain deploys (Hoodi, Galileo, Tempo)
  routerCoveragePct: 100,
  invariants: 13,
  checkedAt: "2026-07-22", // "as of" — rendered as "checked daily", not "live"
};
