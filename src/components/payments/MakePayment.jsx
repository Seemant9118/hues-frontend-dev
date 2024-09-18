import { paymentApi } from '@/api/payments/payment_api';
import {
  createPayment,
  getInvoicesForPayments,
} from '@/services/Payment_Services/PaymentServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Upload, UploadCloud } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
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

const MakePayment = ({ orderId, orderDetails, setIsRecordingPayment }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState({});
  const [invoicesData, setInvoicesData] = useState([]);
  // New state to store amountPaid values for invoices
  const [invoiceAmounts, setInvoiceAmounts] = useState({});
  const [paymentData, setPaymentData] = useState({
    amount: null,
    paymentMode: '',
    transactionId: '',
    attachmentLink: '',
    invoices: invoicesData,
  });

  useEffect(() => {
    setPaymentData((prevData) => ({
      ...prevData,
      invoices: invoicesData,
    }));
  }, [invoicesData]);

  const { data: invoicesForPayments, isLoading } = useQuery({
    queryKey: [paymentApi.getInvoicesForPayments.endpointKey, orderId],
    queryFn: () => getInvoicesForPayments(orderId),
    enabled: !!orderId,
    select: (invoicesForPayments) => invoicesForPayments.data.data,
  });

  // Sync the current amountPaid from invoiceAmounts to invoicesForPayments
  const syncAmountsToInvoices = () => {
    return invoicesForPayments?.map((invoice) => ({
      ...invoice,
      amountPaid: invoiceAmounts[invoice.id] || 0, // Use stored amount or default to 0
    }));
  };

  const splitFn = (amount) => {
    let remainingAmount = amount;
    const updatedInvoices = syncAmountsToInvoices().map((invoice) => {
      const currentInvoiceAmount = parseFloat(invoice.invoicetotalamount);

      if (remainingAmount >= currentInvoiceAmount) {
        invoice.amountPaid = currentInvoiceAmount;
        remainingAmount -= currentInvoiceAmount;
      } else {
        invoice.amountPaid = remainingAmount;
        remainingAmount = 0;
      }

      return invoice;
    });

    // Update invoiceAmounts state with the new amounts
    const newInvoiceAmounts = updatedInvoices.reduce((acc, invoice) => {
      acc[invoice.id] = invoice.amountPaid;
      return acc;
    }, {});

    setInvoiceAmounts(newInvoiceAmounts);
    setInvoicesData(updatedInvoices);
    setPaymentData((prevData) => ({
      ...prevData,
      invoices: updatedInvoices,
      amount,
    }));
  };

  const calculateTotalAmount = (updatedAmounts) => {
    const totalAmount = invoicesData.reduce((sum, invoice) => {
      const invoiceId = invoice.id;
      return sum + (parseFloat(updatedAmounts[invoiceId]) || 0);
    }, 0);

    // Now update the paymentData state with the new total amount
    setPaymentData((prevData) => ({
      ...prevData,
      amount: totalAmount,
    }));
  };

  const handleFileChange = (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setPaymentData({ ...paymentData, attachmentLink: formData });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const balanceAmount = parseFloat(
      orderDetails.amount + orderDetails.gstAmount,
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
        splitFn(value); // Correctly split amount among invoices
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: '',
        }));
      }
    }
  };

  const handleAmountPaidChange = (e, invoiceId, invoice) => {
    const value = parseFloat(e.target.value) || 0;

    if (value <= invoice.invoicetotalamount) {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        amountPaid: '',
      }));
    } else {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        amountPaid: 'Amount exceeds balance amount',
      }));
    }

    // Update the invoiceAmounts state with the new value
    setInvoiceAmounts((prevAmounts) => {
      const updatedAmounts = {
        ...prevAmounts,
        [invoiceId]: value,
      };

      // After updating invoiceAmounts, recalculate the total amount
      calculateTotalAmount(updatedAmounts); // Pass the updated amounts

      // Now sync the updated amounts with the invoicesData
      const updatedInvoices = invoicesData.map((inv) => ({
        ...inv,
        amountPaid: updatedAmounts[inv.id] || 0, // Syncing the amount paid
      }));

      // Update invoicesData state
      setInvoicesData(updatedInvoices);

      return updatedAmounts;
    });
  };

  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Payment Recorded Successfully');
      setPaymentData({
        amount: '', // Consider using an empty string instead of null for consistency
        paymentMode: '',
        transactionId: '',
        attachmentLink: '', // If it's a FormData object, consider setting it to null
        invoices: [],
      });
      queryClient.invalidateQueries[paymentApi.getPaymentsList.endpointKey];
      setIsRecordingPayment(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    },
  });

  const handleSubmit = () => {
    const formattedInvoices = paymentData?.invoices?.map((invoice) => ({
      invoiceId: Number(invoice.invoicereceivableinvoiceid), // Ensure invoice.id is the correct identifier
      amount: Number(invoice.amountPaid) || 0,
    }));

    const payload = {
      amount: Number(paymentData.amount) || 0, // Ensure amount is set correctly
      paymentMode: paymentData.paymentMode,
      transactionId: paymentData.transactionId || '', // Optional
      attachmentLink: paymentData.attachmentLink || '', // Optional
      invoices: formattedInvoices,
    };
    createPaymentMutationFn.mutate(payload);
  };

  return (
    <>
      <div className="scrollBarStyles flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-4 rounded-md border p-5">
          {/* inputs */}
          <section className="grid grid-cols-2 grid-rows-2 gap-4">
            {/* select payment mode */}
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
              <Label>Transaction ID</Label>
              <div className="flex flex-col gap-1">
                <Input
                  name="transactionId"
                  value={paymentData.transactionId}
                  onChange={handleInputChange}
                  className="max-w-md"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <div>
                <Label className="flex-shrink-0">Amount Paid</Label>{' '}
                <span className="text-red-600">*</span>
              </div>
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  name="amount"
                  className="max-w-md"
                  value={paymentData.amount}
                  onChange={handleInputChange}
                />
                {errorMsg.amountPaid && <ErrorBox msg={errorMsg.amountPaid} />}
              </div>
            </div>

            {/* Balance */}
            <div className="flex flex-col gap-2">
              <Label>Balance</Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  className="max-w-md"
                  value={orderDetails.amount + orderDetails.gstAmount}
                />
              </div>
            </div>
          </section>

          {/* uploads payments proofs */}
          <div className="flex flex-col gap-4">
            <Label>Relevant Proof</Label>

            <FileUploader
              handleChange={handleFileChange}
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

        {/* Invoice table  */}
        <div>
          {/* Invoice Selection Table */}
          {isLoading ? (
            <Loading />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    colSpan={1}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    <Checkbox />
                  </TableHead>
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
                {syncAmountsToInvoices()?.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell colSpan={1}>
                      <Checkbox />
                    </TableCell>

                    <TableCell colSpan={3}>
                      {invoice.invoicereferencenumber}
                    </TableCell>

                    <TableCell colSpan={2}>
                      {moment(invoice.invoicecreatedat).format('DD-MM-YYYY')}
                    </TableCell>

                    <TableCell colSpan={2}>{invoice.totalquantity}</TableCell>

                    <TableCell colSpan={2}>
                      {invoice.invoicetotalamount}
                    </TableCell>

                    <TableCell colSpan={2}>
                      <Input
                        className="w-32"
                        type="number"
                        value={invoiceAmounts[invoice.id] || 0}
                        onChange={(e) =>
                          handleAmountPaidChange(e, invoice.id, invoice)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          className="w-32"
          size="sm"
          onClick={() => {
            // state clear
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

export default MakePayment;
