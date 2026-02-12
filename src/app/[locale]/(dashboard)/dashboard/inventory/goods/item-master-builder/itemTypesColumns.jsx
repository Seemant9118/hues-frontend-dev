import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const useItemTypeColumns = ({ router }) => {
  return [
    {
      accessorKey: 'itemType',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Item Type'} />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {capitalize(row.original.name)}
        </div>
      ),
    },

    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'HSN'} />
      ),
      cell: ({ row }) => {
        const { hsnCode } = row.original.goodsHsnMaster;

        return (
          <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
            HSN: {hsnCode}
          </span>
        );
      },
    },

    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Category'} />
      ),
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.goodsHsnMaster?.category?.categoryName}
        </span>
      ),
    },

    {
      accessorKey: 'productsAdded',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Product(s) added'} />
      ),
      cell: ({ row }) => (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
          {row.original.itemsCount}
        </span>
      ),
    },

    // {
    //   accessorKey: 'status',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'Status'} />
    //   ),
    //   cell: ({ row }) => {
    //     const { status } = row.original;

    //     const statusStyles =
    //       status === 'Active'
    //         ? 'bg-blue-100 text-blue-600'
    //         : 'bg-indigo-100 text-indigo-600';

    //     return (
    //       <span
    //         className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles}`}
    //       >
    //         {status}
    //       </span>
    //     );
    //   },
    // },

    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={'Actions'} />
      ),
      cell: ({ row }) => {
        // const data = row.original;

        return (
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                router.push(
                  `/dashboard/inventory/goods/item-master-builder/${row.original.id}`,
                );
              }}
            >
              <Plus size={14} />
              Add product
            </Button>

            {/* <Eye
              size={18}
              className="cursor-pointer text-gray-500 hover:text-black"
            />

            {data.status === 'Completed' ? (
              <RotateCcw
                size={18}
                className="cursor-pointer text-gray-500 hover:text-black"
              />
            ) : (
              <CheckCircle2
                size={18}
                className="cursor-pointer text-green-500"
              />
            )} */}
          </div>
        );
      },
    },
  ];
};
