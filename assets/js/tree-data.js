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
  sub: "founder, SebasTN Inc. · payments for businesses and liquidity, on chain and off",
  children: [
    {
      label: "Access0x1 payments network",
      sub: "live on Ethereum, Base, Unichain and Arc · one router, every business paid directly",
      featured: true,
      sectors: ["payments"],
      children: [
        {
          label: "Access0x1",
          sub: "non-custodial, USD-priced, exact split on every payment · " +
            (window.LIVE_STATS && window.LIVE_STATS.tests != null
              ? window.LIVE_STATS.tests.toLocaleString("en-US")
              : "thousands of") +
            " passing tests",
          href: "https://access0x1.com",
        },
        {
          label: "Live on mainnet, proven",
          sub: "every deployment and settlement checkable on the explorers",
          href: "https://access0x1.com/mainnet",
        },
      ],
    },
    {
      label: "Uniswap v4 hooks",
      sub: "hooks that earn from liquidity and take payments through pools",
      sectors: ["payments"],
      children: [
        {
          label: "BoomerangHook",
          sub: "5% of liquidity-provider fees to the treasury · Ethereum, Base, Unichain, Arc",
          href: "https://access0x1.com/mainnet",
        },
        {
          label: "PayHook",
          sub: "a store takes payment through a Uniswap pool swap · Base, Unichain, Arc",
          href: "https://access0x1.com/mainnet",
        },
        {
          label: "Uniswap Hook Incubator, cohort 11",
          sub: "v4 hooks in Solidity + Foundry",
          href: "https://atrium.academy/uniswap",
        },
      ],
    },
    {
      label: "Businesses that run on it",
      sub: "real customers, real payments",
      sectors: ["commerce"],
      children: [
        {
          label: "ClickReserv",
          sub: "booking, payments and point of sale for 200+ business types, on your own brand and domain",
          href: "https://clickreserv.com",
        },
        {
          label: "Colmado",
          sub: "online orders and payments for bodegas and corner stores",
          href: "https://colmado.click",
        },
        {
          label: "reserv.click",
          sub: "free short links and QR codes",
          href: "https://reserv.click",
        },
        {
          label: "HemiAI",
          sub: "brand events and giveaways, results recorded on chain",
          href: "https://hemiai.click",
        },
      ],
    },
    {
      label: "SebasTN Inc.",
      sub: "the company: card, prepaid and digital-asset payments for businesses",
      sectors: ["payments"],
      children: [
        {
          label: "sebastn.com",
          sub: "plans, developers, security, company",
          href: "https://sebastn.com",
        },
        {
          label: "GitHat",
          sub: "sign-in for developers' apps",
          href: "https://githat.io",
        },
      ],
    },
    {
      label: "Security",
      sub: "fuzzing, invariants, symbolic proofs, adversarial review",
      sectors: ["security"],
      children: [
        {
          label: "How Access0x1 is reviewed",
          sub: "Foundry fuzz + invariant suites, Halmos, Slither, Aderyn",
          href: "https://access0x1.com/security",
        },
      ],
    },
    {
      label: "Recognition",
      sub: "three ETHGlobal events in 2026",
      children: [
        {
          label: "ETHGlobal New York 2026",
          sub: "Access0x1 · prize: Integrate ENS · certificate",
          href: "certificates/ethglobal-newyork-2026.html",
        },
        {
          label: "ETHGlobal Lisbon 2026",
          sub: "Access0x1 · certificate",
          href: "certificates/ethglobal-lisbon-2026.html",
        },
        {
          label: "ETHOnline 2026",
          sub: "certificate",
          href: "certificates/ethonline-2026.html",
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
  { key: "commerce", label: "Commerce" },
  { key: "security", label: "Security" },
];
