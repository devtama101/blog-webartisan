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

---

## Table of Contents

1. [Commands](#commands)
2. [Folder Structure](#folder-structure)
3. [Coding Conventions & Rules](#coding-conventions--rules)
4. [Architecture](#architecture)
5. [Features Deep Dive](#features-deep-dive)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Configuration](#configuration)

---

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

**Important**: Always run `pnpm db:generate` after schema changes. The build script automatically runs this.

### Environment Variables

Loaded from `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Secret for JWT/NextAuth
- `NEXT_PUBLIC_BASE_URL` - Site URL for OG images
- `GROQ_API_KEY` - Groq API for AI features
- `UNSPLASH_ACCESS_KEY` - Unsplash for images
- `UNSPLASH_SECRET_KEY` - Unsplash secret key

---

## Folder Structure

```
blog-webartisan/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seeding script
├── public/                # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth route group
│   │   │   ├── layout.tsx
│   │   │   └── login/
│   │   ├── admin/         # Admin pages (protected)
│   │   │   ├── page.tsx               # Dashboard
│   │   │   ├── posts/                 # Post management
│   │   │   │   ├── page.tsx           # List
│   │   │   │   ├── new/page.tsx       # Create
│   │   │   │   └── [id]/page.tsx      # Edit
│   │   │   ├── categories/            # Category CRUD
│   │   │   ├── tags/                  # Tag CRUD
│   │   │   ├── comments/              # Comment moderation
│   │   │   ├── media/                 # Media library
│   │   │   ├── analytics/             # Analytics dashboard
│   │   │   ├── ai-usage/              # AI usage tracking
│   │   │   └── settings/              # Site settings
│   │   ├── api/
│   │   │   ├── auth/                  # NextAuth endpoints
│   │   │   │   ├── [...nextauth]/     # NextAuth handler
│   │   │   │   ├── session/           # Session endpoint
│   │   │   │   └── user/              # User management
│   │   │   ├── b/                     # Public API
│   │   │   │   ├── posts/             # List posts
│   │   │   │   ├── post/[slug]/       # Single post
│   │   │   │   └── settings/          # Site settings
│   │   │   ├── admin/                 # Admin API
│   │   │   │   ├── dashboard/         # Stats
│   │   │   │   ├── posts/             # Post CRUD
│   │   │   │   ├── categories/        # Category CRUD
│   │   │   │   ├── tags/              # Tag CRUD
│   │   │   │   ├── comments/          # Comment CRUD
│   │   │   │   ├── media/             # Media CRUD
│   │   │   │   ├── analytics/         # Analytics data
│   │   │   │   └── internal-links/    # Link suggestions
│   │   │   ├── ai/                    # AI endpoints
│   │   │   │   ├── continue/          # Continue writing
│   │   │   │   ├── fix-grammar/       # Grammar fix
│   │   │   │   ├── rewrite/           # Rewrite content
│   │   │   │   ├── seo/               # Generate SEO
│   │   │   │   └── summarize/         # Generate excerpt
│   │   │   ├── images/                # Image APIs
│   │   │   │   └── unsplash/          # Search Unsplash
│   │   │   ├── login/                 # Custom login
│   │   │   ├── health/                # Health check
│   │   │   └── posts/[slug]/related/  # Related posts
│   │   ├── [slug]/                    # Blog post page
│   │   │   ├── page.tsx               # Post view
│   │   │   └── opengraph-image.tsx    # Dynamic OG image
│   │   ├── page/                      # Pagination
│   │   │   └── [pageNumber]/page.tsx
│   │   ├── globals.css                # Global styles
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Homepage
│   │   ├── robots.ts                  # Robots.txt
│   │   └── sitemap.ts                 # XML sitemap
│   ├── components/
│   │   ├── admin/                     # Admin components
│   │   │   ├── markdown-editor.tsx    # MD editor
│   │   │   ├── metric-card.tsx        # Dashboard metric
│   │   │   ├── sidebar.tsx            # Admin sidebar
│   │   │   ├── status-badge.tsx       # Status badges
│   │   │   ├── topbar.tsx             # Admin header
│   │   │   └── youtube-embed.tsx      # YouTube helper
│   │   ├── auth/                      # Auth components
│   │   │   ├── password-input.tsx     # Password with toggle
│   │   │   ├── sign-in-button.tsx     # Login button
│   │   │   └── user-menu.tsx          # User dropdown
│   │   ├── blog/                      # Blog components
│   │   │   ├── json-ld.tsx            # Structured data
│   │   │   ├── pagination.tsx         # Pagination UI
│   │   │   ├── related-posts.tsx      # Related posts
│   │   │   ├── table-of-contents.tsx  # TOC
│   │   │   └── youtube-renderer.tsx   # YouTube embed
│   │   └── ui/                        # UI primitives
│   │       └── button.tsx             # Button component
│   ├── lib/
│   │   ├── ai-usage.ts                # AI tracking
│   │   ├── auth.ts                    # NextAuth config
│   │   ├── avatar.ts                  # Avatar URLs
│   │   ├── content-similarity.ts      # Cosine similarity
│   │   ├── remark-headings.ts         # Remark plugin
│   │   ├── schema-generator.ts        # JSON-LD generator
│   │   ├── session.ts                 # Session helpers
│   │   ├── toc-generator.ts           # TOC generator
│   │   ├── utils.ts                   # Utilities
│   │   └── youtube-parser.ts          # YouTube parser
│   └── db.ts                          # Prisma singleton
├── proxy.ts                # Middleware for admin auth
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

---

## Coding Conventions & Rules

### File Management Rules

**DO NOT DELETE** the following files without explicit review:
- `src/proxy.ts` - Required for admin authentication middleware
- `src/app/api/login/route.ts` - Custom login bypasses NextAuth CSRF
- `src/db.ts` - Prisma singleton prevents multiple instances in dev
- `src/lib/session.ts` - Session helpers used throughout app
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `src/app/api/auth/[...nextauth]/options.ts` - Auth provider config
- `.env.local` - Environment variables (add to `.gitignore` if not present)

### Code Style

**All pages use `"use client"` directive** - Data fetching is done client-side via `fetch()` to API routes.

**Imports**: Use path alias `@/` for src imports:
```typescript
import { prisma } from '@/db'
import { logAiUsage } from '@/lib/ai-usage'
```

**TypeScript**: Strict mode is disabled in `tsconfig.json`. Use type annotations for API routes and database models.

**Component Structure**:
- Use `class-variance-authority` for component variants (see `button.tsx`)
- Use `cn()` utility from `utils.ts` for className merging
- Use Tailwind CSS for styling

### API Route Pattern

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const param = searchParams.get('param')

    // Your logic here
    const data = await prisma.model.findMany()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Operation failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
```

### Error Handling Pattern

```typescript
try {
  // Database operation
} catch (error) {
  console.error('[FEATURE] Error:', error)
  return NextResponse.json(
    { error: 'Descriptive error message' },
    { status: 500 }
  )
}
```

**Note**: Logging functions (`logAiUsage`, `logActivity`) should never throw - they catch errors internally.

### Authentication Patterns

**Server-side**: Use `auth()` from `@/lib/auth`:
```typescript
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

**Custom auth**: Use `requireAdmin()` from `@/lib/session`:
```typescript
import { requireAdmin } from '@/lib/session'

export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

### Cookie Names

**CRITICAL**: The login system uses a custom JWT implementation. Cookie name is:
- **`next-auth.session-token`** - Used by login API (compatible with NextAuth)
- Legacy `session-token` - Supported for backward compatibility

Both names are checked in `session.ts`, `proxy.ts`, and `/api/auth/session`.

### Deployment Workflow

1. **Development**:
   ```bash
   pnpm dev
   ```

2. **Database Changes**:
   ```bash
   # Edit prisma/schema.prisma
   pnpm db:push      # Development (direct push)
   pnpm db:migrate   # Production (create migration)
   pnpm db:generate  # Always run after schema changes
   ```

3. **Build for Production**:
   ```bash
   pnpm build        # Generates Prisma client + builds Next.js
   pnpm start        # Start production server
   ```

**Important**: Build automatically runs `prisma generate`. Do not modify the build script.

4. **Environment Setup**:
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL`
   - Set `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Set `NEXT_PUBLIC_BASE_URL` to production URL
   - Set API keys for Groq and Unsplash

---

## Architecture

### App Router Structure

#### Public Pages (`src/app/`)
| Route | File | Description |
|-------|------|-------------|
| `/` | `page.tsx` | Blog homepage with paginated posts (6 per page) |
| `/[slug]` | `[slug]/page.tsx` | Individual blog post with TOC, related posts |
| `/[slug]/opengraph-image` | `opengraph-image.tsx` | Dynamic OG image generation |
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
| `/admin/settings` | `settings/page.tsx` | Site settings |

#### Auth Routes (`src/app/(auth)/`)
| Route | File | Description |
|-------|------|-------------|
| `/login` | `login/page.tsx` | Login page |

#### Static Routes
| Route | File | Description |
|-------|------|-------------|
| `/sitemap.xml` | `sitemap.ts` | Dynamic XML sitemap |
| `/robots.txt` | `robots.ts` | Crawler rules |

### Middleware

**File**: `proxy.ts` - Custom middleware for admin route protection

Matches: `/admin/:path*`

Checks for valid session token and redirects to `/login` if not authenticated or not ADMIN role.

### Styling System

**Framework**: Tailwind CSS with `@tailwindcss/typography` plugin

**Theme**: CSS variables in `src/app/globals.css`
- Light mode: `:root` variables
- Dark mode: `.dark` class variables (class-based strategy)

**Path alias**: `@/*` maps to `src/*`

**Colors**: HSL-based CSS variables
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--muted`, `--accent`
- `--destructive`
- `--border`, `--input`, `--ring`
- `--radius` for border-radius

### Client-Side Rendering

All pages use `"use client"` directive. Data fetching is done client-side via `fetch()` to API routes.

---

## Features Deep Dive

### Authentication System

**Architecture**: Hybrid NextAuth + Custom JWT

1. **NextAuth v5** (`src/lib/auth.ts`)
   - Credentials provider
   - JWT strategy
   - Session management
   - Configuration: `src/app/api/auth/[...nextauth]/options.ts`

2. **Custom Login API** (`src/app/api/login/route.ts`)
   - Bypasses NextAuth CSRF for FormData submissions
   - Creates JWT with user data
   - Sets `next-auth.session-token` cookie
   - Compatible with NextAuth's `useSession()` hook

3. **Session Helpers** (`src/lib/session.ts`)
   - `getSession()` - Get current session from JWT
   - `requireAdmin()` - Verify admin role
   - Checks both `next-auth.session-token` and legacy `session-token`

4. **Middleware** (`src/proxy.ts`)
   - Protects `/admin` routes
   - Verifies JWT and ADMIN role
   - Redirects to `/login` if unauthorized

**Cookie Flow**:
1. User submits login form (FormData)
2. `/api/login` validates credentials
3. Creates JWT with `userId`, `email`, `name`, `role`
4. Sets `next-auth.session-token` cookie (httpOnly, secure in prod, 7-day expiry)
5. `useSession()` hook reads the cookie and populates session

### AI Integration

**Provider**: Groq API with Llama 3.3 70B model

**Endpoints** (`src/app/api/ai/`):
- `POST /continue` - Continue writing from cursor
- `POST /fix-grammar` - Fix grammar issues
- `POST /rewrite` - Rewrite (casual/professional/concise)
- `POST /seo` - Generate SEO metadata
- `POST /summarize` - Generate excerpt

**Usage Tracking** (`src/lib/ai-usage.ts`):
- Logs all AI requests to `AiUsageLog` model
- Tracks tokens used, model, endpoint
- `logAiUsage()` - Never throws, logs errors silently
- `logActivity()` - Audit trail for user actions

**AI Usage Page** (`/admin/ai-usage`):
- Shows daily usage statistics
- Token counts by endpoint
- Cost tracking (if available)

### Content Similarity (Related Posts)

**Algorithm**: Cosine similarity with tokenization

**File**: `src/lib/content-similarity.ts`

**Process**:
1. Tokenize text (remove punctuation, lowercase)
2. Remove 81 stop words (common words)
3. Create term frequency maps
4. Calculate cosine similarity: `dotProduct / (magnitude1 * magnitude2)`
5. Filter posts with similarity > 0.05
6. Return top N results

**Functions**:
- `calculateSimilarity(text1, text2)` - Returns similarity score (0-1)
- `findSimilarPosts(currentPost, allPosts, limit)` - Finds related posts
- `findLinkingSuggestions(content, allPosts, limit)` - Internal link suggestions

### SEO Features

1. **Dynamic Sitemap** (`src/app/sitemap.ts`)
   - Includes all published posts
   - Includes paginated pages
   - Updates automatically

2. **JSON-LD Structured Data** (`src/components/blog/json-ld.tsx`)
   - BlogPosting schema
   - BreadcrumbList schema
   - WebSite schema
   - Generated by `src/lib/schema-generator.ts`

3. **Dynamic OG Images** (`src/app/[slug]/opengraph-image.tsx`)
   - Uses `@vercel/og` for image generation
   - Includes post title and blog name
   - Auto-generated for each post

4. **Table of Contents** (`src/components/blog/table-of-contents.tsx`)
   - Generated from markdown headings
   - Uses `src/lib/toc-generator.ts` with custom Remark plugin
   - Smooth scrolling to sections
   - Mobile/desktop responsive

5. **Internal Linking** (`/api/admin/internal-links`)
   - Suggests posts to link based on keyword matching
   - Uses `findLinkingSuggestions()` from `content-similarity.ts`

### Analytics

**Dashboard Stats** (`/api/admin/dashboard`):
- Total posts (by status)
- Total views
- Pending comments
- AI usage metrics
- Recent activity

**Post Analytics** (`PostStats` model):
- Daily view counts
- Unique visitors
- Bounce rate
- Time on page
- Unique constraint per post per day

**Project Analytics** (`ProjectStats` model):
- Same structure as PostStats
- Per-project tracking

### Media Management

**Upload API** (`/api/admin/media`):
- Accepts file uploads
- Stores metadata in `Media` model
- Generates URL for serving files
- Tracks dimensions (width/height)

**Unsplash Integration** (`/api/images/unsplash`):
- Search for images by query
- Used in post editor for cover images
- Requires `UNSPLASH_ACCESS_KEY`

### Markdown Editor

**Component**: `src/components/admin/markdown-editor.tsx`

**Library**: `@uiw/react-md-editor`

**Features**:
- Live preview
- Split pane editing
- GitHub Flavored Markdown (GFM)
- Syntax highlighting (rehype-highlight)
- HTML support (rehype-raw)

**YouTube Support**:
- `src/lib/youtube-parser.ts` - Extracts video IDs
- `src/components/admin/youtube-embed.tsx` - Editor toolbar button
- `src/components/blog/youtube-renderer.tsx` - Frontend display

### Comments System

**Model**: `Comment`
- Fields: authorName, authorEmail, content, status
- Status: PENDING, APPROVED, SPAM
- Moderation queue at `/admin/comments`

---

## Database Schema

**File**: `prisma/schema.prisma`

**Provider**: PostgreSQL

**Key Models**:

### Blog Models
- `Post` - Blog posts with SEO fields, reading time, AI suggestions
  - Relations: author (User), categories, tags, stats, comments
  - Status: DRAFT, PUBLISHED, SCHEDULED, ARCHIVED
- `Category` - Post categories (many-to-many with Post)
- `Tag` - Post tags (many-to-many with Post)
- `Comment` - Post comments with moderation status
- `PostStats` - Daily view statistics per post

### Project Models
- `Project` - Portfolio projects with deployment config
  - Relations: deployments, healthChecks, stats, technologies
  - Type: WORK, EXPLORATION
  - DeployType: DOCKER, PM2, NONE
- `Deployment` - Deployment tracking with status and logs
- `HealthCheck` - System health monitoring with metrics
- `ProjectStats` - Daily analytics per project
- `Technology` - Tags for project tech stack

### User & Auth Models
- `User` - User accounts with role (ADMIN, USER)
  - Relations: accounts, sessions, posts, aiUsageLogs, activityLogs
- `Account` - OAuth account linking
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

### Tracking Models
- `AiUsageLog` - AI API usage tracking
  - Fields: endpoint, inputTokens, outputTokens, totalTokens, model, cost
- `ActivityLog` - User activity audit trail
  - Fields: action, entity, entityId, metadata

### Media & Settings
- `Media` - Uploaded file metadata
- `SiteSettings` - Global site configuration (singleton)

**Indexes**: Strategic indexes on frequently queried fields (slug, status, dates)

---

## API Reference

### Public APIs (`/api/b/`)

#### `GET /api/b/posts`
List published posts (paginated)

Query params:
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 6, max: 50)

Returns: Array of posts with author, categories, tags

#### `GET /api/b/post/[slug]`
Get single post by slug

Returns: Full post content with metadata

#### `GET /api/b/settings`
Get site settings

Returns: Blog name, title, description

### Admin APIs (`/api/admin/`)

#### `GET /api/admin/dashboard`
Dashboard statistics

Returns: Post counts, views, comments, AI usage, recent activity

#### `GET/POST /api/admin/posts`
List/create posts (admin only)

POST body: title, content, excerpt, coverImage, status, categoryIds, tagIds

#### `PUT/DELETE /api/admin/posts/[id]`
Update/delete post

#### `GET/POST /api/admin/categories`
List/create categories

#### `GET/POST /api/admin/tags`
List/create tags

#### `GET/POST /api/admin/comments`
List/create comments, moderate

#### `GET/POST /api/admin/media`
List/upload media

#### `GET /api/admin/analytics`
Analytics data with time filtering

#### `GET /api/admin/internal-links`
Internal linking suggestions for a post

### AI APIs (`/api/ai/`)

#### `POST /api/ai/continue`
Continue writing with AI

Body: `{ content, cursorPosition }`

#### `POST /api/ai/fix-grammar`
Fix grammar issues

Body: `{ content }`

#### `POST /api/ai/rewrite`
Rewrite content

Body: `{ content, tone }` (tone: casual|professional|concise)

#### `POST /api/ai/seo`
Generate SEO metadata

Body: `{ title, content }`

Returns: `{ metaTitle, metaDescription, keywords }`

#### `POST /api/ai/summarize`
Generate excerpt

Body: `{ content, length }`

### Auth APIs

#### `POST /api/login`
Custom login (bypasses NextAuth CSRF)

Body: FormData with `email`, `password`, `csrfToken`

Sets `next-auth.session-token` cookie

#### `GET /api/auth/session`
Get current session

#### `GET /api/auth/user`
Get current user data

### Other APIs

#### `GET /api/images/unsplash`
Search Unsplash for images

Query: `?query=search_term`

#### `GET /api/health`
Health check endpoint

#### `GET /api/posts/[slug]/related`
Get related posts based on content similarity

---

## Configuration

### Environment Variables (`.env.local`)

```env
# Database
DATABASE_URL="postgresql://postgres@localhost:5432/blog_webartisan"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

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
| `MIN_SIMILARITY` | 0.05 | `src/lib/content-similarity.ts` |
| Reading time | 200 wpm | Calculated as `Math.ceil(words.length / 200)` |

### Dependencies

**Core**:
- `next@16.1.6` - React framework
- `react@19` - UI library
- `prisma@7` - ORM
- `next-auth@5` - Authentication

**UI**:
- `tailwindcss` - Styling
- `@tailwindcss/typography` - Markdown styling
- `@uiw/react-md-editor` - Markdown editor
- `class-variance-authority` - Component variants
- `lucide-react` - Icons

**Content**:
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown
- `rehype-highlight` - Code highlighting
- `rehype-raw` - HTML support

**AI**:
- `groq-sdk` - Groq API client
- `@ai-sdk/openai` - AI SDK

**Auth**:
- `bcryptjs` - Password hashing
- `jose` - JWT handling

**Images**:
- `@vercel/og` - OG image generation

---

## Common Patterns

### Pagination
```typescript
const skip = (page - 1) * limit
const items = await prisma.model.findMany({
  skip,
  take: limit,
  orderBy: { createdAt: 'desc' }
})
```

### Reading Time
```typescript
const words = content.split(/\s+/)
const readingTime = Math.ceil(words.length / 200) // 200 wpm
```

### Slug Generation
```typescript
// Use a slug library or create manually
const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
```

### Protected API Route
```typescript
import { requireAdmin } from '@/lib/session'

export async function GET(req: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ...
}
```

---

## Documentation Files

- `README.md` - Project overview and setup
- `docs/SEO-FEATURES.md` - SEO features guide
- `CLAUDE.md` - This file
