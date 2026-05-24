# Testnet vs Mainnet

HederaNet currently operates on the **Hedera testnet** — a sandbox environment where all tokens have no real monetary value. When the platform launches on **mainnet**, real money will be involved. Understanding the differences is critical before using HederaNet with real funds.

---

## Side-by-Side Comparison

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| **HBAR value** | No real monetary value | Real money — publicly traded |
| **USDC** | Custom HederaNet token (0.0.9038720) | Circle's official USDC (0.0.456858) |
| **USDC Faucet** | 100 USDC free every 24 hours | Not available |
| **Account keys** | Custodial — platform holds encrypted keys | Non-custodial — you hold your own keys |
| **KYC enforcement** | Not enforced — all features accessible | Required for operators above thresholds |
| **Energy trades** | IoT delivery simulated | Real IoT meter readings required |
| **Gas fees** | Free or negligible (testnet allocation) | Real HBAR consumed (~$0.0001/tx) |
| **Smart contracts** | Testnet deployments | Mainnet deployments (new addresses) |
| **HashScan URL** | `https://hashscan.io/testnet` | `https://hashscan.io/mainnet` |
| **Financial risk** | None | Real funds at stake |
| **Wallet type** | Platform-managed (custodial) | Self-custody wallet (e.g., HashPack) |

---

## How to Know Which Network You Are On

### Check the App URL

The testnet app runs at:
`https://hederanet.vercel.app`

The mainnet app will run at a different domain (to be announced).

### Check Your HashScan Links

If the HashScan links in your profile point to `hashscan.io/testnet`, you are on testnet. Mainnet links point to `hashscan.io/mainnet` (no subdomain modifier) or `hashscan.io`.

### Check the API Health Endpoint

The API health endpoint reveals the network configuration:
```
GET https://api.hederanet.online/health
```
The response includes the network environment (`testnet` or `mainnet`).

---

## Custodial vs Non-Custodial Accounts

### Testnet: Custodial

On testnet, when you sign up, the platform:
1. Generates a Hedera account keypair on your behalf.
2. Encrypts your private key using AES-256-GCM.
3. Stores the encrypted key in the secure platform database.
4. Signs all your transactions server-side on your behalf.

You never see your private key. You authenticate with your email/password or Google, not with a Hedera key.

**This is acceptable on testnet** because testnet HBAR has no value. If the platform were hacked, nothing of real value could be lost.

### Mainnet: Non-Custodial

On mainnet, users will hold their own private keys using a self-custody wallet like **HashPack** (the leading Hedera wallet):
- Your private key never leaves your device.
- The platform never has custody of your funds.
- You sign transactions directly in your wallet.
- If you lose your private key / seed phrase, your funds are permanently inaccessible — no one can recover them.

**Account migration:** When mainnet launches, existing testnet users will be guided through a migration process to create non-custodial mainnet accounts.

---

## Token Migration

### USDC

Testnet USDC (0.0.9038720) will be replaced by Circle's official USDC (0.0.456858). The platform's `USDC_TOKEN_ID` configuration changes — all other code remains the same. Testnet USDC balances will not carry over to mainnet.

### HNET, HEC, HCC

These tokens will be redeployed on mainnet with new token IDs. A fair distribution or airdrop process for mainnet tokens will be determined through governance. Testnet token balances are for testing only and do not represent a claim to mainnet tokens.

---

## Energy Delivery

### Testnet
IoT delivery is simulated. When a buyer confirms an energy purchase, the platform immediately marks the trade as completed and transfers funds. No physical hardware verification occurs.

### Mainnet
Physical IoT meters on solar installations must report actual energy generation. Oracle nodes read the meter data and a 3-of-5 multi-signature confirmation is required before funds are released from escrow. Operators without IoT hardware will not be able to list energy on mainnet.

---

## Financial Caution for Mainnet

> ⚠️ **Warning:** When HederaNet launches on mainnet, all transactions will involve real money. Mistakes — such as sending funds to the wrong address, losing a private key, or falling for a phishing site — are irreversible. Always verify you are using the official HederaNet URL before connecting your wallet or signing transactions.

Watch the official HederaNet channels for the mainnet launch announcement:
- Twitter/X: @HederaNet
- Discord: https://discord.gg/hederanet
- Email: Check your registered email for the announcement
