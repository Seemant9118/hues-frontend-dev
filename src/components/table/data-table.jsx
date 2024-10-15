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
// eslint-disable-next-line import/no-extraneous-dependencies
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePathname } from 'next/navigation';
import * as React from 'react';

export function DataTable({
  columns,
  data,
  onRowClick,
  id,
  fetchNextPage,
  isFetching,
  filterData,
  setFilterData,
  paginationData,
}) {
  const pathName = usePathname();
  const isSales = pathName.includes('sales');
  const [showLoadingState, setShowLoadingState] = React.useState(false);
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const containerRef = React.useRef(null);

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    state: {
      sorting,
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
  });

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || isFetching || !paginationData) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Check if we're near the bottom of the container
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (paginationData.currentPage < paginationData.totalPages) {
        setShowLoadingState(true);
        fetchNextPage(); // Fetch the next page if available
      }
    }
  }, [isFetching, paginationData]);

  // Attach and detach the scroll event listener
  React.useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Hide the loading state after data is fetched
  React.useEffect(() => {
    if (!isFetching) {
      setShowLoadingState(false);
    }
  }, [isFetching]);

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 10, // estimate row height for accurate scrollbar dragging
    getScrollElement: () => containerRef.current,
    // measure dynamic row height, except in firefox because it measures table border height incorrectly
    measureElement:
      typeof window !== 'undefined' &&
      navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className="scrollBarStyles max-h-[380px] overflow-y-auto rounded-[6px]"
      >
        <Table id={id}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="shrink-0" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              let isRead;
              if (row.original?.readTracker) {
                if (isSales) {
                  isRead = row.original?.readTracker?.sellerIsRead;
                } else {
                  isRead = row.original?.readTracker?.buyerIsRead;
                }
              }
              return (
                <TableRow
                  data-index={virtualRow.index} // needed for dynamic row height measurement
                  ref={(node) => rowVirtualizer.measureElement(node)} // measure dynamic row height
                  key={row.id}
                  className={
                    isRead
                      ? 'border-y border-[#A5ABBD33] bg-[#A5ABBD17]'
                      : 'border-y border-[#A5ABBD33] font-semibold'
                  }
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : () => {}
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="max-w-xl shrink-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}

            {/* {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                let isRead;
                if (row.original?.readTracker) {
                  if (isSales) {
                    isRead = row.original?.readTracker?.sellerIsRead;
                  } else {
                    isRead = row.original?.readTracker?.buyerIsRead;
                  }
                }

                return (
                  <TableRow
                    className={
                      isRead
                        ? 'border-y border-[#A5ABBD33] bg-[#A5ABBD17]'
                        : 'border-y border-[#A5ABBD33] font-semibold'
                    }
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : () => {}
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="max-w-xl shrink-0">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )} */}

            {/* Loading bar at the last row */}
            {showLoadingState && (
              <TableRow className="border border-red-600">
                <TableCell
                  colSpan={columns.length}
                  className="py-2 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Render Pagination only if there's data */}
      {data?.length > 0 && (
        <DataTablePagination
          table={table}
          filterData={filterData}
          setFilterData={setFilterData}
        />
      )}
    </div>
  );
}
