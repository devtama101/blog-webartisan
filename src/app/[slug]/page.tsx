"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import remarkHeadings from "@/lib/remark-headings";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { JsonLd } from "@/components/blog/json-ld";
import { RelatedPosts } from "@/components/blog/related-posts";
import { generateArticleSchema, generateBreadcrumbSchema, generateWebsiteSchema } from "@/lib/schema-generator";
import { generateToc } from "@/lib/toc-generator";

type Post = {
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  author?: {
    name: string | null;
    email: string | null;
  } | null;
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/b/post/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Post not found");
        }
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    notFound();
    return null;
  }

  const readingTime = post.readingTime || Math.max(1, Math.ceil((post.content || "").split(/\s+/).length / 200));
  const displayDate = post.publishedAt || post.createdAt;
  const toc = generateToc(post.content);

  const articleSchema = generateArticleSchema({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    slug: post.slug,
    author: post.author,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: post.title, url: `/${post.slug}` },
  ]);

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={generateWebsiteSchema()} />

      <article className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="border-b border-border bg-card">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </nav>

        {/* Article */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="lg:flex lg:gap-12">
            {/* Main Content */}
            <div className="lg:flex-1 min-w-0">
              {/* Cover Image */}
              {post.coverImage && (
                <div className="aspect-[16/9] overflow-hidden rounded-2xl mb-8 bg-muted">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
                {post.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border">
                {displayDate && (
                  <time>{new Date(displayDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
                )}
                <span>•</span>
                <span>{readingTime} min read</span>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 border-l-4 border-primary pl-4 italic">
                  {post.excerpt}
                </p>
              )}

              {/* Content */}
              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkHeadings]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Related Posts */}
              <RelatedPosts currentSlug={post.slug} />
            </div>

            {/* Desktop Sidebar - Table of Contents */}
            {toc.length > 0 && (
              <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                <div className="sticky top-8">
                  <nav>
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">
                      On This Page
                    </h3>
                    <TableOfContents toc={toc} variant="desktop" />
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WebArtisan. All rights reserved.
            </p>
          </div>
        </footer>
      </article>

      {/* Mobile Table of Contents - toggle button and drawer */}
      {toc.length > 0 && <TableOfContents toc={toc} variant="mobile" />}
    </>
  );
}
