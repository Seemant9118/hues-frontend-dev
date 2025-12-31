import { Trash2 } from 'lucide-react';
import { formattedAmount } from '@/appUtils/helperFunctions';
import { Button } from '../ui/button';
import { DataTableColumnHeader } from '../table/DataTableColumnHeader';
import { Badge } from '../ui/badge';

export const useCreateResponseColumns = ({ onDelete }) => {
  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original?.productName}</span>
          <span className="text-xs text-gray-500">
            SKU: {row.original?.skuId}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'responseType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Response Type" />
      ),
      cell: ({ row }) => {
        const { responseType } = row.original;
        return (
          <Badge
            className={
              responseType === 'ACCEPTED'
                ? 'border border-green-600 bg-green-100 text-green-700'
                : responseType === 'REJECTED'
                  ? 'border border-red-600 bg-red-100 text-red-700'
                  : 'border border-yellow-600 bg-yellow-100 text-yellow-700'
            }
          >
            {responseType}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unit Price" />
      ),
      cell: ({ getValue }) => `₹${getValue()}`,
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Approved/Rejected Qty" />
      ),
      cell: ({ row }) => {
        const { approvedQuantity, rejectedQuantity } = row.original;

        return approvedQuantity || rejectedQuantity;
      },
    },
    {
      accessorKey: 'approvedAmount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Approved/Rejected Amount"
        />
      ),
      cell: ({ row }) => {
        const { approvedAmount, rejectedAmount } = row.original;

        return formattedAmount(approvedAmount || rejectedAmount);
      },
    },
    {
      accessorKey: 'taxAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Tax" />
      ),
      cell: ({ row }) => {
        const { taxAmount } = row.original;

        return taxAmount ? formattedAmount(taxAmount) : '-';
      },
    },

    // 🔴 ACTION COLUMN
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 size={16} className="text-red-500" />
        </Button>
      ),
    },
  ];
};
