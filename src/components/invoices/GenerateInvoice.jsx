/* eslint-disable consistent-return */
import { invoiceApi } from '@/api/invoice/invoiceApi';
import {
  invoiceGenerateOTP,
  previewInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useItemsColumns } from '../columns/useItemsColumns';
import { DataTable } from '../table/data-table';
import Loading from '../ui/Loading';
import Wrapper from '../wrappers/Wrapper';

// dynamic imports
const GenerateInvoiceModal = dynamic(
  () => import('@/components/Modals/GenerateInvoiceModal'),
  {
    loading: () => <Loading />,
  },
);
const PreviewInvoice = dynamic(
  () => import('@/components/Modals/PreviewInvoiceModal'),
  {
    loading: () => <Loading />,
  },
);
const GenerateInvoice = ({ orderDetails, setIsGenerateInvoice }) => {
  const isAutoSelect = orderDetails?.negotiationStatus === 'NEW';

  const [invoicedData, setInvoicedData] = useState({
    otpCode: null,
    orderId: orderDetails?.id,
    gstAmount: orderDetails?.gstAmount,
    amount: orderDetails?.amount,
    orderType: orderDetails?.orderType,
    invoiceType: orderDetails?.invoiceType || 'GOODS',
    invoiceItems: [],
  });

  const [productDetailsList, setProductDetailsList] = useState([]);
  const [initialQuantities, setInitialQuantities] = useState([]);
  const [previewInvoiceBase64, setPreviewInvoiceBase64] = useState('');

  const calculatedInvoiceQuantity = (quantity, invoiceQuantity) => {
    const calculatedQty = quantity - invoiceQuantity;
    return Math.max(calculatedQty, 0);
  };

  useEffect(() => {
    if (orderDetails?.orderItems) {
      const initialQtys = orderDetails.orderItems.map((item) => item.quantity);
      setInitialQuantities(initialQtys);

      const getInitialProductDetailsList = orderDetails.orderItems.map(
        (item) => ({
          ...item.productDetails,
          productType: item.productType,
          orderItemId: item.id,
          quantity: calculatedInvoiceQuantity(
            item.quantity,
            item.invoiceQuantity,
          ),
          unitPrice: item.unitPrice,
          gstPerUnit: item.gstPerUnit,
          totalAmount: item.totalAmount,
          totalGstAmount: item.totalGstAmount,
        }),
      );

      setProductDetailsList(getInitialProductDetailsList);
      setInvoicedData((prev) => ({
        ...prev,
        invoiceItems: [],
      }));
    }
  }, [orderDetails]);

  const itemColumns = useItemsColumns({
    isAutoSelect,
    setInvoicedData,
    invoicedData,
    setProductDetailsList,
    productDetailsList,
    initialQuantities,
  });

  const onHandleClose = () => {
    setProductDetailsList([]);
    setInvoicedData({
      ...invoicedData,
      invoiceItems: [],
    });
  };

  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewInvoice.endpointKey],
    mutationFn: previewInvoice,
    onSuccess: (data) => setPreviewInvoiceBase64(data?.data?.data),
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const generateOTPMutation = useMutation({
    mutationKey: [invoiceApi.generateOTPInvoice.endpointKey],
    mutationFn: invoiceGenerateOTP,
    onSuccess: () => toast.success('OTP sent'),
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });
  const handlePreview = () => previewInvMutation.mutate(invoicedData);

  const handleGenerateOTP = () => generateOTPMutation.mutate();

  return (
    <Wrapper className="relative">
      <section className="flex h-full flex-col justify-between">
        <DataTable columns={itemColumns} data={productDetailsList} />

        <div className="flex justify-end gap-4 border-t pt-4">
          <div className="mt-auto h-[1px] bg-neutral-300"></div>
          {/* previewInvoice */}
          {!isAutoSelect && (
            <PreviewInvoice
              base64StrToRenderPDF={previewInvoiceBase64}
              mutationFn={handlePreview}
              disableCondition={invoicedData?.invoiceItems?.length === 0}
            />
          )}

          {/* generateInvoice */}
          <GenerateInvoiceModal
            orderDetails={orderDetails}
            invoicedData={invoicedData}
            setInvoicedData={setInvoicedData}
            generateOTP={handleGenerateOTP}
            disableCondition={
              isAutoSelect ? false : invoicedData?.invoiceItems?.length === 0
            }
            setIsGenerateInvoice={setIsGenerateInvoice}
            handleClose={onHandleClose}
          />
        </div>
      </section>
    </Wrapper>
  );
};

export default GenerateInvoice;
