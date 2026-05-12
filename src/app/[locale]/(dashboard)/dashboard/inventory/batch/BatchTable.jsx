'use client';

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

export function BatchTable({
  id,
  columns,
  data,
  fetchNextPage,
  isFetching,
  hasNextPage,
}) {
  const tableContainerRef = React.useRef(null);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const fetchMoreOnBottomReached = React.useCallback(() => {
    if (tableContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } =
        tableContainerRef.current;

      const bottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5;
      if (bottom && !isFetching && hasNextPage) {
        fetchNextPage();
      }
    }
  }, [fetchNextPage, isFetching, hasNextPage]);

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
    estimateSize: () => 45,
    getScrollElement: () => tableContainerRef.current,
    measureElement: (element) =>
      element?.offsetHeight || element?.getBoundingClientRect().height,
    overscan: 10,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className="infinite-datatable-scrollable-body scrollBarStyles flex-grow overflow-scroll rounded-[6px]"
        ref={tableContainerRef}
      >
        <div className="inline-block min-w-full align-middle">
          <Table id={id} className="min-w-full">
            <TableHeader className="sticky top-0 z-20 bg-white">
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
                      className="cursor-pointer border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700"
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
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {isFetching && (
        <div className="p-2 text-center text-sm italic text-gray-500">
          Fetching More...
        </div>
      )}
    </div>
  );
}
