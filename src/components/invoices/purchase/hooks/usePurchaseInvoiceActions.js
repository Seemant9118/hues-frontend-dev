import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { isGstApplicable } from '@/appUtils/helperFunctions';
import { filterSubmitPayload } from '@/components/orders/utils/orderPayloadHelper';
import { SessionStorageService } from '@/lib/utils';
import { previewDirectPurchaseInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { createPurchaseInvoice } from '@/services/Orders_Services/Orders_Services';

export function usePurchaseInvoiceActions({
  order,
  fields,
  isGstApplicableForSelectedVendor,
  isOrder,
  translations,
  setUrl,
  setIsInvoicePreview,
}) {
  const router = useRouter();
  const [isPINError, setIsPINError] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  const validation = useCallback(
    ({ order: orderData }) => {
      const errorObj = {};

      if (
        orderData?.sellerId == null &&
        orderData?.sellerEnterpriseId == null
      ) {
        errorObj.sellerId = '*Please select vendor';
      }

      if (!orderData.invoiceType) {
        errorObj.invoiceType = translations('form.errorMsg.item_type');
      }

      if (!orderData?.source || String(orderData.source).trim() === '') {
        errorObj.source = '*Please enter Source';
      }

      if (
        (!orderData?.invoiceReferenceNumber ||
          String(orderData.invoiceReferenceNumber).trim() === '') &&
        (!orderData?.refrenceNumber ||
          String(orderData.refrenceNumber).trim() === '')
      ) {
        errorObj.invoiceReferenceNumber = '*Please enter Invoice No.';
      }

      if (!orderData?.invoiceDate) {
        errorObj.invoiceDate = translations('form.errorMsg.invoice_date');
      }

      if (!orderData?.orderItems || orderData.orderItems.length === 0) {
        errorObj.orderItem =
          isOrder === 'invoice'
            ? translations('form.errorMsg.itemInvoice')
            : translations('form.errorMsg.itemOrder');
      }

      if (Number(orderData.roundOffAmount) < 0) {
        errorObj.roundOffAmount = '*Round-off amount cannot be negative';
      }

      // Validate required custom fields
      if (fields) {
        fields.forEach((field) => {
          if (
            [
              'invoiceDate',
              'source',
              'invoiceReferenceNumber',
              'refrenceNumber',
              'sellerId',
              'sellerEnterpriseId',
              'invoiceType',
              'productId',
              'batch',
              'quantity',
              'unitPrice',
              'gstPerUnit',
              'totalAmount',
              'totalGstAmount',
              'expiryDate',
            ].includes(field.key)
          )
            return;

          if (field.kind !== 'CUSTOM') return;

          if (field.required && field.visible) {
            const val =
              orderData[field.key] !== undefined
                ? orderData[field.key]
                : orderData.customFields?.[field.key] !== undefined
                  ? orderData.customFields?.[field.key]
                  : orderData.extraInfo?.[field.key];
            if (val === undefined || val === null || val === '') {
              errorObj[field.key] = `${field.label} is required`;
            }
          }
        });
      }

      return errorObj;
    },
    [fields, isOrder, translations],
  );

  const handleSetTotalAmt = useCallback(() => {
    const totalAmount = (order?.orderItems || []).reduce(
      (totalAmt, orderItem) => totalAmt + (Number(orderItem.totalAmount) || 0),
      0,
    );

    const totalGstAmt = (order?.orderItems || []).reduce(
      (totalGst, orderItem) => {
        return (
          totalGst +
          (isGstApplicable(isGstApplicableForSelectedVendor)
            ? Number(orderItem.totalGstAmount) || 0
            : 0)
        );
      },
      0,
    );

    const totalDiscountAmt = (order?.orderItems || []).reduce(
      (totalDisc, orderItem) =>
        totalDisc + (Number(orderItem.discountAmount) || 0),
      0,
    );

    return { totalAmount, totalGstAmt, totalDiscountAmt };
  }, [order?.orderItems, isGstApplicableForSelectedVendor]);

  const { totalAmount, totalGstAmt, totalDiscountAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;
  const finalTotal =
    order.roundOffType === 'SUBTRACT'
      ? totalAmtWithGst - (Number(order.roundOffAmount) || 0)
      : totalAmtWithGst + (Number(order.roundOffAmount) || 0);

  // create invoice mutation
  const invoiceMutation = useMutation({
    mutationFn: createPurchaseInvoice,
    onSuccess: (res) => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );
      SessionStorageService.remove('purchaseInvoiceDraft');
      router.push(`/dashboard/purchases/purchase-invoices/${res.data.data.id}`);
    },
    onError: (error) => {
      if (
        error.response?.data?.error === 'USER_PIN_NOT_FOUND' ||
        error.response?.data?.error === 'INVALID_PIN'
      ) {
        setIsPINError(true);
      }
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = useCallback(
    (updatedOrder) => {
      const isError = validation({ order: updatedOrder });

      if (Object.keys(isError).length === 0) {
        const mappedItems = (updatedOrder.orderItems || []).map((item) => ({
          ...item,
          productId: item.productId || item.catalogueItemId || item.id,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          gstPerUnit: Number(item.gstPerUnit) || 0,
          totalAmount: Number(item.totalAmount) || 0,
          totalGstAmount: Number(item.totalGstAmount) || 0,
          productType: item.productType || updatedOrder.invoiceType || 'GOODS',
          discountPercentage: Number(item.discountPercentage) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          batchNo: item.batch?.batchNo || null,
          expiryDate: item.expiryDate
            ? moment(item.expiryDate).format('YYYY-MM-DD')
            : null,
          gstPercentage: Number(item.gstPerUnit) || 0,
        }));

        const cleanPayload = filterSubmitPayload(
          {
            ...updatedOrder,
            orderItems: mappedItems,
            invoiceItems: mappedItems,
            buyerId: Number(updatedOrder.buyerId),
            sellerId: updatedOrder.sellerId || updatedOrder.sellerEnterpriseId,
            sellerEnterpriseId:
              updatedOrder.sellerId || updatedOrder.sellerEnterpriseId,
            invoiceReferenceNumber:
              updatedOrder.invoiceReferenceNumber ||
              updatedOrder.refrenceNumber,
            refrenceNumber:
              updatedOrder.invoiceReferenceNumber ||
              updatedOrder.refrenceNumber,
            amount: parseFloat(totalAmount.toFixed(2)),
            roundOffAmount: finalTotal,
            gstAmount: parseFloat(totalGstAmt.toFixed(2)),
            discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
          },
          order._formFields || fields,
        );

        invoiceMutation.mutate(cleanPayload);
        setErrorMsg({});
      } else {
        setErrorMsg(isError);
      }
    },
    [
      validation,
      totalAmount,
      finalTotal,
      totalGstAmt,
      totalDiscountAmt,
      order._formFields,
      fields,
      invoiceMutation,
    ],
  );

  // preview invoice
  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewDirectPurchaseInvoice.endpointKey],
    mutationFn: previewDirectPurchaseInvoice,
    onSuccess: (data) => {
      if (data?.data?.data) {
        const base64StrToRenderPDF = data?.data?.data;
        const newUrl = `data:application/pdf;base64,${base64StrToRenderPDF}`;
        setUrl(newUrl);
        setIsInvoicePreview(true);
      }
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      ),
  });

  const handlePreview = useCallback(
    (updatedOrder) => {
      const isError = validation({ order: updatedOrder });

      if (Object.keys(isError).length === 0) {
        setErrorMsg({});
        const mappedItems = (updatedOrder.orderItems || []).map((item) => ({
          ...item,
          productId: item.productId || item.catalogueItemId || item.id,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          gstPerUnit: Number(item.gstPerUnit) || 0,
          totalAmount: Number(item.totalAmount) || 0,
          totalGstAmount: Number(item.totalGstAmount) || 0,
          productType: item.productType || updatedOrder.invoiceType || 'GOODS',
          discountPercentage: Number(item.discountPercentage) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          batchNo: item.batch?.batchNo || null,
          expiryDate: item.expiryDate
            ? moment(item.expiryDate).format('YYYY-MM-DD')
            : null,
          gstPercentage: Number(item.gstPerUnit) || 0,
        }));

        const cleanPayload = filterSubmitPayload(
          {
            ...updatedOrder,
            orderItems: mappedItems,
            invoiceItems: mappedItems,
            buyerId: Number(updatedOrder.buyerId),
            sellerId: updatedOrder.sellerId || updatedOrder.sellerEnterpriseId,
            sellerEnterpriseId:
              updatedOrder.sellerId || updatedOrder.sellerEnterpriseId,
            invoiceReferenceNumber:
              updatedOrder.invoiceReferenceNumber ||
              updatedOrder.refrenceNumber,
            refrenceNumber:
              updatedOrder.invoiceReferenceNumber ||
              updatedOrder.refrenceNumber,
            amount: parseFloat(totalAmount.toFixed(2)),
            roundOffAmount: finalTotal,
            gstAmount: parseFloat(totalGstAmt.toFixed(2)),
            discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
          },
          order._formFields || fields,
        );

        previewInvMutation.mutate(cleanPayload);
      } else {
        setErrorMsg(isError);
      }
    },
    [
      validation,
      totalAmount,
      finalTotal,
      totalGstAmt,
      totalDiscountAmt,
      order._formFields,
      fields,
      previewInvMutation,
    ],
  );

  return {
    isPINError,
    setIsPINError,
    errorMsg,
    setErrorMsg,
    totalAmount,
    totalGstAmt,
    finalTotal,
    invoiceMutation,
    previewInvMutation,
    handleSubmit,
    handlePreview,
  };
}
