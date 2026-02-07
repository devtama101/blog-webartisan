# Automatic Features Guide

This document explains all the automatic features in WebArtisan Blog and how they work under the hood.

---

## Table of Contents

1. [SEO Features](#seo-features)
2. [Related Posts](#related-posts)
3. [Table of Contents](#table-of-contents)
4. [Reading Time](#reading-time)
5. [Content Processing](#content-processing)
6. [Pagination](#pagination)
7. [AI Features](#ai-features)
8. [Analytics & Tracking](#analytics--tracking)
9. [Author Display](#author-display)

---

## SEO Features

### Dynamic Sitemap (`/sitemap.xml`)

**File**: `src/app/sitemap.ts`

The sitemap is automatically generated and includes:

- **Static pages**: Homepage (`/`), Admin dashboard (`/admin`)
- **All published blog posts**: Each post gets its own entry
- **Category pages**: `/category/[slug]` for each category
- **Tag pages**: `/tag/[slug]` for each tag
- **Paginated pages**: `/page/2`, `/page/3`, etc.

**How it works**:

```typescript
// Fetches all published posts from database
const posts = await prisma.post.findMany({ where: { status: 'PUBLISHED' } })

// Generates entries with metadata
{
  url: `${baseUrl}/${post.slug}`,
  lastModified: post.updatedAt,
  changeFrequency: 'weekly',
  priority: 0.7
}
```

**Configuration**:
- `POSTS_PER_PAGE = 6` - Used to calculate pagination URLs
- Skips generation during build if database is unavailable

**Access**: `https://yourdomain.com/sitemap.xml`

---

### Robots.txt (`/robots.txt`)

**File**: `src/app/robots.ts`

Automatically generates crawler rules:

```txt
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin/
Disallow: /api/

Sitemap: https://yourdomain.com/sitemap.xml
```

**Access**: `https://yourdomain.com/robots.txt`

---

### JSON-LD Structured Data

**Files**: `src/lib/schema-generator.ts`, `src/components/blog/json-ld.tsx`

Automatically adds Schema.org markup to every post page for rich search results.

**Types generated**:

1. **BlogPosting** - Article data
   - Title, description, image
   - Publish/update dates
   - Author information
   - Word count

2. **BreadcrumbList** - Navigation path
   - Home → Post Title

3. **WebSite** - Site metadata
   - Name, URL, search action

**Example output**:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Your Post Title",
  "author": {
    "@type": "Person",
    "name": "John Doe"
  },
  "datePublished": "2025-01-15",
  "dateModified": "2025-01-15"
}
</script>
```

---

### Meta Tags

**Database Fields**: `Post.metaTitle`, `Post.metaDescription`, `Post.canonicalUrl`

When creating a post, you can set:
- **Meta Title**: Custom title for SEO (overrides post title)
- **Meta Description**: Custom description for search results
- **Canonical URL**: Preferred URL if content is syndicated

If not set, defaults to:
- Title: Post title
- Description: Auto-generated excerpt or first 160 characters

---

### Open Graph Images

**Database Field**: `Post.ogImage`

Each post can have a custom OG image for social sharing. Falls back to:
1. Custom OG image
2. Cover image
3. Default site image

---

## Related Posts

**Files**: `src/lib/content-similarity.ts`, `src/app/api/posts/[slug]/related/route.ts`

Related posts are automatically calculated using **cosine similarity** on post content.

### How the Algorithm Works

1. **Tokenization**: Split content into individual words
2. **Stop Words Removal**: Filter out 281 common words (the, a, is, etc.)
3. **TF-IDF Calculation**: Score each word's importance
4. **Cosine Similarity**: Compare post vectors
5. **Filtering**: Return posts with similarity score > 0.05

```typescript
// Simplified algorithm
function calculateSimilarity(content1: string, content2: string): number {
  const tokens1 = tokenize(content1)
  const tokens2 = tokenize(content2)
  const vector1 = createVector(tokens1)
  const vector2 = createVector(tokens2)
  return cosineSimilarity(vector1, vector2)
}
```

### Configuration

- **Minimum similarity**: 0.05 (5% match)
- **Max results**: 5 posts
- **Excludes**: Current post, draft posts

### Display Location

Automatically shown at the bottom of each blog post.

---

### Internal Linking Suggestions

**API**: `GET /api/admin/internal-links`

Suggests internal links based on:
1. **Shared keywords**: Posts with overlapping content
2. **Title matches**: Posts whose titles appear in your content

Used in the admin editor to help with SEO.

---

## Table of Contents

**Files**: `src/lib/toc-generator.ts`, `src/components/blog/table-of-contents.tsx`

### How It Works

1. **Extract Headings**: Parses markdown for `##` and `###` headings
2. **Generate Slugs**: Creates URL-friendly anchor IDs
3. **Build Hierarchy**: Structures H2 → H3 parent-child relationships
4. **Render**: Displays as clickable navigation

```typescript
// Input markdown
## Getting Started
### Installation
### Configuration

// Output TOC
[
  { title: 'Getting Started', id: 'getting-started', children: [
    { title: 'Installation', id: 'installation' },
    { title: 'Configuration', id: 'configuration' }
  ]}
]
```

### Display

- **Desktop**: Sidebar on the right, sticky while scrolling
- **Mobile**: Toggle button that opens a drawer

### Smooth Scrolling

Clicking a TOC link smoothly scrolls to that heading.

---

## Reading Time

**Files**: Multiple, uses 200 words per minute standard

### Calculation

```typescript
const words = content.split(/\s+/).length
const readingTime = Math.ceil(words / 200) // 200 wpm
```

### Storage

Reading time is calculated once and stored in the database (`Post.readingTime`) for performance.

### Display

Shown on:
- Homepage post cards
- Individual post pages
- Admin post list

Format: "5 min read"

---

## Content Processing

### Markdown Rendering

**File**: `src/app/[slug]/page.tsx`

Uses **React Markdown** with plugins:

| Plugin | Purpose |
|--------|---------|
| `remark-gfm` | GitHub Flavored Markdown (tables, strikethrough, task lists) |
| `rehype-highlight` | Syntax highlighting for code blocks |
| `remark-headings` | Custom heading processing for TOC |

### YouTube Video Processing

**Files**: `src/lib/youtube-parser.ts`, `src/components/blog/youtube-renderer.tsx`

Automatically detects and embeds YouTube videos.

**Supported URL formats**:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

**Process**:
1. Detect YouTube URLs in content
2. Extract video ID using regex
3. Replace with embed code

---

## Pagination

**Files**: `src/app/api/b/posts/route.ts`, `src/components/blog/pagination.tsx`

### How It Works

```typescript
const skip = (page - 1) * limit
const posts = await prisma.post.findMany({
  skip,
  take: limit
})
```

### Configuration

- **Posts per page**: 6
- **Max limit**: 50 (for API requests)
- **URL structure**: `/`, `/page/2`, `/page/3`

### Smart Pagination UI

- Shows page numbers with ellipsis for many pages
- Always shows first and last page
- Highlights current page
- Shows prev/next buttons

### SEO Links

Automatically adds `<link rel="next">` tags for pagination.

---

## AI Features

All AI features use **Groq API** with **Llama 3.3 70B** model.

### Content Continuation

**API**: `POST /api/ai/continue`

Continues your writing from where you left off.

**Configuration**:
- Max: 2-3 paragraphs
- Tokens: 500
- Temperature: 0.7 (balanced creativity)

### Grammar Fix

**API**: `POST /api/ai/fix-grammar`

Corrects grammar and spelling while maintaining your tone.

**Configuration**:
- Max tokens: 2000
- Temperature: 0.3 (more conservative)
- Prompt: "Fix grammar and spelling issues only"

### Tone Rewrite

**API**: `POST /api/ai/rewrite`

Rewrites content in different styles:

| Style | Description |
|-------|-------------|
| **Casual** | Conversational, friendly tone |
| **Professional** | Formal, business-like |
| **Concise** | Removes fluff, gets to the point |

### SEO Metadata Generation

**API**: `POST /api/ai/seo`

Generates SEO-friendly metadata:

- **Meta Title**: 50-60 characters
- **Meta Description**: 150-160 characters
- **Tags**: 5-10 relevant tags

### Content Summarization

**API**: `POST /api/ai/summarize`

Creates a 1-2 sentence excerpt for your post.

**Configuration**:
- Max length: 200 characters
- Tokens: 150

### AI Usage Tracking

**File**: `src/lib/ai-usage.ts`, Database: `AiUsageLog`

Every AI request is logged:
- User ID
- Endpoint used
- Token counts (prompt + completion)
- Timestamp

View usage at `/admin/ai-usage`.

---

## Analytics & Tracking

### Post Statistics

**Database**: `PostStats` model

Automatically tracks per-post, per-day metrics:

- **Views**: Total page views
- **Visitors**: Unique visitors
- **Bounce Rate**: Single-page visit percentage
- **Avg Time**: Average time on page

### Activity Logging

**API**: Internal, logged via `src/lib/ai-usage.ts`

Tracks all user actions in the admin:
- Post created/updated/deleted
- Comment moderated
- Settings changed
- Media uploaded

View at: Admin dashboard activity feed.

---

## Author Display

**Files**: `src/lib/avatar.ts`, `src/app/page.tsx`, `src/app/[slug]/page.tsx`

### Avatar Generation

Automatically generates author avatars:

1. **Custom Image**: Uses uploaded profile photo
2. **Initials Fallback**: Uses Dicebear API to generate initials

```typescript
// Example: "John Doe" → "JD" → SVG avatar
getAvatarUrl("John Doe", null)
// Returns: https://api.dicebear.com/7.x/initials/svg?seed=JD&backgroundColor=3b82f6&textColor=ffffff
```

### Display Locations

- **Homepage**: Author avatar + name below each post excerpt
- **Post pages**: Author info in meta section below title
- **Admin posts table**: Author column

---

## Summary

| Feature | Automatic? | Configurable | Location |
|---------|-----------|--------------|----------|
| Sitemap | ✅ | POSTS_PER_PAGE | `/sitemap.xml` |
| Robots.txt | ✅ | Base URL | `/robots.txt` |
| JSON-LD | ✅ | Schema types | Post pages |
| Related Posts | ✅ | MIN_SIMILARITY | Post bottom |
| Table of Contents | ✅ | Heading levels | Sidebar/mobile |
| Reading Time | ✅ | Word count | All post displays |
| Markdown Rendering | ✅ | Plugins | Post content |
| YouTube Embeds | ✅ | URL formats | Post content |
| Pagination | ✅ | POSTS_PER_PAGE | Homepage, `/page/n` |
| AI Features | ✅ | API key, model | Admin editor |
| Author Avatars | ✅ | Dicebear theme | Post cards, pages |

All features work automatically with no configuration required. Adjust constants in the files shown to customize behavior.
