import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// Create fresh Prisma client for seeding
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/webartisan_platform'
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean existing data
  await prisma.activityLog.deleteMany({})
  await prisma.aiUsageLog.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.postStats.deleteMany({})
  await prisma.media.deleteMany({})
  await prisma.tag.deleteMany({})
  await prisma.category.deleteMany({})
  await prisma.post.deleteMany({})

  console.log('Seeding data...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Web Development', slug: 'web-development' } }),
    prisma.category.create({ data: { name: 'React', slug: 'react' } }),
    prisma.category.create({ data: { name: 'Next.js', slug: 'nextjs' } }),
    prisma.category.create({ data: { name: 'TypeScript', slug: 'typescript' } }),
    prisma.category.create({ data: { name: 'Tutorial', slug: 'tutorial' } }),
  ])

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'frontend', slug: 'frontend' } }),
    prisma.tag.create({ data: { name: 'backend', slug: 'backend' } }),
    prisma.tag.create({ data: { name: 'fullstack', slug: 'fullstack' } }),
    prisma.tag.create({ data: { name: 'tutorial', slug: 'tutorial' } }),
    prisma.tag.create({ data: { name: 'tips', slug: 'tips' } }),
    prisma.tag.create({ data: { name: 'beginner', slug: 'beginner' } }),
  ])

  // Get admin user
  const admin = await prisma.user.findFirst({ where: { email: 'admin@example.com' } })
  if (!admin) {
    console.log('No admin user found. Creating...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
  } else if (!admin.password) {
    // Update existing admin user with password if none exists
    console.log('Admin user found but no password. Setting password...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })
  }

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@example.com' } })

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with Next.js 15 App Router',
        slug: 'getting-started-nextjs-15-app-router',
        excerpt: 'A comprehensive guide to building modern web applications with Next.js 15 and the new App Router.',
        content: `# Getting Started with Next.js 15 App Router

Next.js 15 brings significant improvements to the App Router, making it easier than ever to build full-stack web applications. In this guide, we'll explore the key features and best practices.

## What's New in Next.js 15?

The App Router now supports:
- Improved file-based routing
- Server components by default
- Streaming and suspense boundaries
- Built-in API routes

## Creating Your First App

Start by creating a new Next.js application using the create-next-app CLI.`,
        coverImage: 'https://placehold.co/800x450/3b82f6/white?text=Next.js+15+App+Router',
        coverImageSource: 'unsplash',
        author: { connect: { id: adminUser!.id } },
        status: 'PUBLISHED',
        publishedAt: new Date('2025-01-15'),
        readingTime: 5,
        categories: { connect: [{ id: categories[0].id }, { id: categories[2].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }] },
      },
    }),

    prisma.post.create({
      data: {
        title: 'Understanding React Server Components',
        slug: 'understanding-react-server-components',
        excerpt: 'Server components change everything about how we build React applications. Learn how to use them effectively.',
        content: `# Understanding React Server Components

Server components are a paradigm shift in React development. They allow components to render on the server, sending HTML directly to the client.

## Key Benefits

1. **Zero Bundle Size**: Server components don't add to the client-side JavaScript bundle
2. **Direct Database Access**: Query databases directly from components
3. **Automatic Code Splitting**: Better performance out of the box

## When to Use Server vs Client Components

Use server components for:
- Data fetching
- Authentication
- SEO-heavy pages
- Static content`,
        coverImage: 'https://placehold.co/800x450/10b981/white?text=React+Server+Components',
        coverImageSource: 'placeholder',
        author: { connect: { id: adminUser!.id } },
        status: 'PUBLISHED',
        publishedAt: new Date('2025-01-10'),
        readingTime: 7,
        categories: { connect: [{ id: categories[1].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[4].id }] },
      },
    }),

    prisma.post.create({
      data: {
        title: 'TypeScript Best Practices for 2025',
        slug: 'typescript-best-practices-2025',
        excerpt: 'Write better TypeScript code with these essential tips and patterns for modern web development.',
        content: `# TypeScript Best Practices for 2025

TypeScript has become the de-facto standard for JavaScript development. Here's how to write better TypeScript code.

## Use Strict Mode

Always enable strict mode in your tsconfig.json:
\`\`\json
{
  "strict": true,
  "noUncheckedIndexedAccess": true
}
\`\`

## Avoid Any Type

The \`any\` type defeats the purpose of TypeScript. Use \`unknown\` instead when the type is truly unknown.`,
        coverImage: 'https://placehold.co/800x450/3b82f6/white?text=TypeScript+Best+Practices',
        coverImageSource: 'placeholder',
        author: { connect: { id: adminUser!.id } },
        status: 'PUBLISHED',
        publishedAt: new Date('2025-01-05'),
        readingTime: 4,
        categories: { connect: [{ id: categories[3].id }] },
        tags: { connect: [{ id: tags[1].id }] },
      },
    }),

    prisma.post.create({
      data: {
        title: 'Building a Full-Stack Application with Next.js',
        slug: 'building-fullstack-nextjs-application',
        excerpt: 'Learn how to create a complete full-stack web application from scratch using Next.js, Prisma, and PostgreSQL.',
        content: `# Building a Full-Stack Application

In this tutorial, we'll build a complete web application with Next.js 15, Prisma ORM, and PostgreSQL.

## Project Setup

\`\`\bash
npx create-next-app@latest my-app
cd my-app
npm install prisma @prisma/client
\`\`

## Database Setup

Configure your database connection and run migrations to set up your schema.`,
        coverImage: 'https://placehold.co/800x450/8b5cf6/white?text=Full-Stack+Next.js',
        coverImageSource: 'placeholder',
        author: { connect: { id: adminUser!.id } },
        status: 'PUBLISHED',
        publishedAt: new Date('2024-12-20'),
        readingTime: 12,
        categories: { connect: [{ id: categories[2].id }, { id: categories[4].id }] },
        tags: { connect: [{ id: tags[2].id }, { id: tags[5].id }] },
      },
    }),

    prisma.post.create({
      data: {
        title: 'Advanced CSS Grid Layout Techniques',
        slug: 'advanced-css-grid-layout-techniques',
        excerpt: 'Master CSS Grid with these advanced techniques for creating complex, responsive layouts.',
        content: `# Advanced CSS Grid Layout Techniques

CSS Grid has revolutionized web layout. Let's dive into some advanced techniques.`,
        coverImage: 'https://placehold.co/800x450/ec4899/white?text=CSS+Grid+Layout',
        coverImageSource: 'placeholder',
        author: { connect: { id: adminUser!.id } },
        status: 'DRAFT',
        readingTime: 8,
        categories: { connect: [{ id: categories[0].id }] },
        tags: { connect: [{ id: tags[0].id }] },
      },
    }),

    prisma.post.create({
      data: {
        title: 'Deploying Next.js to Production with Docker',
        slug: 'deploying-nextjs-production-docker',
        excerpt: 'A complete guide to containerizing your Next.js application and deploying it to production.',
        content: `# Deploying Next.js to Production with Docker`,
        author: { connect: { id: adminUser!.id } },
        status: 'SCHEDULED',
        publishedAt: new Date('2025-02-15'),
        readingTime: 6,
        categories: { connect: [{ id: categories[2].id }, { id: categories[4].id }] },
        tags: { connect: [{ id: tags[1].id }] },
      },
    }),

    prisma.post.create({
      data: {
        title: 'Old Post: JavaScript ES6 Features',
        slug: 'javascript-es6-features',
        excerpt: 'This is an old archived post about ES6 features.',
        content: `# JavaScript ES6 Features`,
        author: { connect: { id: adminUser!.id } },
        status: 'ARCHIVED',
        publishedAt: new Date('2023-01-01'),
        readingTime: 3,
      },
    }),
  ])

  // Create post stats (views)
  const now = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))

    for (const post of posts) {
      if (post.status === 'PUBLISHED') {
        const views = Math.floor(Math.random() * 100) + 10
        await prisma.postStats.upsert({
          where: {
            postId_date: {
              postId: post.id,
              date,
            },
          },
          update: {
            views,
            visitors: Math.floor(views * 0.8),
          },
          create: {
            postId: post.id,
            date,
            views,
            visitors: Math.floor(views * 0.8),
          },
        })
      }
    }
  }

  // Create media items
  const mediaItems = await Promise.all([
    prisma.media.create({
      data: {
        filename: `hero-section-${Date.now()}.jpg`,
        originalName: 'hero-section.jpg',
        mimeType: 'image/jpeg',
        size: 245678,
        url: 'https://placehold.co/1600x900/3b82f6/white?text=Hero+Section',
        alt: 'Hero section image',
        width: 1600,
        height: 900,
      },
    }),
    prisma.media.create({
      data: {
        filename: `about-author-${Date.now()}.jpg`,
        originalName: 'about-author.jpg',
        mimeType: 'image/jpeg',
        size: 124567,
        url: 'https://placehold.co/400x400/10b981/white?text=Author',
        alt: 'Author photo',
        width: 400,
        height: 400,
      },
    }),
    prisma.media.create({
      data: {
        filename: `blog-post-${Date.now()}.jpg`,
        originalName: 'blog-post.jpg',
        mimeType: 'image/jpeg',
        size: 198456,
        url: 'https://placehold.co/1200x675/8b5cf6/white?text=Blog+Post',
        alt: 'Blog post featured image',
        width: 1200,
        height: 675,
      },
    }),
    prisma.media.create({
      data: {
        filename: `tutorial-thumbnail-${Date.now()}.jpg`,
        originalName: 'tutorial-thumbnail.jpg',
        mimeType: 'image/jpeg',
        size: 87654,
        url: 'https://placehold.co/400x225/ec4899/white?text=Tutorial',
        alt: 'Tutorial thumbnail',
        width: 400,
        height: 225,
      },
    }),
  ])

  // Create comments
  await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorName: 'John Doe',
        authorEmail: 'john@example.com',
        content: 'Great article! Really helped me understand Next.js 15 better.',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorName: 'Jane Smith',
        authorEmail: 'jane@example.com',
        content: 'Would love to see more content about server actions!',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        authorName: 'Spammer Bot',
        authorEmail: 'spam@bottest.com',
        content: 'Check out this great product! Buy now!!!',
        status: 'SPAM',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        authorName: 'Bob Wilson',
        authorEmail: 'bob@example.com',
        content: 'The section about streaming with suspense was confusing. Can you elaborate?',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id,
        authorName: 'Sarah Lee',
        authorEmail: 'sarah@example.com',
        content: 'Very helpful, thank you for sharing!',
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    }),
  ])

  // Create AI usage logs
  for (let i = 0; i < 10; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    await prisma.aiUsageLog.create({
      data: {
        userId: adminUser!.id,
        endpoint: ['continue', 'fix-grammar', 'rewrite', 'seo'][Math.floor(Math.random() * 4)],
        inputTokens: Math.floor(Math.random() * 500) + 100,
        outputTokens: Math.floor(Math.random() * 1000) + 200,
        totalTokens: 0,
        model: 'llama-3.3-70b-versatile',
        createdAt: date,
      },
    })
  }

  // Create activity logs
  const activities = [
    { action: 'post_created', entity: 'post', entityId: posts[0].id },
    { action: 'post_published', entity: 'post', entityId: posts[0].id },
    { action: 'post_created', entity: 'post', entityId: posts[1].id },
    { action: 'post_updated', entity: 'post', entityId: posts[3].id },
    { action: 'comment_approved', entity: 'comment', entityId: '1' },
    { action: 'media_uploaded', entity: 'media', entityId: mediaItems[0].id },
    { action: 'category_created', entity: 'category', entityId: categories[4].id },
  ]

  for (const activity of activities) {
    await prisma.activityLog.create({
      data: {
        userId: adminUser!.id,
        ...activity,
        metadata: {},
      },
    })
  }

  console.log('✅ Seed completed successfully!')
  console.log(`- Created ${posts.length} posts`)
  console.log(`- Created ${categories.length} categories`)
  console.log(`- Created ${tags.length} tags`)
  console.log(`- Created 6 comments`)
  console.log(`- Created 4 media items`)
  console.log(`- Created 10 AI usage logs`)
  console.log(`- Created ${activities.length} activity logs`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
