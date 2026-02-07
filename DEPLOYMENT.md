# PM2 Deployment Guide for Node.js/Next.js Projects

This guide covers deploying a Node.js/Next.js application using PM2 process manager, PostgreSQL, and nginx on a VPS.

---

## Prerequisites

- VPS with Ubuntu 20.04+ or Debian 11+
- Root or sudo access
- Domain name pointed to VPS IP

---

## 1. Initial VPS Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Packages
```bash
sudo apt install -y curl git wget build-essential
```

---

## 2. Install Node.js and pnpm

### Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install pnpm
```bash
npm install -g pnpm
```

---

## 3. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << 'EOF'
CREATE DATABASE your_project_name;
CREATE USER your_project_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE your_project_name TO your_project_user;
ALTER USER your_project_user WITH SUPERUSER;
\q
EOF
```

---

## 4. Install PM2

```bash
npm install -g pm2

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs
```

---

## 5. Install nginx

```bash
sudo apt install -y nginx

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 6. Deploy Your Application

### Clone Your Repository
```bash
git clone https://github.com/your-username/your-project.git
cd your-project
```

### Install Dependencies
```bash
pnpm install
```

### Create Environment File
```bash
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://your_project_user:secure_password_here@localhost:5432/your_project_name"

# App
NODE_ENV="production"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Add your other environment variables here
EOF
```

### Generate Prisma Client (if using Prisma)
```bash
pnpm prisma generate
pnpm prisma migrate deploy
```

### Build the Application
```bash
pnpm build
```

---

## 7. Configure PM2

### Start Application with PM2
```bash
pm2 start npm --name "your-app-name" -- start
```

### Save PM2 Configuration
```bash
pm2 save
```

### Useful PM2 Commands
```bash
# View status
pm2 status

# View logs
pm2 logs your-app-name

# View logs (lines)
pm2 logs your-app-name --lines 50

# View error logs
pm2 logs your-app-name --err

# Restart
pm2 restart your-app-name

# Stop
pm2 stop your-app-name

# Delete
pm2 delete your-app-name
```

---

## 8. Configure nginx Reverse Proxy

### Create nginx Configuration
```bash
sudo tee /etc/nginx/conf.d/your-app.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    client_max_body_size 10M;

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
EOF
```

### Test and Reload nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 9. Setup SSL with Certbot (Optional)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is already configured
```

---

## 10. Setup GitHub Actions CI/CD

### Set GitHub Secrets
Go to: `Repository → Settings → Secrets and variables → Actions`

Add the following secrets:
- `VPS_HOST` - Your VPS IP address
- `VPS_USER` - SSH username (e.g., `root` or your username)
- `VPS_SSH_KEY` - Your private SSH key
- `DATABASE_URL` - PostgreSQL connection string

### Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

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
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm prisma generate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Build Next.js
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - name: Create deployment package
        run: |
          tar -czf ../deploy.tar.gz \
            --exclude=node_modules \
            --exclude=.git \
            .
          mv ../deploy.tar.gz .

      - name: Copy files to VPS
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          source: "deploy.tar.gz"
          target: "/tmp/"

      - name: Deploy on VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script_stop: true
          script: |
            set -e

            VPS_PATH="/home/your-user/your-project"
            PM2_NAME="your-app-name"

            # Stop old PM2 process
            pm2 stop $PM2_NAME || true
            pm2 delete $PM2_NAME || true

            # Extract files
            mkdir -p $VPS_PATH
            tar -xzf /tmp/deploy.tar.gz -C $VPS_PATH

            # Install dependencies
            cd $VPS_PATH
            pnpm install

            # Generate Prisma client
            pnpm prisma generate

            # Start PM2
            pm2 start npm --name "$PM2_NAME" -- start
            pm2 save

            # Cleanup
            rm -f /tmp/deploy.tar.gz
```

---

## 11. Local Deployment Script

Create `deploy.sh` in your project root:

```bash
#!/bin/bash
set -e

VPS_HOST="your-vps-ip"
VPS_USER="your-username"
VPS_PATH="~/your-project"
PM2_NAME="your-app-name"

echo "=== Building locally ==="
pnpm build

echo "=== Creating deployment package ==="
tar -czf /tmp/deploy.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=*.log \
  .

echo "=== Uploading to VPS ==="
scp /tmp/deploy.tar.gz $VPS_USER@$VPS_HOST:/tmp/

echo "=== Deploying on VPS ==="
ssh $VPS_USER@$VPS_HOST << ENDSSH
set -e
pm2 stop $PM2_NAME || true
pm2 delete $PM2_NAME || true
tar -xzf /tmp/deploy.tar.gz -C $VPS_PATH
cd $VPS_PATH
pnpm install
pnpm prisma generate
pm2 start npm --name "$PM2_NAME" -- start
pm2 save
rm -f /tmp/deploy.tar.gz
pm2 status $PM2_NAME
ENDSSH

rm -f /tmp/deploy.tar.gz

echo "=== Deployment complete! ==="
```

Make it executable:
```bash
chmod +x deploy.sh
```

---

## 12. Database Management

### Backup Database
```bash
sudo -u postgres pg_dump your_database > backup.sql
```

### Restore Database
```bash
sudo -u postgres psql your_database < backup.sql
```

### Access Database
```bash
sudo -u postgres psql -d your_database
```

---

## 13. Troubleshooting

### Application Not Starting
```bash
# Check PM2 logs
pm2 logs your-app-name --err

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart your-app-name
```

### Database Connection Issues
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U your_user -d your_database

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### nginx Issues
```bash
# Test nginx configuration
sudo nginx -t

# View nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload nginx
sudo systemctl reload nginx
```

### Permission Issues
```bash
# Fix file permissions
sudo chown -R your-user:your-user /home/your-user/your-project
chmod -R 755 /home/your-user/your-project
```

---

## 14. Environment Variables Checklist

For a typical Next.js application with:

| Feature | Required Variables |
|---------|-------------------|
| Database | `DATABASE_URL` |
| NextAuth | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| App | `NEXT_PUBLIC_BASE_URL`, `NODE_ENV` |
| OAuth Providers | Provider-specific keys (GITHUB_ID, GITHUB_SECRET, etc.) |

---

## 15. Quick Reference Commands

```bash
# === Server Management ===
sudo systemctl status nginx    # Check nginx
sudo systemctl reload nginx    # Reload nginx
pm2 status                     # Check PM2 processes
pm2 logs app-name              # View logs
pm2 restart app-name           # Restart app

# === Database ===
sudo -u postgres psql          # Access PostgreSQL
sudo systemctl status postgresql  # Check PostgreSQL

# === Deployment ===
./deploy.sh                    # Deploy using script
git pull && pm2 restart all    # Quick update and restart
```

---

## 16. Security Best Practices

1. **Use strong passwords** for database and applications
2. **Never commit** `.env` files to git
3. **Use SSH keys** instead of passwords
4. **Keep system updated**: `sudo apt update && sudo apt upgrade`
5. **Configure firewall** (ufw):
   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```
6. **Disable root login** via SSH
7. **Regular backups** of database and code

---

## 17. Useful Links

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [nginx Documentation](https://nginx.org/en/docs/)
