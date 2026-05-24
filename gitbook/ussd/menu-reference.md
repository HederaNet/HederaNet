# Full USSD Menu Reference

This page documents every option in the HederaNet USSD menu tree. Dial **`*384*1#`** to access the main menu.

Navigation conventions used in this document:
- Numbers before `*` show the cumulative input to reach that menu
- "→" means "which leads to"
- Text in quotes shows the exact text displayed on the phone screen

---

## Main Menu

**Dial:** `*384*1#`

```
HederaNet - Welcome!
[Your Name] | Bal: [X] HBAR

1. My Account
2. Energy Market
3. Internet Services
4. Earnings
5. Register as Operator
0. Exit
```

**Input `1`** → My Account
**Input `2`** → Energy Market
**Input `3`** → Internet Services
**Input `4`** → Earnings
**Input `5`** → Register as Operator
**Input `0`** → Session ends

---

## Menu 1: My Account

**Input path:** `1`

```
My Account
1. Account Balance
2. Recent Transactions
3. My Subscription Status
4. Language Settings
0. Back
```

### 1*1 — Account Balance

**Input path:** `1*1`

```
Your Account
ID: 0.0.1234567
HBAR: 45.23 HBAR
USDC: 100.00 USDC
HNET: 500.00 HNET

Reply 0 to go back
```

Shows your Hedera Account ID and current balances for HBAR, USDC, and HNET.

---

### 1*2 — Recent Transactions

**Input path:** `1*2`

```
Recent Transactions:
1. SUBSCRIPTION +8.5 HBAR (SUCCESS)
   2026-05-20
2. ENERGY_TRADE +4.25 HBAR (SUCCESS)
   2026-05-18
3. STAKE -100 HBAR (SUCCESS)
   2026-05-15
4. REWARD +2.0 HBAR (SUCCESS)
   2026-05-14
5. FAUCET +100 USDC (SUCCESS)
   2026-05-12

Reply 0 to go back
```

Shows your last 5 transactions with type, direction, amount, and date.

---

### 1*3 — My Subscription Status

**Input path:** `1*3`

```
Active Subscriptions:
1. Node A3F9C2 (Lagos-01)
   Price: 5 HBAR/month
   Expires: 2026-06-20
   Status: ACTIVE

No more subscriptions.
Reply 0 to go back
```

If you have no active subscriptions:

```
No active subscriptions.
Go to Internet Services to
subscribe to a hotspot.

Reply 0 to go back
```

---

### 1*4 — Language Settings

**Input path:** `1*4`

```
Select Language:
1. English
2. Yoruba
3. Hausa
4. Swahili
0. Back
```

Enter the number for your preferred language. Your selection is saved to your account and applies to all future USSD sessions.

**Input `1*4*1`** → Language set to English, confirmation message shown.
**Input `1*4*2`** → Language set to Yoruba, all subsequent menus shown in Yoruba.
**Input `1*4*3`** → Language set to Hausa.
**Input `1*4*4`** → Language set to Swahili.

---

## Menu 2: Energy Market

**Input path:** `2`

```
Energy Market
1. View Listings
2. Buy Energy
3. Sell My Energy
4. My Energy Purchases
0. Back
```

---

### 2*1 — View Listings

**Input path:** `2*1`

```
Available Energy (Top 5):
1. Lagos-01: 0.05 HBAR/kWh
   50kWh left | GOLD operator
2. Abuja-03: 0.07 HBAR/kWh
   120kWh left | SILVER operator
3. Ibadan-02: 0.04 HBAR/kWh
   20kWh left | BRONZE operator
4. Kano-01: 0.06 HBAR/kWh
   80kWh left | GOLD operator
5. PHC-02: 0.05 HBAR/kWh
   35kWh left | SILVER operator

Enter # for details or 0 to go back
```

Listings are sorted by proximity to your registered location.

---

### 2*2 — Buy Energy

**Input path:** `2*2`

**Step 1:** View listings are shown (same as 2*1). Enter the listing number you want to buy from.

**Input `2*2*1`** → Selected listing 1 (Lagos-01):

