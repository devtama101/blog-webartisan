# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebArtisan Blog is a personal blog platform built with Next.js 15 (App Router), Prisma ORM, PostgreSQL, and TypeScript. It features a blog with posts, a project portfolio system, deployment tracking, health monitoring, and AI-powered writing tools.

## Commands

### Development
```bash
pnpm dev          # Start development server
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
pnpm db:seed      # Seed database with admin user
```

The database schema is in `prisma/schema.prisma`. Environment variables are loaded from `.env.local` with `DATABASE_URL`.

## Architecture

### App Router Structure
- `src/app/` - Next.js 15 App Router pages
  - `page.tsx` - Homepage (blog listing)
  - `[slug]/page.tsx` - Individual blog post pages
  - `admin/new/page.tsx` - Post creation editor with AI tools
  - `api/` - API routes

### Database Layer
- `src/db.ts` - Prisma client singleton (prevents multiple instances in dev)
- Models: `Post`, `Category`, `Tag`, `Comment`, `User`, `Project`, `Deployment`, `HealthCheck`, `ProjectStats`, `PostStats`, `Account`, `Session`, `VerificationToken`

### API Routes
- `api/b/posts` - Public blog posts listing
- `api/b/post/[slug]` - Single blog post
- `api/admin/post` - Admin CRUD for posts
- `api/ai/*` - AI writing tools (continue, fix-grammar, rewrite, seo)
- `api/images/unsplash` - Unsplash image search

### Client Pages
All pages use `"use client"` directive. The blog homepage fetches posts client-side via `fetch()` to the API routes.

### AI Integration
The blog uses OpenAI SDK for AI-powered features:
- Content continuation
- Grammar fixing
- Tone rewriting (casual, professional, concise)
- SEO metadata generation

### Deployment
Next.js is configured with `output: 'standalone'` for Docker/VPS deployment. The app serves itself on port 3000.

### Styling
Uses Tailwind CSS with CSS variables for theming (defined in `src/app/globals.css`). The `@/*` path alias maps to `src/*`.

### Components
- `src/components/ui/button.tsx` - Reusable button component using class-variance-authority
- `src/lib/utils.ts` - Utility functions including `cn()` for className merging
