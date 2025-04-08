import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import {
  createPayment,
  getInvoicesForPayments,
} from '@/services/Payment_Services/PaymentServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Upload, UploadCloud } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import InvoiceOverview from '../invoices/InvoiceOverview';
import { Button } from '../ui/button';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Wrapper from '../wrappers/Wrapper';

const MakePaymentNewInvoice = ({
  invoiceDetails,
  setIsRecordingPayment,
  paymentStatus,
  debitNoteStatus,
  contextType,
}) => {
  const translations = useTranslations('components.record_payment_order');
  const queryClient = useQueryClient();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState({
    orderId: invoiceDetails?.orderId,
    amount: '',
    paymentMode: '',
    transactionId: '',
    invoices: [],
  });

  // api call for invoices
  const { data: invoicesForPayments } = useQuery({
    queryKey: [
      paymentApi.getInvoicesForPayments.endpointKey,
      invoiceDetails?.orderId,
    ],
    queryFn: () =>
      getInvoicesForPayments(
        invoiceDetails?.orderId,
        invoiceDetails?.invoiceId,
      ),
    select: (invoicesForPayments) => invoicesForPayments.data.data,
    enabled: !!invoiceDetails?.orderId,
  });

  // Update the invoices state once invoicesForPayments data is fetched
  useEffect(() => {
    const updatedInvoices = invoicesForPayments?.data?.map((invoice) => ({
      ...invoice,
      invoiceId: invoice.invoicereceivableinvoiceid,
      amount: 0, // Adding amountPaid to each invoice
    }));
    setInvoices(updatedInvoices);
  }, [invoicesForPayments]);

  // mutation for create payment
  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success(translations('successMsg.payment_recorded_sucessfully'));
      setErrorMsg({});
      setInvoices([]);
      setPaymentData({
        amount: null,
        paymentMode: null,
        transactionId: null,
        invoices: [],
      });
      // setFiles([]);
      queryClient.invalidateQueries([
        paymentApi.getPaymentsList.endpointKey,
        invoiceDetails?.orderId,
      ]);
      queryClient.invalidateQueries([
        invoiceApi.getInvoice.endpointKey,
        invoiceDetails?.orderId,
      ]);
      setIsRecordingPayment(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || translations('errorMsg.common');
      toast.error(errorMessage);
    },
  });

  // handleInputChange fn
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const balanceAmount = parseFloat(
      invoicesForPayments?.invoicedTotalDueAmount,
    );

    if (name === 'amount') {
      // Allow only numbers & decimals, treating "0" as valid text input
      if (/^\d*\.?\d*$/.test(value)) {
        setPaymentData((prevData) => ({
          ...prevData,
          [name]: value, // Store as string to preserve input format
        }));
      }
    } else {
      setPaymentData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    if (name === 'amount') {
      const numericValue = parseFloat(value); // Convert to number for validation

      if (value === '') {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: translations('errorMsg.amount_paid_empty'),
        }));
      } else if (!Number.isNaN(numericValue) && numericValue > balanceAmount) {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: translations('errorMsg.amount_paid_exceed'),
        }));
      } else {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: '',
        }));
      }
    }
  };

  // handle upload proofs fn
  const handleUploadChange = async (file) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    toast.success('File attached successfully!');
  };

  // hanlde submit fn
  const handleSubmit = () => {
    const amount = Number(paymentData?.amount) || 0;

    // Filter and map invoices: only include those where amount > 0
    const refactoredInvoices =
      invoices
        ?.filter(() => amount > 0) // filter globally based on the entered amount
        .map(({ invoiceId }) => ({
          invoiceId,
          amount,
        })) || [];

    const updatedPaymentData = {
      ...paymentData,
      amount,
      invoices: refactoredInvoices,
    };

    // Validate fields
    const errors = {};
    if (!updatedPaymentData.paymentMode) {
      errors.paymentMode = translations('errorMsg.payment_mode');
    }
    if (!amount) {
      errors.amountPaid = translations('errorMsg.amount_paid_required');
    }

    setErrorMsg(errors);
    if (Object.keys(errors).length > 0) return;

    // Build FormData
    const formData = new FormData();
    // handle files if any
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    formData.append('orderId', updatedPaymentData.orderId);
    formData.append('paymentMode', updatedPaymentData.paymentMode);
    formData.append('transactionId', updatedPaymentData.transactionId);
    formData.append('context', contextType);
    formData.append('invoices', JSON.stringify(updatedPaymentData.invoices));
    formData.append('amount', amount);

    createPaymentMutationFn.mutate(formData);
  };

  return (
    <Wrapper className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-2">
        {/* Collapsable overview */}
        <InvoiceOverview
          isCollapsableOverview={true}
          invoiceDetails={invoiceDetails}
          invoiceId={invoiceDetails?.invoiceReferenceNumber}
          orderId={invoiceDetails?.orderId}
          orderRefId={invoiceDetails?.orderReferenceNumber}
          paymentStatus={paymentStatus}
          debitNoteStatus={debitNoteStatus}
          Name={`${invoiceDetails?.customerName} (${invoiceDetails?.clientType})`}
          type={invoiceDetails?.invoiceType}
          date={invoiceDetails?.createdAt}
          amount={invoiceDetails?.totalAmount}
          amountPaid={invoiceDetails?.amountPaid}
        />
        <div className="flex flex-col gap-4">
          {/* inputs */}
          <section className="flex flex-col gap-4 rounded-md border p-4">
            <div className="flex items-center">
              {/* select payment mode */}
              <div className="flex w-1/2 flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('form.label.payment_mode')}
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>

                <Select
                  defaultValue={paymentData.paymentMode}
                  onValueChange={(value) => {
                    // Check if a payment mode is selected (non-empty value)
                    if (value) {
                      setErrorMsg((prevMsg) => ({
                        ...prevMsg,
                        paymentMode: '', // Clear the payment mode error message
                      }));
                    }
                    setPaymentData((prevData) => ({
                      ...prevData,
                      paymentMode: value,
                    }));
                  }}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neft">
                      {translations('form.label.options.neft')}
                    </SelectItem>
                    <SelectItem value="rtgs">
                      {translations('form.label.options.rtgs')}
                    </SelectItem>
                    <SelectItem value="upi">
                      {translations('form.label.options.upi')}
                    </SelectItem>
                    <SelectItem value="creditDebitCard">
                      {translations('form.label.options.credit_debit')}
                    </SelectItem>
                    <SelectItem value="cheque">
                      {translations('form.label.options.cheque')}
                    </SelectItem>
                    <SelectItem value="cash">
                      {translations('form.label.options.cash')}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {errorMsg.paymentMode && (
                  <ErrorBox msg={errorMsg.paymentMode} />
                )}
              </div>
              {/* transaction ID */}
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.tran_id')}
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    name="transactionId"
                    className="max-w-md"
                    value={paymentData.transactionId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              {/* Amount */}
              <div className="flex w-1/2 flex-col gap-2">
                <div>
                  <Label className="text-sm font-semibold">
                    {translations('form.label.amount_paid')}
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    name="amount"
                    className="max-w-md"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                {errorMsg.amountPaid && <ErrorBox msg={errorMsg.amountPaid} />}
              </div>

              {/* Balance */}
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.balance')}
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    className="max-w-md"
                    value={formattedAmount(
                      invoicesForPayments?.invoicedTotalDueAmount,
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* uploads payments proofs */}
          <div className="flex flex-col gap-4">
            <Label className="text-sm font-semibold">
              {translations('form.upload_proof.title')}
            </Label>
            {files?.map((file) => (
              <div
                key={file.name}
                className="flex min-w-[700px] items-center justify-between gap-4 rounded-sm border border-neutral-300 p-4"
              >
                <div className="flex items-center gap-4">
                  <p className="text-xs font-medium leading-[18px]">
                    {file.name}
                  </p>
                  <div className="h-1 w-1 rounded-full bg-neutral-400"></div>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                      <Check size={10} />
                    </div>
                    <p className="text-xs font-medium leading-5 text-green-500">
                      {translations('successMsg.upload_success')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <FileUploader
              handleChange={handleUploadChange}
              name="file"
              types={['png', 'pdf']}
            >
              <div className="mb-2 flex min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-[#288AF9] px-5 py-10">
                <div className="flex items-center gap-4">
                  <UploadCloud className="text-[#288AF9]" size={40} />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-darkText">
                      {translations('form.upload_proof.para')}
                    </p>
                    <p className="text-xs font-normal text-[#288AF9]">
                      {translations('form.upload_proof.note')}
                    </p>
                  </div>
                </div>
                <Button variant="blue_outline">
                  <Upload />
                  {translations('form.upload_proof.ctas.select')}
                </Button>
              </div>
            </FileUploader>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full justify-end gap-2 border-t-2 bg-white p-2">
        <Button
          variant="outline"
          className="w-32"
          size="sm"
          onClick={() => {
            // state clear
            setIsRecordingPayment(false);
            setInvoices([]);
            setErrorMsg({});
            setPaymentData({
              amount: '',
              paymentMode: '',
              transactionId: '',
              attachmentLink: '', // If it's a FormData object, consider setting it to null
              invoices: [],
            });
            router.back();
          }}
        >
          {translations('form.ctas.discard')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            Object.values(errorMsg).some((msg) => msg !== '') ||
            createPaymentMutationFn.isPending
          }
          size="sm"
          className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
        >
          {createPaymentMutationFn.isPending ? (
            <Loading />
          ) : (
            translations('form.ctas.create')
          )}
        </Button>
      </div>
    </Wrapper>
  );
};

export default MakePaymentNewInvoice;
