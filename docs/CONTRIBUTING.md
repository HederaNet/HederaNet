# Contributing to HederaNet

We welcome contributions from African developers and communities! 🌍

## Setup

```bash
git clone https://github.com/HederaNet/HederaNet.git
cd HederaNet
pnpm install
cp apps/api/.env.example apps/api/.env
# Configure your testnet credentials in apps/api/.env
docker-compose up -d postgres redis
# Migrations run automatically on first startup — no manual migrate needed
pnpm dev
# Optional: deploy the testnet USDC token for the token market
pnpm --filter @hederanet/api deploy:usdc
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add USSD Hausa language support
fix: resolve energy listing expiry check
chore: update Hedera SDK to 2.78
docs: add USSD integration guide
test: add governance contract slashing tests
```

## Pull Request Process

1. Fork → feature branch → PR against `main`
2. All CI checks must pass (typecheck, lint, test, build)
3. For contract changes: include test coverage ≥ 80%
4. Update relevant docs in `docs/`
5. Two approvals required for `packages/contracts/` changes

## Code Standards

- TypeScript strict mode — no `any` types
- All Hedera operations: retry with exponential backoff
- All API routes: Zod validation + typed responses
- No hardcoded secrets — all from env
- Comments only when WHY is non-obvious

## Priority Areas

We especially welcome contributions in:
- USSD language packs (Amharic, Tigrinya, Zulu, Igbo, ...)
- Mobile money integrations (Airtel Money, Orange Money, ...)
- IoT device firmware for energy meters
- Regional deployment guides (country-specific regulations)
- Translation of documentation
