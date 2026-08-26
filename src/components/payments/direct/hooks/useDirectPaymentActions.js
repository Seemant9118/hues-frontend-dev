import { useMutation } from '@tanstack/react-query';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { paymentApi } from '@/api/payments/payment_api';
import { filterSubmitPayload } from '@/components/orders/utils/orderPayloadHelper';
import { SessionStorageService } from '@/lib/utils';
import { createPayment } from '@/services/Payment_Services/PaymentServices';

function saveDraftToSession({ isPurchasePage, data }) {
  const key = isPurchasePage
    ? 'orderPaymentAdviceDraft'
    : 'orderPaymentRecordDraft';
  SessionStorageService.set(key, data);
}

export function useDirectPaymentActions({
  paymentData,
  setPaymentData,
  fields,
  isPurchasePage,
  contextType,
  draftKey,
  translations,
}) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState({});
  const [files, setFiles] = useState([]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const updatedPaymentData = { ...paymentData };

      if (name === 'amount') {
        if (!/^\d*\.?\d*$/.test(value)) return;

        updatedPaymentData.amount = value;

        // sync amount to invoices
        updatedPaymentData.invoices = (updatedPaymentData.invoices || []).map(
          (inv) => ({
            ...inv,
            amount: Number(value) || 0,
          }),
        );

        const numericValue = parseFloat(value);

        if (value === '') {
          setErrorMsg((prev) => ({
            ...prev,
            amountPaid: translations('errorMsg.amount_paid_empty'),
          }));
        } else if (
          !Number.isNaN(numericValue) &&
          numericValue > paymentData?.balance
        ) {
          setErrorMsg((prev) => ({
            ...prev,
            amountPaid: translations('errorMsg.amount_paid_exceed'),
          }));
        } else {
          setErrorMsg((prev) => ({
            ...prev,
            amountPaid: '',
          }));
        }
      } else {
        updatedPaymentData[name] = value;
      }

      setPaymentData(updatedPaymentData);

      saveDraftToSession({
        isPurchasePage,
        data: updatedPaymentData,
      });
    },
    [paymentData, setPaymentData, isPurchasePage, translations],
  );

  const handleAttached = useCallback((file) => {
    setFiles((prev) => [...prev, file]);
    toast.success('File attached successfully!');
  }, []);

  const handleFileRemove = useCallback((file) => {
    setFiles((prev) => prev.filter((f) => f.name !== file.name));
  }, []);

  const validation = useCallback(
    (updatedPaymentData) => {
      const error = {};

      if (
        !updatedPaymentData?.invoices ||
        updatedPaymentData.invoices.length === 0
      ) {
        error.invoices = translations('errorMsg.invoices');
      }

      if (!updatedPaymentData?.paymentDate) {
        error.paymentDate = translations('errorMsg.payment_date');
      }

      if (
        updatedPaymentData.paymentMode !== 'cash' &&
        (!updatedPaymentData.transactionId ||
          updatedPaymentData.transactionId.trim() === '')
      ) {
        error.transactionId =
          translations('errorMsg.transaction_id') ||
          'Please enter a transaction ID.';
      }

      if (!updatedPaymentData.paymentMode) {
        error.paymentMode =
          translations('errorMsg.payment_mode') ||
          'Please select a payment mode.';
      }

      if (
        !updatedPaymentData.amount ||
        Number(updatedPaymentData.amount) <= 0
      ) {
        error.amountPaid =
          translations('errorMsg.amount_paid_required') ||
          'Amount must be greater than 0.';
      }

      // Validate required custom fields
      if (fields) {
        fields.forEach((field) => {
          if (
            [
              'invoiceId',
              'paymentMode',
              'paymentDate',
              'bankAccountId',
              'transactionId',
              'amount',
              'balance',
            ].includes(field.key)
          )
            return;

          if (field.kind !== 'CUSTOM') return;

          if (field.required && field.visible) {
            const val =
              updatedPaymentData[field.key] !== undefined
                ? updatedPaymentData[field.key]
                : updatedPaymentData.customFields?.[field.key] !== undefined
                  ? updatedPaymentData.customFields?.[field.key]
                  : updatedPaymentData.extraInfo?.[field.key];
            if (val === undefined || val === null || val === '') {
              error[field.key] = `${field.label} is required`;
            }
          }
        });
      }

      return error;
    },
    [fields, translations],
  );

  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: (res) => {
      toast.success(translations('successMsg.payment_recorded_sucessfully'));
      SessionStorageService.remove(draftKey);
      if (!isPurchasePage) {
        router.push(`/dashboard/sales/sales-payments/${res.data.data.id}`);
      } else {
        router.push(
          `/dashboard/purchases/purchase-payments/${res.data.data.id}`,
        );
      }
    },
  });

  const handleSubmit = useCallback(() => {
    const updatedPaymentData = {
      ...paymentData,
      invoices: (paymentData.invoices || []).map((inv) => ({
        invoiceId: inv.invoiceId,
        amount: Number(paymentData.amount) || 0,
      })),
    };

    const errors = validation(updatedPaymentData);

    if (Object.keys(errors).length > 0) {
      setErrorMsg(errors);
      return;
    }

    const cleanPayload = filterSubmitPayload(
      updatedPaymentData,
      paymentData._formFields || fields,
    );

    const formDataToSend = new FormData();

    formDataToSend.append('orderId', cleanPayload.orderId);
    formDataToSend.append('paymentMode', cleanPayload.paymentMode);
    formDataToSend.append('transactionId', cleanPayload.transactionId);
    formDataToSend.append('context', contextType);
    formDataToSend.append('invoices', JSON.stringify(cleanPayload.invoices));
    formDataToSend.append('amount', cleanPayload.amount);
    formDataToSend.append('bankAccountId', cleanPayload.bankAccountId);

    const formattedPaymentDate = moment(cleanPayload.paymentDate).format(
      'DD/MM/YYYY',
    );
    formDataToSend.append('paymentDate', formattedPaymentDate);

    if (cleanPayload.extraInfo) {
      formDataToSend.append(
        'extraInfo',
        JSON.stringify(cleanPayload.extraInfo),
      );
    }
    if (cleanPayload.customFields) {
      formDataToSend.append(
        'customFields',
        JSON.stringify(cleanPayload.customFields),
      );
    }

    files.forEach((file) => {
      formDataToSend.append('files', file);
    });

    createPaymentMutationFn.mutate(formDataToSend);
  }, [
    paymentData,
    validation,
    fields,
    contextType,
    files,
    createPaymentMutationFn,
  ]);

  return {
    errorMsg,
    setErrorMsg,
    files,
    handleInputChange,
    handleAttached,
    handleFileRemove,
    createPaymentMutationFn,
    handleSubmit,
  };
}
