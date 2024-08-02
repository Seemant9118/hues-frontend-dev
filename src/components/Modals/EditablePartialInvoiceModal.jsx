import { invoiceApi } from '@/api/invoice/invoiceApi';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  createInvoiceNew,
  previewInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useItemsColumns } from '../columns/useItemsColumns';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';
import PreviewInvoice from './PreviewInvoiceModal';

const EditablePartialInvoiceModal = ({ orderDetails }) => {
  const params = useParams();
  const orderId = params.order_id;
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [invoicedData, setInvoicedData] = useState(); // invoiceData to create invoice
  const [productDetailsList, setProductDetailsList] = useState();
  const [initialQuantities, setInitialQuantities] = useState();
  const [previewInvoiceBase64, setPreviewInvoiceBase64] = useState();

  // Function to get initialQuantities
  const initializeQuantities = () => {
    const initialQtys = orderDetails?.orderItems?.map((item) => item.quantity);
    setInitialQuantities(initialQtys);
  };

  useEffect(initializeQuantities, [open]); // call when modal open or close

  const calculatedInvoiceQuantity = (quantity, invoiceQuantity) => {
    let calculatedQty = quantity - invoiceQuantity;
    if (calculatedQty < 0) {
      calculatedQty = 0;
    }
    return calculatedQty;
  };

  // fn for getting intital value when modal open
  const getInitialProductDetailsList = (orderItems) => {
    return orderItems?.map((item) => ({
      ...item.productDetails,
      productType: item.productType,
      orderItemId: item.id,
      quantity: calculatedInvoiceQuantity(item.quantity, item.invoiceQuantity),
      unitPrice: item.unitPrice,
      gstPerUnit: item.gstPerUnit,
      totalAmount: item.totalAmount,
      totalGstAmount: item.totalGstAmount,
    }));
  };

  useEffect(() => {
    setProductDetailsList(
      getInitialProductDetailsList(orderDetails?.orderItems),
    );
    setInvoicedData({
      orderId: orderDetails?.id,
      gstAmount: orderDetails?.gstAmount,
      amount: orderDetails?.amount,
      orderType: orderDetails?.orderType,
      invoiceType: orderDetails?.invoiceType || 'GOODS',
      invoiceItems: [],
    });
  }, [open]);

  // columns
  const itemColumns = useItemsColumns({
    setInvoicedData,
    invoicedData,
    setProductDetailsList,
    productDetailsList,
    initialQuantities,
  });

  // onClose func
  const onHandleClose = () => {
    setOpen(!open);
    setProductDetailsList([]);
    setInvoicedData({});
  };

  // mutation fn - preview Invoice
  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewInvoice.endpointKey],
    mutationFn: previewInvoice,
    onSuccess: (data) => {
      setPreviewInvoiceBase64(data?.data?.data);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation fn - generate Invoice
  const invoiceMutation = useMutation({
    mutationKey: [invoiceApi.createInvoiceNew.endpointKey],
    mutationFn: createInvoiceNew,
    onSuccess: () => {
      toast.success('Invoice Generated Successfully');
      queryClient.invalidateQueries([
        invoiceApi.getInvoices.endpointKey,
        orderId,
      ]);
      onHandleClose();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // preview fn
  const handlePreview = () => {
    previewInvMutation.mutate(invoicedData);
  };
  // generate fn
  const handleGenerate = () => {
    invoiceMutation.mutate(invoicedData);
  };

  return (
    <Dialog open={open} onOpenChange={onHandleClose}>
      <DialogTrigger asChild>
        <Button variant="blue_outline">
          <FileText size={14} />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] max-w-[55rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>
        <div className="flex flex-col gap-4">
          <DataTable columns={itemColumns} data={productDetailsList} />

          <div className="flex gap-2">
            <PreviewInvoice
              base64StrToRenderPDF={previewInvoiceBase64}
              mutationFn={handlePreview}
              disableCondition={invoicedData?.invoiceItems?.length === 0}
            />
            <Button
              disabled={invoicedData?.invoiceItems?.length === 0}
              className="w-32"
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditablePartialInvoiceModal;
