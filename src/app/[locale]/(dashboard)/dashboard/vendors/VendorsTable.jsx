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

export function VendorsTable({
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

  // ✅ Scroll handler with near-bottom check
  const fetchMoreOnBottomReached = React.useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollHeight, scrollTop, clientHeight } = container;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100; // within 100px

    if (
      nearBottom &&
      !isFetching &&
      !isFetchingNextPage &&
      currFetchedPage < totalPages
    ) {
      setIsFetchingNextPage(true);
      fetchNextPage()
        // eslint-disable-next-line no-console
        .catch((err) => console.error('Fetch next page failed:', err))
        .finally(() => setIsFetchingNextPage(false));
    }
  }, [
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
    currFetchedPage,
    totalPages,
  ]);

  // ✅ Debounce to prevent rapid firing
  const debouncedFetchMore = React.useMemo(() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(fetchMoreOnBottomReached, 150); // 150ms debounce
    };
  }, [fetchMoreOnBottomReached]);

  // ✅ Attach and cleanup scroll listener
  React.useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => debouncedFetchMore();
    container.addEventListener('scroll', handleScroll);

    // eslint-disable-next-line consistent-return
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [debouncedFetchMore]);

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
    count: rows?.length,
    estimateSize: () => 40, // Adjusted height estimate
    getScrollElement: () => tableContainerRef?.current,
    measureElement: (element) =>
      element?.offsetHeight || element?.getBoundingClientRect()?.height,
    overscan: 21,
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className="infinite-datatable-scrollable-body scrollBarStyles flex-grow overflow-scroll rounded-[6px]"
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
                      onClick={
                        onRowClick ? () => onRowClick(row.original) : () => {}
                      }
                      className={
                        'cursor-pointer border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700 hover:text-black'
                      }
                    >
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <TableCell
                            key={cell.id}
                            className="max-w-xl shrink-0 whitespace-nowrap px-4"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
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
