# VPS Credentials - Blog WebArtisan

## Server Info
- **IP Address**: 103.189.234.117
- **Username**: tamatopik
- **Domain**: blog.webartisan.id
- **URL**: https://blog.webartisan.id

## SSH Access
```bash
ssh tamatopik@103.189.234.117
```

Or use the SSH alias:
```bash
ssh webartisan
```

## Project Location on VPS
- **Directory**: ~/blog-webartisan
- **Process Manager**: PM2
- **Environment**: ~/blog-webartisan/.env
- **Database**: PostgreSQL 17 (local, not Docker)

## Useful Commands

### Check PM2 status
```bash
ssh webartisan "pm2 status"
```

### View app logs
```bash
ssh webartisan "pm2 logs blog-webartisan --lines 50"
```

### Restart app
```bash
ssh webartisan "pm2 restart blog-webartisan"
```

### View error logs
```bash
ssh webartisan "pm2 logs blog-webartisan --err"
```

### Access PostgreSQL
```bash
ssh webartisan "sudo -u postgres psql -d blog_webartisan"
```

### Backup database
```bash
ssh webartisan "sudo -u postgres pg_dump blog_webartisan > backup.sql"
```

## Deployment

### Local Deployment Script
```bash
./deploy-pm2.sh
```

### Manual Deployment
```bash
# Build locally
pnpm build

# Upload and restart
ssh webartisan "cd ~/blog-webartisan && pnpm install && pm2 restart blog-webartisan"
```

## GitHub Actions Secrets
Repository: devtama101/blog-webartisan

Required secrets:
- `VPS_HOST`: 103.189.234.117
- `VPS_USER`: tamatopik
- `VPS_SSH_KEY`: (your private SSH key)
- `DATABASE_URL`: (PostgreSQL connection string)

## Environment Variables (.env)
```bash
DATABASE_URL="postgresql://tamatopik:blog_webartisan_secure_2024@localhost:5432/blog_webartisan"
NEXT_PUBLIC_BASE_URL=https://blog.webartisan.id
GROQ_API_KEY=...
UNSPLASH_ACCESS_KEY=...
UNSPLASH_SECRET_KEY=...
```

## Services
- **Next.js App**: PM2 process (port 3000)
- **PostgreSQL**: Local installation (port 5432)
- **Nginx**: Reverse proxy (ports 80/443)

## Notes
- PM2 auto-starts on system boot
- Database runs directly on VPS (not in Docker)
- Nginx proxies requests from port 80 to port 3000
- GitHub Actions auto-deploys on push to `main` branch
