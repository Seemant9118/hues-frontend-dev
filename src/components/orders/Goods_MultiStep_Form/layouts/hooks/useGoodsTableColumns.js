import React, { useMemo } from 'react';

/**
 * Custom hook to generate DataTable columns for Goods Line Items.
 */
export const useGoodsTableColumns = ({
  isCurrentGstApplicable,
  isOffer,
  handleItemEdit,
  handleItemDelete,
}) => {
  return useMemo(
    () => [
      {
        accessorKey: 'productName',
        header: 'Item',
        cell: ({ row }) => (
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm font-semibold text-neutral-800">
              {row.original.productName || row.original.serviceName}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: () => (
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Qty
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-center text-sm font-semibold text-neutral-600">
            {row.original.quantity}
          </div>
        ),
      },
      {
        accessorKey: 'unitPrice',
        header: () => (
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Price
          </div>
        ),
        cell: ({ row }) => (
          <div className="pr-2 text-right text-sm font-semibold text-neutral-600">
            ₹
            {Number(row.original.unitPrice || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        ),
      },
      {
        accessorKey: 'totalAmount',
        header: () => (
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Value
          </div>
        ),
        cell: ({ row }) => {
          const value = Number(row.original.totalAmount) || 0;
          return (
            <div className="text-neutral-750 pr-2 text-right text-sm font-bold">
              ₹
              {value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      ...(isCurrentGstApplicable
        ? [
            {
              accessorKey: 'gstPerUnit',
              header: () => (
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  GST %
                </div>
              ),
              cell: ({ row }) => (
                <div className="text-center text-sm font-medium text-neutral-500">
                  {row.original.gstPerUnit || 0}%
                </div>
              ),
            },
            {
              accessorKey: 'totalGstAmount',
              header: () => (
                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Tax
                </div>
              ),
              cell: ({ row }) => {
                const tax = Number(row.original.totalGstAmount) || 0;
                return (
                  <div className="pr-2 text-right text-sm font-semibold text-neutral-500">
                    ₹
                    {tax.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                );
              },
            },
            {
              accessorKey: 'finalAmount',
              header: () => (
                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Total
                </div>
              ),
              cell: ({ row }) => {
                const item = row.original;
                const total =
                  Number(
                    item.finalAmount || item.totalAmount + item.totalGstAmount,
                  ) || 0;
                return (
                  <div className="pr-2 text-right text-sm font-bold text-neutral-800">
                    ₹
                    {total.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                );
              },
            },
          ]
        : []),
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                title="Edit Item"
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-blue-600"
                onClick={() => handleItemEdit(item)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                type="button"
                title="Delete Item"
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500"
                onClick={() => handleItemDelete(item)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [isCurrentGstApplicable, isOffer, handleItemEdit, handleItemDelete],
  );
};
