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

export function PurchaseTable({
  id,
  columns,
  data,
  fetchNextPage,
  isFetching,
  totalPages,
  currFetchedPage,
  onRowClick,
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
        bottom && // Check if scrolled to the bottom
        !isFetching &&
        !isFetchingNextPage && // Prevent repeated calls
        currFetchedPage < totalPages
      ) {
        setIsFetchingNextPage(true); // Set fetching flag
        fetchNextPage().finally(() => setIsFetchingNextPage(false)); // Reset flag after fetching
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
    () => {
      container.removeEventListener('scroll', handleScroll);
    };
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
    estimateSize: () => 40, // Adjusted height estimate
    getScrollElement: () => tableContainerRef.current,
    measureElement: (element) =>
      element?.offsetHeight || element?.getBoundingClientRect().height,
    overscan: 21,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className="infinite-datatable-scrollable-body scrollBarStyles flex-grow overflow-auto rounded-[6px]"
        ref={tableContainerRef}
      >
        {/* Table wrapper to allow horizontal scroll only when needed */}
        <div className="inline-block min-w-full align-middle">
          <Table id={id} className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
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
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                let isRead;
                if (row.original?.readTracker || row.original.buyerIsRead) {
                  isRead =
                    row.original?.readTracker?.buyerIsRead ||
                    row.original.buyerIsRead;
                }
                return (
                  <TableRow
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    key={row.id}
                    className={
                      isRead
                        ? 'cursor-pointer border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700 hover:text-black'
                        : 'cursor-pointer border-y border-[#A5ABBD33] bg-white font-semibold text-black hover:text-black'
                    }
                    onClick={
                      onRowClick ? () => onRowClick(row.original) : () => {}
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id} className="max-w-xl shrink-0">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      {isFetching && <div className="p-1 text-center">Fetching More...</div>}

      {/* Render Pagination only if there's data */}
      {!isFetching && data?.length > 0 && <DataTablePagination table={table} />}
    </div>
  );
}
