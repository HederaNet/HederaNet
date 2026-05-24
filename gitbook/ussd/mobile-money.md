# Mobile Money Withdrawal

HederaNet lets you withdraw HBAR earnings directly to your mobile money account — M-Pesa, MTN MoMo, or Airtel Money — without a bank account or crypto exchange. This is powered by Flutterwave, a leading African payment infrastructure provider.

---

## How It Works

When you initiate a mobile money withdrawal:

1. You specify the amount of HBAR to withdraw.
2. HederaNet calculates the fiat equivalent using the current HBAR exchange rate.
3. The system transfers your HBAR from your Hedera account to the HederaNet withdrawal address.
4. Flutterwave processes the fiat disbursement to your registered mobile money number.
5. You receive an SMS confirmation from your mobile money provider.

All of this happens within 1 to 5 minutes under normal conditions.

---

## Supported Mobile Money Providers

| Provider | Countries Supported |
|----------|-------------------|
| **M-Pesa** | Kenya, Tanzania, Mozambique |
| **MTN MoMo** | Nigeria, Ghana, Uganda, Cameroon, Rwanda |
| **Airtel Money** | Uganda, Tanzania, Zambia, Malawi, DRC, Congo |

> ℹ️ **Note:** Availability depends on Flutterwave's coverage in your specific country and network. Additional providers may be added through governance proposals.

---

## How to Withdraw via USSD

### Step 1: Access Earnings Menu

Dial `*384*1#` → Select `4` (Earnings) → Select `3` (Withdraw to Mobile Money).

### Step 2: Select Your Provider

```
Withdraw to Mobile Money

Supported:
1. M-Pesa
2. MTN MoMo
3. Airtel Money
0. Back

Select provider:
```

Enter `1`, `2`, or `3` for your provider.

### Step 3: Confirm Your Phone Number

```
Withdraw via M-Pesa

Sending to: +254 700 XXX XXX
(Your registered number)

Is this correct?
1. Yes - Continue
2. No - Update Number
```

If you need to update your mobile money number, select `2` and enter the new number.

### Step 4: Enter Withdrawal Amount

```
Enter HBAR amount to withdraw:
(Min: 10 HBAR, Max: 500 HBAR)

Your balance: 139.50 HBAR
```

Enter the amount you want to withdraw (e.g., `50`).

### Step 5: Review the Fiat Equivalent

```
Withdrawal Summary:

You withdraw: 50 HBAR
Exchange rate: 1 HBAR = 9.50 KES
You receive: 475 KES

Flutterwave fee: ~0.5 HBAR
(deducted from HBAR amount)

Final receive: 472 KES via M-Pesa

Confirm?
1. Yes - Withdraw Now
2. No - Cancel
```

The fiat equivalent is calculated using a live HBAR exchange rate fetched at the time of the transaction. The displayed amount is what you will receive in local currency.

### Step 6: Confirm and Receive

```
Withdrawal Processing!

50 HBAR → 475 KES via M-Pesa
Ref: WD-2026-05230012

You will receive an M-Pesa
SMS within 1-5 minutes.

Reply 0 to exit
```

An M-Pesa (or equivalent) SMS confirms the receipt of funds on your mobile money account.

---

## On-Chain Record

Every withdrawal creates an on-chain record:

1. **HBAR transfer** — Your HBAR moves from your Hedera account to the HederaNet withdrawal address. This is visible on HashScan.
2. **Transaction record** — A `WITHDRAWAL` transaction is created in your HederaNet earnings history with the HBAR amount, fiat equivalent, provider, and status.
3. **Audit trail** — The Flutterwave disbursement ID is stored alongside the on-chain transaction ID for cross-reference.

---

## Processing Time

| Condition | Expected Time |
|-----------|--------------|
| Normal operations | 1–5 minutes |
| High volume periods | 5–15 minutes |
| Provider system maintenance | Up to 2 hours |
| Network holiday/weekend | Standard SLAs apply |

If you do not receive your mobile money within 30 minutes, contact support at support@hederanet.online with your withdrawal reference number (e.g., `WD-2026-05230012`).

---

## Minimum and Maximum Amounts

| Limit | Amount |
|-------|--------|
| **Minimum withdrawal** | 10 HBAR (~$0.70) |
| **Maximum single withdrawal** | 500 HBAR (~$35) |
| **Daily withdrawal limit** | 1,000 HBAR (~$70) |
| **Monthly withdrawal limit** | 10,000 HBAR (~$700) |

Limits may vary by country due to mobile money provider regulations. Higher limits may be available for KYC-approved operators with verified identity.

---

## Fees

Flutterwave charges a processing fee that varies by country and provider. The fee is shown as an HBAR deduction in the withdrawal confirmation screen before you confirm. Typical fees range from 0.5% to 2% of the transaction value.

HederaNet does not charge an additional withdrawal fee beyond the Flutterwave processing cost.

---

## First-Time Setup: Linking Your Phone Number

To withdraw to mobile money, your phone number must be linked to your HederaNet account:

1. **Via USSD:** Your number is automatically associated when you first dial `*384*1#` and complete the account linking prompt.
2. **Via Web App:** Go to your Profile page and enter your mobile number in the withdrawal settings (when available).

Make sure your registered number is the same active mobile money number where you want to receive funds. Withdrawals sent to the wrong number cannot be reversed.

---

## Withdrawal via Web App

Mobile money withdrawal will also be available through the web app Dashboard → Earnings page. The USSD withdrawal path is provided for users who prefer or need feature phone access. Both paths use the same Flutterwave integration and produce the same on-chain transaction record.