```
Buy from Lagos-01
Price: 0.05 HBAR/kWh
Available: 50 kWh
Operator: GOLD tier

Enter kWh amount to buy:
(0 to cancel)
```

**Input `2*2*1*20`** → Entered 20 kWh:

```
Purchase Summary:
20 kWh @ 0.05 HBAR
Total: 1.00 HBAR

Your balance: 45.23 HBAR
After purchase: 44.23 HBAR

Confirm?
1. Yes - Buy Now
2. No - Cancel
```

**Input `2*2*1*20*1`** → Confirmed:

```
Purchase Successful!
20 kWh purchased from Lagos-01
Cost: 1.00 HBAR
Txn ID: abc123def456
Energy delivery in progress.

Reply 0 to go back
```

If insufficient balance:

```
Insufficient Balance!
You need 1.00 HBAR
Your balance: 0.45 HBAR
Shortfall: 0.55 HBAR

Earn more HBAR by deploying
infrastructure or use the
web app to swap tokens.

Reply 0 to go back
```

---

### 2*3 — Sell My Energy (Operators Only)

**Input path:** `2*3`

If you are not an operator:

```
Operator Access Required
Register as an operator to
list energy for sale.

Select 5 from main menu
to register.

Reply 0 to go back
```

If you are an operator:

**Step 1 — Select installation:**

```
Your Solar Installations:
1. Lagos-01 (5kW) - Active
2. + Register New Installation
0. Back
```

**Input `2*3*1`** → Selected installation:

```
Create Energy Listing
Installation: Lagos-01

Enter price per kWh in HBAR
(e.g. 0.05):
```

**Input `2*3*1*0.05`** → Entered price:

```
Enter available kWh:
(max 500):
```

**Input `2*3*1*0.05*100`** → Entered units:

```
Listing Summary:
100 kWh @ 0.05 HBAR/kWh
Total value: 5.00 HBAR

Confirm listing?
1. Yes - Create Listing
2. No - Cancel
```

**Input `2*3*1*0.05*100*1`** → Confirmed:

```
Listing Created!
100 kWh available at 0.05 HBAR/kWh
Visible to all buyers immediately.

Reply 0 to go back
```

---

### 2*4 — My Energy Purchases

**Input path:** `2*4`

```
Recent Energy Purchases:
1. Lagos-01: 20 kWh
   Cost: 1.00 HBAR | 2026-05-20
   Status: DELIVERED
2. Abuja-03: 50 kWh
   Cost: 3.50 HBAR | 2026-05-10
   Status: DELIVERED

Reply 0 to go back
```

---

## Menu 3: Internet Services

**Input path:** `3`

```
Internet Services
1. Available Hotspots Near Me
2. Subscribe to Internet
3. My Current Plan
4. Upgrade Plan
5. Check Data Balance
0. Back
```

---

### 3*1 — Available Hotspots Near Me

**Input path:** `3*1`

```
Hotspots Near You (Top 5):
1. A3F9C2 (Lagos-01)
   5 HBAR/month | 95% uptime
   Radius: 500m | GOLD
2. B7D3A1 (Lagos-02)
   3 HBAR/month | 88% uptime
   Radius: 300m | SILVER
3. C2F8E4 (Lagos-03)
   4 HBAR/month | 91% uptime
   Radius: 400m | GOLD

Enter # for details or 0 to back
```

---

### 3*2 — Subscribe to Internet

**Input path:** `3*2`

Hotspot list shown. Enter number to select.

**Input `3*2*1`** → Selected hotspot A3F9C2:

```
Subscribe to A3F9C2 (Lagos-01)

Monthly Price: 5 HBAR
Coverage: 500m radius
Uptime: 95% (last 30 days)
Operator: GOLD tier

Your balance: 45.23 HBAR
After payment: 40.23 HBAR

Subscribe for 1 month?
1. Yes - Subscribe Now
2. No - Cancel
```

**Input `3*2*1*1`** → Confirmed:

```
Subscription Active!
Hotspot: A3F9C2 (Lagos-01)
Cost: 5.00 HBAR
Expires: 2026-06-23

You now have internet access.
Reply 0 to go back
```

---

