import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { isGstApplicable } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import {
  createInvoiceForAcceptedOrder,
  previewDirectInvoice,
  previewInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import { createInvoice } from '@/services/Orders_Services/Orders_Services';
import { filterSubmitPayload } from '@/components/orders/utils/orderPayloadHelper';

export function useB2BInvoiceActions({
  order,
  fields,
  isGstApplicableForSalesOrders,
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

      if (!orderData?.invoiceDate) {
        errorObj.invoiceDate = translations('form.errorMsg.invoice_date');
      }

      if (!orderData?.source) {
        errorObj.source = translations('form.errorMsg.source');
      }

      if (
        orderData?.source !== 'hues' &&
        (!orderData?.invoiceReferenceNumber ||
          orderData.invoiceReferenceNumber.trim() === '')
      ) {
        errorObj.invoiceReferenceNumber = translations(
          'form.errorMsg.reference_number',
        );
      }

      if (orderData?.buyerId == null) {
        errorObj.buyerId = translations('form.errorMsg.client');
      }

      if (orderData?.invoiceType === '') {
        errorObj.invoiceType = translations('form.errorMsg.item_type');
      }

      if (!orderData?.orderItems || orderData.orderItems.length === 0) {
        errorObj.orderItem =
          isOrder === 'invoice'
            ? translations('form.errorMsg.itemInvoice')
            : translations('form.errorMsg.itemOrder');
      }

      // Validate required custom fields
      if (fields) {
        fields.forEach((field) => {
          if (
            [
              'invoiceDate',
              'source',
              'invoiceReferenceNumber',
              'buyerId',
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
          (isGstApplicable(isGstApplicableForSalesOrders)
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
  }, [order?.orderItems, isGstApplicableForSalesOrders]);

  const { totalAmount, totalGstAmt, totalDiscountAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;
  const roundedTotal = Math.round(totalAmtWithGst);
  const roundOff = (roundedTotal - totalAmtWithGst).toFixed(2);

  const getMappedPayloadRows = useCallback((updatedOrder) => {
    return (updatedOrder.orderItems || []).map((item) => ({
      orderItemId: item.orderItemId || item.id,
      productName: item.productName || item.serviceName,
      productType: item.productType || updatedOrder.invoiceType || 'GOODS',
      hsnCode: item.hsnCode || null,
      sac: item.sac || 0,
      serviceName: item.serviceName || '',
      productId: item.productId || item.id,
      quantity: Number(item.quantity) || 0,
      unitId: item.unitId || null,
      unitPrice: Number(item.unitPrice) || 0,
      gstPerUnit: Number(item.gstPerUnit) || 0,
      totalAmount: Number(item.totalAmount) || 0,
      totalGstAmount: Number(item.totalGstAmount) || 0,
      discountPercentage: Number(item.discountPercentage) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      batch: item.batch || null,
      batches: item.batches || [],
      batchNo: item.batch?.batchNo || null,
      expiryDate: item.expiryDate
        ? moment(item.expiryDate).format('YYYY-MM-DD')
        : null,
      gstPercentage: Number(item.gstPerUnit) || 0,
    }));
  }, []);

  // Invoice Mutation
  const invoiceMutation = useMutation({
    mutationFn: (data) => {
      if (data.orderId) {
        return createInvoiceForAcceptedOrder(data);
      }
      return createInvoice(data);
    },
    onSuccess: (res) => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );
      SessionStorageService.remove('b2bInvoiceDraft');
      router.push(`/dashboard/sales/sales-invoices/${res.data.data.id}`);
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
        const mappedRows = getMappedPayloadRows(updatedOrder);

        const cleanPayload = filterSubmitPayload(
          {
            ...updatedOrder,
            orderItems: mappedRows,
            invoiceItems: mappedRows,
            buyerId: Number(updatedOrder.buyerId),
            amount: parseFloat(totalAmount.toFixed(2)),
            roundOffAmount: roundedTotal,
            gstAmount: parseFloat(totalGstAmt.toFixed(2)),
            discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
          },
          order._formFields || fields,
        );

        const rootKeysToSync = [
          'rcmClassification',
          'dueDate',
          'paymentTerms',
          'selectedOrder',
          'selectedValue',
          'getAddressRelatedData',
          'selectedGstNumber',
          'buyerType',
        ];
        rootKeysToSync.forEach((key) => {
          const val =
            updatedOrder[key] !== undefined
              ? updatedOrder[key]
              : cleanPayload.extraInfo?.[key];
          if (val !== undefined && val !== null) {
            cleanPayload[key] = val;
          }
        });

        invoiceMutation.mutate(cleanPayload);
      } else {
        setErrorMsg(isError);
      }
    },
    [
      validation,
      getMappedPayloadRows,
      totalAmount,
      roundedTotal,
      totalGstAmt,
      totalDiscountAmt,
      order._formFields,
      fields,
      invoiceMutation,
    ],
  );

  // Preview Invoice Mutation
  const previewInvMutation = useMutation({
    mutationKey: ['mixed_previewInvoice'],
    mutationFn: (data) => {
      if (data.orderId) {
        return previewInvoice(data);
      }
      return previewDirectInvoice(data);
    },
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
        const mappedRows = getMappedPayloadRows(updatedOrder);
        setErrorMsg({});
        const cleanPayload = filterSubmitPayload(
          {
            ...updatedOrder,
            orderItems: mappedRows,
            invoiceItems: mappedRows,
            buyerId: Number(updatedOrder.buyerId),
            amount: parseFloat(totalAmount.toFixed(2)),
            roundOffAmount: roundedTotal,
            gstAmount: parseFloat(totalGstAmt.toFixed(2)),
            discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
          },
          order._formFields || fields,
        );

        const rootKeysToSync = [
          'rcmClassification',
          'dueDate',
          'paymentTerms',
          'selectedOrder',
          'selectedValue',
          'getAddressRelatedData',
          'selectedGstNumber',
          'buyerType',
        ];
        rootKeysToSync.forEach((key) => {
          const val =
            updatedOrder[key] !== undefined
              ? updatedOrder[key]
              : cleanPayload.extraInfo?.[key];
          if (val !== undefined && val !== null) {
            cleanPayload[key] = val;
          }
        });

        previewInvMutation.mutate(cleanPayload);
      } else {
        setErrorMsg(isError);
      }
    },
    [
      validation,
      getMappedPayloadRows,
      totalAmount,
      roundedTotal,
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
    roundedTotal,
    roundOff,
    invoiceMutation,
    previewInvMutation,
    handleSubmit,
    handlePreview,
  };
}
