import { capitalize } from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';

export const useFetchedDataColumns = () => {
  return [
    {
      id: 'select',
      size: 60,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: 'item',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Item" />
      ),
      cell: ({ row }) => (
        <div className="max-w-52 truncate font-medium text-gray-900">
          {capitalize(row.original.item)}
        </div>
      ),
    },

    {
      accessorKey: 'hsnCode',
      size: 140,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN" />
      ),
      cell: ({ row }) => (
        <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
          {row.original.hsnCode}
        </span>
      ),
    },

    {
      accessorKey: 'category',
      size: 200,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original?.category?.categoryName}
        </span>
      ),
    },
  ];
};
