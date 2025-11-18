'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useSalesDispatchedNotes = () => {
  const translations = useTranslations(
    'sales.sales-dispatched-notes.table.header',
  );

  // Function to handle row selection
  //   const handleRowSelection = (isSelected, row) => {
  //     const orderWithCustomer = { ...row.original };

  //     if (isSelected) {
  //       setSelectedInvoices((prev) => [...prev, orderWithCustomer]);
  //     } else {
  //       setSelectedInvoices((prev) =>
  //         prev.filter((order) => order.id !== row.original.id),
  //       );
  //     }
  //   };

  //   // Function to handle "Select All" functionality
  //   const handleSelectAll = (isAllSelected, rows) => {
  //     if (isAllSelected) {
  //       const allOrders = rows.map((row) => {
  //         return { ...row.original };
  //       });
  //       setSelectedInvoices(allOrders);
  //     } else {
  //       setSelectedInvoices([]); // Clear all selections
  //     }
  //   };

  return [
    // {
    //   id: 'select',
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && 'indeterminate')
    //       }
    //       onCheckedChange={(value) => {
    //         table.toggleAllPageRowsSelected(!!value);
    //         handleSelectAll(!!value, table.getRowModel().rows);
    //       }}
    //       aria-label="Select all"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <div
    //       onClick={(e) => {
    //         e.stopPropagation(); // Prevent row click from being triggered
    //       }}
    //     >
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={(value) => {
    //           row.toggleSelected(!!value);
    //           handleRowSelection(!!value, row);
    //         }}
    //         aria-label="Select row"
    //       />
    //     </div>
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: 'referenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('dispatch_id')}
        />
      ),
      cell: ({ row }) => {
        const { referenceNumber } = row.original;
        return (
          <div className="flex items-center">
            <span>{referenceNumber}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        return (
          <div className="text-[#A5ABBD]">
            {moment(createdAt).format('DD-MM-YYYY')}
          </div>
        );
      },
    },
    {
      accessorKey: 'buyerName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('customers')}
        />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const dispatchedNotesStatus = row.original?.status;

        return (
          <div className="flex items-start gap-2">
            <ConditionalRenderingStatus status={dispatchedNotesStatus} />
          </div>
        );
      },
    },
    {
      accessorKey: 'invoiceReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_id')}
        />
      ),
      cell: ({ row }) => {
        const invoiceReferenceNumber = row.original?.invoice?.referenceNumber;
        return (
          <div className="w-48 rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1">
            {invoiceReferenceNumber}
          </div>
        );
      },
    },

    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('total_amount')}
        />
      ),
      cell: ({ row }) => {
        const { totalAmount } = row.original;
        return formattedAmount(totalAmount);
      },
    },
  ];
};
