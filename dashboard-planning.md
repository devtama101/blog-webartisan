# Blog WebArtisan CMS Dashboard Plan

**Project:** Build comprehensive CMS dashboard for blog-webartisan
**Date:** 2026-02-05
**Status:** Ready to Execute

---

## Overview

Build a professional blog CMS dashboard inspired by the best platforms (Ghost, WordPress, Notion, Substack, Medium) with AI-powered writing tools already implemented.

**Current State:**
- `/admin/new` - Post creation page with AI tools (Continue Writing, Fix Grammar, Make Professional/Casual/Concise)
- `/api/admin/post` - Create post endpoint
- `/api/b/posts`, `/api/b/post/[slug]` - Public blog endpoints
- Prisma schema with rich models (Post, Category, Tag, Comment, PostStats)

**Missing:**
- Dashboard home with overview
- Post management (list, edit, delete, bulk actions)
- Analytics/stats dashboard
- Media library
- Comment moderation
- Category/Tag management
- User management

---

## Navigation Structure

Inspired by Ghost's clean sidebar navigation:

```
/admin
├── /admin              → Dashboard home (overview, stats)
├── /admin/posts        → Post list with filters (all, draft, published, scheduled, archived)
├── /admin/posts/new    → Create new post (existing)
├── /admin/posts/[id]   → Edit existing post
├── /admin/media        → Media library
├── /admin/comments     → Comment moderation
├── /admin/categories   → Category management
├── /admin/tags         → Tag management
├── /admin/users        → User management (if ADMIN role)
└── /admin/settings     → General settings
```

---

## Implementation Plan

### Phase 1: Dashboard Layout & Navigation

**Files to create:**

1. `/src/app/admin/layout.tsx` - Admin layout with sidebar navigation
   - Left sidebar with navigation menu
   - Top bar with user menu
   - Responsive design (mobile drawer)

2. `/src/components/admin/sidebar.tsx` - Navigation sidebar component
   - Logo/brand
   - Navigation links with icons
   - Active state highlighting
   - Collapsible sections

3. `/src/components/admin/topbar.tsx` - Top bar component
   - Breadcrumbs
   - User dropdown
   - Quick actions

**Key Features from Ghost:**
- Clean, minimal design
- Clear visual hierarchy
- Keyboard shortcuts (`Cmd+K` for command palette)
- Collapsible sidebar

---

### Phase 2: Dashboard Home (`/admin`)

**File:** `/src/app/admin/page.tsx`

**Metrics Card (from Substack/Medium):**
- Total posts (published/draft)
- Total views (today/week/month)
- Total comments (pending/approved)
- Quick actions (New Post, Upload Media)

**Charts (inspired by Ghost/WordPress):**
- Views over time (line chart)
- Top posts (table)
- Recent activity (list)

**Quick Stats (from Medium):**
- Most viewed posts this week
- Posts with most engagement
- Pending comments count

---

### Phase 3: Post Management (`/admin/posts`)

**File:** `/src/app/admin/posts/page.tsx`

**Features (from WordPress/Ghost):**
- **Filters:** All, Published, Draft, Scheduled, Archived
- **Search:** By title or content
- **Sort:** Date, Title, Views
- **Bulk actions:** Delete, Publish, Unpublish, Archive, Restore, Move to Trash
- **Quick edit:** Status, title, category
- **Per-page:** 10, 25, 50, 100

**Table Columns:**
- Status indicator (published/draft/scheduled/archived)
- Title (with excerpt preview)
- Author
- Category/Tags
- Date
- Views
- Actions (Edit, Delete, Archive/Restore, View)

**Archive Functionality:**
- Archive posts instead of deleting (posts remain accessible but not listed)
- Archived posts don't appear in public feed
- Restore from archive functionality
- Bulk archive/restore actions

