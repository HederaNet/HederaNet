# Deployment Guide

This guide walks through deploying HederaNet end-to-end:

- **Backend** (API + USSD service) → AWS EC2 via Docker
- **Database** (PostgreSQL) + **Cache** (Redis) → same EC2 instance via Docker
- **Frontend** (Next.js web app) → Cloudflare Pages

---

## Architecture Overview

```
┌─────────────────────────────┐       ┌───────────────────────┐
│  Cloudflare Pages           │       │  AWS EC2 (Ubuntu)     │
│  hederanet.vercel.app /     │──────▶│  Nginx :80 / :443     │
│  your-domain.pages.dev      │       │    ├─ API :4000        │
└─────────────────────────────┘       │    ├─ USSD :5000       │
                                      │    ├─ PostgreSQL :5432 │
                                      │    └─ Redis :6379      │
                                      └───────────────────────┘
```

---

## Part 1 — AWS EC2: Server Preparation

### 1.1 Launch an EC2 Instance

1. Open the [AWS EC2 Console](https://console.aws.amazon.com/ec2).
2. Click **Launch Instance**.
3. Configure:
   - **Name**: `hederanet-backend`
   - **AMI**: Ubuntu Server 24.04 LTS (64-bit)
   - **Instance type**: `t3.medium` (2 vCPU / 4 GB RAM) minimum; `t3.large` recommended for production
   - **Key pair**: Create a new key pair → download the `.pem` file and keep it safe
   - **Storage**: 30 GB gp3 SSD (increase to 50 GB if storing large logs)
4. Under **Network settings**, create a new Security Group with these inbound rules:

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| SSH | TCP | 22 | Your IP only | Server access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Nginx (redirect to HTTPS) |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Nginx (SSL) |
| Custom TCP | TCP | 4000 | 0.0.0.0/0 | API (direct, optional) |
| Custom TCP | TCP | 5000 | 0.0.0.0/0 | USSD service |

> Leave ports 5432 (PostgreSQL) and 6379 (Redis) **closed** to the public. They are only accessed internally by the Docker containers.

5. Click **Launch Instance**. Note the **Public IPv4 address** or assign an **Elastic IP** (recommended — static IP that survives instance restarts).

### 1.2 SSH Into the Instance

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 1.3 Update the System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip
```

### 1.4 Install Docker

```bash
# Add Docker's official GPG key and repo
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Allow ubuntu user to run docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker
docker --version   # should print Docker version
```

---

## Part 2 — Deploy Backend and Database

### 2.1 Clone the Repository

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_ORG/hederanet.git
cd hederanet
```

### 2.2 Create the Production Environment File

```bash
cp .env.example .env.production   # or create from scratch
nano .env.production
```

Paste and fill in every value:

```env
# ─── Node ──────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=4000

# ─── Database ──────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:YOUR_STRONG_DB_PASSWORD@postgres:5432/hederanet

# ─── Redis ─────────────────────────────────────────────────────────────────
REDIS_URL=redis://redis:6379

# ─── Authentication ────────────────────────────────────────────────────────
JWT_SECRET=a-very-long-random-string-at-least-64-chars
ENCRYPTION_KEY=32-byte-hex-key-for-aes-256   # generate with: openssl rand -hex 32

# ─── Hedera ────────────────────────────────────────────────────────────────
HEDERA_NETWORK=mainnet                        # change to 'testnet' if still testing
HEDERA_OPERATOR_ID=0.0.XXXXXXX
HEDERA_OPERATOR_PRIVATE_KEY=302e0201...
HEDERA_MIRROR_NODE_URL=https://mainnet-public.mirrornode.hedera.com

# ─── HederaNet Token IDs ────────────────────────────────────────────────────
HNET_TOKEN_ID=0.0.7153593
HEC_TOKEN_ID=0.0.7153605
HCC_TOKEN_ID=0.0.7153651
USDC_TOKEN_ID=0.0.9038720                     # update to 0.0.456858 for mainnet Circle USDC
REPUTATION_NFT_ID=0.0.7153666

# ─── Smart Contracts ───────────────────────────────────────────────────────
ENERGY_TRADING_CONTRACT_ID=0.0.7153712
SERVICE_PAYMENT_CONTRACT_ID=0.0.7153764
GOVERNANCE_CONTRACT_ID=0.0.7153782

# ─── HCS Topics ────────────────────────────────────────────────────────────
GOVERNANCE_TOPIC_ID=0.0.1006
SERVICE_QUALITY_TOPIC_ID=0.0.1005
ENERGY_TRADING_TOPIC_ID=0.0.1007

# ─── CORS ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://your-domain.pages.dev   # or your custom domain

# ─── Postgres (used by the docker-compose postgres service itself) ─────────
POSTGRES_DB=hederanet
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_STRONG_DB_PASSWORD

# ─── Optional: Google OAuth ────────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

> **Security**: Never commit `.env.production` to git. Add it to `.gitignore`.

Generate secure values:
```bash
openssl rand -base64 48   # for JWT_SECRET
openssl rand -hex 32      # for ENCRYPTION_KEY
openssl rand -base64 32   # for POSTGRES_PASSWORD
```

### 2.3 Create a Production Docker Compose Override

The default `docker-compose.yml` is for local development (no SSL, dev settings). Create an override for production:

```bash
nano docker-compose.prod.yml
```

```yaml
version: '3.9'

services:
  postgres:
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports: []   # do NOT expose 5432 publicly in production

  redis:
    restart: always
    ports: []   # do NOT expose 6379 publicly in production

  api:
    restart: always
    env_file: .env.production
    environment:
      NODE_ENV: production
    ports:
      - "4000:4000"

  ussd:
    restart: always
    env_file: .env.production
    ports:
      - "5000:5000"
```

### 2.4 Start All Services

```bash
# Start PostgreSQL and Redis first, wait for healthy status
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d postgres redis

# Wait ~10 seconds for databases to initialize
sleep 10

# Start the API and USSD service
# The API automatically creates the database (if missing) and runs all pending
# Prisma migrations on startup via db-init before accepting any requests.
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d api ussd
```

### 2.5 Verify Services Are Running

```bash
docker compose ps                          # all containers should show "Up"
curl http://localhost:4000/health          # should return {"status":"ok",...}
docker compose logs -f api                 # tail API logs
```

---

## Part 3 — Nginx Reverse Proxy and SSL

Nginx sits in front of the API and USSD service, handles SSL termination, and applies rate limiting. The `nginx/nginx.conf` in the repo is already configured for this.

### 3.1 Install Nginx and Certbot on the EC2 Host

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 3.2 Configure Nginx for HederaNet

```bash
sudo nano /etc/nginx/sites-available/hederanet
```

Paste this config (replace `api.yourdomain.com` with your real domain):

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;
limit_req_zone $binary_remote_addr zone=ussd_limit:10m rate=10r/m;

server {
    listen 80;
    server_name api.yourdomain.com;

    # Certbot will add SSL config here automatically

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # API proxy
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO WebSocket
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # Health check (public)
    location /health {
        proxy_pass http://127.0.0.1:4000/health;
    }
}

server {
    listen 80;
    server_name ussd.yourdomain.com;

    location /ussd {
        limit_req zone=ussd_limit burst=5 nodelay;
        proxy_pass http://127.0.0.1:5000/ussd;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/hederanet /etc/nginx/sites-enabled/
sudo nginx -t              # should print "syntax is ok"
sudo systemctl reload nginx
```

### 3.3 Point Your Domain to the EC2 IP

Before issuing an SSL certificate, your domain must resolve to your EC2 IP.

In your DNS provider (Cloudflare, Route 53, etc.), add:
```
A   api.yourdomain.com   →   YOUR_EC2_PUBLIC_IP
A   ussd.yourdomain.com  →   YOUR_EC2_PUBLIC_IP
```

Wait for DNS to propagate (usually 1–5 minutes with Cloudflare, up to 24 hours with other providers).

Verify:
```bash
dig api.yourdomain.com +short   # should return your EC2 IP
```

### 3.4 Issue SSL Certificates with Let's Encrypt

```bash
sudo certbot --nginx -d api.yourdomain.com -d ussd.yourdomain.com \
  --email your@email.com --agree-tos --no-eff-email
```

Certbot automatically edits your Nginx config to redirect HTTP → HTTPS and inserts the SSL certificate blocks.

Test automatic renewal:
```bash
sudo certbot renew --dry-run
```

> Certificates auto-renew every 60 days via a cron job installed by Certbot.

---

## Part 4 — Database Backups

Never lose production data. Set up automated PostgreSQL backups.

### 4.1 Create a Backup Script

```bash
sudo nano /usr/local/bin/hederanet-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

docker compose -f /home/ubuntu/hederanet/docker-compose.yml exec -T postgres \
  pg_dump -U postgres hederanet | gzip > "$BACKUP_DIR/hederanet_$TIMESTAMP.sql.gz"

# Keep only last 14 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +14 -delete

echo "Backup completed: hederanet_$TIMESTAMP.sql.gz"
```

```bash
sudo chmod +x /usr/local/bin/hederanet-backup.sh
```

### 4.2 Schedule Daily Backups

```bash
crontab -e
```

Add this line (runs daily at 2 AM UTC):

```
0 2 * * * /usr/local/bin/hederanet-backup.sh >> /home/ubuntu/backups/backup.log 2>&1
```

---

## Part 5 — Deploy Frontend to Cloudflare Pages

The Next.js web app (`apps/web`) is deployed to Cloudflare Pages using the `@cloudflare/next-on-pages` adapter.

### 5.1 Install the Cloudflare Next.js Adapter

In the repository, run locally:

```bash
cd apps/web
pnpm add -D @cloudflare/next-on-pages wrangler
```

### 5.2 Add a Cloudflare Wrangler Config

Create `apps/web/wrangler.toml`:

```toml
name = "hederanet-web"
compatibility_date = "2025-05-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

### 5.3 Update next.config.ts for Edge Compatibility

In `apps/web/next.config.ts`, ensure the config exports correctly. No structural change is needed — `@cloudflare/next-on-pages` reads it automatically.

Add a `.dev.vars` file (Cloudflare's local `.env` for Pages — **do not commit**):

```bash
nano apps/web/.dev.vars
```

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_HEDERA_NETWORK=mainnet
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 5.4 Add a Build Script for Cloudflare

In `apps/web/package.json`, add a build command for Cloudflare Pages:

```json
"scripts": {
  "build:cloudflare": "next-on-pages"
}
```

### 5.5 Connect the Repository to Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize Cloudflare to access your GitHub/GitLab account and select the `hederanet` repository.
3. Configure the build settings:

| Setting | Value |
|---------|-------|
| **Framework preset** | Next.js |
| **Build command** | `pnpm --filter @hederanet/types build && pnpm --filter @hederanet/web build:cloudflare` |
| **Build output directory** | `apps/web/.vercel/output/static` |
| **Root directory** | `/` (repository root — pnpm workspace must be at root) |
| **Node.js version** | `20` |

4. Under **Environment variables**, add (using the **Production** tab):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com` |
| `NEXT_PUBLIC_WS_URL` | `wss://api.yourdomain.com` |
| `NEXT_PUBLIC_HEDERA_NETWORK` | `mainnet` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | your OAuth client ID |

5. Click **Save and Deploy**.

Cloudflare runs the build, bundles the output, and deploys globally. Your app is available at `https://hederanet.pages.dev` (or a custom domain).

### 5.6 Add a Custom Domain (Optional)

In Cloudflare Pages project → **Custom domains** → **Set up a custom domain**:
- Enter `app.yourdomain.com`
- Cloudflare automatically adds the DNS record and provisions an SSL certificate

---

## Part 6 — Keeping Everything Running

### 6.1 Set Docker Containers to Start on Reboot

The `restart: always` policy in `docker-compose.prod.yml` (set in Part 2) ensures containers restart automatically after EC2 reboots. Verify Docker starts on boot:

```bash
sudo systemctl enable docker
sudo systemctl is-enabled docker   # should print "enabled"
```

### 6.2 Update the Backend (Zero-Downtime Deploy)

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

cd /home/ubuntu/hederanet

# Pull latest code
git pull origin main

# Rebuild and restart only the API and USSD service
# New Prisma migrations run automatically on API startup via db-init
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production \
  up -d --build --no-deps api ussd

# Check logs — migration output appears in the first few lines
docker compose logs -f api --tail=50
```

### 6.3 Monitor Container Health

```bash
# See all container statuses and uptime
docker compose ps

# CPU and memory usage
docker stats

# View logs for a specific service
docker compose logs -f api       # API
docker compose logs -f ussd      # USSD
docker compose logs -f postgres  # Database
```

### 6.4 Update the Frontend

Cloudflare Pages redeploys automatically on every push to `main`. No manual steps needed.

To trigger a manual redeploy:
1. Cloudflare Dashboard → Workers & Pages → `hederanet-web` → **Deployments** → **Retry deployment**.

---

## Part 7 — Environment Variable Reference

### Backend (EC2 `.env.production`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | API port (default: `4000`) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET` | ✅ | Random string ≥64 chars for signing tokens |
| `ENCRYPTION_KEY` | ✅ | 32-byte hex key for AES-256-GCM private key encryption |
| `HEDERA_NETWORK` | ✅ | `testnet` or `mainnet` |
| `HEDERA_OPERATOR_ID` | ✅ | Platform Hedera account ID (e.g. `0.0.123456`) |
| `HEDERA_OPERATOR_PRIVATE_KEY` | ✅ | Platform operator private key (keep secret) |
| `HEDERA_MIRROR_NODE_URL` | ✅ | Mirror node base URL |
| `HNET_TOKEN_ID` | ✅ | HTS token ID for HNET |
| `HEC_TOKEN_ID` | ✅ | HTS token ID for HEC |
| `HCC_TOKEN_ID` | ✅ | HTS token ID for HCC |
| `USDC_TOKEN_ID` | ✅ | HTS token ID for USDC |
| `REPUTATION_NFT_ID` | ✅ | HTS token ID for Reputation NFTs |
| `ENERGY_TRADING_CONTRACT_ID` | ✅ | EnergyMarket contract (0.0.7153712) |
| `SERVICE_PAYMENT_CONTRACT_ID` | ✅ | ServicePayment contract (0.0.7153764) |
| `GOVERNANCE_CONTRACT_ID` | ✅ | Governance contract (0.0.7153782) |
| `GOVERNANCE_TOPIC_ID` | ✅ | HCS governance topic |
| `SERVICE_QUALITY_TOPIC_ID` | ✅ | HCS service quality topic |
| `ENERGY_TRADING_TOPIC_ID` | ✅ | HCS energy trading topic |
| `NEXT_PUBLIC_APP_URL` | ✅ | Frontend origin for CORS (e.g. `https://app.yourdomain.com`) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |

### Frontend (Cloudflare Pages environment variables)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `https://api.yourdomain.com`) |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL for Socket.IO (e.g. `wss://api.yourdomain.com`) |
| `NEXT_PUBLIC_HEDERA_NETWORK` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID for OAuth popup |

---

## Part 8 — Troubleshooting

### API container exits immediately

```bash
docker compose logs api   # read the error message
```

Common causes:
- Missing or wrong environment variable — check `.env.production` against the reference table above
- Database not ready — ensure `postgres` is healthy before `api` starts (the `depends_on` + healthcheck handles this)
- Port 4000 already in use — `sudo lsof -i :4000` to find and kill the conflicting process

### Prisma migration fails

```bash
docker compose run --rm api sh -c "npx prisma migrate status"
```

If migrations are in a failed state, resolve the conflict manually or reset (⚠️ destructive on production):
```bash
docker compose run --rm api sh -c "npx prisma migrate resolve --applied MIGRATION_NAME"
```

### Cloudflare Pages build fails

- Check the **Build log** in Cloudflare Dashboard for the exact error.
- Common issues:
  - Wrong **build output directory** — must be `apps/web/.vercel/output/static`
  - Missing `NEXT_PUBLIC_*` environment variable — add it in Pages → Settings → Environment variables
  - Edge-incompatible Node.js API — any `fs`, `crypto` (Node core) usage in a Server Component or API route must use the `edge` runtime marker or be moved to the API server

### SSL certificate not issuing

- Ensure your domain DNS is pointing to the EC2 IP and has propagated (`dig api.yourdomain.com`)
- Ensure port 80 is open in the EC2 Security Group (Certbot uses HTTP-01 challenge)
- Check Nginx is running: `sudo systemctl status nginx`
