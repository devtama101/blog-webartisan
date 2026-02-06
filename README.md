# WebArtisan Blog

A personal blog platform built with Next.js 15 (App Router), Prisma ORM, PostgreSQL, and TypeScript. Features SEO optimization, AI-powered writing tools, and a modern responsive design.

## Features

### Content Management
- **Blog Posts**: Create, edit, and publish blog posts with Markdown support
- **Categories & Tags**: Organize content with flexible taxonomy
- **Cover Images**: Unsplash integration for high-quality images
- **Draft System**: Save drafts before publishing
- **Reading Time**: Auto-calculated based on word count

### SEO & Performance
- **Sitemap**: Auto-generated XML sitemap
- **Robots.txt**: Configurable crawler rules
- **Structured Data**: JSON-LD schema for rich snippets
- **Pagination**: SEO-friendly pagination with clean URLs
- **Open Graph Images**: Dynamic OG images for social sharing
- **Table of Contents**: Auto-generated from headings

### AI-Powered Tools
- **Content Continuation**: AI continues your writing
- **Grammar Fix**: Automatically fix grammar issues
- **Tone Rewrite**: Adjust tone (casual, professional, concise)
- **SEO Metadata**: Generate meta titles, descriptions, and tags

### User Experience
- **Related Posts**: Content-similarity-based recommendations
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Dark Mode Support**: CSS variables for theming
- **Fast Performance**: Next.js 15 with Turbopack

## Documentation

| Document | Description |
|----------|-------------|
| [SEO Features](./docs/SEO-FEATURES.md) | Comprehensive guide to all SEO features, configuration, and best practices |

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
```

## Project Structure

```
blog-webartisan/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [slug]/           # Blog post pages
│   │   ├── admin/            # Admin dashboard
│   │   ├── page/[pageNumber]/# Paginated pages
│   │   ├── api/              # API routes
│   │   ├── sitemap.ts        # XML sitemap
│   │   └── robots.ts         # Robots.txt
│   ├── components/
│   │   ├── blog/             # Blog-specific components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utility functions
│   └── db.ts                 # Prisma client
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

The blog uses Prisma ORM. See `prisma/schema.prisma` for the complete database schema.

### Main Models

- **Post** - Blog posts with content, metadata, and SEO fields
- **Category** - Post categories
- **Tag** - Post tags
- **Comment** - Post comments
- **User** - User accounts and authentication
- **Project** - Portfolio projects
- **Deployment** - Deployment tracking
- **HealthCheck** - System health monitoring

### Prisma Studio

```bash
pnpm db:studio
```

Opens a GUI at [http://localhost:5555](http://localhost:5555) to view and edit database data.

## Deployment

The blog is configured with `output: 'standalone'` for Docker/VPS deployment.

### Docker

```bash
# Build image
docker build -t blog-webartisan .

# Run container
docker run -p 3001:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXT_PUBLIC_BASE_URL="https://yourdomain.com" \
  blog-webartisan
```

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
GROQ_API_KEY="your_key"
UNSPLASH_ACCESS_KEY="your_key"
```

## API Routes

### Public Routes
- `GET /api/b/posts` - List all published posts (paginated)
- `GET /api/b/post/[slug]` - Get single post by slug
- `GET /api/posts/[slug]/related` - Get related posts

### Admin Routes
- `POST /api/admin/post` - Create post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/internal-links` - Internal linking suggestions

### AI Routes
- `POST /api/ai/continue` - Continue writing
- `POST /api/ai/fix-grammar` - Fix grammar
- `POST /api/ai/rewrite` - Rewrite content
- `POST /api/ai/seo` - Generate SEO metadata

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Database | [PostgreSQL](https://www.postgresql.org/) |
| ORM | [Prisma](https://www.prisma.io/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | Custom components with class-variance-authority |
| AI | [Groq API](https://groq.com/) (Llama models) |
| Images | [Unsplash](https://unsplash.com/) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
