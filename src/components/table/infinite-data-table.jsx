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
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Tooltips from '../auth/Tooltips';

const COLLAPSED_COLUMN_LIMIT = 5;

export default function InfiniteDataTable({
  id,
  columns,
  data,
  fetchNextPage,
  isFetching,
  totalPages,
  currFetchedPage,
  onRowClick,
  rowSelection,
  onRowSelectionChange,
  getRowId,
}) {
  const tableContainerRef = useRef(null);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [isColumnsExpanded, setIsColumnsExpanded] = useState(false);

  const hasCollapsibleColumns = (columns?.length || 0) > COLLAPSED_COLUMN_LIMIT;
  const columnsBeforeToggle = useMemo(
    () => columns?.slice(0, COLLAPSED_COLUMN_LIMIT) || [],
    [columns],
  );
  const columnsAfterToggle = useMemo(() => {
    if (!hasCollapsibleColumns || !isColumnsExpanded) {
      return [];
    }

    return columns.slice(COLLAPSED_COLUMN_LIMIT);
  }, [columns, hasCollapsibleColumns, isColumnsExpanded]);
  const visibleColumns = useMemo(() => {
    if (!hasCollapsibleColumns) {
      return columns;
    }

    return [...columnsBeforeToggle, ...columnsAfterToggle];
  }, [columns, columnsAfterToggle, columnsBeforeToggle, hasCollapsibleColumns]);
  const renderedColumnCount =
    (visibleColumns?.length || 1) + (hasCollapsibleColumns ? 1 : 0);

  useEffect(() => {
    if (!hasCollapsibleColumns) {
      setIsColumnsExpanded(false);
    }
  }, [hasCollapsibleColumns]);

  const hasNextPage =
    totalPages && currFetchedPage ? currFetchedPage < totalPages : false;

  const loadMoreRef = useInfiniteScroll(() => {
    if (!isFetching && hasNextPage) {
      fetchNextPage();
    }
  }, hasNextPage);

  const table = useReactTable({
    data: data || [],
    columns: visibleColumns,
    state: {
      sorting,
      columnFilters,
      ...(rowSelection !== undefined && { rowSelection }),
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    ...(onRowSelectionChange !== undefined && { onRowSelectionChange }),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId,
    manualPagination: true,
  });

  const { rows } = table.getRowModel();
  const renderColumnToggle = () => (
    <Tooltips
      trigger={
        <button
          type="button"
          className="rounded-sm border border-transparent p-1 text-gray-600 transition hover:border-gray-200 hover:bg-gray-100 hover:text-black"
          onClick={() => setIsColumnsExpanded((prev) => !prev)}
          aria-expanded={isColumnsExpanded}
        >
          {isColumnsExpanded ? (
            <>
              <PanelLeftClose className="h-4 w-4" />
            </>
          ) : (
            <>
              <PanelLeftOpen className="h-4 w-4" />
            </>
          )}
        </button>
      }
      content={isColumnsExpanded ? 'Collapse columns' : 'Expand columns'}
      side="top"
    />
  );

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
        className={
          'infinite-datatable-scrollable-body scrollBarStyles overflow-auto rounded-sm sm:h-[75dvh]'
        }
      >
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header, index) => (
                    <Fragment key={header.id}>
                      <TableHead className="shrink-0 whitespace-nowrap">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                      {hasCollapsibleColumns &&
                        index === COLLAPSED_COLUMN_LIMIT - 1 && (
                          <TableHead className="w-px shrink-0 whitespace-nowrap px-2 text-right">
                            {renderColumnToggle()}
                          </TableHead>
                        )}
                    </Fragment>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {/* No results */}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={renderedColumnCount}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No results found
                  </TableCell>
                </TableRow>
              )}

              {/* Only render virtual rows if data exists */}
              {rows.length > 0 && (
                <>
                  {/* Top spacer */}
                  <TableRow
                    key="top-spacer"
                    aria-hidden
                    className="pointer-events-none"
                  >
                    <TableCell
                      colSpan={renderedColumnCount}
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
                        className={
                          isRead
                            ? 'cursor-pointer border-y border-[#A5ABBD33] bg-[#ada9a919] font-semibold text-gray-700 hover:text-black'
                            : 'cursor-pointer border-y border-[#A5ABBD33] bg-white font-semibold text-black hover:text-black'
                        }
                        onClick={
                          onRowClick
                            ? () => onRowClick(row.original)
                            : undefined
                        }
                      >
                        {row.getVisibleCells().map((cell, index) => (
                          <Fragment key={cell.id}>
                            <TableCell className="max-w-xl shrink-0 whitespace-nowrap px-4">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                            {hasCollapsibleColumns &&
                              index === COLLAPSED_COLUMN_LIMIT - 1 && (
                                <TableCell className="w-px shrink-0 px-2" />
                              )}
                          </Fragment>
                        ))}
                      </TableRow>
                    );
                  })}

                  {/* Bottom spacer */}
                  <TableRow
                    key="bottom-spacer"
                    aria-hidden
                    className="pointer-events-none"
                  >
                    <TableCell
                      colSpan={renderedColumnCount}
                      className="border-0 bg-transparent p-0"
                      style={{
                        height:
                          rowVirtualizer.getTotalSize() -
                          (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0),
                      }}
                    />
                  </TableRow>
                </>
              )}

              {/* Infinite scroll trigger */}
              {rows.length > 0 && hasNextPage && (
                <TableRow key="infinite-scroll-trigger">
                  <TableCell
                    colSpan={renderedColumnCount}
                    className="border-0 p-0"
                  >
                    <div
                      ref={loadMoreRef}
                      className="flex items-center justify-center py-8 text-sm text-muted-foreground"
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
