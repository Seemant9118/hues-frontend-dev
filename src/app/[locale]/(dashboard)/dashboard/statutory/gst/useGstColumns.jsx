'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

export const useGstColumns = () => {
  const router = useRouter();
  const translations = useTranslations('gsts.table');

  const getStatusBadge = (status, isFiled) => {
    // If we have a specific status, use it, otherwise fallback to isFiled
    const currentStatus =
      status?.toLowerCase() || (isFiled ? 'filed' : 'pending');

    switch (currentStatus) {
      case 'filed':
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 font-medium text-green-700"
          >
            Filed
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 font-medium text-blue-700"
          >
            Pending
          </Badge>
        );
      case 'draft':
        return (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-50 font-medium text-gray-700"
          >
            Draft
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 font-medium text-red-700"
          >
            Failed
          </Badge>
        );
      case 'overdue':
        return (
          <Badge
            variant="outline"
            className="border-orange-200 bg-orange-50 font-medium text-orange-700"
          >
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-50 font-medium text-gray-700"
          >
            {capitalize(currentStatus)}
          </Badge>
        );
    }
  };

  return [
    {
      accessorKey: 'returnType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('documentType')}
        />
      ),
      cell: ({ row }) => {
        const type = row.original?.returnType || 'GSTR-1';
        const description =
          row.original?.description || 'Outward Supplies Return';
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-gray-900">{type}</span>
            <span className="text-xs text-gray-500">{description}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'contextId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('documentNo')}
        />
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
            className="cursor-pointer hover:text-primary hover:underline"
            onClick={() => {
              if (isCDNR) {
                router.push(`/dashboard/sales/sales-creditNotes/${contextId}`);
              } else {
                router.push(`/dashboard/sales/sales-invoices/${contextId}`);
              }
            }}
          >
            <span className="flex w-fit items-center justify-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-primary/30 hover:bg-primary/5">
              {contextRef} <ExternalLink size={12} className="text-gray-400" />
            </span>
          </span>
        );
      },
    },

    /* Section Type */
    {
      accessorKey: 'sectionType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('section')}
        />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-700">
          {row.original?.sectionType?.toUpperCase() || '--'}
        </span>
      ),
    },

    /* Period */
    {
      accessorKey: 'retPeriod',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('period')} />
      ),
      cell: ({ row }) => {
        const period = row.original?.retPeriod; // MMYYYY
        return (
          <span className="text-sm text-gray-600">
            {period ? moment(period, 'MMYYYY').format('MMMM YYYY') : '--'}
          </span>
        );
      },
    },

    /* Status */
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) =>
        getStatusBadge(row.original?.status, row.original?.isFiled),
    },

    /* GSTIN */
    {
      accessorKey: 'gstin',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('gstin')} />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">
          {row.original?.gstin || '--'}
        </span>
      ),
    },
  ];
};
