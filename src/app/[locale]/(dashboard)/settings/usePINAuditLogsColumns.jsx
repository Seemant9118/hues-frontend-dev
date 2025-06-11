'use client';

import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import moment from 'moment';
import { useTranslations } from 'next-intl';

export const usePINAuditLogsColumns = () => {
  const translations = useTranslations(
    'components.generate_pin_modal.audit_logs.table',
  );
  return [
    {
      accessorKey: 'actiontype',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.label.action_type')}
        />
      ),
      cell: ({ row }) => {
        const { actiontype } = row.original;

        if (actiontype === 'RESET_PIN') {
          return <div>{translations('data.action_reset_pin')}</div>;
        }
        if (actiontype === 'CREATE_PIN') {
          return <div>{translations('data.action_create_pin')}</div>;
        }
        if (actiontype === 'UPDATE_PIN') {
          return <div>{translations('data.action_update_pin')}</div>;
        }
        return <div>-</div>;
      },
    },
    {
      accessorKey: 'createdat',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translations('header.label.update_on')}
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
          title={translations('header.label.ip_address')}
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
        <DataTableColumnHeader
          column={column}
          title={translations('header.label.status')}
        />
      ),
      cell: ({ row }) => {
        const { status } = row.original;
        if (status === 'SUCCESS') {
          return (
            <div className="w-fit rounded-sm border border-green-600 bg-green-100 px-2 py-1 text-green-600">
              {translations('data.status_success')}
            </div>
          );
        }
        if (status === 'FAILED') {
          return (
            <div className="w-fit rounded-sm border border-red-600 bg-red-100 p-1 text-red-600">
              {translations('data.status_success')}
            </div>
          );
        }
        return <div>{'-'}</div>;
      },
    },
  ];
};