**API needed:**
- `GET /api/admin/posts` - List posts with filters
- `PATCH /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post (permanently)
- `POST /api/admin/posts/[id]/archive` - Archive post
- `POST /api/admin/posts/[id]/restore` - Restore from archive
- `POST /api/admin/posts/bulk` - Bulk operations

---

### Phase 4: Edit Post (`/admin/posts/[id]`)

**File:** `/src/app/admin/posts/[id]/page.tsx`

**Reuse existing `/admin/new/page.tsx` structure:**
- Same AI writing tools
- Same cover image selection
- Same SEO fields
- Add: Version history (from Notion)
- Add: Preview button (from Ghost)
- Add: Save as draft / Publish / Schedule / Archive options

**YouTube Embed Feature:**
- Paste YouTube URL → auto-embed video
- Support for YouTube shorts and regular videos
- Customizable video width/height
- Support for start time parameter (e.g., `?t=30`)
- Preview embedded video in editor
- YouTube thumbnail as cover image option
- Supports both full URL and short URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/shorts/VIDEO_ID`

**Implementation:**
- Regex pattern to detect YouTube URLs in content
- Auto-convert to iframe embed
- Component: `<YouTubeEmbed url="..." />`
- Store as `{{youtube:VIDEO_ID}}` in content, render as iframe on frontend

**API needed:**
- `GET /api/admin/posts/[id]` - Get single post
- `PUT /api/admin/posts/[id]` - Update post

---

### Phase 5: Analytics Dashboard (`/admin/analytics`)

**File:** `/src/app/admin/analytics/page.tsx`

**Metrics (from Substack/Ghost):**
- Views over time (date range picker)
- Unique visitors
- Top performing posts
- Traffic sources (direct, social, search)
- Engagement metrics (avg read time, bounce rate)
- Subscriber growth (if newsletter)

**Charts:**
- Line chart: Views over time
- Bar chart: Posts by views
- Pie chart: Traffic sources
- Table: Top posts with engagement metrics

**API needed:**
- `GET /api/admin/analytics` - Analytics data
- `GET /api/admin/analytics/posts` - Top posts
- `GET /api/admin/stats/posts/[id]` - Individual post stats

---

### Phase 6: Media Library (`/admin/media`)

**File:** `/src/app/admin/media/page.tsx`

**Features (from WordPress):**
- Grid and list views
- Drag-and-drop upload
- Image preview modal
- Bulk selection
- Filter by type (image, video, document)
- Search by filename
- Image editing (crop, rotate, alt text)

**API needed:**
- `GET /api/admin/media` - List media
- `POST /api/admin/media/upload` - Upload file
- `DELETE /api/admin/media/[id]` - Delete media
- `PUT /api/admin/media/[id]` - Update metadata

**Storage options:**
- Local: `/public/uploads/`
- Cloud: S3, Cloudinary (future)

---

### Phase 7: Comment Moderation (`/admin/comments`)

**File:** `/src/app/admin/comments/page.tsx`

**Features (from WordPress/Ghost):**
- List with status (Pending, Approved, Spam)
- Quick actions: Approve, Spam, Delete, Reply
- Filter by status
- Search by content or author
- Bulk moderation
- Comment detail view

**Table Columns:**
- Checkbox (bulk select)
- Author name + email
- Comment preview
- Post
- Date
- Status badge
- Actions

**API needed:**
- `GET /api/admin/comments` - List comments
- `PATCH /api/admin/comments/[id]` - Update status
- `DELETE /api/admin/comments/[id]` - Delete comment
- `POST /api/admin/comments/bulk` - Bulk actions

---

### Phase 8: Category & Tag Management

**Files:**
- `/src/app/admin/categories/page.tsx`
- `/src/app/admin/tags/page.tsx`

**Features:**
- List with post count
- Create, edit, delete
- Color coding (categories)
- Merge tags
- Bulk operations

