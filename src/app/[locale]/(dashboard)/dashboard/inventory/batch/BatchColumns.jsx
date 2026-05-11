'use client';

import { batchApi } from '@/api/inventories/goods/batch';
import ConfirmAction from '@/components/Modals/ConfirmAction';
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
import { DeleteProductBatch } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { MoreVertical, Pencil } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const useBatchColumns = (setIsEditing) => {
  const translations = useTranslations('batch');
  const { hasAnyPermission } = usePermission();

  const baseColumns = [
    {
      accessorKey: 'skuId',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.skuId')}
        />
      ),
      cell: ({ row }) => row.original.skuId || '-',
    },
    {
      accessorKey: 'batchNo',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.batchNo')}
        />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-primary">{row.original.batchNo}</div>
      ),
    },
    {
      accessorKey: 'manufactureDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.manufactureDate')}
        />
      ),
      cell: ({ row }) => {
        const { manufactureDate } = row.original;
        return manufactureDate
          ? moment(manufactureDate).format('DD-MM-YYYY')
          : '-';
      },
    },
    {
      accessorKey: 'expiryDate',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.expiryDate')}
        />
      ),
      cell: ({ row }) => {
        const { expiryDate } = row.original;
        return expiryDate ? moment(expiryDate).format('DD-MM-YYYY') : '-';
      },
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('table.header.status')}
        />
      ),
      cell: ({ row }) => {
        const { isActive } = row.original;
        return (
          <Badge variant={isActive ? 'success' : 'destructive'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
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
        return moment(createdAt).format('DD-MM-YYYY');
      },
    },
  ];

  const canShowActions = hasAnyPermission([
    'permission:item-masters-edit',
    'permission:item-masters-delete',
  ]);

  if (canShowActions) {
    baseColumns.push({
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const { publicId, batchNo } = row.original;
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
                    e.stopPropagation();
                    setIsEditing(true, row.original);
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
                      name: batchNo,
                    },
                  )}
                  cancelCta={translations('table.columnActions.delete.cancel')}
                  id={publicId}
                  mutationKey={batchApi.listBatches.endpointKey}
                  mutationFunc={DeleteProductBatch}
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
