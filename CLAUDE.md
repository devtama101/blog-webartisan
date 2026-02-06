# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebArtisan Blog is a comprehensive content platform built with Next.js 16 (App Router), Prisma ORM, PostgreSQL, and TypeScript. It features:

- **Blog System** - Posts with Markdown, categories, tags, comments, related posts
- **Project Portfolio** - Showcase projects with deployment tracking
- **Media Management** - File uploads and library
- **Analytics** - Dashboard with charts and metrics
- **AI Tools** - Content assistance using Groq/Llama 3.3
- **SEO** - Sitemap, structured data, pagination, OG images

## Commands

### Development
```bash
pnpm dev          # Start development server (Turbopack)
pnpm build        # Build for production (generates Prisma client)
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Database
```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:migrate   # Create and apply migration
pnpm db:studio    # Open Prisma Studio (GUI)
pnpm db:seed      # Seed database with sample data
```

The database schema is in `prisma/schema.prisma`. Environment variables are loaded from `.env.local` with `DATABASE_URL`.

## Architecture

### App Router Structure

#### Public Pages (`src/app/`)
| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Blog homepage with paginated posts (6 per page) |
| `/[slug]` | `[slug]/page.tsx` | Individual blog post with TOC, related posts |
| `/page/[pageNumber]` | `page/[pageNumber]/page.tsx` | Paginated blog pages |

#### Admin Pages (`src/app/admin/`)
| Route | File | Description |
|-------|------|-------------|
| `/admin` | `page.tsx` | Dashboard overview with metrics |
| `/admin/posts` | `posts/page.tsx` | Post listing |
| `/admin/posts/new` | `posts/new/page.tsx` | Create post with AI tools |
| `/admin/posts/[id]` | `posts/[id]/page.tsx` | Edit post |
| `/admin/categories` | `categories/page.tsx` | Category management |
| `/admin/tags` | `tags/page.tsx` | Tag management |
| `/admin/comments` | `comments/page.tsx` | Comment moderation |
| `/admin/media` | `media/page.tsx` | Media library |
| `/admin/analytics` | `analytics/page.tsx` | Analytics dashboard |
| `/admin/ai-usage` | `ai-usage/page.tsx` | AI usage tracking |

#### Static Routes
| Route | File | Description |
|-------|------|-------------|
| `/sitemap.xml` | `sitemap.ts` | Dynamic XML sitemap |
| `/robots.txt` | `robots.ts` | Crawler rules |

### API Routes

#### Public APIs (`/api/b/`)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/b/posts` | GET | List published posts (paginated) |
| `/api/b/post/[slug]` | GET | Get single post |
| `/api/posts/[slug]/related` | GET | Get related posts (content similarity) |

#### AI APIs (`/api/ai/`)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/ai/continue` | POST | Continue writing with AI |
| `/api/ai/fix-grammar` | POST | Fix grammar issues |
| `/api/ai/rewrite` | POST | Rewrite content (casual/professional/concise) |
| `/api/ai/seo` | POST | Generate SEO metadata |
| `/api/ai/summarize` | POST | Generate excerpts |

#### Admin APIs (`/api/admin/`)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/dashboard` | GET | Dashboard stats |
| `/api/admin/posts` | GET/POST | List/create posts |
| `/api/admin/posts/[id]` | PUT/DELETE | Update/delete posts |
| `/api/admin/post` | POST | Quick create post |
| `/api/admin/categories` | GET/POST | List/create categories |
| `/api/admin/categories/[id]` | PUT/DELETE | Update/delete categories |
| `/api/admin/tags` | GET/POST | List/create tags |
| `/api/admin/tags/[id]` | PUT/DELETE | Update/delete tags |
| `/api/admin/comments` | GET/POST | List/create comments |
| `/api/admin/comments/[id]` | PUT/DELETE | Update/delete comments |
| `/api/admin/media` | GET/POST | List/upload media |
| `/api/admin/media/[id]` | PUT/DELETE | Update/delete media |
| `/api/admin/analytics` | GET | Analytics data |
| `/api/admin/internal-links` | GET | Internal linking suggestions |
| `/api/admin/ai-usage` | GET | AI usage tracking |

#### Media APIs
| Route | Method | Description |
|-------|--------|-------------|
| `/api/images/unsplash` | GET | Search Unsplash for images |

### Database Layer

**File**: `src/db.ts` - Prisma client singleton (prevents multiple instances in dev)

#### Models

##### Blog Models
- `Post` - Blog posts with SEO fields, reading time, AI suggestions
- `Category` - Post categories (many-to-many with Post)
- `Tag` - Post tags (many-to-many with Post)
- `Comment` - Post comments with moderation status
- `PostStats` - Post view statistics
- `Media` - Uploaded media files

##### Project Models
- `Project` - Portfolio projects
- `Deployment` - Deployment tracking
- `HealthCheck` - System health monitoring
- `ProjectStats` - Project analytics

##### User & Auth Models
- `User` - User accounts with role management
- `Account` - OAuth account linking
- `Session` - User sessions
- `VerificationToken` - Email verification

