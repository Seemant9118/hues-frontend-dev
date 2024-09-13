import React from 'react';
import { DataTable } from '../table/data-table';
import { paymentColumns } from './paymentColumns';

const PaymentDetails = () => {
  return <DataTable columns={paymentColumns} data={[]}></DataTable>;
};

export default PaymentDetails;
