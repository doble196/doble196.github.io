/*
 * gen-live-stats.mjs — regenerate assets/js/live-stats.js from real numbers.
 *
 * Run by .github/workflows/live-stats.yml (scheduled). It does NOT compute the
 * numbers itself — the workflow measures them (forge test --list for the pass
 * count; block-explorer queries for verification, when a key is present) and
 * passes them in as env vars. This script only rewrites the committed file,
 * preserving its structure + comment so it stays the human-readable fallback.
 *
 * Env (all optional — a missing/blank value LEAVES the committed number as the
 * last-known-good fallback, never blanks it):
 *   STAT_TESTS, STAT_VERIFIED, STAT_TESTNETS, STAT_CHAINS  (positive ints)
 *   STAT_DATE  (YYYY-MM-DD; the "as of" stamp)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'js', 'live-stats.js')
let src = readFileSync(FILE, 'utf8')

const NUMS = {
  tests: process.env.STAT_TESTS,
  verified: process.env.STAT_VERIFIED,
  testnets: process.env.STAT_TESTNETS,
  chainsTotal: process.env.STAT_CHAINS,
}

let changed = 0
for (const [key, raw] of Object.entries(NUMS)) {
  if (raw == null || raw === '') continue
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) {
    console.error(`skip ${key}: not a positive integer (${raw})`)
    continue
  }
  const re = new RegExp(`(\\b${key}:\\s*)\\d+`)
  if (!re.test(src)) {
    console.error(`WARN: key '${key}' not found in live-stats.js`)
    continue
  }
  const next = src.replace(re, `$1${n}`)
  if (next !== src) changed++
  src = next
}

const date = process.env.STAT_DATE
if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
  const next = src.replace(/(checkedAt:\s*")[^"]*(")/, `$1${date}$2`)
  if (next !== src) changed++
  src = next
}

writeFileSync(FILE, src)
console.log(`live-stats.js regenerated (${changed} field(s) changed):`, { ...NUMS, date })
