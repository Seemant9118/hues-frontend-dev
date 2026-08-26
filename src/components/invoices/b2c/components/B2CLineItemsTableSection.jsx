import React from 'react';
import { DataTable } from '@/components/table/data-table';

export default function B2CLineItemsTableSection({ columns, orderItems }) {
  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary">
        Line Items
      </span>
      <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border-0 bg-white shadow-none">
        {orderItems && orderItems.length > 0 ? (
          <div className="min-h-0 w-full flex-1 overflow-auto">
            <DataTable columns={columns} data={orderItems || []} />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center bg-gray-100 p-4 text-center text-neutral-400">
            <svg
              className="mb-2 h-10 w-10 text-neutral-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3m-11 0h3m-2 0a1 1 0 00-1 1v1a1 1 0 001 1h3a1 1 0 001-1v-1a1 1 0 00-1-1m-3 0h3"
              />
            </svg>
            <p className="text-sm font-medium text-neutral-500">
              No items added yet
            </p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Select and add items above to build your invoice.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
