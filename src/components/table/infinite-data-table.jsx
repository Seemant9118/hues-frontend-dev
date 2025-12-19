'use client';

import { DataTablePagination } from '@/components/table/DataTablePagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';

export default function InfiniteDataTable({
  id,
  columns,
  data,
  fetchNextPage,
  isFetching,
  totalPages,
  currFetchedPage,
  onRowClick,
}) {
  const tableContainerRef = useRef();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  useEffect(() => {
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [data]);

  const hasNextPage =
    totalPages && currFetchedPage ? currFetchedPage < totalPages : false;

  const loadMoreRef = useInfiniteScroll(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, hasNextPage);

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <div
        ref={tableContainerRef}
        id={id}
        className="scrollBarStyles h-[80vh] overflow-auto"
      >
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={
                  'cursor-pointer border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700'
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {/* Infinite scroll trigger */}
            <TableRow>
              {hasNextPage && (
                <TableCell colSpan={columns.length}>
                  <div
                    ref={loadMoreRef}
                    className="py-4 text-center text-sm text-muted-foreground"
                  >
                    {isFetching
                      ? 'Loading more data...'
                      : hasNextPage
                        ? 'Scroll to load more'
                        : 'No more data'}
                  </div>
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {/* ✅ Pagination footer */}
      {!isFetching && data?.length > 0 && (
        <DataTablePagination
          table={table}
          currFetchedPage={currFetchedPage}
          totalPages={totalPages}
          totalRows={data.length}
        />
      )}
    </div>
  );
}
