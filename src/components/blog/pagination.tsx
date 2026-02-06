"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({ currentPage, totalPages, basePath = "" }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getPagePath = (pageNum: number) => {
    if (pageNum === 1) return basePath || "/";
    return `${basePath}/page/${pageNum}`;
  };

  return (
    <nav className="flex items-center justify-center gap-2 my-8" aria-label="Pagination">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={getPagePath(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-md border hover:bg-muted transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-2 text-muted-foreground">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={getPagePath(page as number)}
              className={`min-w-[2.5rem] px-3 py-2 rounded-md border text-center transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted"
              }`}
              aria-label={`Page ${page}`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={getPagePath(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-md border hover:bg-muted transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}
