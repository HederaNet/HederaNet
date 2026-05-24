# Your Profile

Your profile page is where you view your Hedera account details and update personal information. It is accessible from the top navigation bar on any dashboard page.

---

## Accessing Your Profile

Click your **name** or **avatar image** in the top right corner of the navigation bar. This opens your profile page.

---

## What Your Profile Displays

Your profile page shows the following read-only information:

| Field | Description |
|-------|-------------|
| **Name** | Your display name on the platform |
| **Email** | The email address linked to your account |
| **Hedera Account ID** | Your unique Hedera address (e.g. `0.0.1234567`) with a link to HashScan |
| **HBAR Balance** | Your current HBAR holdings, fetched from the Hedera mirror node |
| **KYC Status** | Your identity verification status: `PENDING`, `APPROVED`, or `REJECTED` |
| **Public Key** | Your Hedera account's public key, shown truncated (first 20 characters) for reference |
| **Role** | Your current role: `SUBSCRIBER` or `OPERATOR` |

> ℹ️ **Your Hedera Account ID on HashScan**
> Clicking the HashScan link next to your Account ID opens `https://hashscan.io/testnet/account/YOUR_ID` where you can view your full transaction history, token balances, and account details on the public Hedera ledger. Your Account ID is public and safe to share — only your private key (which you never see directly) should be kept secret.

---

## Editing Your Profile

Click the **Edit Profile** button to enter edit mode. The following fields can be changed:

### Name
- Minimum: 2 characters
- Change your display name and click **Save**.

### Email Address
- Enter a new valid email address.
- Your sign-in email will update after saving.

> ⚠️ **Warning:** If you signed up with Google OAuth, changing your email here updates your HederaNet profile but does not affect your Google account. If you later sign in with Google using a different email, it may create a separate account.

### Avatar Image

You can upload a profile picture:

1. Click the avatar area or the **Upload Image** button.
2. Select a PNG or JPG image file from your device.
3. The image is compressed client-side to a maximum of **220KB** before uploading — very large images are automatically resized.
4. A preview appears immediately so you can confirm the image looks correct.
5. Click **Save** to apply the new avatar.

To remove your avatar and revert to the default placeholder, click the **Remove** option next to the avatar preview.

---

## Changing Your Password

Password change is available if you registered with email and password (not Google OAuth).

1. In your profile page, click **Change Password**.
2. Enter your **current password** to confirm your identity.
3. Enter your **new password** — it must be:
   - Minimum 8 characters
   - At least one letter
   - At least one number
4. A **password strength indicator** shows in real time: Weak, Fair, Good, or Strong.
5. Click **Update Password** to save.

> ℹ️ **Note:** If you forget your current password, use the **Forgot Password** flow from the sign-in page instead.

---

## Your KYC Status

The KYC (Know Your Customer) badge on your profile shows your verification status:

| Status | Meaning |
|--------|---------|
| **PENDING** | Default state — verification not yet completed |
| **APPROVED** | Identity verified — all platform features available |
| **REJECTED** | Verification failed — contact support to resolve |

On testnet, KYC is not strictly enforced and most features are accessible regardless of status. See [KYC Verification](../account/kyc-verification.md) for details on getting approved for mainnet.

---

## Account Security Tips

- Use a strong, unique password not shared with other services.
- Your private key is encrypted and managed by the platform on testnet — you do not need to store it yourself.
- Never share your password or session tokens.
- If you suspect unauthorized access, change your password immediately and contact support@hederanet.online.
