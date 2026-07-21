/*
 * check-verification.mjs — query each mirror-chain block explorer for the
 * router's source-verification status, and print { testnets, verified }.
 *
 * ONE Etherscan V2 key (ETHERSCAN_API_KEY, chain-id-routed) covers the
 * Etherscan-family + Fuji/Celo/zkSync; Blockscout (keyless) covers Arc +
 * Robinhood. Conservative by construction: an unreachable or ambiguous
 * explorer counts as NOT verified, so the number can only understate — never
 * inflate — the claim. Prints per-chain status to stderr, the JSON to stdout.
 * NEVER prints the key or the request URL.
 *
 * Env: ETHERSCAN_API_KEY (required for the Etherscan-family chains),
 *      ARC_SCAN_VERIFIER_URL (Arc Blockscout base).
 */
const ROUTER = '0xe92244e3368561faf21648146511dede3a475eb5'
const KEY = process.env.ETHERSCAN_API_KEY || ''
const ARC = process.env.ARC_SCAN_VERIFIER_URL || ''

// Each chain routed to its ACTUAL explorer family: Etherscan V2 (one key, by
// chain id) for the Etherscan-family; Etherscan-compatible `/api` (keyless) for
// Routescan (Fuji), zkSync, and Blockscout (Arc/Robinhood/Celo).
const CHAINS = [
  { id: 11155111, name: 'Ethereum Sepolia', kind: 'etherscan' },
  { id: 11155420, name: 'OP Sepolia', kind: 'etherscan' },
  { id: 421614, name: 'Arbitrum Sepolia', kind: 'etherscan' },
  { id: 84532, name: 'Base Sepolia', kind: 'etherscan' },
  { id: 43113, name: 'Avalanche Fuji', kind: 'etherscan' }, // Snowscan via Etherscan V2 (verified there, not Routescan)
  { id: 11142220, name: 'Celo Sepolia', kind: 'compat', base: 'https://celo-sepolia.blockscout.com' },
  { id: 300, name: 'zkSync Sepolia', kind: 'compat', base: 'https://block-explorer-api.sepolia.zksync.dev' },
  { id: 5042002, name: 'Arc', kind: 'compat', base: ARC },
  { id: 46630, name: 'Robinhood', kind: 'compat', base: 'https://explorer.testnet.chain.robinhood.com' },
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** One explorer query -> "yes" | "no" | "unknown" (the last on error/rate-limit). */
async function probe(c) {
  let url
  if (c.kind === 'etherscan') {
    if (!KEY) return 'unknown'
    url = `https://api.etherscan.io/v2/api?chainid=${c.id}&module=contract&action=getsourcecode&address=${ROUTER}&apikey=${KEY}`
  } else {
    if (!c.base) return 'unknown'
    // Normalize any base to its host root: strip a trailing "?", "/api", "/".
    const base = String(c.base).replace(/\/?api\/?\??$/i, '').replace(/\/+$/, '')
    url = `${base}/api?module=contract&action=getsourcecode&address=${ROUTER}`
  }
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!r.ok) return 'unknown'
  const j = await r.json()
  // Etherscan rate-limit / NOTOK come back as status "0" with a message.
  if (String(j.status) === '0' && /rate limit|max .*rate|NOTOK/i.test(String(j.message ?? j.result ?? '')))
    return 'unknown'
  const res = Array.isArray(j.result) ? j.result[0] : j.result
  if (!res) return 'unknown'
  const abi = String(res.ABI ?? res.abi ?? '')
  const src = String(res.SourceCode ?? res.sourceCode ?? '')
  if (/not verified/i.test(abi)) return 'no'
  return src.length > 0 ? 'yes' : 'no'
}

/** SEQUENTIAL with retries so rate-limits/transients don't produce false negatives. */
async function status(c) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const s = await probe(c)
      if (s !== 'unknown') return s
    } catch {
      /* transient — retry */
    }
    await sleep(900)
  }
  return 'unknown'
}

const results = []
for (const c of CHAINS) {
  results.push({ id: c.id, name: c.name, verified: (await status(c)) === 'yes' })
  await sleep(300) // stay under the free-tier rate limit
}
const verified = results.filter((r) => r.verified).length
console.error(
  results.map((r) => `  ${String(r.id).padStart(9)} ${r.name}: ${r.verified ? 'VERIFIED' : 'unverified/unknown'}`).join('\n'),
)
console.log(JSON.stringify({ testnets: CHAINS.length, verified }))
