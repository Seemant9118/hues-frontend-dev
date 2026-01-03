import { formattedAmount } from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import moment from 'moment';

export const debitNoteColumns = () => [
  {
    accessorKey: 'referenceNumber',
    header: 'Debit Note ID',
    cell: ({ row }) => (
      <span className="text-sm font-semibold">
        {row.original?.referenceNumber || '-'}
      </span>
    ),
  },

  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <ConditionalRenderingStatus status={row.original?.status} />
    ),
  },

  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm">
        {moment(row.original?.createdAt).format('DD-MM-YYYY')}
      </span>
    ),
  },

  {
    accessorKey: 'amount',
    header: 'Total Amount',
    cell: ({ row }) => (
      <span className="font-semibold text-[#363940]">
        {formattedAmount(row.original?.amount)}{' '}
      </span>
    ),
  },

  {
    accessorKey: 'remark',
    header: 'Reason',
    cell: ({ row }) => (
      <span className="text-sm text-[#363940]">
        {row.original?.remark || '-'}
      </span>
    ),
  },
];
