'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { capitalize, formattedAmount } from '@/appUtils/helperFunctions';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import Tooltips from '@/components/auth/Tooltips';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import { usePermission } from '@/hooks/usePermissions';
import { DeleteProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { Info, MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useGoodsColumns = (setIsEditing, setGoodsToEdit) => {
  const translations = useTranslations('goods');
  const { hasAnyPermission } = usePermission();

  const baseColumns = [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.product')}
        />
      ),
      cell: ({ row }) => {
        const { productName } = row.original;
        return (
          <div className="flex items-center gap-1">
            <span className="hover:text-primary hover:underline">
              {productName}
            </span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: 'manufacturerName',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader
    //       column={column}
    //       title={translations('table.header.manufacturer')}
    //     />
    //   ),
    //   cell: ({ row }) => {
    //     const { manufacturerName } = row.original;
    //     return manufacturerName || '-';
    //   },
    // },
    {
      accessorKey: 'produtType',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.prodType')}
        />
      ),
      cell: ({ row }) => {
        // eslint-disable-next-line no-unsafe-optional-chaining
        const itemType = row.original?.goodsType?.goodsHsnMaster?.item || '-';
        const description =
          row.original?.goodsType?.goodsHsnMaster?.description || '-';
        return (
          <div className="flex items-center gap-1">
            <span className="hover:text-primary hover:underline">
              {capitalize(itemType)}
            </span>
            <Tooltips trigger={<Info size={14} />} content={description} />
          </div>
        );
      },
    },
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.hsnCode')}
        />
      ),
      cell: ({ row }) => {
        const { hsnCode } = row.original;
        return <Badge variant="secondary">{hsnCode || '-'}</Badge>;
      },
    },

    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.category')}
        />
      ),
      cell: ({ row }) => {
        const category =
          row.original?.goodsType?.goodsHsnMaster?.category?.categoryName;
        return category || '-';
      },
    },
    {
      accessorKey: 'salesPrice',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.salesPrice')}
        />
      ),
      cell: ({ row }) => {
        const value = row.getValue('salesPrice');
        return formattedAmount(value);
      },
    },
    {
      accessorKey: 'mrp',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.mrp')}
        />
      ),
      cell: ({ row }) => {
        const value = row.getValue('mrp');
        return formattedAmount(value);
      },
    },

    {
      accessorKey: 'gstPercentage',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.gst')}
        />
      ),
      cell: ({ row }) => {
        const value = row.getValue('gstPercentage');
        return `${value} %`;
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.addedOn')}
        />
      ),
      cell: ({ row }) => {
        const { createdAt } = row.original;
        const date = moment(createdAt).format('DD-MM-YYYY');
        return <div>{date}</div>;
      },
    },
  ];

  // Conditionally add actions column
  const canShowActions = hasAnyPermission([
    'permission:item-masters-edit',
    'permission:item-masters-delete',
  ]);

  if (canShowActions) {
    baseColumns.push({
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;
        const name = row.original?.productName;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-fit">
              <ProtectedWrapper permissionCode="permission:item-masters-edit">
                <DropdownMenuItem
                  className="flex items-center justify-center gap-2"
                  onClick={(e) => {
                    setIsEditing((prev) => !prev);
                    e.stopPropagation();
                    setGoodsToEdit(row.original);
                  }}
                >
                  <Pencil size={12} />
                  {translations('table.columnActions.edit')}
                </DropdownMenuItem>
              </ProtectedWrapper>

              <ProtectedWrapper permissionCode="permission:item-masters-delete">
                <ConfirmAction
                  deleteCta={translations('table.columnActions.delete.cta')}
                  infoText={translations(
                    'table.columnActions.delete.infoText',
                    {
                      name,
                    },
                  )}
                  cancelCta={translations('table.columnActions.delete.cancel')}
                  id={id}
                  mutationKey={goodsApi.getAllProductGoods.endpointKey}
                  mutationFunc={DeleteProductGoods}
                  successMsg={translations(
                    'table.columnActions.delete.successMsg',
                  )}
                />
              </ProtectedWrapper>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return baseColumns;
};
