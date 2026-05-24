# Support & Community

HederaNet is an open, community-driven platform. This page lists all the ways to get help, report issues, request features, and stay connected with the community.

---

## Support Channels

### GitHub Issues
**https://github.com/hederanet/hederanet/issues**

The primary channel for bug reports and feature requests. Use GitHub Issues when:
- You found a bug in the web app, API, or USSD service.
- A feature is missing that you need.
- You have a question that belongs in a permanent, searchable record.

All issues are public — check existing issues before opening a new one to avoid duplicates.

---

### Discord
**https://discord.gg/hederanet**

The real-time community hub. Use Discord for:
- Quick questions and live help from the community.
- Discussing governance proposals before submitting them.
- Getting feedback on your operator setup.
- Staying current with platform announcements.

Main channels:
- `#general` — General discussion
- `#operators` — Help for infrastructure operators
- `#governance` — Proposal discussion
- `#developers` — Technical discussion and API questions
- `#announcements` — Official announcements (read-only)

---

### Email Support
**support@hederanet.online**

Use email for:
- KYC verification requests and status inquiries
- Account-related issues (lost access, email changes)
- Mobile money withdrawal problems with a reference number
- Partnership or business inquiries

**Response time:** Aim for 48-72 hours on business days.

---

### Security Vulnerabilities
**security@hederanet.online**

**Do NOT use GitHub Issues or Discord for security vulnerabilities.** Public disclosure before a patch is deployed puts users at risk.

Report security issues to security@hederanet.online with:
- A clear description of the vulnerability
- Steps to reproduce it
- The potential impact
- Your Hedera Account ID (so we can credit you in the disclosure)

**Response time:** We acknowledge within 48 hours and provide a fix timeline. After the patch is deployed, we publish a responsible disclosure with credit to the reporter.

---

### Twitter / X
**@HederaNet**

Follow for:
- Network status announcements
- New feature releases
- Governance proposal notifications
- Partnership news

---

### Documentation
**https://hederanet.gitbook.io**

You are here. The documentation covers all platform features in detail. Use the search function to find specific topics quickly.

---

## For Testnet Issues

### Check HashScan First

If a transaction appears to have failed or is missing from your history, check HashScan before contacting support:

**https://hashscan.io/testnet/account/YOUR_ACCOUNT_ID**

HashScan is the ground truth for all on-chain activity. If a transaction appears there, it was processed by the Hedera network. If it does not appear, it was not submitted or was rejected.

### Check the API Health Endpoint

If the app is unresponsive or behaving unexpectedly:

```
GET https://api.hederanet.online/health
```

A healthy response:
```json
{"status":"ok","environment":"testnet","database":"connected","hedera":"connected"}
```

If `hedera` shows `disconnected`, there may be a Hedera network issue. Check [Hedera Status](https://status.hedera.com) for service updates.

---

## What to Include in a Bug Report

Good bug reports get faster resolutions. Include:

| Field | Example |
|-------|---------|
| **Platform** | Web app (Chrome 124, macOS) |
| **Account ID** | `0.0.1234567` (NOT your private key) |
| **Steps to reproduce** | 1. Go to Energy page. 2. Click Buy. 3. Enter 20 kWh. 4. Click Confirm. |
| **Expected behavior** | Purchase modal closes and transaction appears in history |
| **Actual behavior** | Error message: "Insufficient balance" even though balance shows 50 HBAR |
| **Screenshot** | If applicable |
| **Error message** | Full text of any error shown |

> ⚠️ **Important:** Never include your private key, password, or JWT token in a bug report. Only share your **Account ID** (public address) — never your credentials.

---

## Feature Requests

For new feature ideas, use **GitHub Discussions** (under the Ideas category):

**https://github.com/hederanet/hederanet/discussions**

GitHub Discussions allows the community to upvote ideas, comment, and build consensus before a formal development decision is made. High-upvote discussions have a better chance of making it onto the development roadmap.

For governance-level changes (fee structures, token parameters, protocol rules), submit a governance proposal directly on the platform. See [Creating a Proposal](../governance/creating-proposals.md).

---

## Response Time Expectations

| Channel | Expected Response |
|---------|-----------------|
| **GitHub Issues** (bugs) | 2–5 business days for triage |
| **GitHub Discussions** | Community response within days |
| **Discord** | Community response within hours |
| **Email (support)** | 48–72 business hours |
| **Email (security)** | 48 hours acknowledgment |

These are target times during normal operations. Response may be slower during major releases or public holidays.

---

## Stay Informed

To never miss important HederaNet news:
- **Star the GitHub repository** to get release notifications.
- **Join Discord** and enable notifications for `#announcements`.
- **Follow @HederaNet** on Twitter/X.
- **Check the registered email** for your HederaNet account — official announcements (especially mainnet launch) will be sent there.
