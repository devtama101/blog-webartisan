# VPS Setup Guide: GitHub Actions + SSH Auto-Deploy

> **Target:** Personal projects, blog, demos & experimental apps
> **OS:** Ubuntu 24.04 LTS
> **Last Updated:** February 2026

---

## Project Credentials

| Item | Value |
|------|-------|
| **VPS IP** | 103.189.234.117 |
| **SSH User** | tamatopik |
| **Domain** | blog.webartisan.id |
| **GitHub Repo** | devtama101/blog-webartisan |

---

## Stack Versions

| Stack | Version | Notes |
|-------|---------|-------|
| Ubuntu | 24.04 LTS | Support sampai Juni 2029 |
| Nginx | 1.28.x (stable) | Reverse proxy & static files |
| Node.js | 24.x LTS "Krypton" | Support sampai April 2028 |
| PostgreSQL | 17.x | Latest stable |
| PM2 | 6.x | Node.js process manager |
| Certbot | latest (snap) | Free SSL dari Let's Encrypt |

---

## Phase 1: Initial Server Setup

### 1.1 SSH ke VPS & Update System

```bash
ssh root@103.189.234.117

# Update packages
apt update && apt upgrade -y

# Set timezone
timedatectl set-timezone Asia/Jakarta

# Install essentials
apt install -y curl wget git unzip software-properties-common
```

### 1.2 Create Non-Root User

```bash
adduser tamatopik
usermod -aG sudo tamatopik

# Copy SSH key
rsync --archive --chown=tamatopik:tamatopik ~/.ssh /home/tamatopik

# Test login (dari terminal lain)
ssh tamatopik@103.189.234.117
```

### 1.3 Firewall Setup

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

### 1.4 Setup SSH Key untuk GitHub Actions

```bash
# Di VPS, sebagai user tamatopik
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# Tambah public key ke authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Copy PRIVATE key — ini yang nanti masuk GitHub Secrets
cat ~/.ssh/deploy_key
```

Simpan private key ini — nanti dipake di **Phase 5**.

---

## Phase 2: Install Stack

### 2.1 Nginx

```bash
# Install dari official repo (versi terbaru)
curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo gpg --dearmor -o /usr/share/keyrings/nginx-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/ubuntu $(lsb_release -cs) nginx" | sudo tee /etc/apt/sources.list.d/nginx.list

# Prioritas repo nginx official
echo -e "Package: *\nPin: origin nginx.org\nPin-Priority: 900" | sudo tee /etc/apt/preferences.d/99nginx

sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

nginx -v  # should show 1.28.x
```

### 2.2 Node.js 24 LTS + PM2

```bash
# Install via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs

node -v   # should show v24.x
npm -v

# Install PM2 globally
sudo npm install -g pm2@latest

pm2 --version  # should show 6.x

# Setup PM2 auto-start on boot
pm2 startup systemd
# Jalankan command yang dikasih PM2
```

### 2.3 PostgreSQL 17

```bash
# Add official PostgreSQL repo
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

sudo apt update
sudo apt install -y postgresql-17 postgresql-client-17

sudo systemctl enable postgresql
sudo systemctl start postgresql

psql --version  # should show 17.x
```

### 2.4 Setup Database

```bash
sudo -u postgres psql

# Di dalam psql:
CREATE USER tamatopik WITH PASSWORD 'your_secure_password';
CREATE DATABASE blog_webartisan OWNER tamatopik;
\q
```

---

## Phase 3: Directory Structure

```bash
# Buat project directories
sudo mkdir -p /var/www/blog-webartisan
sudo chown -R tamatopik:tamatopik /var/www

# Structure:
# /var/www/
# └── blog-webartisan/    ← Next.js blog
```

---

## Phase 4: Nginx Configuration

```bash
sudo nano /etc/nginx/conf.d/blog.webartisan.id.conf
```

```nginx
server {
    listen 80;
    server_name blog.webartisan.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.3 Test & Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 5: SSL with Certbot

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# Auto-configure SSL
sudo certbot --nginx -d blog.webartisan.id

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## Phase 6: Deploy Script

```bash
nano /var/www/blog-webartisan/deploy.sh
chmod +x /var/www/blog-webartisan/deploy.sh
```

```bash
#!/bin/bash
set -e

cd /var/www/blog-webartisan

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️ Building..."
pnpm build

echo "🔄 Restarting PM2..."
pm2 restart blog-webartisan || pm2 start npm --name "blog-webartisan" -- start

pm2 save

echo "✅ Deploy complete!"
```

---

## Phase 7: GitHub Actions Workflow

### 7.1 Setup GitHub Secrets

Di setiap repo GitHub → Settings → Secrets → Actions, tambah:

| Secret | Value |
|--------|-------|
| `VPS_HOST` | 103.189.234.117 |
| `VPS_USER` | tamatopik |
| `VPS_SSH_KEY` | Private key dari Phase 1.4 |

### 7.2 Workflow

Buat file `.github/workflows/deploy.yml` di repo:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script_stop: true
          script: |
            cd /var/www/blog-webartisan
            bash deploy.sh
```

---

## Phase 8: PM2 Ecosystem

Buat file `ecosystem.config.js` di `/var/www/`:

```javascript
module.exports = {
  apps: [
    {
      name: "blog-webartisan",
      cwd: "/var/www/blog-webartisan",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
```

---

## Phase 9: Swap File (Optional)

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize swappiness
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Phase 10: First Deploy (Manual)

```bash
# Clone repo
cd /var/www/blog-webartisan
git clone git@github.com:devtama101/blog-webartisan.git .

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
nano .env  # set DATABASE_URL, NEXT_PUBLIC_BASE_URL, etc.

# Build
pnpm build

# Start with PM2
pm2 start npm --name "blog-webartisan" -- start
pm2 save
```

---

## Quick Commands Cheatsheet

```bash
# === NGINX ===
sudo nginx -t                    # Test config
sudo systemctl reload nginx      # Reload tanpa downtime
sudo tail -f /var/log/nginx/error.log

# === PM2 ===
pm2 list                         # Lihat semua processes
pm2 logs                         # Stream semua logs
pm2 logs blog-webartisan         # Log specific app
pm2 monit                        # Real-time monitoring
pm2 restart blog-webartisan     # Restart app

# === POSTGRESQL ===
sudo -u postgres psql            # Masuk psql
psql -U tamatopik -d blog_webartisan

# === SSL ===
sudo certbot renew --dry-run     # Test renewal
sudo certbot certificates        # Lihat all certs

# === SYSTEM ===
htop                             # Resource monitoring
df -h                            # Disk usage
free -h                          # Memory usage
```

---

## Environment Variables (.env.example)

```env
# Database
DATABASE_URL="postgresql://tamatopik:your_password@localhost:5432/blog_webartisan"

# Site
NEXT_PUBLIC_BASE_URL="https://blog.webartisan.id"

# AI (Groq)
GROQ_API_KEY="your_groq_api_key"

# Images (Unsplash)
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"
UNSPLASH_SECRET_KEY="your_unsplash_secret_key"
```

---

## Estimated Monthly Cost

| Provider | RAM | Storage | Price |
|----------|-----|---------|-------|
| DigitalOcean | 2GB | 50GB SSD | $12/mo |
| Hetzner | 4GB | 40GB SSD | €4.5/mo (~$5) |
| Vultr | 2GB | 50GB SSD | $10/mo |
| Contabo | 4GB | 50GB SSD | €5/mo (~$5.5) |

> **Recommendation:** Hetzner atau Contabo — best value buat use case lo.
