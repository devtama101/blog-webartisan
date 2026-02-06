"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pagination } from "@/components/blog/pagination";

type Post = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  content: string;
};

interface PaginatedPostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function BlogHomePage() {
  const [data, setData] = useState<PaginatedPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/b/posts?page=1")
      .then((res) => res.json())
      .then((result: PaginatedPostsResponse) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const calculateReadingTime = (content: string, wordCount = 200) => {
    return Math.max(1, Math.ceil(content.split(/\s+/).length / wordCount));
  };

  return (
    <div className="min-h-screen">
      {/* SEO Links for pagination */}
      {data && data.pagination.hasNext && (
        <link rel="next" href="/page/2" />
      )}

      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            WebArtisan Blog
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/admin" className="text-primary hover:text-primary">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Latest Posts</h1>

        {loading ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : !data || data.posts.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No posts published yet.</p>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {data.posts.map((post: Post) => (
                <article key={post.slug} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  {post.coverImage && (
                    <div
                      className="aspect-video bg-muted rounded-lg mb-4 bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.coverImage})` }}
                    />
                  )}
                  <h2 className="text-2xl font-bold mb-2 hover:text-primary cursor-pointer">
                    <Link href={`/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                  </p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {post.publishedAt && (
                      <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    )}
                    {post.publishedAt && <span>•</span>}
                    <span>{post.readingTime || (post.content && calculateReadingTime(post.content))} min read</span>
                  </div>
                </article>
              ))}
            </div>

            <Pagination currentPage={1} totalPages={data.pagination.totalPages} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} WebArtisan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
