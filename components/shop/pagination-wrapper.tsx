"use client";

import { useSearchParams, usePathname } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Props {
  totalPages: number;
  page: number;
}

export function PaginationWrapper({ totalPages, page }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // This helper preserves ALL current filters (price, brand, etc.) when you change pages
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    } else {
      params.delete("page");
    }
    return `${pathname}?${params.toString()}`;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center py-12">
      <Pagination>
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <PaginationPrevious href={createPageUrl(page - 1)} />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((pageNum) => {
              return (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - page) <= 1
              );
            })
            .map((pageNum, index, array) => {
              const showEllipsis = index > 0 && pageNum - array[index - 1] > 1;
              return (
                <div key={pageNum} className="flex items-center">
                  {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                  <PaginationItem>
                    <PaginationLink
                      href={createPageUrl(pageNum)}
                      isActive={pageNum === page}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                </div>
              );
            })}

          {page < totalPages && (
            <PaginationItem>
              <PaginationNext href={createPageUrl(page + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
