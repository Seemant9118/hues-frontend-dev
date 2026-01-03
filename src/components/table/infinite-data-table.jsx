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
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState } from 'react';

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
  const tableContainerRef = useRef(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

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
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 44, // fixed row height
    overscan: 6,
  });

  return (
    <div>
      <div
        ref={tableContainerRef}
        id={id}
        className="infinite-datatable-scrollable-body scrollBarStyles h-[80dvh] overflow-auto rounded-sm"
      >
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="shrink-0 whitespace-nowrap"
                    >
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
              {/* Top spacer */}
              <TableRow aria-hidden className="pointer-events-none">
                <TableCell
                  colSpan={columns.length}
                  className="border-0 bg-transparent p-0"
                  style={{
                    height: rowVirtualizer.getVirtualItems()[0]?.start ?? 0,
                  }}
                />
              </TableRow>

              {/* Virtual rows */}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                const isRead = row.original?.readTracker?.isRead || true;

                return (
                  <TableRow
                    key={row.id}
                    // ref={rowVirtualizer.measureElement}
                    className={
                      isRead
                        ? 'cursor-pointer border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700 hover:text-black'
                        : 'cursor-pointer border-y border-[#A5ABBD33] bg-white font-semibold text-black hover:text-black'
                    }
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="max-w-xl shrink-0 whitespace-nowrap px-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}

              {/* Bottom spacer */}
              <TableRow aria-hidden className="pointer-events-none">
                <TableCell
                  colSpan={columns.length}
                  className="border-0 bg-transparent p-0"
                  style={{
                    height:
                      rowVirtualizer.getTotalSize() -
                      (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                  }}
                />
              </TableRow>

              {/* Infinite scroll trigger */}
              {hasNextPage && (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div
                      ref={loadMoreRef}
                      className="py-4 text-center text-sm text-muted-foreground"
                    >
                      {isFetching
                        ? 'Loading more data...'
                        : 'Scroll to load more'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
