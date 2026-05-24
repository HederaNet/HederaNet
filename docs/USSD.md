# USSD Integration Guide

## Overview

HederaNet provides USSD access via **Africa's Talking** for feature phone users across Africa.

**Short code:** `*384*1#`

## Menu Tree

```
*384*1# → Main Menu
├── 1. My Account
│   ├── 1. View Balance (HBAR + HNET + HEC)
│   ├── 2. Recent Transactions (last 3)
│   └── 3. Subscription Status
├── 2. Energy Market
│   ├── 1. View Listings (near location)
│   ├── 2. Buy Energy → select listing → confirm
│   └── 3. Sell Energy → enter kWh → set price → list
├── 3. Internet Services
│   ├── 1. View My Plan
│   ├── 2. Upgrade Plan
│   └── 3. Check Data Balance
├── 4. Earnings
│   ├── 1. Today's Earnings
│   ├── 2. This Month
│   └── 3. Withdraw to Mobile Money (M-Pesa / MTN MoMo)
└── 5. Register as Operator
    ├── 1. Register Node (enter GPS)
    ├── 2. Set Price
    └── 3. Go Live
```

## Integration

### Africa's Talking Webhook

Africa's Talking sends POST requests to your USSD endpoint:

```
POST /ussd
Content-Type: application/x-www-form-urlencoded

sessionId=&serviceCode=*384*1#&phoneNumber=+254712345678&text=1*2
```

The `text` field is cumulative: `1*2` means user entered `1` at first prompt, then `2`.

### Session Management

Sessions stored in Redis with 5-minute TTL. Each session tracks:
- `phoneNumber` — linked Hedera account
- `menuState` — current menu position
- `data` — transaction in progress (amount, listing selected, etc.)

Rate limit: **10 sessions per phone number per hour**.

### Mobile Money Withdrawal

Withdrawals convert HBAR → local fiat via Flutterwave:
1. User enters amount in HBAR
2. System calculates fiat equivalent (real-time rate)
3. Flutterwave processes M-Pesa/MTN MoMo disbursement
4. SMS confirmation sent

## Language Support

Language is auto-detected from phone number prefix:

| Prefix | Language |
|--------|----------|
| +254 (Kenya) | Swahili |
| +234 (Nigeria) | English (default) |
| Others | English |

To add a language, extend `services/ussd/src/i18n/strings.ts`.

## Local Development

```bash
# Start USSD service
pnpm --filter @hederanet/ussd dev

# Test with Africa's Talking simulator (or curl)
curl -X POST http://localhost:5000/ussd \
  -d 'sessionId=test123&serviceCode=*384*1#&phoneNumber=+254712345678&text='
```
