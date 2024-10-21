'use client';

import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import { Textarea } from '../ui/textarea';

const DebitNoteModal = ({ cta, debitNote }) => {
  const queryClient = useQueryClient();
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
      debitNote.id,
    ],
    mutationFn: acceptDebitCreateCreditNote,
    onSuccess: () => {
      toast.success('Debit Note Accepted and created Credit Note');
      setDataToCreateCreditNote({
        creditAmount: '',
        remark: '',
      });
      setIsOpen(false);
      queryClient.invalidateQueries([
        DebitNoteApi.getAllDebitNotes.endpointKey,
      ]);
      queryClient.invalidateQueries([
        CreditNoteApi.getAllCreditNotes.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // mutation Fn : reject debit note
  const rejectDebitNoteMutationFn = useMutation({
    mutationKey: [DebitNoteApi.rejectDebitNote.endpointKey, debitNote.id],
    mutationFn: rejectDebitNote,
    onSuccess: () => {
      toast.success('Debit Note Rejected');
      setDataToRejection({
        reason: '',
      });
      setIsOpen(false);
      queryClient.invalidateQueries([
        DebitNoteApi.getAllDebitNotes.endpointKey,
      ]);
      queryClient.invalidateQueries([
        CreditNoteApi.getAllCreditNotes.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleAccept = () =>
    acceptCreateCreditNoteMutationFn.mutate({
      id: debitNote.id,
      data: dataToCreateCreditNote,
    });

  const handleReject = () => {
    rejectDebitNoteMutationFn.mutate({
      id: debitNote.id,
      data: dataToRejection,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={
            debitNote.status === 'PENDING' && cta === 'accept'
              ? 'w-24 bg-[#288AF9]'
              : debitNote.status === 'PENDING' && cta === 'reject'
                ? 'w-24 border border-[#F04949] bg-white text-[#F04949] hover:bg-[#F04949] hover:text-white'
                : 'hidden'
          }
        >
          {cta === 'accept' ? 'Accept' : 'Reject'}
        </Button>
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
                    value={debitNote.amount.toFixed(2)}
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
                  className="min-h-[80px] w-full rounded-sm"
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
                  className="min-h-[80px] w-full rounded-sm"
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
