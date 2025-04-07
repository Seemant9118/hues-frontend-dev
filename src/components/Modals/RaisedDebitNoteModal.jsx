import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { raisedDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import { Textarea } from '../ui/textarea';
import ErrorBox from '../ui/ErrorBox';

const RaisedDebitNoteModal = ({ orderId, invoiceId, totalAmount }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [dataToRaisedDebitNote, setDataToRaisedDebitNote] = useState({
    orderId,
    amount: null,
    remark: '',
    invoiceId,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'amount') {
      if (value > totalAmount) {
        setErrorMsg(
          'Amount should not be greater than total amount of invoice',
        );
      } else {
        setErrorMsg('');
        setDataToRaisedDebitNote((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
    setDataToRaisedDebitNote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const raisedDebitNoteMutation = useMutation({
    mutationKey: [DebitNoteApi.raisedDebitNote.endpointKey],
    mutationFn: raisedDebitNote,
    onSuccess: () => {
      toast.success('Debit Note Raised');
      setIsOpen(false);
      queryClient.invalidateQueries([
        invoiceApi.getInvoice.endpointKey,
        invoiceId,
      ]);
      setDataToRaisedDebitNote({
        orderId: null,
        amount: null,
        remark: '',
        invoiceId: null,
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleRaisedDebitNote = () => {
    raisedDebitNoteMutation.mutate(dataToRaisedDebitNote);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Tooltips
          trigger={
            <Button
              onClick={() => setIsOpen(true)}
              size="sm"
              variant="blue_outline"
              className="font-bold"
            >
              Raise Debit Note
            </Button>
          }
          content={'Raise a debit note'}
        />
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-5">
        <DialogHeader className="text-lg font-bold">
          Raised a Debit Note
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div>
              <Label className="flex-shrink-0 font-semibold">Amount</Label>{' '}
              <span className="text-red-600">*</span>
            </div>

            <Input
              type="number"
              name="amount"
              className="max-w-md rounded-sm"
              value={dataToRaisedDebitNote.amount}
              onChange={handleChange}
            />
            {errorMsg && <ErrorBox msg={errorMsg} />}
          </div>

          <div className="flex w-full flex-col gap-2">
            <div>
              <Label className="flex-shrink-0 font-semibold">Remark</Label>{' '}
              <span className="text-red-600">*</span>
            </div>
            <Textarea
              name="remark"
              className="w-full rounded-sm"
              value={dataToRaisedDebitNote.remark}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="outline"
              className="font-bold"
              onClick={() => {
                setDataToRaisedDebitNote({
                  orderId: null,
                  amount: null,
                  remark: '',
                  invoiceId: null,
                });
                setIsOpen(false);
              }}
            >
              Discard
            </Button>
            <Button
              size="sm"
              className="bg-[#288AF9]"
              onClick={handleRaisedDebitNote}
              disabled={raisedDebitNoteMutation.isPending || errorMsg}
            >
              {raisedDebitNoteMutation.isPending ? <Loading /> : 'Raised'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RaisedDebitNoteModal;
