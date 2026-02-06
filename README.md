# WebArtisan Blog

A comprehensive content platform built with Next.js 16 (App Router), Prisma ORM, PostgreSQL, and TypeScript. Features blog posts, project portfolio, media management, analytics, and AI-powered writing tools.

## Features

### Content Management
- **Blog Posts**: Create, edit, and publish blog posts with Markdown support
- **Categories & Tags**: Organize content with flexible taxonomy
- **Cover Images**: Unsplash integration for high-quality images
- **Draft System**: Save drafts before publishing
- **Reading Time**: Auto-calculated based on word count
- **Related Posts**: Content-similarity-based recommendations
- **Comment System**: Moderation workflow (pending/approved/spam)

### Project Portfolio
- **Project Management**: Full CRUD for portfolio projects
- **Deployment Tracking**: Track deployment status and logs
- **Health Monitoring**: System health checks for deployed projects
- **Project Analytics**: View counts and engagement metrics

### SEO & Performance
- **Sitemap**: Auto-generated XML sitemap with all pages
- **Robots.txt**: Configurable crawler rules
- **Structured Data**: JSON-LD schema (BlogPosting, Breadcrumb, WebSite)
- **Pagination**: SEO-friendly pagination (`/page/2`, `/page/3`)
- **Open Graph Images**: Dynamic OG images for social sharing
- **Table of Contents**: Auto-generated from markdown headings
- **Internal Linking**: AI-powered internal link suggestions

### AI-Powered Tools (Groq/Llama 3.3)
- **Content Continuation**: AI continues your writing
- **Grammar Fix**: Automatically fix grammar issues
- **Tone Rewrite**: Adjust tone (casual, professional, concise)
- **SEO Metadata**: Generate meta titles, descriptions, and tags
- **AI Usage Tracking**: Monitor AI quota and costs

### Admin Dashboard
- **Analytics Dashboard**: Charts and metrics for posts/projects
- **Media Library**: Upload and manage media files
- **Comment Moderation**: Review and moderate comments
- **Activity Logs**: Track all user actions
- **Quick Actions**: Fast access to common tasks

### User Experience
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Dark Mode Support**: CSS variables for theming
- **Fast Performance**: Next.js 16 with Turbopack

## Documentation

| Document | Description |
|----------|-------------|
| [SEO Features](./docs/SEO-FEATURES.md) | Comprehensive guide to SEO features, configuration, and best practices |
| [CLAUDE.md](./CLAUDE.md) | Developer guide for Claude Code (architecture, commands, patterns) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (using DBngin on macOS recommended)
- pnpm package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd blog-webartisan

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# (Optional) Seed database with admin user
pnpm db:seed

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://postgres@localhost:5432/blog_webartisan"

# Site Configuration
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# AI Features (Groq)
GROQ_API_KEY="your_groq_api_key"

# Images (Unsplash)
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"
UNSPLASH_SECRET_KEY="your_unsplash_secret_key"
```

## Project Structure

```
blog-webartisan/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [slug]/           # Blog post pages
│   │   ├── admin/            # Admin dashboard
│   │   │   ├── posts/       # Post management
│   │   │   ├── categories/  # Category management
│   │   │   ├── tags/        # Tag management
│   │   │   ├── comments/    # Comment moderation
│   │   │   ├── media/       # Media library
│   │   │   ├── analytics/   # Analytics dashboard
│   │   │   └── ai-usage/    # AI usage tracking
│   │   ├── page/[pageNumber]/# Paginated blog pages
│   │   ├── api/             # API routes
│   │   ├── sitemap.ts       # XML sitemap
│   │   └── robots.ts        # Robots.txt
│   ├── components/
│   │   ├── blog/            # Blog-specific components
│   │   ├── admin/           # Admin components
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility functions
│   └── db.ts                # Prisma client
├── docs/                     # Documentation
└── public/                   # Static assets
```

## Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Create and apply migration
pnpm db:studio    # Open Prisma Studio (GUI)
pnpm db:seed      # Seed database with admin user
```

## Database

The platform uses Prisma ORM with PostgreSQL. See `prisma/schema.prisma` for the complete schema.

### Data Models

#### Blog Models
- **Post** - Blog posts with SEO fields, reading time, AI suggestions
- **Category** - Post categories
- **Tag** - Post tags
- **Comment** - Post comments with moderation status
- **PostStats** - Post view statistics
- **Media** - Uploaded media files

#### Project Models
- **Project** - Portfolio projects
- **Deployment** - Deployment tracking
- **HealthCheck** - System health monitoring
- **ProjectStats** - Project analytics

#### User & Auth Models
- **User** - User accounts with role management
- **Account** - OAuth account linking
- **Session** - User sessions
- **VerificationToken** - Email verification

#### Tracking Models
- **AiUsageLog** - Track AI API usage and costs
- **ActivityLog** - User activity tracking

### Prisma Studio

```bash
pnpm db:studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555) to view and edit data.

## API Routes

### Public Blog APIs
- `GET /api/b/posts` - List published posts (paginated)
- `GET /api/b/post/[slug]` - Get single post by slug
- `GET /api/posts/[slug]/related` - Get related posts

### AI APIs (Groq/Llama 3.3)
- `POST /api/ai/continue` - Continue writing
- `POST /api/ai/fix-grammar` - Fix grammar
- `POST /api/ai/rewrite` - Rewrite content
- `POST /api/ai/seo` - Generate SEO metadata
- `POST /api/ai/summarize` - Generate excerpts

### Admin APIs

#### Posts
- `GET/POST /api/admin/posts` - List/create posts
- `PUT/DELETE /api/admin/posts/[id]` - Update/delete posts
- `POST /api/admin/post` - Quick create post

#### Categories
- `GET/POST /api/admin/categories` - List/create categories
- `PUT/DELETE /api/admin/categories/[id]` - Update/delete categories

#### Tags
- `GET/POST /api/admin/tags` - List/create tags
- `PUT/DELETE /api/admin/tags/[id]` - Update/delete tags

#### Comments
- `GET/POST /api/admin/comments` - List/create comments
- `PUT/DELETE /api/admin/comments/[id]` - Update/delete comments

#### Media
- `GET/POST /api/admin/media` - List/upload media
- `PUT/DELETE /api/admin/media/[id]` - Update/delete media

#### Analytics & Dashboard
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/internal-links` - Internal linking suggestions
- `GET /api/admin/ai-usage` - AI usage tracking

### Media APIs
- `GET /api/images/unsplash` - Search Unsplash for images

## Admin Dashboard

The admin dashboard at `/admin` provides:

- **Overview** - Key metrics, top posts, recent activity
- **Posts** - Full CRUD with editor and AI tools
- **Categories/Tags** - Taxonomy management
- **Comments** - Moderation queue
- **Media** - File uploads and library
- **Analytics** - Charts and insights
- **AI Usage** - Track AI quota and costs

## Deployment

Configured with `output: 'standalone'` for Docker/VPS deployment.

### Docker

```bash
# Build image
docker build -t blog-webartisan .

# Run container
docker run -p 3001:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/blog_webartisan" \
  -e NEXT_PUBLIC_BASE_URL="https://yourdomain.com" \
  -e GROQ_API_KEY="your_key" \
  blog-webartisan
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/blog_webartisan"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
GROQ_API_KEY="your_groq_api_key"
UNSPLASH_ACCESS_KEY="your_unsplash_key"
UNSPLASH_SECRET_KEY="your_unsplash_secret"
```

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| AI | [Groq API](https://groq.com/) (Llama 3.3 70B) |
| Images | [Unsplash API](https://unsplash.com/) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
