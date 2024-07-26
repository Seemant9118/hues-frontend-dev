import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import React, { useState } from 'react';
import { useItemsColumns } from '../columns/useItemsColumns';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';

const EditablePartialInvoiceModal = ({ orderItems }) => {
  const [partialInvoiceData, setPartialInvoiceData] = useState([]);

  // Extract productDetails from each item
  const initialProductDetailsList = orderItems.map(
    (item) => item.productDetails,
  );
  const [productDetailsList] = useState(initialProductDetailsList);

  const itemColumns = useItemsColumns({
    setPartialInvoiceData,
    partialInvoiceData,
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="blue_outline">
          <FileText size={14} />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[40rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>
        <div className="flex flex-col items-end gap-4">
          <DataTable columns={itemColumns} data={productDetailsList} />

          <Button disabled={partialInvoiceData.length === 0} className="w-1/4">
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditablePartialInvoiceModal;
