import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

export const AddHocItemsColumns = ({ onEdit, onDelete }) => [
  {
    accessorKey: 'productName',
    header: 'Item',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.productName}</span>
        <span className="text-xs text-muted-foreground">
          SKU: {row.original.skuId}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'quantity',
    header: 'Qty',
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ getValue }) => `₹ ${getValue()}`,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ getValue }) => `₹ ${getValue()}`,
  },
  {
    accessorKey: 'gstPerUnit',
    header: 'GST (%)',
    cell: ({ getValue }) => `${getValue()} %`,
  },
  {
    accessorKey: 'totalGstAmount',
    header: 'Tax Amount',
    cell: ({ getValue }) => `₹ ${getValue()}`,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ getValue }) => (
      <span className="font-semibold">₹ {getValue()}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => onEdit(row.index)}>
          <Pencil size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(row.index)}>
          <Trash2 size={16} className="text-red-500" />
        </Button>
      </div>
    ),
  },
];
