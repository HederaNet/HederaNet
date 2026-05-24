# Create Your Account

Creating a HederaNet account takes less than two minutes and automatically provisions a Hedera testnet account for you — no wallet extension or prior crypto experience required.

---

## Step 1: Go to the App

Open [https://hederanet.vercel.app](https://hederanet.vercel.app) in any modern browser. You will land on the home page.

---

## Step 2: Open Sign Up

Click the **Sign Up** button in the top navigation bar. You will see the registration form.

---

## Step 3: Choose Your Sign-Up Method

### Option A: Email and Password

Fill in the registration form:

| Field | Requirements |
|-------|-------------|
| **Name** | Minimum 2 characters |
| **Email** | Valid email address format |
| **Password** | Minimum 8 characters, must contain at least one letter and one number |

Click **Create Account** to submit.

### Option B: Google OAuth

Click the **Continue with Google** button. You will be redirected to Google's sign-in page. After authenticating with Google, you are returned to HederaNet and your account is created automatically. No additional form fields are required.

---

## Step 4: What Happens Automatically

As soon as your account is created, HederaNet automatically:

1. **Creates a Hedera testnet account** — a new account ID (e.g. `0.0.1234567`) is generated on the Hedera testnet and linked to your HederaNet profile.
2. **Generates and stores your keypair** — the account's private key is encrypted using AES-256-GCM and stored securely. You do not need to save any seed phrase.
3. **Sets your initial role** — all new accounts start with the **SUBSCRIBER** role. You can upgrade to OPERATOR later.
4. **Sets your KYC status** — your account starts with `KYC: PENDING`. This is normal and expected.

> ℹ️ **Your Hedera Account ID**
> Your account ID looks like `0.0.1234567`. It is your permanent address on the Hedera network. You can view your account at any time on HashScan:
> `https://hashscan.io/testnet/account/0.0.1234567`
> The account ID is public — it is safe to share when receiving payments or providing an operator address.

---

## Step 5: Verify Your Setup

After signing in, click your name or avatar in the top right corner to open your profile. Confirm that:

- Your **name** and **email** are correctly displayed.
- A **Hedera Account ID** is shown (e.g. `0.0.1234567`) with a link to HashScan.
- Your **HBAR balance** is shown (you may receive a small testnet HBAR allocation automatically).
- **KYC Status** shows `PENDING` — this is the default starting state.

---

## Signing In Later

Return to [https://hederanet.vercel.app](https://hederanet.vercel.app) and click **Sign In**.

- If you registered with email/password, enter your credentials.
- If you registered with Google, click **Continue with Google**.

Your session is maintained via a JWT token that is refreshed automatically.

---

## Forgot Your Password?

If you registered with email and need to reset your password, use the **Forgot Password** link on the sign-in page. A reset link will be sent to your registered email address.

> ⚠️ **Warning:** If you registered with Google OAuth, you cannot set or reset a password through HederaNet — your account is authenticated entirely through Google. Use your Google account settings to manage access.

---

## What's Next?

- Take a [tour of your dashboard](dashboard-tour.md) to explore all the features.
- [Set up your profile](your-profile.md) with an avatar and confirm your account details.
- If you want to deploy infrastructure and earn HBAR, read [Becoming an Operator](../operators/becoming-an-operator.md).
