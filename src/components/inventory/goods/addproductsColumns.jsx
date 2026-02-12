import { formattedAmount } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

export const useAddedProductColumns = ({
  setIsEditingProduct,
  goodsHsnMasterDetails,
  setProductsToEdit,
}) => {
  return [
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'SKU ID'} />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-800">
          {row.original.skuId || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Product name'} />
      ),
      cell: ({ row }) => <span>{row.original.productName || '-'}</span>,
    },
    {
      accessorKey: 'salesPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Sales Price'} />
      ),
      cell: ({ row }) => (
        <span>
          {row.original?.salesPrice
            ? formattedAmount(row.original?.salesPrice)
            : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'mrp',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'MRP'} />
      ),
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original?.mrp ? formattedAmount(row.original?.mrp) : '-'}
        </span>
      ),
    },

    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Actions'} />
      ),
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => {
                setIsEditingProduct(true);
                setProductsToEdit({ ...data, goodsHsnMasterDetails });
              }}
            >
              <Pencil size={14} />
            </Button>
          </div>
        );
      },
    },
  ];
};
