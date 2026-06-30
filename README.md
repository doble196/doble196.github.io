# <!-- IDENTITY:name -->Rensley R.<!-- /IDENTITY:name --> — Portfolio

**Live:** [doble196.github.io](https://doble196.github.io)

## About

> 🛠️ <!-- IDENTITY:status -->building Access0x1 — open-source onchain payments<!-- /IDENTITY:status -->

Builder based in NYC. I work across the full stack — from on-chain protocols to AI agents to multi-tenant SaaS — and care about shipping things that work end-to-end. The Vyper-pilled dev.

## What I work on

- **On-chain** — smart-contract development and security review across EVM and a few non-EVM chains
- **AI agents** — agentic workflows, retrieval, and orchestration around modern LLMs
- **Fullstack web** — modern frontend stacks, typed APIs, AWS-native edge
- **Data / forecasting** — time-series modeling and algorithmic trading research

Comfortable across several languages and ecosystems; usually picking up another. Still learning every week.

## Building

<!-- IDENTITY:fleet_links -->
- **[Access0x1](https://github.com/Access0x1/Access0x1)** — Open-source onchain payments + identity rail
- **[NFTeria](https://nfteria.click)** — Onchain commerce built on Access0x1
<!-- /IDENTITY:fleet_links -->


## Access0x1 — live onchain

Open-source, on-chain payments + commerce + identity layer. One shared, multi-tenant router — zero custody, USD-priced via Chainlink feeds read in-tx, exact fee-split — joined with one permissionless call. Source-verified on Base Sepolia, Ethereum + Optimism Sepolia, and Avalanche Fuji (Arc Testnet + Robinhood Chain deployed, verification pending); deployment and repo activity below refresh on each daily sync.

<!-- IDENTITY:access0x1_card -->
- **Router (Arc Testnet):** `0xA5982ea8842Eea97C6e313A5f75FD8CF72C69Aad` (verification pending)
- **Router (Base Sepolia):** [`0xec89c9eE…6E8E57`](https://sepolia.basescan.org/address/0xec89c9eE28AF42Ae2b917BB0bAe245EAad6E8E57#code)
- **Repo:** [Access0x1/Access0x1](https://github.com/Access0x1/Access0x1)
<!-- /IDENTITY:access0x1_card -->

### ETHGlobal Hacker Pack

An on-chain credential — the EG-HACKER token held on Optimism (contract `0x32382a82d9faDc55f971f33DaEeE5841cfbADbE0`, wallet `0x53c61cfb8128ad59244e8c1d26109252ace23d14`, balance 1).

```js
// ETHGlobal Hacker Pack — onchain holder check (Optimism)
const { ethers } = require('ethers'); // npm install ethers
const provider = new ethers.JsonRpcProvider('https://mainnet.optimism.io');

const pack   = '0x32382a82d9faDc55f971f33DaEeE5841cfbADbE0'; // ETHGlobal Hacker Pack (EG-HACKER)
const wallet = '0x53c61cfb8128ad59244e8c1d26109252ace23d14';
const abi    = ['function balanceOf(address owner) view returns (uint256)'];

const held = await new ethers.Contract(pack, abi, provider).balanceOf(wallet);
console.log(`${wallet} ${held > 0n ? 'is' : 'is not'} a pack holder`); // → is  (balance: 1)
```

## Background

**Cyfrin Updraft (2024)** — Smart-contract security, auditing, DeFi protocol design, account abstraction, DAO governance, formal verification.

**Columbia FinTech Executive Bootcamp (2022)** — Six-month intensive on blockchain + financial applications, algorithmic trading, forecasting.

## Contact

<!-- IDENTITY:contact -->
- **Email:** [rensley@nfteria.cc](mailto:rensley@nfteria.cc)
- **X:** [@VyperPilledDev](https://x.com/VyperPilledDev)
- **GitHub:** [@doble196](https://github.com/doble196)
- **Location:** New York, NY
<!-- /IDENTITY:contact -->

