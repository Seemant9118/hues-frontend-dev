'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

export function MergerDataTable({ columns, data, id }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-[6px] border border-[#A5ABBD33]">
      <Table id={id}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
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

            return (
              <TableRow
                key={row.id}
                className={cn(
                  'font-medium hover:bg-white',
                  isBuyerRow ? 'border-t bg-white' : 'border-t-0 bg-white',
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const isSellerColumn =
                    cell.column.id === 'sellerResponse' ||
                    cell.column.id === 'sellerQty' ||
                    cell.column.id === 'sellerAmount';

                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'align-top',

                        // visual merge
                        isSellerColumn && 'border-l border-t pl-4',

                        // hide buyer cells on seller rows
                        !isBuyerRow && !isSellerColumn && 'p-0',
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
