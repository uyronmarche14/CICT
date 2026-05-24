import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Paginated, SortConfig } from '@/types/Paginated';
import { useQuery } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import React, { useState } from 'react';
import { DataTablePagination } from './datatable-pagination';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useDebounce } from 'use-debounce';
import { Card, CardContent } from './ui/card';
import { PlusIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  queryKey: string;
  fetchData: (
    page: number,
    limit: number,
    search?: string,
    sort?: SortConfig
  ) => Promise<Paginated<TData>>;
  onAddNew?: () => void;
  renderActions?: () => React.ReactNode;
}

const DataTable = <TData,>({
  columns,
  queryKey,
  fetchData,
  onAddNew,
  renderActions,
}: DataTableProps<TData>) => {
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 500);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      queryKey,
      pagination.pageIndex + 1,
      pagination.pageSize,
      searchValue,
      sortConfig,
    ],
    queryFn: () =>
      fetchData(
        pagination.pageIndex + 1,
        pagination.pageSize,
        searchValue,
        sortConfig
      ),
  });

  const handleSort = (field: string) => {
    setSortConfig(currentSort => {
      if (currentSort?.field === field) {
        if (currentSort.direction === 'asc') {
          return { field, direction: 'desc' as const };
        } else {
          return null; // Remove sorting
        }
      } else {
        return { field, direction: 'asc' as const };
      }
    });
  };

  const getSortIcon = (field: string) => {
    if (sortConfig?.field !== field) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  return (
    <div className="w-full">
      <Card>
        <CardContent>
          <div className="flex flex-col lg:flex-row lg:items-center md:justify-between gap-4 pb-4">
            <Input
              placeholder="Search..."
              onChange={event => {
                table.getColumn('email')?.setFilterValue(event.target.value);
                setSearch(event.target.value);
              }}
              className="w-full md:max-w-sm"
            />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {renderActions && renderActions()}
              {onAddNew && (
                <Button onClick={onAddNew} className="w-full sm:w-auto">
                  <PlusIcon className="h-4 w-4" />
                  Add New
                </Button>
              )}
            </div>
          </div>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    const columnDef = header.column.columnDef;
                    const meta = columnDef.meta as
                      | { sortable?: boolean; field?: string }
                      | undefined;
                    const isSortable = meta?.sortable !== false;
                    const field = meta?.field;

                    return (
                      <TableHead
                        key={header.id}
                        className={`font-bold ${
                          isSortable && field
                            ? 'cursor-pointer hover:bg-foreground/5 hover:rounded-md select-none'
                            : ''
                        }`}
                        onClick={() => {
                          if (isSortable && field) {
                            handleSort(field);
                          }
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {isSortable && field && getSortIcon(field)}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: pagination.pageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {Array.from({ length: columns.length }).map(
                      (_, cellIndex) => (
                        <TableCell key={`skeleton-cell-${cellIndex}`}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <DataTablePagination
        table={table}
        total={data?.total || 0}
        limit={pagination.pageSize}
        pagination={pagination}
      />
    </div>
  );
};

export default DataTable;
