'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

export function MergerDataTable({
  columns,
  data,
  id,

  enableSelection = false,
  selectedRowIds = [],
  onSelectionChange,
  rowIdKey = 'rowId',
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const buyerRowIds = data
    .filter((row) => row._isFirstRow)
    .map((row) => row[rowIdKey]);

  const isAllSelected =
    buyerRowIds.length > 0 &&
    buyerRowIds.every((id) => selectedRowIds.includes(id));

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;

    onSelectionChange(isAllSelected ? [] : buyerRowIds);
  };

  const toggleRow = (rowId) => {
    if (!onSelectionChange) return;

    onSelectionChange(
      selectedRowIds.includes(rowId)
        ? selectedRowIds.filter((id) => id !== rowId)
        : [...selectedRowIds, rowId],
    );
  };

  return (
    <div className="rounded-[6px] border border-[#A5ABBD33]">
      <Table id={id}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {enableSelection && (
                <TableHead className="w-10">
                  <Checkbox
                    checked={isAllSelected}
                    disabled={!buyerRowIds.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}

              {headerGroup.headers.map((header) => (
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
          {table.getRowModel().rows.map((row) => {
            const isBuyerRow = row.original._isFirstRow;
            const rowKey = row.original[rowIdKey];
            const isChecked = selectedRowIds.includes(rowKey);

            return (
              <TableRow
                key={row.id}
                className={cn(
                  'font-medium hover:bg-white',
                  isBuyerRow ? 'border-t bg-white' : 'border-t-0 bg-white',
                )}
              >
                {enableSelection && (
                  <TableCell className="align-top">
                    {isBuyerRow ? (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleRow(rowKey)}
                        aria-label="Select row"
                      />
                    ) : (
                      // placeholder keeps column alignment
                      <span className="invisible">x</span>
                    )}
                  </TableCell>
                )}

                {row.getVisibleCells().map((cell) => {
                  const isSellerColumn =
                    cell.column.id === 'sellerResponse' ||
                    cell.column.id === 'sellerQty' ||
                    cell.column.id === 'sellerAmount' ||
                    cell.column.id === 'actions';

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'align-top',

                        // seller columns keep border + padding
                        isSellerColumn && 'border-l border-t pl-4',

                        // buyer columns on seller rows stay invisible but keep width
                        !isBuyerRow && !isSellerColumn && 'invisible',
                      )}
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
