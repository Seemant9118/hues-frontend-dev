'use client';

import {
  capitalize,
  convertSnakeToTitleCase,
} from '@/appUtils/helperFunctions';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const usePINAuditLogsColumns = () => {
  const translations = useTranslations(
    'components.generate_pin_modal.audit_logs.table.header.label',
  );
  return [
    {
      accessorKey: 'actiontype',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('action_type')}
        />
      ),
      cell: ({ row }) => {
        const { actiontype } = row.original;

        if (actiontype === 'RESET_PIN') {
          return <div>{convertSnakeToTitleCase(actiontype)}</div>;
        }
        if (actiontype === 'CREATE_PIN') {
          return <div>{convertSnakeToTitleCase(actiontype)}</div>;
        }
        if (actiontype === 'UPDATE_PIN') {
          return <div>{convertSnakeToTitleCase(actiontype)}</div>;
        }
        return <div>-</div>;
      },
    },
    {
      accessorKey: 'createdat',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('update_on')}
        />
      ),
      cell: ({ row }) => {
        const { createdat } = row.original;
        const date = moment(createdat).format('DD-MM-YYYY');
        return <div className="text-[#A5ABBD]">{date}</div>;
      },
    },
    {
      accessorKey: 'ipAddress',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('ip_address')}
        />
      ),
      cell: ({ row }) => {
        const { ipAddress } = row.original;
        return <div>{ipAddress ?? '-'}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={translations('status')} />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        if (status === 'SUCCESS') {
          return (
            <div className="w-fit rounded-sm border border-green-600 bg-green-100 px-2 py-1 text-green-600">
              {capitalize(status)}
            </div>
          );
        }
        if (status === 'FAILED') {
          return (
            <div className="w-fit rounded-sm border border-red-600 bg-red-100 p-1 text-red-600">
              {capitalize(status)}
            </div>
          );
        }
        return <div>{'-'}</div>;
      },
    },
  ];
};
