'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  acceptDebitCreateCreditNote,
  rejectDebitNote,
} from '@/services/Debit_Note_Services/DebitNoteServices';
import { Label } from '@radix-ui/react-label';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import Loading from '../ui/Loading';

const DebitNoteModal = ({ cta, balance, debitNoteId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dataToCreateCreditNote, setDataToCreateCreditNote] = useState({
    amount: '',
    remark: '',
  });

  const [dataToRejection, setDataToRejection] = useState({
    reason: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataToCreateCreditNote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRejectionChange = (e) => {
    const { name, value } = e.target;
    setDataToRejection((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // mutation fn: accept & create credit note
  const acceptCreateCreditNoteMutationFn = useMutation({
    mutationKey: [
      DebitNoteApi.acceptDebitAndCreateCreditNote.endpointKey,
      debitNoteId,
    ],
    mutationFn: acceptDebitCreateCreditNote,
    onSuccess: () => {
      toast.success('Debit Note Accepted and created Credit Note');
      setDataToCreateCreditNote({
        creditAmount: '',
        remark: '',
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // mutation Fn : reject debit note
  const rejectDebitNoteMutationFn = useMutation({
    mutationKey: [DebitNoteApi.rejectDebitNote.endpointKey, debitNoteId],
    mutationFn: rejectDebitNote,
    onSuccess: () => {
      toast.success('Debit Note Rejected');
      setDataToRejection({
        reason: '',
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleAccept = () =>
    acceptCreateCreditNoteMutationFn.mutate({
      id: debitNoteId,
      data: dataToCreateCreditNote,
    });

  const handleReject = () => {
    rejectDebitNoteMutationFn.mutate({
      id: debitNoteId,
      data: dataToRejection,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {cta === 'accept' ? (
          <Button size="sm" className="bg-[#288AF9]">
            Accept & create credit note
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="border border-[#F04949] text-[#F04949] hover:bg-[#F04949] hover:text-white"
          >
            Reject
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-5">
        {cta === 'accept' && (
          <>
            <DialogHeader className="text-lg font-bold">
              Accept and create a credit note
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between gap-6">
                <div className="flex w-1/2 flex-col gap-2">
                  <div>
                    <Label className="flex-shrink-0 font-semibold">
                      Credit Amount
                    </Label>{' '}
                    <span className="text-red-600">*</span>
                  </div>

                  <Input
                    type="number"
                    name="amount"
                    className="max-w-md rounded-sm"
                    value={dataToCreateCreditNote.amount}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex w-1/2 flex-col gap-2">
                  <Label className="flex-shrink-0 font-semibold">Balance</Label>{' '}
                  <Input
                    type="number"
                    name="balance"
                    className="max-w-md rounded-sm"
                    disabled
                    value={balance.toFixed(2)}
                  />
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 font-semibold">Remark</Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <Textarea
                  name="remark"
                  className="w-full rounded-sm"
                  value={dataToCreateCreditNote.remark}
                  onChange={handleChange}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="font-bold"
                  onClick={() => {
                    setDataToCreateCreditNote({
                      creditAmount: '',
                      remark: '',
                    });
                    setIsOpen(false);
                  }}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  disabled={acceptCreateCreditNoteMutationFn.isPending}
                  className="bg-[#288AF9]"
                  onClick={handleAccept}
                >
                  {acceptCreateCreditNoteMutationFn.isPending ? (
                    <Loading />
                  ) : (
                    'Create'
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {cta === 'reject' && (
          <>
            <DialogHeader className="text-lg font-bold">
              Reject debit note
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex w-full flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    Reason for rejection
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <Textarea
                  name="reason"
                  className="w-full rounded-sm"
                  value={dataToRejection.reason}
                  onChange={handleRejectionChange}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="font-bold"
                  onClick={() => {
                    setDataToRejection({
                      reason: '',
                    });
                    setIsOpen(false);
                  }}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={rejectDebitNoteMutationFn?.isPending}
                  className="bg-[#F04949] text-white hover:bg-red-600 hover:text-white"
                  onClick={handleReject}
                >
                  {rejectDebitNoteMutationFn.isPending ? <Loading /> : 'Reject'}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DebitNoteModal;
