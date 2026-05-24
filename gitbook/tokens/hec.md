# HEC — Hedera Energy Credits

Hedera Energy Credits (HEC) are the digital representation of verified solar energy generation on HederaNet. Each HEC token certifies that exactly 1 kWh of real solar electricity was produced and measured by a connected IoT device.

---

## Token Details

| Property | Value |
|----------|-------|
| **Name** | Hedera Energy Credits |
| **Symbol** | HEC |
| **Token ID (Testnet)** | 0.0.7153605 |
| **1 HEC = ** | 1 kilowatt-hour of verified solar energy |
| **Decimals** | 2 (minimum unit: 0.01 kWh) |
| **Supply** | Infinite (minted on verified generation) |
| **Testnet Price** | AMM-derived (initial seed: $0.002, moves with trading) |
| **Price Source** | Constant-product AMM pool (500,000 HEC / 1,000 USDC initial reserves) |
| **Type** | HTS Fungible Token |

---

## What HEC Represents

HEC is a **Renewable Energy Certificate (REC)** on the blockchain. RECs are a well-established concept in energy markets — every time a solar panel generates 1 kWh of electricity, it can receive a certificate proving that the energy was produced from a clean, renewable source.

Traditional RECs are issued by regional registries, are expensive to track, and are often double-counted or fraudulently issued. HEC solves these problems:

- **On-chain issuance** — HEC is minted by the EnergyMarket smart contract after IoT oracle confirmation, creating an immutable record tied to a specific solar installation.
- **No double counting** — Once HEC is minted for a specific IoT reading, that reading is marked as processed — it cannot be submitted again.
- **Publicly verifiable** — Every HEC token, its minting event, and the originating transaction are viewable on HashScan.

---

## How HEC Is Minted

The HEC minting process involves three systems working together:

```
Solar panel generates electricity
        │
        ▼
IoT smart meter records kWh output
        │
        ▼
Oracle network (3-of-5 multi-sig) confirms reading
        │
        ▼
EnergyMarket contract (0.0.7153712) mints HEC
        │
        ▼
HEC credited to operator's Hedera account
(1 HEC per 1 confirmed kWh)
```

On testnet, step 2 and 3 are simulated. On mainnet, actual hardware readings are required.

---

## Why HEC Price Could Rise

HEC currently trades at $0.002 on testnet as a reference price. Several factors could drive mainnet HEC value higher:

1. **ESG compliance demand** — Corporations worldwide face pressure to offset carbon emissions. HEC tokens, backed by verified African solar generation, are a new source of RECs for ESG reporting.

2. **African energy market growth** — Sub-Saharan Africa is one of the fastest-growing solar markets globally. As more solar capacity connects to HederaNet, more HEC is generated — but demand from ESG buyers could grow faster.

3. **Liquidity premium** — Traditional RECs are illiquid, requiring brokers and paperwork. HEC tokens are instantly transferable on Hedera with settlement in 5 seconds.

4. **Carbon credit integration** — Future governance proposals may explore integrating HEC with international carbon credit standards, potentially allowing HEC to be converted into verified carbon offsets.

---

## Getting HEC

| Method | Description |
|--------|-------------|
| **Deploy solar panels** | Register a solar installation and create energy listings. HEC is minted to you when buyers purchase kWh and IoT confirms delivery. |
| **Swap USDC → HEC** | Use the [Swap page](../market/swapping-tokens.md) to buy HEC directly |
| **Swap HBAR → HEC** | Available via the swap interface |

---

## Selling HEC

Once you hold HEC, you can:

1. **Sell via Swap** — Swap HEC → USDC or HEC → HBAR on the [Swap page](../market/swapping-tokens.md).
2. **Hold for appreciation** — If ESG demand grows, HEC price on mainnet may rise.
3. **Future: institutional sales** — Governance may enable bulk HEC sales to corporate ESG buyers through a dedicated interface.

---

## Decimal Precision

HEC has 2 decimal places, meaning you can hold as little as 0.01 HEC (representing 10 watt-hours of solar generation). This precision is important for small-scale solar installations where daily generation might be measured in single-digit kWh.

---

## Token ID Verification

Verify HEC on HashScan:
`https://hashscan.io/testnet/token/0.0.7153605`

The token page shows total minted supply (which grows as energy is generated), all holder accounts, and the minting transaction history.