### 3*3 — My Current Plan

**Input path:** `3*3`

```
Your Subscriptions:
1. A3F9C2 (Lagos-01)
   5 HBAR/month
   Expires: 2026-06-23
   Days remaining: 30
   Status: ACTIVE

Reply 1 to renew
Reply 0 to go back
```

---

### 3*4 — Upgrade Plan

**Input path:** `3*4`

Shows available hotspots with higher coverage or uptime than your current subscription, sorted by upgrade value.

---

### 3*5 — Check Data Balance

**Input path:** `3*5`

```
Internet Status:
Active Subscription: YES
Hotspot: A3F9C2 (Lagos-01)
Days Remaining: 30
Coverage: Within range
Status: CONNECTED

Reply 0 to go back
```

---

## Menu 4: Earnings

**Input path:** `4`

```
Earnings
1. Today's Earnings
2. This Month's Earnings
3. Withdraw to Mobile Money
4. Transaction History
0. Back
```

---

### 4*1 — Today's Earnings

**Input path:** `4*1`

```
Today's Earnings (2026-05-23):
Subscriptions: +8.5 HBAR
Energy Sales:  +4.25 HBAR
Rewards:       +0.50 HBAR
             ──────────────
Total Today:  +13.25 HBAR
($0.93 USD at $0.07/HBAR)

Reply 0 to go back
```

---

### 4*2 — This Month's Earnings

**Input path:** `4*2`

```
May 2026 Earnings:
Subscriptions: +85.00 HBAR
Energy Sales:  +42.50 HBAR
Rewards:       +12.00 HBAR
             ──────────────
Month Total: +139.50 HBAR
($9.77 USD at $0.07/HBAR)

Reply 0 to go back
```

---

### 4*3 — Withdraw to Mobile Money

**Input path:** `4*3`

See [Mobile Money Withdrawal](mobile-money.md) for the full flow.

```
Withdraw to Mobile Money

Supported:
1. M-Pesa
2. MTN MoMo
3. Airtel Money
0. Back

Select provider:
```

---

### 4*4 — Transaction History

**Input path:** `4*4`

```
Last 10 Transactions:
1. SUBSCRIPTION +8.5 HBAR SUCCESS
2. ENERGY_TRADE +4.25 HBAR SUCCESS
3. STAKE -100 HBAR SUCCESS
4. REWARD +2.0 HBAR SUCCESS
5. SUBSCRIPTION +8.5 HBAR SUCCESS
6. ENERGY_TRADE +3.50 HBAR SUCCESS
7. UNSTAKE +50 HBAR SUCCESS
8. REWARD +1.0 HBAR SUCCESS
9. SUBSCRIPTION +8.5 HBAR SUCCESS
10.FAUCET +100 USDC SUCCESS

Reply 0 to go back
```

---

## Menu 5: Register as Operator

**Input path:** `5`

```
Register as Operator

To deploy hotspots and list
energy, register as an operator.

1. Start Registration
0. Back
```

**Input `5*1`** → Start registration:

```
Operator Registration
Step 1 of 3

Enter your country:
(e.g. Nigeria)
```

**Input `5*1*Nigeria`** → Enter city:

```
Operator Registration
Step 2 of 3

Enter your city:
(e.g. Lagos)
```

**Input `5*1*Nigeria*Lagos`** → Enter latitude:

```
Operator Registration
Step 3 of 3

Enter latitude (e.g. 6.5244):
```

**Input `5*1*Nigeria*Lagos*6.5244`** → Enter longitude:

```
Enter longitude (e.g. 3.3792):
```

**Input `5*1*Nigeria*Lagos*6.5244*3.3792`** → Confirmation:

```
Registration Summary:
Country: Nigeria
City: Lagos
Location: 6.5244, 3.3792

Submit registration?
1. Yes - Register
2. No - Cancel
```

**Input `5*1*Nigeria*Lagos*6.5244*3.3792*1`** → Submitted:

```
Registration Submitted!

Your operator profile is
being created. You will
receive an SMS confirmation
within 5 minutes.

You can now deploy hotspots
and list energy via the
web app or USSD.

Reply 0 to exit
```
