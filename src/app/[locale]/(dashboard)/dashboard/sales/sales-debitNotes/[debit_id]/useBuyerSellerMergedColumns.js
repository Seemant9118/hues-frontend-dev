import {
  capitalize,
  convertSnakeToTitleCase,
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCheck, MoreVertical, Pencil, Trash2 } from 'lucide-react';

// const renderBuyerCell = (row, renderFn) => {
//   if (!row.original._isFirstRow) return null;

//   return renderFn();
// };

export const useBuyerSellerColumns = ({
  onEditLine = null,
  onDeleteLine = null,
  canShowSellerAction = null,
} = {}) => {
  return [
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU ID" />
      ),
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
    },
    {
      accessorKey: 'defect',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Defects" />
      ),
      cell: ({ row }) => {
        const statuses = getQCDefectStatuses(row.original);
        if (!statuses?.length) return '-';

        return (
          <div className="flex flex-wrap gap-1">
            {statuses.map((status) => (
              <ConditionalRenderingStatus key={status} status={status} isQC />
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'buyerQty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty." />
      ),
    },
    {
      accessorKey: 'expectation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Buyer Expectation" />
      ),
      cell: ({ row }) => {
        const { expectation } = row.original;
        return convertSnakeToTitleCase(expectation) || '-';
      },
    },

    // -------- SELLER --------
    {
      accessorKey: 'sellerResponse',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Seller Response" />
      ),
      cell: ({ row }) => {
        const { sellerResponse } = row.original;

        // No response → show only dash (no badge, no styling)
        if (sellerResponse === '-') {
          return '-';
        }

        // Badge only when response exists
        const badgeClass =
          sellerResponse === 'ACCEPTED'
            ? 'border border-green-500 bg-green-100 text-green-600'
            : sellerResponse === 'REJECTED'
              ? 'border border-red-500 bg-red-100 text-red-600'
              : 'border border-yellow-500 bg-yellow-100 text-yellow-600';

        return (
          <Badge className={badgeClass}>{capitalize(sellerResponse)}</Badge>
        );
      },
    },
    {
      accessorKey: 'sellerQty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty." />
      ),
    },
    {
      accessorKey: 'sellerAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ getValue }) =>
        typeof getValue() === 'number'
          ? formattedAmount(getValue())
          : getValue(),
    },
    // -------- ACTIONS --------
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => {
        const { isCreditNoteCreated } = row.original;
        if (!canShowSellerAction) return '-';
        else if (canShowSellerAction && !canShowSellerAction(row)) return '-';

        return (
          <div className="flex items-center gap-1">
            {isCreditNoteCreated ? (
              <span className="flex items-center gap-1 text-xs">
                <CheckCheck size={14} /> Credit Note
              </span>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-w-fit">
                  <DropdownMenuItem
                    className="flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLine(row.original);
                    }}
                  >
                    <Pencil size={14} /> Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="flex items-center justify-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLine(row.original);
                    }}
                  >
                    <Trash2 size={16} className="text-red-500" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];
};
