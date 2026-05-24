# Contributing to HederaNet

HederaNet is an open-source project and welcomes contributions from developers, translators, operators, and community members. This guide explains how to contribute effectively.

---

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/hederanet.git
cd hederanet
pnpm install
```

### 2. Create a Feature Branch

Always work on a dedicated branch. Never commit directly to `main`.

```bash
git checkout -b feat/add-amharic-ussd
# or
git checkout -b fix/energy-listing-price-validation
# or
git checkout -b docs/update-staking-guide
```

### 3. Make Your Changes

Follow the code standards below. Test your changes locally before opening a PR.

### 4. Open a Pull Request

Push your branch and open a PR against `main`:

```bash
git push origin feat/add-amharic-ussd
```

Then go to GitHub and open a Pull Request with a clear description of what you changed and why.

---

## Commit Message Convention

HederaNet uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|------------|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `chore` | Maintenance tasks, dependency updates, build changes |
| `docs` | Documentation changes only |
| `test` | Adding or updating tests |
| `refactor` | Code restructuring with no behavior change |
| `style` | Formatting, whitespace (no logic change) |
| `perf` | Performance improvements |

### Examples

```
feat(ussd): add Amharic language support to USSD handler
fix(energy): validate that availableUnits is a positive integer
chore(deps): upgrade Hedera SDK to 2.50.0
docs(governance): clarify voting weight calculation
test(market): add unit tests for swap rate calculation
```

---

## PR Requirements

Before your PR can be merged, the following must all pass:

### CI Checks (automated)

| Check | Command | What It Does |
|-------|---------|-------------|
| **Typecheck** | `pnpm typecheck` | TypeScript strict mode across all packages |
| **Lint** | `pnpm lint` | ESLint rules enforcement |
| **Tests** | `pnpm test` | Unit and integration test suite |
| **Build** | `pnpm build` | Ensures production build succeeds |

### Documentation

If your PR adds, changes, or removes a user-facing feature, update the relevant pages in `docs/gitbook/` as part of the same PR. Documentation PRs without code changes are also very welcome.

### Smart Contract PRs

Changes to any contract in the `contracts/` directory require:
- **Two approvals** from the core team (not just one).
- A new audit if the change modifies security-critical logic (ReentrancyGuard, access control, fund flows).
- A governance discussion post before implementation.

---

## Code Standards

### TypeScript

- **Strict mode** — TypeScript `strict: true` is enabled. No `any` types (use `unknown` + type guards if truly needed).
- All function parameters and return types must be explicitly typed.
- Avoid type assertions (`as SomeType`) unless absolutely necessary.

### Input Validation

- **All API inputs must be validated with Zod** before use.
- Create Zod schemas in `packages/types/` for schemas shared between apps.
- Return 400 with a clear `VALIDATION_ERROR` message for invalid input.

```typescript
// Good:
const bodySchema = z.object({
  amountHbar: z.string().regex(/^\d+(\.\d+)?$/, 'Must be a positive number'),
  listingId: z.string().min(1),
});
const { amountHbar, listingId } = bodySchema.parse(req.body);

// Bad:
const { amountHbar, listingId } = req.body; // no validation
```

### Hedera Operations

- All Hedera SDK calls must be wrapped with retry/backoff logic using the `hedera` package's `withRetry` helper.
- Never hardcode HBAR amounts — use `Hbar.fromTinybars()` or `new Hbar(amount)` with explicit units.
- Always handle `INSUFFICIENT_PAYER_BALANCE`, `BUSY`, and `PLATFORM_TRANSACTION_NOT_CREATED` error statuses.

```typescript
// Good:
const receipt = await withRetry(() => 
  new TransferTransaction()
    .addHbarTransfer(sender, new Hbar(-amount))
    .addHbarTransfer(receiver, new Hbar(amount))
    .execute(client)
    .then(r => r.getReceipt(client))
);
```

### No Hardcoded Secrets

Never hardcode private keys, API keys, or contract addresses directly in code. All such values must come from environment variables. Use the `env` helper in `packages/config/` which validates required env vars at startup.

---

## Priority Contribution Areas

These are areas where contributions are most needed and will have the most impact:

### USSD Language Packs

The USSD service currently supports English, Yoruba, Hausa, and Swahili. High-priority languages for expansion:

| Language | Priority | Countries |
|----------|---------|---------|
| Amharic | High | Ethiopia (120M+ speakers) |
| Igbo | High | Nigeria (45M+ speakers) |
| Zulu | Medium | South Africa |
| Tigrinya | Medium | Ethiopia, Eritrea |
| French | High | 26+ African countries |
| Portugese | Medium | Angola, Mozambique |

To add a language, create a new file in `services/ussd/locales/` following the existing patterns.

### Mobile Money Integrations

Beyond M-Pesa, MTN MoMo, and Airtel Money, the following providers are in demand:

- Orange Money (Senegal, Mali, Côte d'Ivoire)
- Wave (Senegal, Mali)
- Chipper Cash (multi-country)
- Ecocash (Zimbabwe)

### IoT Firmware

Open-source firmware for solar monitoring devices that can send readings to the HederaNet oracle network. Target platforms: ESP32, Raspberry Pi, Arduino MKR.

### Regional Deployment Guides

Step-by-step guides for operators in specific countries covering local hardware sourcing, ISP backhaul options, solar equipment, and regulatory considerations.

---

## Where to Get Help

| Channel | Best For |
|---------|---------|
| **GitHub Issues** | Bug reports, feature requests |
| **GitHub Discussions** | Architecture questions, RFC discussions |
| **Discord** | Real-time help, community chat |
| **Email** | security@hederanet.online (vulnerabilities only), support@hederanet.online (general) |

Links:
- GitHub: https://github.com/hederanet/hederanet/issues
- Discord: https://discord.gg/hederanet

---

## Reporting Security Vulnerabilities

**Do NOT open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is deployed puts users at risk.

Instead:
1. Email **security@hederanet.online** with a clear description.
2. Include your finding, steps to reproduce, and the potential impact.
3. The team will acknowledge within 48 hours and provide a fix timeline.
4. After the fix is deployed, the finding will be publicly disclosed with credit to you.

---

## Code of Conduct

HederaNet is committed to a welcoming, inclusive community. All contributors are expected to:
- Be respectful and constructive in code reviews and discussions.
- Assume good intent from other contributors.
- Focus criticism on code and ideas, not on people.

Harassment, discrimination, or bad-faith behavior will result in removal from the project community.
