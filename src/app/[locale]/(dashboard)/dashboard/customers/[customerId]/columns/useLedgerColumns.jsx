import {
  capitalize,
  formatDateCustom,
  formattedAmount,
  formatValue,
} from '@/appUtils/helperFunctions';

export const useLedgerColumns = () => {
  return [
    {
      accessorKey: 'transactionDate',
      header: 'Date',
      cell: ({ row }) => formatDateCustom(row.original.transactionDate),
    },
    {
      accessorKey: 'transactionType',
      header: 'Doc Type',
      cell: ({ row }) => capitalize(row.original.transactionType),
    },
    {
      accessorKey: 'referenceNo',
      header: 'Doc No',
      cell: ({ row }) =>
        formatValue(row.original.referenceNo || row.original.transactionId),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        return (
          <span className="font-semibold text-emerald-600">
            {formattedAmount(row.original.amount)}
          </span>
        );
      },
    },
  ];
};
