'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useInvoicesForGSTFilingColumns = ({
  type, // 'b2b' or 'crn'
  setFilingState,
}) => {
  const translations = useTranslations('gsts.gstr1.table');
  const idField = type === 'b2b' ? 'invoiceId' : 'id';
  const stateField =
    type === 'b2b' ? 'selectedInvoices' : 'selectedCreditNotes';

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

                setFilingState((prev) => ({
                  ...prev,
                  [stateField]: selectedRows,
                }));
              } else {
                setFilingState((prev) => ({
                  ...prev,
                  [stateField]: [],
                }));
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

              setFilingState((prev) => {
                const currentSelected = prev[stateField] || [];
                if (value) {
                  // Avoid duplicates
                  const alreadyExists = currentSelected.some(
                    (item) => item[idField] === row.original[idField],
                  );
                  if (alreadyExists) return prev;

                  return {
                    ...prev,
                    [stateField]: [
                      ...currentSelected,
                      {
                        ...row.original,
                        customerName: row.original.clientName,
                      },
                    ],
                  };
                }

                return {
                  ...prev,
                  [stateField]: currentSelected.filter(
                    (item) => item[idField] !== row.original[idField],
                  ),
                };
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
        <DataTableColumnHeader column={column} title={translations('docNo')} />
      ),
      cell: ({ row }) =>
        row.original?.invoiceReferenceNumber ||
        row.original?.referenceNumber ||
        '--',
    },

    /* Doc Date */
    {
      accessorKey: 'docDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('docDate')}
        />
      ),
      cell: ({ row }) => {
        const date = row.original?.invoiceDate || row.original?.createdAt;
        return date ? moment(date).format('DD MMM YYYY') : '--';
      },
    },

    /* Counterparty GSTIN */
    {
      accessorKey: 'counterpartyGstin',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('counterpartyGstin')}
        />
      ),
      cell: ({ row }) =>
        row.original?.gstNumber ||
        row.original?.toEnterprise?.gstNumber ||
        '--',
    },

    /* Counterparty Name */
    {
      accessorKey: 'counterpartyName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('counterpartyName')}
        />
      ),
      cell: ({ row }) =>
        row.original?.vendorName || row.original?.toEnterprise?.name || '--',
    },

    /* Value */
    {
      accessorKey: 'value',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('value')} />
      ),
      cell: ({ row }) => formattedAmount(row.original?.totalAmount),
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const { isDraft, isFiled } = row.original?.gstr1Filed || {};
        const status = isFiled ? 'FILED' : isDraft ? 'DRAFT' : 'PENDING';
        return status ? <ConditionalRenderingStatus status={status} /> : '--';
      },
    },

    /* Sync */
    {
      accessorKey: 'sync',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('sync')} />
      ),
      cell: ({ row }) => row.original?.syncStatus || '--',
    },
  ];
};
