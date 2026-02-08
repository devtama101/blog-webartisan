"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Pagination } from "@/components/blog/pagination";
import { UserMenu } from "@/components/auth/user-menu";
import { SignInButton } from "@/components/auth/sign-in-button";
import { getAvatarUrl } from "@/lib/avatar";

type Post = {
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

interface SiteSettings {
  blogName: string;
  blogTitle: string;
  blogDescription: string;
}

export default function BlogHomePage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<PaginatedPostsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SiteSettings>({
    blogName: "WebArtisan Blog",
    blogTitle: "Tools & Craft",
    blogDescription: "Thoughts on development, design, and the future of the web."
  });

  useEffect(() => {
    // Fetch posts
    fetch("/api/b/posts?page=1")
      .then((res) => res.json())
      .then((result: PaginatedPostsResponse | { error: string }) => {
        if ("error" in result) {
          setData({ posts: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 0, hasNext: false, hasPrev: false } });
        } else {
          setData(result);
        }
        setLoading(false);
      })
      .catch(() => {
        setData({ posts: [], pagination: { total: 0, page: 1, limit: 6, totalPages: 0, hasNext: false, hasPrev: false } });
        setLoading(false);
      });

    // Fetch site settings
    fetch("/api/b/settings")
      .then((res) => res.json())
      .then((data: SiteSettings) => {
        setSettings(data);
      })
      .catch(() => {
        // Keep defaults on error
      });
  }, []);

  const getCategoryLabel = (post: Post) => {
    if (post.categories.length > 0) {
      return post.categories[0].name;
    }
    if (post.tags.length > 0) {
      return post.tags[0].name;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      {data && data.pagination.hasNext && (
        <link rel="next" href="/page/2" />
      )}

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold text-gray-900">
            {settings.blogName}
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 hidden sm:block text-sm">
              Home
            </Link>
            {status === "loading" ? (
              <div className="w-16 h-8 bg-gray-100 animate-pulse rounded" />
            ) : session?.user ? (
              <UserMenu variant="blog" />
            ) : (
              <SignInButton variant="default" />
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {settings.blogTitle}
          </h1>
          <p className="text-lg text-gray-600">
            {settings.blogDescription}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : !data || data.posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No posts published yet.</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-16">
              {data.posts.map((post: Post) => {
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
            <Pagination currentPage={1} totalPages={data.pagination.totalPages} />
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
