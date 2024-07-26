import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { invoiceColumns } from '../columns/invoiceColumns';
import { DataTable } from '../table/data-table';

const PartialInvoiceViewModal = () => {
  const data = [
    {
      invoiceId: 1,
      date: '7/28/2024',
      totalAmt: 999,
    },
    {
      invoiceId: 2,
      date: '02/5/2024',
      totalAmt: 699,
    },
  ];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="blue_outline">
          <Eye size={14} />
          View Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[60rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>

        <DataTable columns={invoiceColumns} data={data} />
      </DialogContent>
    </Dialog>
  );
};

export default PartialInvoiceViewModal;
