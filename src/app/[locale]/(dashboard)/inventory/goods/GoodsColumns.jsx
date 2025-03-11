'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import Tooltips from '@/components/auth/Tooltips';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { Info, MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useGoodsColumns = (setIsEditing, setGoodsToEdit) => {
  const translations = useTranslations('goods');

  return [
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.product')}
        />
      ),
      cell: ({ row }) => {
        const { description, productName } = row.original;
        return (
          <div className="flex items-center gap-1">
            {productName}
            <Tooltips trigger={<Info size={14} />} content={description} />
          </div>
        );
      },
    },
    {
      accessorKey: 'manufacturerName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.manufacturer')}
        />
      ),
    },
    {
      accessorKey: 'hsnCode',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.hsnCode')}
        />
      ),
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.rate')}
        />
      ),
    },
    {
      accessorKey: 'gstPercentage',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.gst')}
        />
      ),
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
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { id } = row.original;
        const name = row.original.productName;
        return (
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
                onClick={() => {
                  setIsEditing((prev) => !prev);
                  setGoodsToEdit(row.original);
                }}
              >
                <Pencil size={12} />
                {translations('table.columnActions.edit')}
              </DropdownMenuItem>

              <ConfirmAction
                deleteCta={translations('table.columnActions.delete.cta')}
                infoText={translations('table.columnActions.delete.infoText', {
                  name,
                })}
                cancelCta={translations('table.columnActions.delete.cancel')}
                id={id}
                mutationKey={goodsApi.getAllProductGoods.endpointKey}
                mutationFunc={DeleteProductGoods}
                successMsg={translations(
                  'table.columnActions.delete.successMsg',
                )}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
