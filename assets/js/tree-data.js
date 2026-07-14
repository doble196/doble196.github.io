// Muscle tree — CONTENT ONLY. The engine (muscle-tree.js) never hardcodes a
// node: add/remove/reorder anything here and the layout, lines, and
// animations adapt. Shape of a node:
//   { label, sub?, href?, featured?, sectors?, children? }
// - children  → expands on click.  href → a leaf that links out.
// - featured  → rendered with visual dominance (the flagship).
// - sectors   → tags used by the sector filter bar; a top-level muscle shows
//               only when its sector is selected (or "All"). Keep these HONEST
//               — only tag a sector you actually have work in.
// Keep it public-clean (no internal infrastructure) per AGENTS.md.
window.MUSCLE_TREE = {
  label: "Rensley",
  sub: "reasoning & logic first · fullstack, leaning backend — where fintech lies",
  children: [
    {
      label: "Payments & Settlement",
      sub: "USD-priced checkout, settled non-custodially",
      featured: true, // the flagship — rendered with visual dominance so the
                      // eye lands here first (weight, not just reading order)
      sectors: ["payments"],
      children: [
        {
          label: "Access0x1",
          sub: "open-source payments + identity rail · 1,746 passing tests",
          href: "https://github.com/Access0x1/Access0x1",
        },
        {
          label: "NFTeria checkout",
          sub: "one-link crypto checkout for any merchant",
          href: "https://nfteria.click",
        },
        {
          label: "Rebates module",
          sub: "idea → fuzz-proven contract → live on two testnets, same day",
          // the feat/rebates-module branch was merged into main and deleted;
          // point at the repo root (the honest, live source) not a dead branch
          href: "https://github.com/Access0x1/Access0x1",
        },
      ],
    },
    {
      label: "Identity & Auth",
      sub: "one shared sign-in, sessions done once",
      sectors: ["identity"],
      children: [
        {
          label: "GitHat",
          sub: "hosted sign-in every app plugs into",
          href: "https://githat.io",
        },
        {
          label: "Onchain identity",
          sub: "wallet-linked identity on the Access0x1 rail",
          href: "https://github.com/Access0x1/Access0x1",
        },
      ],
    },
    {
      label: "Booking",
      sub: "calendar → deposit → confirmation",
      sectors: ["commerce"],
      children: [
        {
          label: "ClickReserv",
          sub: "reservations with real deposits",
          href: "https://reserv.click",
        },
      ],
    },
    {
      label: "Commerce & Inventory",
      sub: "carts, stock, point of sale",
      sectors: ["commerce"],
      children: [
        {
          label: "Colmado",
          sub: "inventory + POS",
          href: "https://colmado.click",
        },
        {
          label: "SebasTN",
          sub: "marketplace payments",
          href: "https://sebastn.com",
        },
      ],
    },
    {
      label: "Provenance & Verification",
      sub: "don't trust the page — check the chain",
      sectors: ["security"],
      children: [
        {
          label: "NFTeria Super-Verify",
          sub: "prove an item's history onchain",
          href: "https://nfteria.click",
        },
        {
          label: "ETHGlobal credential",
          sub: "EG-HACKER token, verifiable on Optimism",
          href: "classic.html#credential",
        },
      ],
    },
    {
      label: "AI & Autonomous Systems",
      sub: "agents that are secure and useful",
      sectors: ["ai"],
      children: [
        {
          label: "Quantl",
          sub: "autonomous ML trading",
          href: "https://quantl.click",
        },
        {
          label: "Agent engineering",
          sub: "LangChain · ElizaOS · RAG",
          href: "classic.html#skills",
        },
      ],
    },
    {
      label: "Security & Auditing",
      sub: "fuzzing, invariants, adversarial review",
      sectors: ["security"],
      children: [
        {
          label: "Access0x1 test suite",
          sub: "262k fuzz calls, zero handler reverts",
          href: "https://github.com/Access0x1/Access0x1",
        },
        {
          label: "Audit practice",
          sub: "Foundry fuzzing + manual review",
          href: "classic.html#security",
        },
      ],
    },
    {
      label: "Teaching",
      sub: "make the idea tangible, no jargon",
      sectors: ["teaching"],
      children: [
        {
          label: "The On-Chain Lesson",
          sub: "see a blockchain work in 60 seconds — testnet, no real money",
          href: "https://githat.io/lesson",
        },
      ],
    },
  ],
};

// Sector filter bar — order + labels for the chips. `key: null` = show all.
// Only list sectors you want a chip for; a muscle with an untagged sector
// (e.g. teaching) still shows under "All".
window.MUSCLE_SECTORS = [
  { key: null, label: "All work" },
  { key: "payments", label: "Payments" },
  { key: "identity", label: "Identity" },
  { key: "commerce", label: "Commerce" },
  { key: "security", label: "Security" },
  { key: "ai", label: "AI" },
];
