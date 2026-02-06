#!/bin/bash
# One-time VPS setup script for blog-webartisan deployment
# Repository: devtama101/blog-webartisan

set -e

COLOR_RESET='\033[0m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'

log_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_RESET} $1"
}

log_warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${COLOR_RESET} $1"
}

log_info "=========================================="
log_info "WebArtisan Blog VPS Setup"
log_info "=========================================="

# Create project directory
log_info "Creating project directory..."
mkdir -p ~/blog-webartisan
cd ~/blog-webartisan

# Create docker-compose.yml
log_info "Creating docker-compose.yml..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  blog:
    image: ghcr.io/devtama101/blog-webartisan:latest
    container_name: blog-webartisan
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD:-changeme}@postgres:5432/blog_webartisan
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-https://blog.webartisan.id}
      - GROQ_API_KEY=${GROQ_API_KEY}
      - UNSPLASH_ACCESS_KEY=${UNSPLASH_ACCESS_KEY}
      - UNSPLASH_SECRET_KEY=${UNSPLASH_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - blog-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:16-alpine
    container_name: blog-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-changeme}
      - POSTGRES_DB=blog_webartisan
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - blog-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
    container_name: blog-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - blog
    networks:
      - blog-network

volumes:
  postgres_data:

networks:
  blog-network:
    driver: bridge
EOF

log_success "docker-compose.yml created"

# Create nginx.conf
log_info "Creating nginx.conf..."
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    upstream blog_app {
        server blog:3000;
    }

    server {
        listen 80;
        server_name blog.webartisan.id webartisan.id;

        client_max_body_size 10M;

        location / {
            proxy_pass http://blog_app;
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
}
EOF

log_success "nginx.conf created"

# Create .env file template
log_info "Creating .env template..."
cat > .env << 'EOF'
# PostgreSQL Password
POSTGRES_PASSWORD=CHANGE_ME_TO_SECURE_PASSWORD

# Site URL
NEXT_PUBLIC_BASE_URL=https://blog.webartisan.id

# Groq API Key
GROQ_API_KEY=YOUR_GROQ_API_KEY

# Unsplash Keys
UNSPLASH_ACCESS_KEY=YOUR_UNSPLASH_ACCESS_KEY
UNSPLASH_SECRET_KEY=YOUR_UNSPLASH_SECRET_KEY
EOF

log_warning "Please edit .env with your actual values"

# Create ssl directory for future SSL certificates
mkdir -p ssl

log_success "Setup complete!"
echo ""
log_info "Next steps:"
echo "  1. Edit ~/blog-webartisan/.env with your actual values"
echo "  2. Run: cd ~/blog-webartisan && docker-compose pull && docker-compose up -d"
echo "  3. Run migrations: docker-compose exec -T blog npx prisma migrate deploy"
