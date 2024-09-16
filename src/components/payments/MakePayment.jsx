import { paymentApi } from '@/api/payments/payment_api';
import { getInvoicesForPayments } from '@/services/Payment_Services/PaymentServices';
import { useQuery } from '@tanstack/react-query';
import { Upload, UploadCloud } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
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

const MakePayment = ({ orderId, orderDetails }) => {
  const router = useRouter();
  const { data: invoicesForPayments, isLoading } = useQuery({
    queryKey: [paymentApi.getInvoicesForPayments.endpointKey, orderId],
    queryFn: () => getInvoicesForPayments(orderId), // Make sure you're passing the orderId correctly
    enabled: !!orderId, // Ensure the query only runs if orderId is truthy
    select: (invoicesForPayments) => invoicesForPayments.data.data,
  });

  return (
    <>
      <div className="scrollBarStyles flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-4 rounded-md border p-5">
          {/* inputs */}
          <section className="grid grid-cols-2 grid-rows-2 gap-6">
            {/* select payment mode */}
            <div className="flex flex-col gap-2">
              <div>
                <Label className="flex-shrink-0">Payment Mode</Label>{' '}
                <span className="text-red-600">*</span>
              </div>

              <Select defaultValue="">
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neft">NEFT</SelectItem>
                  <SelectItem value="rtgs">RTGS</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="crditDebitCard">
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
                <Input className="max-w-md" />
                {/* {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />} */}
              </div>
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <div>
                <Label className="flex-shrink-0">Amount Paid</Label>{' '}
                <span className="text-red-600">*</span>
              </div>
              <div className="flex flex-col gap-1">
                <Input className="max-w-md" />
                {/* {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />} */}
              </div>
            </div>

            {/* Balance */}
            <div className="flex flex-col gap-2">
              <Label>Balance</Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  className="max-w-md"
                  value={orderDetails?.amount}
                />
                {/* {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />} */}
              </div>
            </div>
          </section>

          {/* uploads payments proofs */}
          <div className="flex flex-col gap-4">
            <Label>Relevant Proof</Label>

            <FileUploader
              handleChange={() => {}}
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

            {/* {files.map((file) => (
          <div
            key={file.name}
            className="flex min-w-[700px] items-center justify-between gap-4 rounded-sm border border-neutral-300 p-4"
          >
            <div className="flex items-center gap-4">
              <p className="text-xs font-medium leading-[18px]">{file.name}</p>
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
        ))} */}
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
                {invoicesForPayments?.map((invoice) => (
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
                      <Input className="w-32"></Input>
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
