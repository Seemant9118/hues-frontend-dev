import { capitalize, formatDate } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export const useTrialBalanceWBColumns = ({ onReview } = {}) => {
  const router = useRouter();

  return [
    {
      accessorKey: 'journalType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TYPE" />
      ),
      cell: ({ row }) => capitalize(row.original.journalType),
    },
    {
      accessorKey: 'entryDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ENTRY DATE" />
      ),
      cell: ({ row }) => formatDate(row.original.entryDate),
    },
    {
      accessorKey: 'sourceModule',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SOURCE" />
      ),
      cell: ({ row }) => capitalize(row.original.sourceModule),
    },
    {
      accessorKey: 'sourceRef',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="REF NUMBER" />
      ),
      cell: ({ row }) => row.original.referenceNumber || 'NA',
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        return <ConditionalRenderingStatus status={status} />;
      },
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ACTION" />
      ),
      cell: ({ row }) => {
        const actions = [];
        // if (row.original.status === 'DRAFT') {
        //   actions.push('Review');
        // }
        actions.push('View');

        return (
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <button
                key={`${row.original.id}-${action}`}
                className={cn(
                  `flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-primary underline-offset-2 hover:underline`,
                  action === 'Review'
                    ? 'bg-[#163b7d] text-white hover:bg-[#0f2f63]'
                    : 'bg-gray-100 text-primary',
                )}
                onClick={() => {
                  if (action === 'View') {
                    router.push(
                      `/dashboard/accounting/trial-balance/${encodeURIComponent(row.original.publicId || row.original.id)}`,
                    );
                  }
                  if (action === 'Review' && onReview) {
                    onReview(row.original);
                  }
                }}
              >
                {action}
              </button>
            ))}
          </div>
        );
      },
    },
  ];
};
