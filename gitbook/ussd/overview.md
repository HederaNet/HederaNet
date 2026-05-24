# USSD Overview

HederaNet is designed for Africa — and Africa runs on feature phones. The USSD gateway brings the full power of the HederaNet platform to any mobile phone with a SIM card, no smartphone or internet connection required.

---

## Why USSD Matters

Over 3.5 billion feature phones are in active use across sub-Saharan Africa. In countries like Nigeria, Ethiopia, Tanzania, and Cameroon, basic keypad phones significantly outnumber smartphones in rural and peri-urban areas. These are the communities HederaNet is built for — and they cannot be excluded because they lack a $200+ smartphone.

**USSD (Unstructured Supplementary Service Data)** is a protocol built into every GSM network since the 1990s. When you dial `*384*1#`, your mobile network sends the request directly to HederaNet's servers. A text-based menu returns to your screen. You navigate with number keys. No app download, no internet connection, no data bundle required.

---

## What You Can Do via USSD

| Feature | Available via USSD |
|---------|:------------------:|
| Check HBAR balance | Yes |
| View recent transactions | Yes |
| Buy solar energy | Yes |
| Create an energy listing | Yes |
| Subscribe to internet hotspot | Yes |
| Check subscription status | Yes |
| View today's and monthly earnings | Yes |
| Withdraw earnings to mobile money | Yes |
| Register as an operator | Yes |
| Change language preference | Yes |
| Token market swaps | No |
| Governance voting | No |
| View earnings chart | No |
| Upload avatar | No |
| Manage hotspot details | No |

The USSD interface covers the highest-frequency, most economically important actions. For full platform management, use the web app at [https://hederanet.vercel.app](https://hederanet.vercel.app).

---

## How to Access HederaNet via USSD

Dial: **`*384*1#`**

This works on:
- Any GSM mobile network (MTN, Airtel, Safaricom, Glo, etc.)
- Any feature phone or smartphone
- No internet connection or data bundle required
- Any country where Africa's Talking operates

---

## The Africa's Talking Gateway

HederaNet's USSD service is powered by **Africa's Talking**, a leading African developer platform that provides SMS, USSD, voice, and mobile data APIs across 18 African countries. When you dial `*384*1#`, the request is routed through Africa's Talking's USSD gateway, which then calls HederaNet's USSD service API.

The Africa's Talking integration means:
- Reliable delivery across multiple African mobile networks
- Session management and timeout handling
- Multi-language text delivery

---

## Session Management

### Session Duration
USSD sessions are stateful — the server remembers where you are in the menu for the duration of your session. Sessions expire after **5 minutes of inactivity**.

If your session expires mid-transaction:
1. Re-dial `*384*1#` to start a new session.
2. Your account data is never lost — only the current menu navigation state resets.
3. Incomplete purchases are not charged — the transaction only executes on explicit confirmation.

### Navigation
- Enter the number for your desired option and press **Send** (or the green call button, or OK — varies by phone model).
- Enter `0` to go back to the previous menu at any point.
- The session ends when you select Exit (option 0 on the main menu) or let it time out.

---

## Language Support

HederaNet USSD automatically selects a language based on your phone number's country prefix:

| Phone Prefix | Language |
|-------------|---------|
| +254 (Kenya) | Swahili |
| +234 (Nigeria) | English |
| +256 (Uganda) | English |
| All other prefixes | English |

To manually select a different language, go to **My Account → Language Settings** and choose from:
- English
- Yoruba
- Hausa
- Swahili

Your language preference is saved to your account and applied to all future USSD sessions from your phone number.

---

## Linking Your Phone Number

On your first USSD session, the system identifies you by your phone number. If your phone number is already linked to a HederaNet account (from the registration process), you are automatically signed in.

If your phone number is not yet linked:
1. The USSD session will prompt you to link an existing account using a verification code.
2. Alternatively, register a new account via USSD by selecting **Register as Operator** from the main menu.

---

## Limitations vs the Web App

USSD is a text-only, low-bandwidth interface. Certain features that require visual interfaces, complex forms, or real-time data streaming are available only in the web app. For governance voting, token market access, detailed analytics, and hotspot management, use [https://hederanet.vercel.app](https://hederanet.vercel.app) on a smartphone or computer.

See the [Full Menu Reference](menu-reference.md) for a complete list of every available USSD menu option.
