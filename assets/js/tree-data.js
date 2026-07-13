// Muscle tree — CONTENT ONLY. The engine (muscle-tree.js) never hardcodes a
// node: add/remove/reorder anything here and the layout, lines, and
// animations adapt. Shape of a node:
//   { label, sub?, href?, children? }
// A node with `children` expands on click; a node with `href` is a leaf that
// links out. Keep it public-clean (no internal infrastructure) per AGENTS.md.
window.MUSCLE_TREE = {
  label: "Rensley",
  sub: "reasoning & logic first · fullstack, leaning backend — where fintech lies",
  children: [
    {
      label: "Payments & Settlement",
      sub: "USD-priced, non-custodial, onchain",
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
          href: "https://github.com/Access0x1/Access0x1/tree/feat/rebates-module",
        },
      ],
    },
    {
      label: "Identity & Auth",
      sub: "one shared sign-in, sessions done once",
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
