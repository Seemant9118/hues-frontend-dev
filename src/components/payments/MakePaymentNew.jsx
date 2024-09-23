import { orderApi } from '@/api/order_api/order_api';
import { paymentApi } from '@/api/payments/payment_api';
import { LocalStorageService } from '@/lib/utils';
import {
  createPayment,
  getInvoicesForPayments,
  uploadPaymentProofs,
} from '@/services/Payment_Services/PaymentServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, RotateCcw, Upload, UploadCloud } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const MakePaymentNew = ({ orderId, orderDetails, setIsRecordingPayment }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [files, setFiles] = useState([]);

  const { data: invoicesForPayments, isLoading } = useQuery({
    queryKey: [paymentApi.getInvoicesForPayments.endpointKey, orderId],
    queryFn: () => getInvoicesForPayments(orderId),
    enabled: !!orderId,
    select: (invoicesForPayments) => invoicesForPayments.data.data,
  });

  const [isAutoSplitted, setIsAutoSplitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  // Set initial state for invoices
  const [invoices, setInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: '',
    transactionId: '',
    attachmentLink: '',
    invoices,
  });

  // Update the invoices state once invoicesForPayments data is fetched
  useEffect(() => {
    if (invoicesForPayments) {
      const updatedInvoices = invoicesForPayments.map((invoice) => ({
        ...invoice,
        invoiceId: invoice.invoicereceivableinvoiceid,
        amount: 0, // Adding amountPaid to each invoice
      }));
      setInvoices(updatedInvoices);
    }
  }, [invoicesForPayments]);

  const splitFn = (totalAmount) => {
    let remainingAmount = totalAmount;

    const updatedInvoices = invoices.map((invoice) => {
      const balanceAmount = invoice.invoicereceivabledueamount;

      if (remainingAmount > balanceAmount) {
        // Pay full balance amount for this invoice
        remainingAmount -= balanceAmount;
        return {
          ...invoice,
          amount: balanceAmount,
        };
      } else {
        // Pay remaining amount to this invoice
        const amountToPay = remainingAmount;
        remainingAmount = 0;
        return {
          ...invoice,
          amount: amountToPay,
        };
      }
    });

    setInvoices(updatedInvoices);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const balanceAmount = parseFloat(
      orderDetails.amount + orderDetails.gstAmount - orderDetails.amountPaid,
    );

    setPaymentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'amount') {
      if (value > balanceAmount) {
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

  const handleAmountPaidChange = (e, invoiceId) => {
    const { value } = e.target;
    const newAmountPaid = parseFloat(value) || '0';

    // Update the specific invoice's amountPaid
    const updatedInvoices = invoices.map((invoice) =>
      invoice.invoiceId === invoiceId
        ? { ...invoice, amount: newAmountPaid }
        : invoice,
    );

    // Calculate total amount paid across all invoices
    const totalAmountPaid = updatedInvoices.reduce(
      (total, inv) => total + inv.amount,
      0,
    );

    // Update the invoices state with the new amounts
    setInvoices(updatedInvoices);

    // Check for errors and update error messages accordingly
    if (totalAmountPaid > paymentData.amount) {
      // If total amount paid exceeds the paymentData.amount
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        invoiceAmountPaid: 'Amount exceeds the total payment amount',
      }));
    } else if (totalAmountPaid < paymentData.amount) {
      // If total amount paid is less than the paymentData.amount
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        invoiceAmountPaid: 'Amount is less than the total payment amount',
      }));
    } else {
      // Clear error message if no issues
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        invoiceAmountPaid: '',
      }));
    }

    // Update paymentData with the new invoices
    setPaymentData((prevData) => ({
      ...prevData,
      invoices: updatedInvoices,
    }));
  };

  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Payment Recorded Successfully');
      setInvoices([]);
      setErrorMsg({});
      setPaymentData({
        amount: '',
        paymentMode: '',
        transactionId: '',
        attachmentLink: '', // If it's a FormData object, consider setting it to null
        invoices: [],
      });
      setFiles([]);
      queryClient.invalidateQueries([paymentApi.getPaymentsList.endpointKey]);
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setIsRecordingPayment(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    },
  });

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

  const handleSubmit = () => {
    // Filter invoices where amountPaid > 0
    const filteredInvoices = invoices.filter((invoice) => invoice.amount > 0);
    // Update paymentData with filtered invoices
    const updatedPaymentData = {
      ...paymentData,
      invoices: filteredInvoices,
    };
    // console.log(updatedPaymentData);

    createPaymentMutationFn.mutate(updatedPaymentData);
  };

  return (
    <>
      <div className="scrollBarStyles flex flex-col gap-4 overflow-y-auto">
        {/* inputs */}
        <section className="flex flex-col gap-4 rounded-md border p-4">
          <div className="flex items-center">
            {/* select payment mode */}
            <div className="flex w-1/2 flex-col gap-2">
              <div>
                <Label className="flex-shrink-0">Payment Mode</Label>{' '}
                <span className="text-red-600">*</span>
              </div>

              <Select
                defaultValue={paymentData.paymentMode}
                onValueChange={(value) =>
                  setPaymentData((prevData) => ({
                    ...prevData,
                    paymentMode: value,
                  }))
                }
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
            </div>
            {/* transaction ID */}
            <div className="flex w-1/2 flex-col gap-2">
              <Label>Transaction ID</Label>
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
                <Label className="flex-shrink-0">Amount Paid</Label>{' '}
                <span className="text-red-600">*</span>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  name="amount"
                  className="max-w-md"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                />
                {paymentData.amount && (
                  <span
                    onClick={() => {
                      if (isAutoSplitted) {
                        setIsAutoSplitted(false);
                        // Reset the amountPaid for each invoice to 0
                        const resetInvoices = invoices.map((invoice) => ({
                          ...invoice,
                          amount: 0, // Reset amount to 0
                        }));

                        setInvoices(resetInvoices); // Update invoices with the reset values

                        setPaymentData((prevData) => ({
                          ...prevData,
                          amount: '',
                          paymentMode: '',
                          transactionId: '',
                          attachmentLink: '',
                          invoices: resetInvoices, // Use the reset invoices
                        }));
                        setErrorMsg({});
                      } else {
                        splitFn(paymentData.amount); // Call splitFn to distribute amount across invoices
                        setIsAutoSplitted(true);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-bold text-[#288AF9] hover:underline"
                  >
                    <RotateCcw size={12} />
                    {isAutoSplitted ? 'Revert' : 'Auto-split'}
                  </span>
                )}
              </div>
              {errorMsg.amountPaid && <ErrorBox msg={errorMsg.amountPaid} />}
            </div>

            {/* Balance */}
            <div className="flex w-1/2 flex-col gap-2">
              <Label>Balance</Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  className="max-w-md"
                  value={
                    orderDetails.amount +
                    orderDetails.gstAmount -
                    orderDetails.amountPaid
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* Invoice table  */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold">Invoices</h2>
          {isAutoSplitted && (
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-[#A5ABBD]">
                Amount is auto-splitted, but you can customize it manually if
                needed
              </span>

              {errorMsg.invoiceAmountPaid && (
                <ErrorBox msg={errorMsg.invoiceAmountPaid} />
              )}
            </div>
          )}
          {/* Invoice Selection Table */}
          {isLoading ? (
            <Loading />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    colSpan={3}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    INVOICE NO
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    DATE
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    QUANTITY
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    BALANCE AMOUNT
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    AMOUNT PAID
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="shrink-0">
                {invoices?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell colSpan={3}>
                      {invoice.invoicereferencenumber}
                    </TableCell>

                    <TableCell colSpan={2}>
                      {moment(invoice.invoicecreatedat).format('DD-MM-YYYY')}
                    </TableCell>

                    <TableCell colSpan={2}>{invoice.totalquantity}</TableCell>

                    <TableCell colSpan={2}>
                      {invoice.invoicereceivabledueamount}
                    </TableCell>

                    <TableCell colSpan={2}>
                      <Input
                        className="w-32"
                        disabled={
                          !isAutoSplitted ||
                          invoice.invoicereceivabledueamount === 0
                        }
                        value={invoice.amount}
                        onChange={(e) =>
                          handleAmountPaidChange(e, invoice.invoiceId)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* uploads payments proofs */}
        <div className="flex flex-col gap-4">
          <Label>Relevant Proof</Label>
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

      <div className="flex justify-end gap-2">
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
          disabled={Object.values(errorMsg).some((msg) => msg !== '')}
          size="sm"
          className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
        >
          Create
        </Button>
      </div>
    </>
  );
};

export default MakePaymentNew;
