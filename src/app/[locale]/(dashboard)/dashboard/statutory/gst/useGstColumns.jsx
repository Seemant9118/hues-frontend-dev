'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { ExternalLink } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';

export const useGstColumns = () => {
  const router = useRouter();

  return [
    {
      accessorKey: 'contextId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document no." />
      ),
      cell: ({ row }) => {
        const isCDNR = row.original?.sectionType === 'cdnr';

        const contextRef = isCDNR
          ? row.original?.invoiceData?.cdnr?.[0]?.nt?.[0]?.nt_num
          : row.original?.invoiceData?.b2b?.[0]?.inv?.[0]?.inum;

        const contextId = row.original?.contextId;

        if (!contextRef) return '--';

        return (
          <span
            className="hover:text-primary hover:underline"
            onClick={() => {
              if (isCDNR) {
                router.push(`/dashboard/sales/sales-creditNotes/${contextId}`);
              } else {
                router.push(`/dashboard/sales/sales-invoices/${contextId}`);
              }
            }}
          >
            <span className="flex w-fit items-center justify-center gap-1 rounded-sm border bg-foreground/5 p-1">
              {contextRef} <ExternalLink size={14} />
            </span>
          </span>
        );
      },
    },

    /* Context / Document Type */
    {
      accessorKey: 'context',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Document Type" />
      ),
      cell: ({ row }) => {
        const context = row.original?.context;
        if (!context) return '--';
        return capitalize(context.replace('_', ' '));
      },
    },

    /* Period */
    {
      accessorKey: 'retPeriod',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Period" />
      ),
      cell: ({ row }) => {
        const period = row.original?.retPeriod; // MMYYYY
        return period ? moment(period, 'MMYYYY').format('MMMM YYYY') : '--';
      },
    },

    /* Section Type */
    {
      accessorKey: 'sectionType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Section" />
      ),
      cell: ({ row }) => row.original?.sectionType?.toUpperCase() || '--',
    },

    /* GSTIN */
    {
      accessorKey: 'gstin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="GSTIN" />
      ),
      cell: ({ row }) => row.original?.gstin || '--',
    },
  ];
};
