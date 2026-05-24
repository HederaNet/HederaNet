# Managing Your Profile

Your profile is your identity on HederaNet — it contains your account details, Hedera credentials, and the personal information used across the platform.

---

## Accessing Your Profile

Click your **name** or **avatar image** in the top right corner of any dashboard page. This opens your profile page.

---

## What Your Profile Displays

### Account Information

| Field | Description |
|-------|-------------|
| **Name** | Your display name visible to other users on the platform |
| **Email** | The email address associated with your account |
| **Hedera Account ID** | Your unique address on the Hedera network (e.g., `0.0.1234567`) |
| **HBAR Balance** | Your current HBAR holdings, fetched live from the Hedera mirror node |
| **KYC Status** | Your identity verification status (PENDING / APPROVED / REJECTED) |
| **Public Key** | Your Hedera account's public key, displayed truncated for reference |
| **Role** | SUBSCRIBER or OPERATOR |

### The HashScan Link

Next to your Hedera Account ID is a direct link to your account on HashScan:

```
https://hashscan.io/testnet/account/0.0.YOUR_ID
```

Clicking this link opens your full Hedera account page showing:
- All HBAR transactions
- Token balances (HNET, HEC, HCC, USDC)
- NFT holdings (including Reputation NFTs)
- Smart contract interactions

Your Account ID is **public** — it is your address for receiving payments and is safe to share. Never share your **private key** or password.

---

## Editing Your Profile

Click the **Edit Profile** button to enter edit mode.

### Changing Your Name

Enter a new display name in the Name field.
- Minimum: 2 characters
- No maximum, but keep it reasonable for display purposes

Click **Save** to apply.

### Changing Your Email

Enter a new email address in the Email field. Your new email will be used for sign-in after saving.

> ⚠️ **Warning:** If you authenticated with Google OAuth, your displayed email comes from your Google account. Changing it here updates your HederaNet profile display but does not change which Google account you sign in with.

### Uploading an Avatar

1. Click the **avatar image area** or the **Upload Image** button below it.
2. A file picker opens. Select a **PNG** or **JPG** image from your device.
3. Client-side compression reduces the image to a maximum of **220KB** automatically. Large photos are resized proportionally — you do not need to manually resize them.
4. A **preview** of the compressed image appears so you can check how it looks before saving.
5. Click **Save** to upload and apply the avatar.

> 💡 **Tip:** Square images work best for the circular avatar display. A 400×400 pixel PNG at 72 DPI compresses well under the 220KB limit.

### Removing Your Avatar

To revert to the default placeholder avatar, click the **Remove** option that appears next to your current avatar in edit mode. Saving after clicking Remove clears your avatar back to the default.

---

## Changing Your Password

This section is only available if you registered with email and password (not Google OAuth).

1. Click **Change Password** on the profile page.
2. Enter your **current password** — this confirms it is actually you making the change.
3. Enter your **new password**. Requirements:
   - Minimum 8 characters
   - At least one letter
   - At least one number
4. The **password strength indicator** shows in real time as you type:

| Indicator | Meaning |
|-----------|---------|
| **Weak** | Does not meet minimum requirements or is too simple |
| **Fair** | Meets minimum requirements but is predictable |
| **Good** | Reasonable length and complexity |
| **Strong** | Long and complex — recommended |

5. Click **Update Password** to save. You are not signed out — your current session continues.

---

## If You Forgot Your Password

Use the **Forgot Password** flow from the sign-in page at [https://hederanet.vercel.app](https://hederanet.vercel.app). A password reset link is sent to your registered email address.

---

## Privacy Notes

- Your name and avatar are visible to other platform users.
- Your email address is private and not displayed to other users.
- Your Hedera Account ID is public by design (it is your blockchain address).
- Your private key is never shown and is stored encrypted — it is managed by the platform on your behalf on testnet.
