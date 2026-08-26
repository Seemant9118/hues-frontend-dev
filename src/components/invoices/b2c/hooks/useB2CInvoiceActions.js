import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { isGstApplicable } from '@/appUtils/helperFunctions';
import { filterSubmitPayload } from '@/components/orders/utils/orderPayloadHelper';
import { SessionStorageService } from '@/lib/utils';
import { createInvoice } from '@/services/Orders_Services/Orders_Services';

export function useB2CInvoiceActions({
  order,
  fields,
  isGstApplicableForSalesOrders,
  translations,
}) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState({});

  const validation = useCallback(
    ({ order: orderData }) => {
      const errorObj = {};

      if (!orderData?.invoiceDate) {
        errorObj.invoiceDate = translations('form.errorMsg.invoice_date');
      }

      if (!orderData?.buyerId) {
        errorObj.buyerId = translations('form.errorMsg.customer');
      }
      if (!orderData?.buyerName || orderData.buyerName.trim() === '') {
        errorObj.buyerName = translations('form.errorMsg.customer_name');
      }
      if (
        orderData?.addressType === 'deliveryPurchase' &&
        (!orderData?.buyerAddress || orderData.buyerAddress.trim() === '')
      ) {
        errorObj.buyerAddress = translations('form.errorMsg.customer_address');
      }
      if (!orderData?.addressType) {
        errorObj.addressType = translations('form.errorMsg.address_type');
      }

      if (orderData.invoiceType === '') {
        errorObj.invoiceType = translations('form.errorMsg.item_type');
      }

      if (!orderData?.orderItems || orderData.orderItems.length === 0) {
        errorObj.orderItem = translations('form.errorMsg.itemInvoice');
      }

      // Validate required custom fields
      if (fields) {
        fields.forEach((field) => {
          if (
            [
              'invoiceDate',
              'buyerId',
              'buyerName',
              'addressType',
              'buyerAddress',
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
    [fields, translations],
  );

  const handleSetTotalAmt = useCallback(() => {
    const totalAmount = (order?.orderItems || []).reduce(
      (totalAmt, orderItem) => {
        return totalAmt + (Number(orderItem.totalAmount) || 0);
      },
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

    return { totalAmount, totalGstAmt };
  }, [order?.orderItems, isGstApplicableForSalesOrders]);

  const { totalAmount, totalGstAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;

  const invoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (res) => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );
      SessionStorageService.remove('b2CInvoiceDraft');
      router.push(`/dashboard/sales/sales-invoices/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = useCallback(
    (updateOrder) => {
      const { totalAmount: currentTotalAmt, totalGstAmt: currentTotalGst } =
        handleSetTotalAmt();
      const isError = validation({ order: updateOrder });

      if (Object.keys(isError).length === 0) {
        const mappedOrderItems = (updateOrder.orderItems || []).map((item) => ({
          ...item,
          batchNo: item.batch?.batchNo || null,
          expiryDate: item.expiryDate
            ? moment(item.expiryDate).format('YYYY-MM-DD')
            : null,
          gstPercentage: Number(item.gstPerUnit) || 0,
        }));

        const cleanPayload = filterSubmitPayload(
          {
            ...updateOrder,
            orderItems: mappedOrderItems,
            invoiceItems: mappedOrderItems,
            buyerId: Number(updateOrder.buyerId),
            amount: parseFloat(currentTotalAmt.toFixed(2)),
            gstAmount: parseFloat(currentTotalGst.toFixed(2)),
          },
          order._formFields || fields,
        );

        invoiceMutation.mutate(cleanPayload);
      } else {
        setErrorMsg(isError);
      }
    },
    [handleSetTotalAmt, validation, order._formFields, fields, invoiceMutation],
  );

  return {
    errorMsg,
    setErrorMsg,
    totalAmount,
    totalGstAmt,
    totalAmtWithGst,
    invoiceMutation,
    handleSubmit,
  };
}
