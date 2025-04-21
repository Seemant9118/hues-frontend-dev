'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Dot } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export const usePaymentsColumn = () => {
  const [showAll, setShowAll] = useState(false);
  const translations = useTranslations(
    'sales.sales-payments.section.table.header',
  );

  const handleToggleShow = () => {
    setShowAll(!showAll);
  };

  // // Function to handle row selection
  // const handleRowSelection = (isSelected, row) => {
  //   const debits = { ...row.original };

  //   if (isSelected) {
  //     setSelectedDebit((prev) => [...prev, debits]);
  //   } else {
  //     setSelectedDebit((prev) =>
  //       prev.filter((order) => order.id !== row.original.id),
  //     );
  //   }
  // };

  // // Function to handle "Select All" functionality
  // const handleSelectAll = (isAllSelected, rows) => {
  //   if (isAllSelected) {
  //     const allOrders = rows.map((row) => ({ ...row.original }));
  //     setSelectedDebit(allOrders);
  //   } else {
  //     setSelectedDebit([]); // Clear all selections
  //   }
  // };

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
      accessorKey: 'paymentReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('payment_id')}
        />
      ),
      cell: ({ row }) => {
        const { paymentReferenceNumber } = row.original;
        const isSalesPaymentRead = row.original.sellerIsRead;

        return (
          <div className="flex items-center">
            {!isSalesPaymentRead && (
              <Dot size={32} className="text-[#3288ED]" />
            )}
            <span>{paymentReferenceNumber}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'clientName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('client_name')}
        />
      ),
      cell: ({ row }) => {
        const { clientName } = row.original;
        return <div>{clientName}</div>;
      },
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('payment_date')}
        />
      ),
      cell: ({ row }) => {
        const { paymentDate } = row.original;

        return <div className="text-[#A5ABBD]">{paymentDate || '-'}</div>;
      },
    },
    {
      accessorKey: 'invoiceReferenceNumbers',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('invoice_id')}
        />
      ),
      cell: ({ row }) => {
        const { invoiceReferenceNumbers } = row.original;
        return (
          <div className="flex flex-col items-start gap-2">
            {invoiceReferenceNumbers
              .slice(0, showAll ? invoiceReferenceNumbers.length : 3)
              .map((invoiceNo) => (
                <div
                  key={invoiceNo}
                  className="w-40 rounded-sm border border-[#EDEEF2] bg-[#F6F7F9] p-1 text-xs text-black"
                >
                  {invoiceNo}
                </div>
              ))}

            {invoiceReferenceNumbers.length > 3 && (
              <button
                onClick={handleToggleShow}
                className="text-xs text-blue-500 underline"
              >
                {showAll ? 'Show less' : 'See more'}
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        return (
          <div className="flex max-w-sm">
            {' '}
            <ConditionalRenderingStatus status={status} />
          </div>
        );
      },
    },
    {
      accessorKey: 'amountPaid',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('amount_paid')}
        />
      ),
      cell: ({ row }) => {
        const { amountPaid } = row.original;
        return formattedAmount(amountPaid);
      },
    },
    {
      accessorKey: 'amount',
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
    {
      accessorKey: 'paymentMode',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('mode_of_payment')}
        />
      ),
      cell: ({ row }) => {
        const { paymentMode } = row.original;
        return <span>{paymentMode.toUpperCase()}</span> || '-';
      },
    },
    // {
    //   id: 'actions',
    //   enableHiding: false,
    //   cell: ({ row }) => {
    //     const { status } = row.original;

    //     if (status === 'Approved' || status === 'Rejected') return null;

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreVertical className="h-4 w-4" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end" className="max-w-fit">
    //           <span
    //             onClick={(e) => {
    //               e.stopPropagation();
    //             }}
    //             className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
    //           >
    //             <Pencil size={14} /> {'Edit'}
    //           </span>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
  ];
};
