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
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';

export function InfiniteDataTable({
  id,
  columns,
  data,
  fetchNextPage,
  isFetching,
  totalPages,
  currFetchedPage,
}) {
  const tableContainerRef = React.useRef(null);
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const fetchMoreOnBottomReached = React.useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } =
        tableContainerRef.current;

      const bottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
      if (
        bottom &&
        !isFetching &&
        !isFetchingNextPage &&
        currFetchedPage < totalPages
      ) {
        setIsFetchingNextPage(true);
        fetchNextPage().finally(() => setIsFetchingNextPage(false));
      }
    }
  }, [
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    currFetchedPage,
    totalPages,
  ]);

  React.useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => fetchMoreOnBottomReached();
    container.addEventListener('scroll', handleScroll);

    // eslint-disable-next-line consistent-return
    return () => container.removeEventListener('scroll', handleScroll);
  }, [fetchMoreOnBottomReached]);

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

  const { rows = [] } = table.getRowModel() || {};

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 40,
    getScrollElement: () => tableContainerRef.current,
    measureElement: (element) =>
      element?.offsetHeight || element?.getBoundingClientRect().height,
    overscan: 21,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Scrollable container for both axes */}
      <div
        ref={tableContainerRef}
        className="infinite-datatable-scrollable-body scrollBarStyles flex-grow overflow-auto rounded-[6px]"
      >
        {/* Table wrapper to allow horizontal scroll only when needed */}
        <div className="inline-block min-w-full align-middle">
          <Table id={id} className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="shrink-0 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-4 text-center text-gray-500"
                  >
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];

                  return (
                    <TableRow
                      data-index={virtualRow.index}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      key={row.id}
                      className="h-16 border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="shrink-0 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {isFetching && <div className="p-1 text-center">Fetching More...</div>}

      {!isFetching && data?.length > 0 && <DataTablePagination table={table} />}
    </div>
  );
}
