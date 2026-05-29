import {
  capitalize,
  convertSnakeToTitleCase,
  formatDate,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { Badge } from '@/components/ui/badge';
import { useRouter } from '@/i18n/routing';
import { ExternalLink, Eye } from 'lucide-react';
import Link from 'next/link';

const normalizeSourceValue = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

const getSourceId = (row, sourceType) => {
  const normalizedSourceType = normalizeSourceValue(sourceType);

  if (normalizedSourceType.includes('invoice')) {
    return (
      row.invoiceId ||
      row.sourceId ||
      row.sourceID ||
      row.source?.id ||
      row.invoice?.id
    );
  }

  if (normalizedSourceType.includes('payment')) {
    return (
      row.paymentId ||
      row.sourceId ||
      row.sourceID ||
      row.source?.id ||
      row.payment?.id
    );
  }

  if (normalizedSourceType.includes('order')) {
    return (
      row.orderId ||
      row.sourceId ||
      row.sourceID ||
      row.source?.id ||
      row.order?.id
    );
  }

  return row.sourceId || row.sourceID || row.source?.id;
};

const getSourceHref = (row) => {
  const normalizedSourceType = normalizeSourceValue(row.sourceType);
  const normalizedFlowDirection = normalizeSourceValue(row.flowDirection);
  const isInflow = normalizedFlowDirection === 'inflow';
  const sourceId = getSourceId(row, row.sourceType);

  if (!sourceId) return null;

  if (normalizedSourceType.includes('invoice')) {
    return isInflow
      ? `/dashboard/sales/sales-invoices/${sourceId}`
      : `/dashboard/purchases/purchase-invoices/${sourceId}`;
  }

  if (normalizedSourceType.includes('payment')) {
    return isInflow
      ? `/dashboard/sales/sales-payments/${sourceId}`
      : `/dashboard/purchases/purchase-payments/${sourceId}`;
  }

  if (normalizedSourceType.includes('order')) {
    return isInflow
      ? `/dashboard/sales/sales-orders/${sourceId}`
      : `/dashboard/purchases/purchase-orders/${sourceId}`;
  }

  return null;
};

const sourceCell = (row) => {
  const label = row.referenceNumber
    ? `${capitalize(row.sourceType)} (${row.referenceNumber})`
    : capitalize(row.sourceType) || '--';
  const href = getSourceHref(row);

  if (!href) return label;

  return (
    <Link
      href={href}
      className="flex items-center gap-1 font-medium text-primary underline-offset-2 hover:underline"
    >
      {label} <ExternalLink size={14} />
    </Link>
  );
};

const makeActionsCell =
  (router, tab = 'impending') =>
  // eslint-disable-next-line react/display-name
  ({ row }) => (
    <div className="flex items-center gap-2">
      <button
        size="sm"
        className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-primary underline-offset-2 hover:underline"
        onClick={() => {
          const bytes = new TextEncoder().encode(JSON.stringify(row.original));
          const binary = Array.from(bytes, (byte) =>
            String.fromCharCode(byte),
          ).join('');
          const payload = encodeURIComponent(btoa(binary));
          router.push(
            `/dashboard/accounting/cash-flow/${encodeURIComponent(row.original.id)}?entry=${payload}&tab=${tab}`,
          );
        }}
      >
        <Eye size={14} /> View
      </button>
      {row.original.journalEntryPublicId && (
        <button
          size="sm"
          className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-medium text-black underline-offset-2 hover:underline"
          onClick={() => {
            router.push(
              `/dashboard/accounting/trial-balance/${row.original.journalEntryPublicId}`,
            );
          }}
        >
          TB <ExternalLink size={14} />
        </button>
      )}
    </div>
  );

const actualActionsCell = () => <span className="text-gray-400">--</span>;

const impendingColumns = [
  {
    accessorKey: 'expectedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EXPECTED DATE" />
    ),
    cell: ({ row }) =>
      formatDate(row.original.expectedDate || row.original.actualDate),
  },
  {
    accessorKey: 'flowDirection',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DIRECTION" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        {capitalize(row.original.flowDirection)}
      </Badge>
    ),
  },
  {
    accessorKey: 'transactionAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="EXPECTED AMOUNT" />
    ),
    cell: ({ row }) => <span>{formattedAmount(row.original.grossAmount)}</span>,
  },
  {
    accessorKey: 'settledAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="REALIZED AMOUNT" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-emerald-600">
        {formattedAmount(row.original.settledAmount)}
      </span>
    ),
  },
  {
    accessorKey: 'outstandingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="RESIDUAL" />
    ),
    cell: ({ row }) => (
      <span className="font-medium text-amber-600">
        {formattedAmount(row.original.outstandingAmount)}
      </span>
    ),
  },
  {
    accessorKey: 'flowCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CLASSIFICATION" />
    ),
    cell: ({ row }) => convertSnakeToTitleCase(row.original.classification),
  },
  {
    accessorKey: 'sourceType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SOURCE" />
    ),
    cell: ({ row }) => sourceCell(row.original),
  },
  {
    accessorKey: 'eventType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BASIS" />
    ),
    cell: ({ row }) => convertSnakeToTitleCase(row.original.eventType),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STATUS" />
    ),
    cell: ({ row }) => (
      <ConditionalRenderingStatus
        status={row.original.status}
        className="w-fit"
      />
    ),
  },
  {
    accessorKey: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ACTIONS" />
    ),
    cell: actualActionsCell,
  },
];

const actualColumns = [
  {
    accessorKey: 'actualDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DATE" />
    ),
    cell: ({ row }) =>
      formatDate(row.original.actualDate || row.original.expectedDate),
  },
  {
    accessorKey: 'flowDirection',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DIRECTION" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary">
        {capitalize(row.original.flowDirection)}
      </Badge>
    ),
  },
  {
    accessorKey: 'transactionAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="AMOUNT" />
    ),
    cell: ({ row }) => (
      <span>{formattedAmount(row.original.transactionAmount)}</span>
    ),
  },
  {
    accessorKey: 'flowCategory',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CLASSIFICATION" />
    ),
    cell: ({ row }) => convertSnakeToTitleCase(row.original.flowCategory),
  },
  {
    accessorKey: 'counterparty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="COUNTERPARTY" />
    ),
    cell: ({ row }) =>
      row.original.counterpartyName ||
      row.original.customerName ||
      row.original.vendorName ||
      row.original.partyName ||
      '--',
  },
  {
    accessorKey: 'sourceType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SOURCE" />
    ),
    cell: ({ row }) => sourceCell(row.original),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="STATUS" />
    ),
    cell: ({ row }) => (
      <ConditionalRenderingStatus
        status={row.original.status}
        className="w-fit"
      />
    ),
  },
  {
    accessorKey: 'bankAccount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BANK ACCOUNT" />
    ),
    cell: ({ row }) =>
      row.original.bankAccountName ||
      row.original.bankAccountNumber ||
      row.original.bankName ||
      '--',
  },
  {
    accessorKey: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ACTIONS" />
    ),
    cell: actualActionsCell,
  },
];

export const useCashFlowColumns = ({ tab = 'impending' } = {}) => {
  const router = useRouter();

  if (tab === 'actual') {
    return actualColumns.map((column) =>
      column.accessorKey === 'actions'
        ? { ...column, cell: makeActionsCell(router, 'actual') }
        : column,
    );
  }

  return impendingColumns.map((column) =>
    column.accessorKey === 'actions'
      ? { ...column, cell: makeActionsCell(router, 'impending') }
      : column,
  );
};
