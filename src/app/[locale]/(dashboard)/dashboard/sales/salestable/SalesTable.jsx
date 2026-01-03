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

export function SalesTable({
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
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollHeight, scrollTop, clientHeight } = container;

    // Trigger only when scrolled within 100px from bottom
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (
      nearBottom &&
      !isFetching &&
      !isFetchingNextPage &&
      currFetchedPage < totalPages
    ) {
      setIsFetchingNextPage(true);
      fetchNextPage()
        // eslint-disable-next-line no-console
        .catch((err) => console.error('Fetch next page failed', err))
        .finally(() => setIsFetchingNextPage(false));
    }
  }, [
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    currFetchedPage,
    totalPages,
  ]);

  // ✅ Add a tiny debounce to prevent rapid fire
  const debouncedFetchMore = React.useMemo(() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(fetchMoreOnBottomReached, 150); // 150ms debounce
    };
  }, [fetchMoreOnBottomReached]);

  React.useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => debouncedFetchMore();

    container.addEventListener('scroll', handleScroll);

    // ✅ Proper cleanup to avoid multiple listeners
    // eslint-disable-next-line consistent-return
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedFetchMore]);

  // ✅ React Table
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
      {/* Scrollable table wrapper */}
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
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                const isRead =
                  row.original?.readTracker?.sellerIsRead ||
                  row.original?.sellerIsRead ||
                  true;

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
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Infinite Scroll loader */}
      {isFetching && <div className="p-1 text-center">Fetching More...</div>}

      {/* Pagination */}
      {!isFetching && data?.length > 0 && <DataTablePagination table={table} />}
    </div>
  );
}
