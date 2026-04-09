import { capitalize, formatDate } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';

export const useTrialBalanceWBColumns = ({ onReview } = {}) => {
  const router = useRouter();

  return [
    {
      accessorKey: 'entryNumber',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ENTRY NUMBER" />
      ),
    },
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
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DESCRIPTION" />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        const statusStyles = {
          POSTED: 'bg-emerald-100 text-emerald-700',
          CLOSED: 'bg-gray-200 text-gray-700',
          AWAITING: 'bg-purple-100 text-purple-700',
          DRAFT: 'bg-amber-100 text-amber-700',
        };

        return (
          <Badge
            className={`border-none px-2.5 py-1 text-xs font-semibold ${statusStyles[status?.toUpperCase()] || 'bg-gray-100 text-gray-700'}`}
          >
            {status}
          </Badge>
        );
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
              <Button
                key={`${row.original.id}-${action}`}
                variant={action === 'Review' ? 'default' : 'outline'}
                size="sm"
                className={
                  action === 'Review'
                    ? 'bg-[#163b7d] text-white hover:bg-[#0f2f63]'
                    : 'text-gray-700'
                }
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
              </Button>
            ))}
          </div>
        );
      },
    },
  ];
};
