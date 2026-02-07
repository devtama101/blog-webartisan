"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/blog/pagination";
import { Metadata } from "next";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  content: string;
}

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

interface PageProps {
  params: Promise<{ pageNumber: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function PaginatedPage({ params }: PageProps) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [data, setData] = useState<PaginatedPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      const pageNum = parseInt(resolvedParams.pageNumber);
      if (isNaN(pageNum) || pageNum < 1) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }
      setPageNumber(pageNum);

      fetch(`/api/b/posts?page=${pageNum}`)
        .then((res) => res.json())
        .then((result: PaginatedPostsResponse | { error: string }) => {
          // Handle error response from API
          if ("error" in result) {
            setData({ posts: [], pagination: { total: 0, page: pageNum, limit: 6, totalPages: 0, hasNext: false, hasPrev: false } });
          } else if (result.posts.length === 0 && pageNum > 1) {
            setNotFoundState(true);
          } else {
            setData(result);
          }
          setLoading(false);
        })
        .catch(() => {
          setData({ posts: [], pagination: { total: 0, page: pageNum, limit: 6, totalPages: 0, hasNext: false, hasPrev: false } });
          setLoading(false);
        });
    });
  }, [params]);

  const calculateReadingTime = (content: string, wordCount = 200) => {
    return Math.max(1, Math.ceil(content.split(/\s+/).length / wordCount));
  };

  if (loading) {
    return (
      <div className="min-h-screen">
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
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (notFoundState) {
    notFound();
    return null;
  }

  if (!data) {
    return (
      <div className="min-h-screen">
        <header className="border-b">
          <div className="container mx-auto px-4 py-6 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">WebArtisan Blog</Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
              <Link href="/admin" className="text-primary hover:text-primary">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const { posts, pagination } = data;

  return (
    <div className="min-h-screen">
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
        <h1 className="text-4xl font-bold mb-2">Latest Posts</h1>
        <p className="text-muted-foreground mb-8">
          Page {pageNumber} of {pagination.totalPages}
        </p>

        {posts.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {posts.map((post: Post) => (
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
                    {post.excerpt || post.content?.substring(0, 150) + "..."}
                  </p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    {post.publishedAt && (
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {post.publishedAt && <span>•</span>}
                    <span>{post.readingTime || (post.content && calculateReadingTime(post.content))} min read</span>
                  </div>
                </article>
              ))}
            </div>

            <Pagination currentPage={pageNumber} totalPages={pagination.totalPages} />
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
