import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import { LocalStorageService } from '@/lib/utils';
import {
  createPayment,
  getInvoicesForPayments,
  uploadPaymentProofs,
} from '@/services/Payment_Services/PaymentServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Upload, UploadCloud } from 'lucide-react';
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
}) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState({
    orderId: invoiceDetails?.orderId,
    amount: '',
    paymentMode: '',
    transactionId: '',
    attachmentLink: '',
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
      toast.success('Payment Recorded Successfully');
      setErrorMsg({});
      setInvoices([]);
      setPaymentData({
        amount: null,
        paymentMode: null,
        transactionId: null,
        attachmentLink: '', // If it's a FormData object, consider setting it to null
        invoices: [],
      });
      setFiles([]);
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
        error?.response?.data?.message || 'Something went wrong';
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
          amountPaid: 'Amount should not be empty',
        }));
      } else if (!Number.isNaN(numericValue) && numericValue > balanceAmount) {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: 'Amount exceeds balance amount',
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);

    try {
      const resData = await uploadPaymentProofs(enterpriseId, formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      setPaymentData({
        ...paymentData,
        attachmentLink: resData?.data?.data,
      });
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  // hanlde submit fn
  const handleSubmit = () => {
    // Convert amount to a number (if valid) and update invoices
    const filteredInvoices = invoices?.map((invoice) => ({
      ...invoice,
      amount: Number(paymentData?.amount) || 0, // Ensure a valid number
    }));

    // Update paymentData with filtered invoices
    const updatedPaymentData = {
      ...paymentData,
      amount: Number(paymentData?.amount) || 0, // Ensure numeric value
      invoices: filteredInvoices,
    };

    const errorsMsg = {};

    // Validation for payment mode
    if (!updatedPaymentData.paymentMode) {
      errorsMsg.paymentMode = 'Required! Please select payment mode';
    }

    // Validation for amount
    if (!updatedPaymentData.amount) {
      errorsMsg.amountPaid = 'Required! Amount should not be empty';
    }

    setErrorMsg(errorsMsg);

    // If there are no errors, proceed with submission
    if (Object.keys(errorsMsg).length === 0) {
      createPaymentMutationFn.mutate(updatedPaymentData);
    }
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
                    Payment Mode
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
                    <SelectItem value="neft">NEFT</SelectItem>
                    <SelectItem value="rtgs">RTGS</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="creditDebitCard">
                      Credit / Debit Card
                    </SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>

                {errorMsg.paymentMode && (
                  <ErrorBox msg={errorMsg.paymentMode} />
                )}
              </div>
              {/* transaction ID */}
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="text-sm font-semibold">Transaction ID</Label>
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
                  <Label className="text-sm font-semibold">Amount Paid</Label>{' '}
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
                <Label className="text-sm font-semibold">Balance</Label>
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
            <Label className="text-sm font-semibold">Upload Proof</Label>
            {files.map((file) => (
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
                      Upload Successfully!
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
                      Drag & Drop or Select a File (Max 10MB,
                      <span className="font-bold text-[#288AF9]">
                        {' '}
                        .png /.pdf Formats
                      </span>
                      )
                    </p>
                    <p className="text-xs font-normal text-[#288AF9]">
                      Note - Upload Payment Proofs only.
                    </p>
                  </div>
                </div>
                <Button variant="blue_outline">
                  <Upload />
                  Select
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
          Discard
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
          {createPaymentMutationFn.isPending ? <Loading /> : 'Create'}
        </Button>
      </div>
    </Wrapper>
  );
};

export default MakePaymentNewInvoice;
