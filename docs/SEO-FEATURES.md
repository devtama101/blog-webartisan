# SEO Features Documentation

WebArtisan Blog includes comprehensive SEO features to help your content rank better in search engines and drive more organic traffic.

## Table of Contents

1. [Sitemap Generation](#sitemap-generation)
2. [Robots.txt](#robotstxt)
3. [Structured Data (Schema.org)](#structured-data-schemaorg)
4. [Pagination SEO](#pagination-seo)
5. [Table of Contents](#table-of-contents)
6. [Related Posts](#related-posts)
7. [Internal Linking Suggestions](#internal-linking-suggestions)
8. [AI-Powered SEO Tools](#ai-powered-seo-tools)
9. [Reading Time](#reading-time)
10. [Open Graph Images](#open-graph-images)
11. [Configuration](#configuration)
12. [Best Practices](#best-practices)

---

## Sitemap Generation

**Location**: `src/app/sitemap.ts`

### What It Does

Automatically generates an XML sitemap that helps search engines discover and index your content. The sitemap includes:

| Content Type | Priority | Change Frequency |
|--------------|----------|------------------|
| Homepage | 1.0 | daily |
| Paginated pages (page 2+) | 0.9 | daily |
| Blog posts | 0.8 | weekly |
| Category pages | 0.6 | weekly |
| Tag pages | 0.5 | weekly |
| Admin page | 0.3 | monthly |

### How It Works

The sitemap is dynamically generated at build time by querying the database for all published posts, categories, and tags. Paginated pages are automatically calculated based on the total number of posts.

### Access

- **URL**: `https://yourdomain.com/sitemap.xml`
- **Format**: XML
- **Auto-updates**: Regenerates on each build

---

## Robots.txt

**Location**: `src/app/robots.ts`

### What It Does

Controls which parts of your site search engines can crawl.

### Current Rules

```
# Allow all crawlers
User-agent: *

# Block admin and API areas
Disallow: /admin
Disallow: /api

# Sitemap reference
Sitemap: https://yourdomain.com/sitemap.xml
```

### Access

- **URL**: `https://yourdomain.com/robots.txt`

---

## Structured Data (Schema.org)

**Locations**:
- Component: `src/components/blog/json-ld.tsx`
- Generator: `src/lib/schema-generator.ts`

### What It Does

Injects JSON-LD structured data that helps search engines understand your content better. This can result in rich snippets in search results.

### Schema Types Implemented

#### 1. BlogPosting Schema

For individual blog posts, includes:
- Article headline and description
- Author information
- Publication date and modified date
- Publisher details
- Cover image
- Word count
- Language

#### 2. Breadcrumb Schema

Helps search engines understand your site structure and can display breadcrumb navigation in search results.

#### 3. WebSite Schema

Site-wide information including:
- Site name and description
- Site URL
- Potential actions (search)

### Implementation

The JSON-LD component is automatically included in blog post pages. No manual configuration needed.

---

## Pagination SEO

**Locations**:
- API: `src/app/api/b/posts/route.ts`
- Component: `src/components/blog/pagination.tsx`
- Routes: `src/app/page/[pageNumber]/page.tsx`

### What It Does

Splits your blog content across multiple pages while maintaining SEO best practices.

### Features

1. **Clean URL Structure**
   - Page 1: `/` (homepage)
   - Page 2: `/page/2`
   - Page 3: `/page/3`
   - etc.

2. **rel="next" and rel="prev" Links**
   - Automatically added to indicate pagination sequence
   - Helps search engines understand page relationships

3. **Configurable Posts Per Page**
   - Default: 6 posts per page
   - Optimized for UX and page load speed

### Configuration

Edit the `POSTS_PER_PAGE` constant in:
- `src/app/sitemap.ts`
- `src/app/api/b/posts/route.ts`

```typescript
const POSTS_PER_PAGE = 6  // Change this value
```

---

## Table of Contents

**Locations**:
- Component: `src/components/blog/table-of-contents.tsx`
- Generator: `src/lib/toc-generator.ts`

### What It Does

Automatically generates a navigable table of contents from your post's markdown headings.

### Features

1. **Auto-Generation**
   - Extracts `##` and `###` headings from markdown
   - Creates anchor links for each section

2. **Responsive Design**
   - Desktop: Sticky sidebar on the right
   - Mobile: Collapsible drawer with toggle button

3. **Smooth Scrolling**
   - Clicking a link smoothly scrolls to the section
   - Proper offset for fixed headers

### How to Use

No configuration needed. Simply use markdown headings in your post content:

```markdown
# Main Title (H1 - not included in TOC)

## Section 1 (H2 - included)
Content here...

### Subsection 1.1 (H3 - included)
More content...

## Section 2 (H2 - included)
Content...
```

---

## Related Posts

**Locations**:
- Component: `src/components/blog/related-posts.tsx`
- API: `src/app/api/posts/[slug]/related/route.ts`
- Algorithm: `src/lib/content-similarity.ts`

### What It Does

Automatically displays related posts at the bottom of each article based on content similarity.

### How It Works

1. **Content Analysis**
   - Tokenizes post content into words
   - Removes common stop words (281 words)
   - Calculates term frequency (TF)

2. **Similarity Calculation**
   - Uses cosine similarity algorithm
   - Compares content vectors between posts
   - Filters results with similarity > 0.05

3. **Display**
   - Shows up to 4 related posts
   - Sorted by similarity score

### API Endpoint

```
GET /api/posts/{slug}/related
```

**Response Example**:
```json
[
  {
    "slug": "another-post",
    "title": "Another Post Title",
    "excerpt": "Post excerpt...",
    "coverImage": "https://...",
    "similarity": 0.234
  }
]
```

### Customization

To adjust the similarity threshold or number of results, edit:
`src/app/api/posts/[slug]/related/route.ts`

```typescript
const MIN_SIMILARITY = 0.05  // Lower = more results
const MAX_RESULTS = 4        // Number of posts to show
```

---

## Internal Linking Suggestions

**Location**: `src/app/api/admin/internal-links/route.ts`

### What It Does

Suggests relevant posts to link to while editing, helping you build internal link structure.

### API Endpoint

```
POST /api/admin/internal-links
```

**Request Body**:
```json
{
  "content": "Your post content here...",
  "excludeSlug": "current-post-slug"
}
```

**Response**:
```json
[
  {
    "slug": "related-post",
    "title": "Related Post Title",
    "matchCount": 3
  }
]
```

### How It Works

1. Finds posts with titles or excerpts matching keywords in your content
2. Excludes the current post
3. Returns up to 5 suggestions ranked by match count

### Usage in Admin

The admin editor can integrate this endpoint to suggest internal links while you write.

---

## AI-Powered SEO Tools

**Location**: `src/app/api/ai/seo/route.ts`

### What It Does

Generates SEO-optimized metadata for your posts using AI.

### API Endpoint

```
POST /api/ai/seo
```

**Request Body**:
```json
{
  "title": "Your Post Title",
  "content": "Your post content..."
}
```

**Response**:
```json
{
  "metaTitle": "SEO-Optimized Title (50-60 chars)",
  "metaDescription": "SEO-optimized description (150-160 chars)",
  "tags": ["tag1", "tag2", "tag3"]
}
```

### Features

1. **Meta Title Generation**
   - Optimized for 50-60 characters
   - Includes keywords from your content

2. **Meta Description Generation**
   - Optimized for 150-160 characters
   - Compelling copy to improve CTR

3. **Tag Suggestions**
   - Relevant tags based on content
   - Helps with categorization

### Usage

1. Create a new post in `/admin/new`
2. Click "Generate SEO" button
3. AI analyzes your content and generates metadata
4. Review and edit as needed
5. Save with your post

---

## Reading Time

**Locations**:
- `src/app/[slug]/page.tsx`
- `src/app/page.tsx`

### What It Does

Calculates and displays estimated reading time for each post.

### Calculation

Based on **200 words per minute** average reading speed:

```typescript
readingTime = Math.ceil(wordCount / 200)
```

### Display

Shown in post meta:
```
December 15, 2025 • 5 min read
```

### Database Field

Posts have a `readingTime` field that can be manually set. If not set, it's automatically calculated from content.

---

## Open Graph Images

**Location**: `src/app/[slug]/opengraph-image.tsx`

### What It Does

Generates dynamic OG images for social media sharing (Facebook, LinkedIn, etc.).

### Features

- **Dynamic Generation**: Each post gets a unique OG image
- **Gradient Background**: Eye-catching colored backgrounds
- **Site Branding**: Includes "WebArtisan Blog" text
- **Post Title**: Displays the post title overlay

### Access

The OG image URL is automatically included in the page meta tags:
```html
<meta property="og:image" content="https://yourdomain.com/post-slug/opengraph-image" />
```

### Dimensions

- **Recommended**: 1200 x 630 pixels
- **Minimum**: 600 x 315 pixels

---

## Configuration

### Environment Variables

Set these in your `.env.local` file:

```bash
# Your site URL (used in sitemap and robots.txt)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Groq API for AI SEO tools
GROQ_API_KEY=your_groq_api_key

# Unsplash for cover images
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

### Posts Per Page

To change pagination settings, edit these files:

1. `src/app/sitemap.ts`
2. `src/app/api/b/posts/route.ts`

Change the `POSTS_PER_PAGE` constant (default: 6).

---

## Best Practices

### 1. Content Structure

- Use descriptive, keyword-rich headings
- Include target keywords naturally
- Write compelling meta descriptions
- Use relevant cover images

### 2. Internal Linking

- Link to related posts within your content
- Use descriptive anchor text
- Build topic clusters around core themes

### 3. URL Structure

- Post URLs use the slug field
- Keep slugs short and descriptive
- Use hyphens between words

### 4. Images

- Always add cover images to posts
- Use descriptive file names
- Alt text is automatically handled

### 5. Regular Updates

- Update old posts with new information
- The `updatedAt` field is tracked in the sitemap
- Fresh content can improve rankings

### 6. SEO Checklist for New Posts

- [ ] Write compelling title (50-60 chars for SEO)
- [ ] Craft enticing excerpt/meta description
- [ ] Add relevant cover image
- [ ] Use proper heading structure (H2, H3)
- [ ] Link to 2-3 related posts internally
- [ ] Add relevant tags
- [ ] Use AI SEO tool for optimization suggestions
- [ ] Review preview in social media sharing

---

## Monitoring SEO

### Check Your Sitemap

Visit `https://yourdomain.com/sitemap.xml` to verify all pages are included.

### Check Robots.txt

Visit `https://yourdomain.com/robots.txt` to verify crawler rules.

### Test Structured Data

Use Google's [Rich Results Test](https://search.google.com/test/rich-results) to validate your schema markup.

### Submit to Search Engines

- **Google Search Console**: Submit your sitemap
- **Bing Webmaster Tools**: Submit your sitemap

---

## Future Enhancements

Planned SEO features:

1. **RSS Feed** - For content syndication
2. **Canonical URLs** - For duplicate content control
3. **Twitter Card Tags** - For Twitter sharing optimization
4. **Breadcrumb Component** - Visual breadcrumb navigation
5. **Image Alt Text AI** - Auto-generate alt text for images
6. **SEO Score** - Content analysis with improvement suggestions

---

## Support

For issues or questions about SEO features, check:
- Next.js SEO documentation: https://nextjs.org/docs/app/building-your-application/optimizing/seo
- Schema.org documentation: https://schema.org/
- Google Search Central: https://developers.google.com/search