**API needed:**
- `GET /api/admin/categories` - List categories
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/[id]` - Update category
- `DELETE /api/admin/categories/[id]` - Delete category
- Same for tags

---

### Phase 9: User Management (`/admin/users`)

**File:** `/src/app/admin/users/page.tsx`

**Features:**
- List users with role badges
- Create user
- Edit user (name, email, role)
- Reset password
- Activity log

**API needed:**
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

---

## File Structure

```
src/
├── app/
│   └── admin/
│       ├── layout.tsx                    ← NEW (admin layout)
│       ├── page.tsx                      ← NEW (dashboard home)
│       ├── posts/
│       │   ├── page.tsx                  ← NEW (post list)
│       │   ├── new/page.tsx              ← EXISTING (reuse)
│       │   └── [id]/page.tsx             ← NEW (edit post)
│       ├── media/
│       │   └── page.tsx                  ← NEW (media library)
│       ├── comments/
│       │   └── page.tsx                  ← NEW (comment moderation)
│       ├── categories/
│       │   └── page.tsx                  ← NEW
│       ├── tags/
│       │   └── page.tsx                  ← NEW
│       ├── analytics/
│       │   └── page.tsx                  ← NEW
│       ├── users/
│       │   └── page.tsx                  ← NEW
│       └── settings/
│           └── page.tsx                  ← NEW
├── components/
│   └── admin/
│       ├── sidebar.tsx                   ← NEW
│       ├── topbar.tsx                    ← NEW
│       ├── metrics-card.tsx              ← NEW
│       ├── data-table.tsx                ← NEW (reusable)
│       ├── status-badge.tsx              ← NEW
│       ├── command-palette.tsx           ← NEW (Cmd+K)
│       └── youtube-embed.tsx             ← NEW (YouTube iframe component)
└── lib/
    └── admin-hooks.ts                    ← NEW (shared hooks)
```

---

## YouTube Embed Implementation

**Component:** `/src/components/admin/youtube-embed.tsx`

```tsx
// Props: url, width, height, startTime
// Extracts video ID from various YouTube URL formats
// Renders responsive iframe with lazy loading
// Supports: regular videos, shorts, embed URLs
```

**Parser Function:** `/src/lib/youtube-parser.ts`

```typescript
// Detects YouTube URLs in markdown/text
// Formats:
//   - https://www.youtube.com/watch?v=VIDEO_ID
//   - https://youtu.be/VIDEO_ID
//   - https://www.youtube.com/shorts/VIDEO_ID
//   - https://www.youtube.com/embed/VIDEO_ID
// Extracts: video ID, start time parameter
// Returns: {{youtube:VIDEO_ID}} or {{youtube:VIDEO_ID?start=SECONDS}}
```

**Frontend Renderer:** `/src/components/blog/youtube-renderer.tsx`

```tsx
// Parses content for {{youtube:...}} placeholders
// Renders as responsive iframe
// Options: autoplay, mute, controls
```

**Editor Integration:**
- Auto-detect YouTube URL when pasted
- Show "Embed as YouTube video" prompt
- Insert {{youtube:VIDEO_ID}} placeholder
- Live preview in editor

---

## API Routes to Create

```
src/app/api/admin/
├── posts/
│   ├── route.ts              ← NEW (GET list, POST create)
│   └── [id]/
│       └── route.ts          ← NEW (GET, PUT, DELETE)
├── comments/
│   ├── route.ts              ← NEW (GET list)
│   └── [id]/
│       └── route.ts          ← NEW (PATCH status, DELETE)
├── media/
│   ├── route.ts              ← NEW (GET list, POST upload)
│   └── [id]/
│       └── route.ts          ← NEW (PUT metadata, DELETE)
├── categories/
│   └── route.ts              ← NEW (CRUD)
├── tags/
│   └── route.ts              ← NEW (CRUD)
├── users/
│   └── route.ts              ← NEW (CRUD)
├── analytics/
│   └── route.ts              ← NEW (GET stats)
└── bulk/
    └── route.ts              ← NEW (POST bulk operations)
```

---

## Database Changes

Current Prisma schema is well-structured. Additions needed:

```prisma
// Add to schema
model Media {
  id          String   @id @default(cuid())
  filename    String
  originalName String
  mimeType    String
  size        Int
  url         String
  alt         String?
  width       Int?
  height      Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String
  entity      String   // 'post', 'comment', 'media', etc.
  entityId    String
  metadata    Json?
  createdAt   DateTime @default(now())
}

