import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';

export const useTrialBalanceWBColumns = ({ onReview } = {}) => {
  const router = useRouter();

  return [
    {
      accessorKey: 'documentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DOCUMENT ID" />
      ),
    },
    {
      accessorKey: 'transactionType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TRANSACTION TYPE" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-gray-900">
          {row.original.transactionType}
        </span>
      ),
    },
    {
      accessorKey: 'counterparty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="COUNTERPARTY" />
      ),
    },
    {
      accessorKey: 'debitLedger',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DEBIT LEDGER" />
      ),
    },
    {
      accessorKey: 'creditLedger',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CREDIT LEDGER" />
      ),
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="AMOUNT"
          className="justify-end text-right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-semibold text-gray-900">
          {row.original.amount}
        </div>
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
          Posted: 'bg-emerald-100 text-emerald-700',
          Closed: 'bg-gray-200 text-gray-700',
          Awaiting: 'bg-purple-100 text-purple-700',
          'Draft Bundle': 'bg-amber-100 text-amber-700',
        };

        return (
          <Badge
            className={`border-none px-2.5 py-1 text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'source',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SOURCE" />
      ),
      cell: ({ row }) => (
        <span className="text-gray-500">{row.original.source}</span>
      ),
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ACTION" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.actions?.map((action) => (
            <Button
              key={`${row.original.eventId}-${action}`}
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
                    `/dashboard/accounting/trial-balance/${encodeURIComponent(row.original.documentId)}`,
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
      ),
    },
  ];
};
