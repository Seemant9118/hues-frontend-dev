'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Dot, Info } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useSalesInvoicesColumns = (setSelectedInvoices) => {
  const translations = useTranslations('sales.sales-invoices.table.header');
  // Function to handle row selection
  const handleRowSelection = (isSelected, row) => {
    const orderWithCustomer = { ...row.original };

    if (isSelected) {
      setSelectedInvoices((prev) => [...prev, orderWithCustomer]);
    } else {
      setSelectedInvoices((prev) =>
        prev.filter((order) => order.id !== row.original.id),
      );
    }
  };

  // Function to handle "Select All" functionality
  const handleSelectAll = (isAllSelected, rows) => {
    if (isAllSelected) {
      const allOrders = rows.map((row) => {
        return { ...row.original };
      });
      setSelectedInvoices(allOrders);
    } else {
      setSelectedInvoices([]); // Clear all selections
    }
  };
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value, table.getRowModel().rows);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click from being triggered
          }}
        >
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              handleRowSelection(!!value, row);
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
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
        const { invoiceReferenceNumber } = row.original;
        const isSaleRead = row.original?.readTracker?.sellerIsRead || true;
        return (
          <div className="flex items-center">
            {!isSaleRead && <Dot size={32} className="text-[#3288ED]" />}
            <span>{invoiceReferenceNumber}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('date')} />
      ),
      cell: ({ row }) => {
        const { invoiceDate } = row.original;
        return (
          <div className="text-[#A5ABBD]">
            {moment(invoiceDate).format('DD-MM-YYYY')}
          </div>
        );
      },
    },
    {
      accessorKey: 'clientType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('customers_type')}
        />
      ),
    },
    {
      accessorKey: 'customerName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('customers')}
        />
      ),
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
    {
      accessorKey: 'round_off',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('round_off')}
        />
      ),
      cell: ({ row }) => {
        const { totalAmount, roundOffAmount } = row.original;
        const roundOffVal = (Number(roundOffAmount) || 0) - totalAmount;

        if (roundOffVal === 0) return formattedAmount(0);

        const prefix = roundOffVal > 0 ? '+' : '';
        return (
          <span className={roundOffVal > 0 ? 'text-green-600' : 'text-red-600'}>
            {prefix}
            {formattedAmount(roundOffVal)}
          </span>
        );
      },
    },
    {
      accessorKey: 'roundOffAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('roundOff_amount')}
        />
      ),
      cell: ({ row }) => {
        const { roundOffAmount } = row.original;
        return (
          <div className="font-bold text-primary">
            {formattedAmount(roundOffAmount)}
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
        const paymentStatus = row.original?.invoiceMetaData?.payment?.status;
        const debitNoteStatus =
          row.original?.invoiceMetaData?.debitNote?.status === 'NOT_RAISED'
            ? ''
            : row.original?.invoiceMetaData?.debitNote?.status;

        return (
          <div className="flex max-w-36 flex-wrap gap-2">
            <ConditionalRenderingStatus status={paymentStatus} />
            {debitNoteStatus !== '' && (
              <ConditionalRenderingStatus status={debitNoteStatus} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'match_status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('match_status')}
        />
      ),
      cell: ({ row }) => {
        const metaData = row.original?.metaData;
        const matchStatusData = metaData?.gstFeeds?.salesSide?.matchStatus;

        const portalInvoiceNumber = matchStatusData?.portalInvoiceNumber || '—';
        const systemInvoiceNumber =
          matchStatusData?.systemInvoiceNumber ||
          row.original?.invoiceReferenceNumber ||
          '—';
        const status = matchStatusData?.result?.status || 'BOOKS_ONLY';
        const lastSyncAt =
          metaData?.gstFeeds?.salesSide?.syncAt || row.original.invoiceDate;

        return (
          <div className="flex flex-col gap-0.5 text-[11px] leading-tight">
            <div className="flex gap-1">
              <span className="text-[#A5ABBD]">Portal:</span>
              <span className="font-medium text-black">
                {portalInvoiceNumber}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-[#A5ABBD]">Books:</span>
              <span className="font-medium text-black">
                {systemInvoiceNumber}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <ConditionalRenderingStatus
                status={status}
                className="h-5 px-2 py-0"
              />

              <Tooltips
                trigger={
                  <Info size={14} className="cursor-pointer text-[#A5ABBD]" />
                }
                content={`Last Synced at : ${moment(lastSyncAt).format('DD-MM-YYYY hh:mm A')}`}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'gstfeeds',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('gst_feeds')}
        />
      ),
      cell: ({ row }) => {
        const isDraft = row.original?.gstr1Filed?.isDraft;
        const isFiled = row.original?.gstr1Filed?.isFiled;

        return (
          <div className="flex max-w-36 flex-wrap gap-2">
            {isFiled ? (
              <ConditionalRenderingStatus status={'GSTR_1_FILED'} />
            ) : isDraft ? (
              <ConditionalRenderingStatus status={'IMS_DRAFT'} />
            ) : (
              <ConditionalRenderingStatus status={'PLATFORM_ONLY'} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'orderReferenceNumber',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('order_id')}
        />
      ),
      cell: ({ row }) => {
        const { orderReferenceNumber } = row.original;
        return (
          <div className="w-48 rounded border border-[#EDEEF2] bg-[#F6F7F9] p-1">
            {orderReferenceNumber}
          </div>
        );
      },
    },
  ];
};
