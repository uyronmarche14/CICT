'use client';

import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading: boolean;
  skeletonCount?: number;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  renderCustomRows?: (items: T[]) => ReactNode;

  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [1];

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

function SkeletonRows({ columns, count }: { columns: ColumnDef<unknown>[]; count: number }) {
  return Array.from({ length: count }).map((_, i) => (
    <TableRow key={i}>
      {columns.map((col, j) => (
        <TableCell key={j} className={col.className}>
          <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-40 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Search className="h-8 w-8 opacity-30" />
          <p className="text-sm">{message}</p>
          <p className="text-xs">Try adjusting your search or filters</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function DataTable<T>({
  columns,
  data,
  loading,
  skeletonCount = 8,
  emptyMessage = 'No results found',
  keyExtractor,
  renderCustomRows,
  total,
  page,
  totalPages,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
}: DataTableProps<T>) {
  return (
    <Card>
      {(search !== undefined || filters) && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {total > 0 ? `${total} result${total !== 1 ? 's' : ''}` : ''}
            </CardTitle>
            <div className="flex items-center gap-2">
              {search !== undefined && onSearchChange && (
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8 h-9 w-[200px] text-sm"
                  />
                </div>
              )}
              {filters}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className={`text-xs uppercase tracking-wider text-muted-foreground ${col.headerClassName ?? ''}`}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows columns={columns as ColumnDef<unknown>[]} count={skeletonCount} />
            ) : data.length === 0 ? (
              <EmptyRow colSpan={columns.length} message={emptyMessage} />
            ) : renderCustomRows ? (
              renderCustomRows(data)
            ) : (
              data.map((item) => (
                <TableRow key={keyExtractor(item)}>
                  {columns.map((col, j) => (
                    <TableCell key={j} className={col.className}>
                      {col.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={(e) => { e.preventDefault(); onPageChange(page - 1); }}
                    className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === 'ellipsis' ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === page}
                        size="icon"
                        onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={(e) => { e.preventDefault(); onPageChange(page + 1); }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
