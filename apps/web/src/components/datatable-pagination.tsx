import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { PaginationState, Table } from '@tanstack/react-table';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  total: number; // Total items from API response
  limit: number; // Items per page
  pagination: PaginationState;
}

export function DataTablePagination<TData>({
  table,
  total,
  limit,
  pagination,
}: DataTablePaginationProps<TData>) {
  const totalPages = Math.ceil(total / limit);
  const currentPage = table.getState().pagination.pageIndex + 1;

  // Generate page numbers dynamically
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Helper to get truncated page numbers with ellipsis
  function getTruncatedPageNumbers() {
    if (totalPages <= 5) return pageNumbers;

    const pages: (number | 'ellipsis')[] = [1];

    // Determine window of pages around currentPage
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis if there's a gap between 1 and start
    if (start > 2) {
      pages.push('ellipsis');
    }

    // Add the window of pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis if there's a gap between end and last page
    if (end < totalPages - 1) {
      pages.push('ellipsis');
    }

    // Always add the last page
    pages.push(totalPages);

    return pages;
  }

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
        {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of{' '}
        {total} entries
      </div>
      <div className="flex-1">
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? '#' : undefined}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : undefined}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
                onClick={() => table.previousPage()}
              />
            </PaginationItem>

            {/* Dynamic Page Numbers */}
            {getTruncatedPageNumbers().map((page, idx) =>
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <span className="px-2">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    size="icon"
                    isActive={currentPage === page}
                    onClick={() => table.setPageIndex((page as number) - 1)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href={currentPage < totalPages ? '#' : undefined}
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : undefined}
                className={
                  currentPage >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
                onClick={() => table.nextPage()}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
