/* eslint-disable no-unsafe-optional-chaining */

'use client';

import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { sellerResponseUpdate } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Wrapper from '../wrappers/Wrapper';

const EditResponse = ({ item = {}, debitNoteId, onClose }) => {
  const queryClient = useQueryClient();

  /** Prefilled editable item */
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!item || !item.rowId) return;

    const debitNoteItemId = Number(item.rowId.split('-')[0]);

    setSelectedItem({
      ...item,
      debitNoteItemId,

      responseType: item.sellerResponse || '',

      approvedQuantity:
        item.sellerResponse === 'ACCEPTED' ? item.sellerQty || 0 : 0,

      approvedAmount:
        item.sellerResponse === 'ACCEPTED' ? item.sellerAmount || 0 : 0,

      rejectedQuantity:
        item.sellerResponse === 'REJECTED' ? item.sellerQty || 0 : 0,

      rejectedAmount:
        item.sellerResponse === 'REJECTED' ? item.sellerAmount || 0 : 0,

      replacementQty:
        item.sellerResponse === 'REPLACEMENT' ? item.sellerQty || 0 : 0,

      taxAmount: item.taxAmount || 0,
    });
  }, [item]);

  const buyerQuantity =
    item?.respondedQty ||
    (item?.refundQuantity ?? 0) + (item?.replacementQuantity ?? 0);

  const getUsedQty = () => {
    if (!selectedItem?.draftResponses?.length) return 0;

    return selectedItem.draftResponses
      .filter(
        (r) =>
          r.rowId !== selectedItem.rowId &&
          r.debitNoteItemId === selectedItem.debitNoteItemId,
      )
      .reduce(
        (sum, r) =>
          sum +
          (Number(r.approvedQuantity) || 0) +
          (Number(r.rejectedQuantity) || 0) +
          (Number(r.replacementQty) || 0),
        0,
      );
  };

  const getRemainingQty = () => {
    const sellerQty = selectedItem?.sellerQty || 0;
    const usedQty = getUsedQty();

    return Math.max(sellerQty - usedQty, 0);
  };

  /** ---------------- TAX CALCULATION ---------------- */
  const calculateTax = (approvedAmount, item) => {
    if (!approvedAmount || approvedAmount <= 0) {
      return {
        taxAmount: 0,
        cgstDetails: item?.cgstDetails
          ? { ...item.cgstDetails, amount: 0 }
          : null,
        sgstDetails: item?.sgstDetails
          ? { ...item.sgstDetails, amount: 0 }
          : null,
        igstDetails: item?.igstDetails
          ? { ...item.igstDetails, amount: 0 }
          : null,
      };
    }

    const cgstRate = item?.cgstDetails?.rate ?? 0;
    const sgstRate = item?.sgstDetails?.rate ?? 0;
    const igstRate = item?.igstDetails?.rate ?? 0;

    const cgstAmount = (approvedAmount * cgstRate) / 100;
    const sgstAmount = (approvedAmount * sgstRate) / 100;
    const igstAmount = (approvedAmount * igstRate) / 100;

    const totalTax =
      Number(cgstAmount.toFixed(2)) +
      Number(sgstAmount.toFixed(2)) +
      Number(igstAmount.toFixed(2));

    return {
      taxAmount: totalTax,
      cgstDetails: item?.cgstDetails
        ? { rate: cgstRate, amount: Number(cgstAmount.toFixed(2)) }
        : null,
      sgstDetails: item?.sgstDetails
        ? { rate: sgstRate, amount: Number(sgstAmount.toFixed(2)) }
        : null,
      igstDetails: item?.igstDetails
        ? { rate: igstRate, amount: Number(igstAmount.toFixed(2)) }
        : null,
    };
  };

  /** ---------------- API ---------------- */
  const sellerResponseUpdateMutation = useMutation({
    mutationFn: sellerResponseUpdate,
    onSuccess: () => {
      toast.success('Response updated successfully');
      queryClient.invalidateQueries([DebitNoteApi.getDebitNote.endpointKey]);
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  /** ---------------- PAYLOAD ---------------- */
  const buildPayload = () => {
    const isAccepted = selectedItem.responseType === 'ACCEPTED';
    const isRejected = selectedItem.responseType === 'REJECTED';
    const isReplacement = selectedItem.responseType === 'REPLACEMENT';

    return {
      items: [
        {
          // IMPORTANT: existing draft response id (if exists)
          id: selectedItem.id, // backend draft response id

          debitNoteItemId: selectedItem.debitNoteItemId,
          unitPrice: selectedItem.unitPrice,
          responseType: selectedItem.responseType,

          approvedQuantity: isAccepted ? selectedItem.approvedQuantity : 0,
          approvedAmount: isAccepted ? selectedItem.approvedAmount : 0,

          rejectedQuantity: isRejected ? selectedItem.rejectedQuantity : 0,

          replacementQty: isReplacement ? selectedItem.replacementQty : 0,

          taxAmount: isAccepted ? selectedItem.taxAmount : 0,

          cgstDetails: isAccepted ? selectedItem.cgstDetails : null,
          sgstDetails: isAccepted ? selectedItem.sgstDetails : null,
          igstDetails: isAccepted ? selectedItem.igstDetails : null,

          remarks: selectedItem.remarks || '',
        },
      ],
    };
  };

  const handleUpdate = () => {
    const payload = buildPayload();

    sellerResponseUpdateMutation.mutate({
      id: debitNoteId,
      data: payload,
    });
  };

  /** ---------------- UI ---------------- */
  return (
    <Wrapper className="relative flex h-full flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="mb-4 flex flex-col gap-4 rounded-sm border p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Item */}
            <div className="col-span-3">
              <Label>Item</Label>
              <Input disabled value={selectedItem?.productName || ''} />
            </div>

            {/* Response Type */}
            <div>
              <Label>Response Type</Label>
              <Select
                value={selectedItem?.responseType}
                onValueChange={(value) => {
                  if (!selectedItem) return;

                  const remainingQty = getRemainingQty(selectedItem);

                  if (value === 'REJECTED') {
                    setSelectedItem((prev) => ({
                      ...prev,
                      responseType: value,
                      approvedQuantity: 0,
                      approvedAmount: 0,
                      replacementQuantity: 0,
                      rejectedQuantity: remainingQty,
                      rejectedAmount: remainingQty * prev.unitPrice,
                      taxAmount: 0,
                      cgstDetails: prev?.cgstDetails
                        ? { ...prev.cgstDetails, amount: 0 }
                        : null,
                      sgstDetails: prev?.sgstDetails
                        ? { ...prev.sgstDetails, amount: 0 }
                        : null,
                      igstDetails: prev?.igstDetails
                        ? { ...prev.igstDetails, amount: 0 }
                        : null,
                    }));
                  } else if (value === 'REPLACEMENT') {
                    setSelectedItem((prev) => ({
                      ...prev,
                      responseType: value,
                      approvedQuantity: 0,
                      approvedAmount: 0,
                      rejectedQuantity: 0,
                      rejectedAmount: 0,
                      replacementQuantity:
                        prev.replacementQuantity &&
                        prev.replacementQuantity <= remainingQty
                          ? prev.replacementQuantity
                          : remainingQty,
                      taxAmount: 0,
                      cgstDetails: prev?.cgstDetails
                        ? { ...prev.cgstDetails, amount: 0 }
                        : null,
                      sgstDetails: prev?.sgstDetails
                        ? { ...prev.sgstDetails, amount: 0 }
                        : null,
                      igstDetails: prev?.igstDetails
                        ? { ...prev.igstDetails, amount: 0 }
                        : null,
                    }));
                  } else {
                    // ✅ ACCEPTED → recalculate GST
                    setSelectedItem((prev) => {
                      const approvedQty =
                        prev.approvedQuantity &&
                        prev.approvedQuantity <= remainingQty
                          ? prev.approvedQuantity
                          : remainingQty;

                      const approvedAmount = approvedQty * prev.unitPrice;

                      const taxData = calculateTax(approvedAmount, prev);

                      return {
                        ...prev,
                        responseType: value,
                        rejectedQuantity: 0,
                        rejectedAmount: 0,
                        replacementQuantity: 0,
                        approvedQuantity: approvedQty,
                        approvedAmount,
                        ...taxData, // ✅ cgst / sgst / igst stored here
                      };
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select response" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACCEPTED">Accept (Claim)</SelectItem>
                  <SelectItem value="REPLACEMENT">Replacement</SelectItem>
                  <SelectItem value="REJECTED">Rejected / Dispute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buyer Qty */}
            <div>
              <Label>Buyer Quantity</Label>
              <Input disabled value={buyerQuantity} />
            </div>

            {/* Unit Price */}
            <div>
              <Label>Unit Price</Label>
              <Input disabled value={selectedItem?.unitPrice} />
            </div>

            {selectedItem?.responseType === 'ACCEPTED' && (
              <>
                <div className="flex flex-col gap-1">
                  <Label>
                    Approved Quantity <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={selectedItem?.approvedQuantity ?? ''}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const remainingQty = getRemainingQty();

                      if (qty < 0 || qty > remainingQty) return;

                      const amount = qty * selectedItem.unitPrice;
                      const taxData = calculateTax(amount, selectedItem);

                      setSelectedItem((prev) => ({
                        ...prev,
                        approvedQuantity: qty,
                        approvedAmount: amount,
                        ...taxData,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Max allowed: {getRemainingQty()}
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <Label>
                    Approved Amount <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={selectedItem?.approvedAmount ?? ''}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      if (amount < 0) return;
                      const remainingQty = getRemainingQty();
                      const maxAmount = remainingQty * selectedItem?.unitPrice;
                      if (amount > maxAmount) return;

                      const taxData = calculateTax(amount, selectedItem);

                      setSelectedItem((prev) => ({
                        ...prev,
                        approvedAmount: amount,
                        ...taxData,
                      }));
                    }}
                  />
                  <span className="text-xs text-gray-500">
                    Max allowed: ₹
                    {(getRemainingQty() * selectedItem?.unitPrice).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {selectedItem?.responseType === 'REJECTED' && (
              <>
                <div className="flex flex-col gap-1">
                  <Label>
                    Rejected Quantity <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={selectedItem?.rejectedQuantity ?? ''}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const remainingQty = getRemainingQty();

                      if (qty < 0 || qty > remainingQty) return;

                      setSelectedItem((prev) => ({
                        ...prev,
                        rejectedQuantity: qty,
                        taxAmount: 0,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Max allowed: {getRemainingQty()}
                  </p>
                </div>

                {/* <div className="flex flex-col gap-1">
                  <Label>
                    Rejected Amount <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={selectedItem?.rejectedAmount ?? ''}
                    onChange={(e) => {
                      const amount = Number(e.target.value);
                      if (amount < 0) return;
                      const remainingQty = getRemainingQty();
                      const maxAmount = remainingQty * selectedItem?.unitPrice;
                      if (amount > maxAmount) return;

                      setSelectedItem((prev) => ({
                        ...prev,
                        rejectedAmount: amount,
                        taxAmount: 0,
                      }));
                    }}
                  />
                  <span className="text-xs text-gray-500">
                    Max allowed: ₹
                    {(getRemainingQty() * selectedItem?.unitPrice).toFixed(2)}
                  </span>
                </div> */}
              </>
            )}

            {selectedItem?.responseType === 'REPLACEMENT' && (
              <>
                <div className="flex flex-col gap-1">
                  <Label>
                    Replacement Quantity <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={selectedItem?.replacementQty ?? ''}
                    onChange={(e) => {
                      const qty = Number(e.target.value);
                      const remainingQty = getRemainingQty();

                      if (qty < 0 || qty > remainingQty) return;

                      setSelectedItem((prev) => ({
                        ...prev,
                        replacementQty: qty,
                        taxAmount: 0,
                      }));
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Max allowed: {getRemainingQty()}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="blue_outline"
              size="sm"
              disabled={
                !selectedItem?.responseType ||
                (selectedItem.responseType === 'ACCEPTED' &&
                  (!selectedItem.approvedQuantity ||
                    selectedItem.approvedQuantity <= 0)) ||
                (selectedItem.responseType === 'REPLACEMENT' &&
                  (!selectedItem.replacementQty ||
                    selectedItem.replacementQty <= 0)) ||
                (selectedItem.responseType === 'REJECTED' &&
                  (!selectedItem.rejectedQuantity ||
                    selectedItem.rejectedQuantity <= 0))
              }
              onClick={handleUpdate}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default EditResponse;