// Update PostStatus enum to include ARCHIVED
enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  ARCHIVED  // NEW: Posts archived instead of deleted
}
```

**Archive Behavior:**
- Archived posts keep their URL and remain accessible if you have the link
- Archived posts excluded from public RSS feed
- Archived posts excluded from homepage and archive pages
- Archived posts still visible in search (optional)
- Archive action reversible (restore)

---

## Component Reuse Strategy

**Existing components to reuse:**
- `/src/components/ui/button.tsx` - Button component (need to create)
- `/src/lib/utils.ts` - Utility functions (cn, etc.) (need to create)

**New shared components to create:**
- `DataTable` - Reusable table with sorting, filtering, pagination
- `StatusBadge` - Display post/comment status with colors
- `MetricCard` - Display stats with trend indicators
- `ConfirmDialog` - Confirmation before destructive actions
- `EmptyState` - When no data exists

---

## Key Features from Top CMS Platforms

| Feature | Source | Priority |
|---------|--------|----------|
| Clean sidebar navigation | Ghost | High |
| Real-time analytics charts | Ghost | High |
| Post status indicators | WordPress | High |
| Bulk actions | WordPress | Medium |
| Command palette (Cmd+K) | Notion | Medium |
| Version history | Notion | Low |
| Focus mode | Ghost | Low |
| Scheduled publishing | Substack | High |
| Media library with drag-drop | WordPress | Medium |
| Comment moderation queue | WordPress | High |
| **Archive posts (not delete)** | WordPress/Ghost | **High** |
| **YouTube embed in posts** | Medium/Substack | **High** |

---

## Implementation Priority

**MVP (Phase 1-4):**
1. Admin layout with navigation
2. Dashboard home with stats
3. Post list page
4. Edit post page

**Essential (Phase 5-7):**
5. Analytics dashboard
6. Media library
7. Comment moderation

**Nice to have (Phase 8-9):**
8. Category/Tag management
9. User management

---

## Critical Files to Reference

| File | Purpose |
|------|---------|
| `/src/app/admin/new/page.tsx` | Reuse for edit post structure |
| `/src/app/api/admin/post/route.ts` | Reference for post CRUD pattern |
| `/prisma/schema.prisma` | Database structure |

---

## Verification Steps

After implementation:

1. **Navigate to `/admin`** - Dashboard home loads with stats
2. **Navigate to `/admin/posts`** - Post list displays all posts
3. **Click "New Post"** - Creates new post, AI tools work
4. **Edit existing post** - All fields populate correctly
5. **Delete post** - Confirmation dialog, post removed
6. **Upload media** - File saves, appears in media library
7. **Moderate comments** - Status changes, reflects on public site
8. **View analytics** - Charts render, data is accurate

---

## Post-Deployment Checklist

- [ ] Admin layout with sidebar navigation
- [ ] Dashboard home with metrics cards
- [ ] Post list with filters and search (including archived filter)
- [ ] Create/edit/delete post functionality
- [ ] **Archive/Restore post functionality**
- [ ] **YouTube embed in posts (auto-detect URLs, render iframe)**
- [ ] Media library with upload
- [ ] Comment moderation interface
- [ ] Analytics dashboard with charts
- [ ] Category/Tag management
- [ ] User management (admin only)
- [ ] Bulk actions for posts/comments (including bulk archive)
- [ ] Command palette (Cmd+K)
- [ ] Responsive design (mobile)
- [ ] Role-based access control

---

## Design Inspiration

- **Ghost:** Clean, writer-focused interface
- **WordPress:** Powerful post management
- **Notion:** Flexible database views
- **Substack:** Revenue and subscriber analytics
- **Medium:** Engagement metrics and insights

---

## Notes

- Use existing AI tools (Groq) for content assistance
- Keep design minimal and distraction-free (Ghost philosophy)
- Prioritize writing experience over complex features
- Build incrementally, starting with MVP

---

## Additional Features Added

### Archive Post Functionality
- Posts can be archived instead of permanently deleted
- Archived posts remain accessible via direct URL
- Archived posts excluded from public listings, RSS, homepage
- Restore functionality to bring posts back from archive
- Bulk archive/restore actions in post list

### YouTube Embed Support
- Paste any YouTube URL → auto-converts to embed
- Supports: youtube.com, youtu.be, shorts URLs
- Extracts video ID and optional start time (`?t=30`)
- Stored as `{{youtube:VIDEO_ID}}` in content
- Rendered as responsive iframe on frontend
- Preview in editor while writing
- Option to use YouTube thumbnail as cover image
