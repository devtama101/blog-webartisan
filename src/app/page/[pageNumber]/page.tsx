"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pagination } from "@/components/blog/pagination";
import { Metadata } from "next";
import { getAvatarUrl } from "@/lib/avatar";

interface Post {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  readingTime: number | null;
  content: string;
  author: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
  tags: {
    name: string;
    slug: string;
  }[];
  categories: {
    name: string;
    slug: string;
  }[];
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

  const getCategoryLabel = (post: Post) => {
    if (post.categories.length > 0) {
      return post.categories[0].name;
    }
    if (post.tags.length > 0) {
      return post.tags[0].name;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              WebArtisan Blog
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                Home
              </Link>
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center py-20">
            <p className="text-gray-500">Loading...</p>
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
      <div className="min-h-screen bg-white">
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              WebArtisan Blog
            </Link>
            <nav className="flex gap-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                Home
              </Link>
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center py-20">
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  const { posts, pagination } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            WebArtisan Blog
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
              Home
            </Link>
            <Link href="/admin" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Tools & Craft
          </h1>
          <p className="text-lg text-gray-600">
            Page {pageNumber} of {pagination.totalPages}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No posts found.</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-16">
              {posts.map((post: Post) => {
                const categoryLabel = getCategoryLabel(post);
                return (
                  <article
                    key={post.slug}
                    className="group flex flex-col"
                  >
                    {/* Cover Image */}
                    <Link href={`/${post.slug}`} className="block mb-4">
                      {post.coverImage ? (
                        <div
                          className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.coverImage})` }}
                        />
                      ) : (
                        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <span className="text-4xl font-bold text-gray-300">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Category Label */}
                    {categoryLabel && (
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        {categoryLabel}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
                      <Link
                        href={`/${post.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Author Info */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-auto">
                      {post.author && (
                        <>
                          <img
                            src={getAvatarUrl(post.author.name, post.author.image)}
                            alt={post.author.name || "Author"}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-gray-700">
                            {post.author.name || "Anonymous"}
                          </span>
                        </>
                      )}
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {post.readingTime || 1} min read
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <Pagination currentPage={pageNumber} totalPages={pagination.totalPages} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} WebArtisan. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
