import { DataTable } from '@/components/table/data-table';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import React from 'react';
import { NotificationColumns } from './NotificationsColumns';

const page = () => {
  const data = [
    {
      notifications: 'New Client Added',
      recievdAt: '08/05/2024',
      type: 'user',
    },
    {
      notifications: 'Order in Negotitaion',
      recievdAt: '08/05/2024',
      type: 'order',
    },
    {
      notifications: 'Inventory shared by enterprise',
      recievdAt: '09/08/2024',
      type: 'inventory',
    },
    {
      notifications: 'Invoice Generated',
      recievdAt: '08/08/2024',
      type: 'invoice',
    },
  ];

  return (
    <>
      <Wrapper>
        <SubHeader
          name={'Notifications'}
          className="flex justify-start"
        ></SubHeader>

        <DataTable
          id={'notification table'}
          columns={NotificationColumns}
          data={data}
        />
      </Wrapper>
    </>
  );
};

export default page;
