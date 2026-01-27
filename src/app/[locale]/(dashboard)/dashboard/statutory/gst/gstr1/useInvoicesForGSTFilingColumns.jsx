'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import moment from 'moment';

export const useInvoicesForGSTFilingColumns = ({
  setSelectedInvoicesToFile,
}) => {
  return [
    /* Selection */
    {
      id: 'select',
      header: ({ table }) => {
        const isAllSelected = table.getIsAllPageRowsSelected();
        const isSomeSelected = table.getIsSomePageRowsSelected();

        return (
          <Checkbox
            checked={isAllSelected || (isSomeSelected && 'indeterminate')}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);

              if (value) {
                const selectedRows = table.getRowModel().rows.map((row) => ({
                  ...row.original,
                  customerName: row.original.clientName,
                }));

                setSelectedInvoicesToFile(selectedRows);
              } else {
                setSelectedInvoicesToFile([]);
              }
            }}
            aria-label="Select all"
          />
        );
      },
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);

              setSelectedInvoicesToFile((prev) => {
                if (value) {
                  return [
                    ...prev,
                    {
                      ...row.original,
                      customerName: row.original.clientName,
                    },
                  ];
                }

                return prev.filter((item) => item.id !== row.original.id);
              });
            }}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },

    /* Doc No */
    {
      accessorKey: 'docNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doc No" />
      ),
      cell: ({ row }) => (
        <span>{row.original?.invoiceReferenceNumber || '--'}</span>
      ),
    },

    /* Doc Date */
    {
      accessorKey: 'docDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Doc Date" />
      ),
      cell: ({ row }) => {
        const date = row.original?.invoiceDate;
        return date ? moment(date).format('DD MMM YYYY') : '--';
      },
    },

    /* Counterparty GSTIN */
    {
      accessorKey: 'counterpartyGstin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Counterparty GSTIN" />
      ),
      cell: ({ row }) => row.original?.gstNumber || '--',
    },

    /* Counterparty Name */
    {
      accessorKey: 'counterpartyName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Counterparty Name" />
      ),
      cell: ({ row }) => row.original?.vendorName || '--',
    },

    /* Value */
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => formattedAmount(row.original?.totalAmount),
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original?.status;
        return status ? <ConditionalRenderingStatus status={status} /> : '--';
      },
    },

    /* Sync */
    {
      accessorKey: 'sync',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sync" />
      ),
      cell: ({ row }) => row.original?.syncStatus || '--',
    },
  ];
};
