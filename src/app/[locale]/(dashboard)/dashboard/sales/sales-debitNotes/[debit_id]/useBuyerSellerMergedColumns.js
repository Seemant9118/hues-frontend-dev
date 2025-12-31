import {
  capitalize,
  formattedAmount,
  getQCDefectStatuses,
} from '@/appUtils/helperFunctions';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';

const renderBuyerCell = (row, renderFn) => {
  if (!row.original._isFirstRow) return null;

  return renderFn();
};

export const useBuyerSellerColumns = () => {
  return [
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="SKU ID" />
      ),
      cell: ({ row, getValue }) => renderBuyerCell(row, () => getValue()),
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Items" />
      ),
      cell: ({ row, getValue }) => renderBuyerCell(row, () => getValue()),
    },
    {
      accessorKey: 'defect',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Defects" />
      ),
      cell: ({ row }) =>
        renderBuyerCell(row, () => {
          const statuses = getQCDefectStatuses(row.original);
          if (!statuses?.length) return '-';

          return (
            <div className="flex flex-wrap gap-1">
              {statuses.map((status) => (
                <ConditionalRenderingStatus key={status} status={status} isQC />
              ))}
            </div>
          );
        }),
    },
    {
      accessorKey: 'buyerQty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty." />
      ),
      cell: ({ row, getValue }) => renderBuyerCell(row, () => getValue()),
    },
    {
      accessorKey: 'expectation',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Buyer Expectation" />
      ),
      cell: ({ row, getValue }) => renderBuyerCell(row, () => getValue()),
    },
    {
      accessorKey: 'internalRemark',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Internal remarks" />
      ),
      cell: ({ row, getValue }) =>
        renderBuyerCell(row, () => getValue() || '-'),
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
  ];
};