##### Tracking Models
- `AiUsageLog` - Track AI API usage and costs
- `ActivityLog` - User activity tracking

### Components

#### Blog Components (`src/components/blog/`)
| Component | Description |
|-----------|-------------|
| `json-ld.tsx` | Structured data (JSON-LD) for SEO |
| `pagination.tsx` | Pagination UI with page numbers |
| `related-posts.tsx` | Display related posts |
| `table-of-contents.tsx` | Auto-generated TOC (mobile/desktop) |
| `youtube-renderer.tsx` | YouTube video embed |

#### Admin Components (`src/components/admin/`)
| Component | Description |
|-----------|-------------|
| `markdown-editor.tsx` | Markdown editor with preview |
| `metric-card.tsx` | Dashboard metric card with trend |
| `sidebar.tsx` | Admin sidebar navigation |
| `status-badge.tsx` | Status badges (draft/published) |
| `topbar.tsx` | Admin header |
| `youtube-embed.tsx` | YouTube embed for editor |

#### UI Components (`src/components/ui/`)
| Component | Description |
|-----------|-------------|
| `button.tsx` | Reusable button (class-variance-authority) |

### Libraries (`src/lib/`)

| File | Description |
|------|-------------|
| `ai-usage.ts` | AI usage tracking and quota management |
| `content-similarity.ts` | Cosine similarity algorithm for related posts |
| `remark-headings.ts` | Remark plugin for heading extraction |
| `schema-generator.ts` | Generate JSON-LD structured data |
| `toc-generator.ts` | Generate table of contents from markdown |
| `utils.ts` | Utilities (`cn()` for className merging) |
| `youtube-parser.ts` | Parse YouTube video IDs |

### Client-Side Rendering

All pages use `"use client"` directive. Data fetching is done client-side via `fetch()` to API routes.

### AI Integration

Uses **Groq API** with **Llama 3.3 70B** model:
- Content continuation
- Grammar fixing
- Tone rewriting
- SEO metadata generation

AI usage is tracked in `AiUsageLog` model with daily quota monitoring.

### Deployment

- **Output mode**: `standalone` (Docker/VPS ready)
- **Port**: 3000 (default)
- **Database**: PostgreSQL

### Styling

- **Framework**: Tailwind CSS
- **Theming**: CSS variables in `src/app/globals.css`
- **Path alias**: `@/*` maps to `src/*`

### Key Features

#### Related Posts Algorithm
Uses **cosine similarity** on tokenized content:
1. Tokenize text into words
2. Remove 281 stop words
3. Calculate TF-IDF-like scores
4. Return posts with similarity > 0.05

#### Pagination
- **Posts per page**: 6
- **URL structure**: `/` (page 1), `/page/2`, `/page/3`
- **SEO**: `rel="next"` links, sitemap includes all pages

#### SEO Features
- Auto-generated sitemap with all content
- JSON-LD structured data (BlogPosting, Breadcrumb, WebSite)
- Dynamic OG images
- Table of contents for anchor links
- Internal linking suggestions

## Configuration

### Environment Variables (`.env.local`)

```env
# Database
DATABASE_URL="postgresql://postgres@localhost:5432/blog_webartisan"

# Site
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# AI (Groq)
GROQ_API_KEY="your_groq_api_key"

# Images (Unsplash)
UNSPLASH_ACCESS_KEY="your_unsplash_access_key"
UNSPLASH_SECRET_KEY="your_unsplash_secret_key"
```

### Constants

| Constant | Value | Location |
|----------|-------|----------|
| `POSTS_PER_PAGE` | 6 | `src/app/api/b/posts/route.ts`, `src/app/sitemap.ts` |
| `MAX_LIMIT` | 50 | `src/app/api/b/posts/route.ts` |
| `MIN_SIMILARITY` | 0.05 | `src/app/api/posts/[slug]/related/route.ts` |

## Working with This Codebase

### Adding a New Blog Post

1. Go to `/admin/posts/new`
2. Enter title, content, excerpt
3. Use AI tools for assistance (continue, fix grammar, SEO)
4. Select cover image from Unsplash
5. Save as draft or publish

### Modifying Database Schema

1. Edit `prisma/schema.prisma`
2. Run `pnpm db:push` (development) or `pnpm db:migrate` (production)
3. Run `pnpm db:generate` to update Prisma client

### Adding a New API Route

Create file in `src/app/api/` following the pattern:
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/db'

export async function GET() {
  // Your logic here
  return NextResponse.json(data)
}
```

### Adding SEO to New Pages

1. Add to `sitemap.ts` if page should be indexed
2. Add JSON-LD schema if applicable
3. Ensure proper meta tags

## Common Patterns

### Error Handling
```typescript
try {
  // Database operation
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

### Fetch with Pagination
```typescript
const skip = (page - 1) * limit
const items = await prisma.model.findMany({
  skip,
  take: limit,
  orderBy: { createdAt: 'desc' }
})
```

### Reading Time Calculation
```typescript
const readingTime = Math.ceil(words.length / 200) // 200 wpm
```

## Documentation

- `README.md` - Project overview and setup
- `docs/SEO-FEATURES.md` - SEO features guide
