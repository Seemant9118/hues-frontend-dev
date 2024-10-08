'use client';

import * as React from 'react';

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

export function DataTable({
  columns,
  data,
  onRowClick,
  id,
  filterData,
  setFilterData,
  setCurrentPage,
  paginationData,
}) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isFetching, setIsFetching] = React.useState(false); // To prevent multiple fetches
  const containerRef = React.useRef(null);

  const table = useReactTable({
    data,
    columns,
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

  // Handle scroll event for infinite scrolling
  const handleScroll = () => {
    if (!containerRef.current || isFetching) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Check if we are near the bottom (second last row)
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      // Update page in filterData (increase page number by 1)
      if (paginationData.currentPage < paginationData.totalPages) {
        setIsFetching(true);
        /*  setFilterData((prevData) => ({
          ...prevData,
          page: prevData.page + 1,
        })); */
        setCurrentPage((prev) => prev + 1);
      }

      setTimeout(() => {
        setIsFetching(false);
      }, 1000); // Simulate a delay or await API call
    }
  };

  // Add scroll event listener
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
  }, [isFetching]);

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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
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
      </div>

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
