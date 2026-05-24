# USSD Access (*384*1#)

HederaNet is accessible from any mobile phone — not just smartphones. By dialing `*384*1#`, users on feature phones (the most common phone type across rural Africa) can check balances, buy energy, subscribe to internet services, check earnings, and register as operators — all without a data connection.

---

## Why USSD?

Over 3.5 billion feature phones are in use across Africa. USSD (Unstructured Supplementary Service Data) is a protocol that works on every GSM network and every type of mobile phone. It requires no internet connection, no data bundle, and no smartphone app. A session is just a text dialogue between the user and the platform, delivered over the mobile network in real time.

HederaNet's USSD gateway is powered by **Africa's Talking**, a leading African communications API provider. When you dial `*384*1#`, your request routes through Africa's Talking to the HederaNet USSD service, which connects to your account and executes actions on your behalf.

---

## Getting Started

### What You Need

- Any mobile phone with a SIM card on a supported network
- Your phone number registered with HederaNet (linked to your account)
- HBAR balance (for purchases) or an account to check

### Linking Your Phone Number

On your first USSD session, you will be prompted to link your phone number to your HederaNet account. This is a one-time step that associates your mobile number with your Hedera account ID, allowing the USSD service to identify you.

---

## Dialing In

Dial: **`*384*1#`**

The main menu appears immediately:

```
HederaNet - Welcome!
1. My Account
2. Energy Market
3. Internet Services
4. Earnings
5. Register as Operator
0. Exit
```

Enter the number for your desired option and press **Send** (or the equivalent on your phone).

---

## Session Management

- **Timeout:** USSD sessions expire after **5 minutes** of inactivity. If your session expires, simply re-dial `*384*1#` to start a new one.
- **Input format:** USSD uses cumulative input. When you see `1*2*50`, it means you first pressed `1`, then `2`, then typed `50`.
- **Navigation:** Press `0` or type `back` at any sub-menu to return to the previous level.

---

## Language Support

HederaNet's USSD service supports multiple languages. The language is automatically selected based on your phone number's country prefix:

| Country Code | Language |
|-------------|---------|
| +254 (Kenya) | Swahili |
| +234 (Nigeria) | English |
| +256 (Uganda) | English |
| All others | English |

Yoruba and Hausa are also available for Nigerian users who select them in the Account settings sub-menu.

---

## Menu 1: My Account

```
My Account
1. Account Balance
2. Recent Transactions
3. My Subscription Status
4. Language Settings
0. Back
```

| Option | What It Shows |
|--------|--------------|
| **1. Account Balance** | Your current HBAR balance and USDC balance |
| **2. Recent Transactions** | Last 5 transactions with type, amount, and date |
| **3. My Subscription Status** | Active hotspot subscriptions and expiry dates |
| **4. Language Settings** | Switch between English, Yoruba, Hausa, Swahili |

---

## Menu 2: Energy Market

```
Energy Market
1. View Listings
2. Buy Energy
3. Sell My Energy
4. My Energy Purchases
0. Back
```

| Option | What Happens |
|--------|-------------|
| **1. View Listings** | Shows the top 5 available energy listings nearest to your registered location with price/kWh |
| **2. Buy Energy** | Enter listing number → enter kWh amount → confirm → purchase executed |
| **3. Sell My Energy** | Operators: enter price/kWh and available units to create a new listing |
| **4. My Energy Purchases** | View your last 5 energy purchase records |

### Buying Energy via USSD: Step-by-Step

```
Input path: *384*1# → 2 → 2

View Listings:
1. Lagos-01: 0.05 HBAR/kWh (50kWh left)
2. Abuja-03: 0.07 HBAR/kWh (120kWh left)
3. Ibadan-02: 0.04 HBAR/kWh (20kWh left)

Enter listing number: 1

Enter kWh to buy: 20

Summary:
20 kWh @ 0.05 HBAR = 1.0 HBAR
Confirm? 1=Yes, 2=No: 1

SUCCESS! 20kWh purchased.
Txn: abc123
```

---

## Menu 3: Internet Services

```
Internet Services
1. Available Hotspots Near Me
2. Subscribe to Internet
3. My Current Plan
4. Upgrade Plan
5. Check Data Balance
0. Back
```

| Option | What Happens |
|--------|-------------|
| **1. Available Hotspots** | Lists the nearest 5 active hotspots with monthly price |
| **2. Subscribe** | Select hotspot number → confirm price → subscription activated |
| **3. My Current Plan** | Shows active hotspot, expiry date, operator details |
| **4. Upgrade Plan** | Switch to a different or higher-priced hotspot |
| **5. Check Data Balance** | Shows subscription status and days remaining |

---

## Menu 4: Earnings

```
Earnings
1. Today's Earnings
2. This Month's Earnings
3. Withdraw to Mobile Money
4. Transaction History
0. Back
```

| Option | What Happens |
|--------|-------------|
| **1. Today's Earnings** | Total HBAR earned in the last 24 hours |
| **2. This Month's Earnings** | Cumulative HBAR earned this calendar month |
| **3. Withdraw** | Initiate a mobile money withdrawal (see [Mobile Money](../ussd/mobile-money.md)) |
| **4. Transaction History** | Last 10 earnings transactions with type and amount |

---

## Menu 5: Register as Operator

```
Register as Operator
Enter your city: Lagos
Enter latitude (e.g. 6.5244): 6.5244
Enter longitude (e.g. 3.3792): 3.3792

Registration submitted!
Your operator profile is being created.
You will receive an SMS confirmation.
```

This submits an operator registration request from your USSD session. The platform links the registration to your account identified by your phone number.

---

## Limitations vs Web App

USSD provides core functionality but has limitations compared to the web interface:

| Feature | USSD | Web App |
|---------|------|---------|
| Buy energy | Yes | Yes |
| Buy internet | Yes | Yes |
| Check balance | Yes | Yes |
| Swap tokens | No | Yes |
| Governance voting | No | Yes |
| View earnings chart | No | Yes |
| Manage hotspots | No | Yes |
| Claim USDC faucet | No | Yes |
| Avatar/profile photo | No | Yes |

For full platform access, use the web app at [https://hederanet.vercel.app](https://hederanet.vercel.app).
