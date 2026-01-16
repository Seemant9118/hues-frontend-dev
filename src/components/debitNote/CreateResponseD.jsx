/* eslint-disable no-unsafe-optional-chaining */
import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  getQCDefectStatuses,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
import { sellerResponseDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import ReactSelect from 'react-select';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';
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
import Wrapper from '../wrappers/Wrapper';
import { useCreateResponseColumns } from './useCreateResponseColumns';

const CreateResponseD = ({ items = [], debitNoteId, onClose }) => {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [responseData, setResponseData] = useState({ items: [] });

  /* helpers */
  const buyerQuantity =
    selectedItem?.respondedQty ||
    (selectedItem?.refundQuantity ?? 0) +
      (selectedItem?.replacementQuantity ?? 0);

  const getUsedQty = (debitNoteItemId) => {
    return responseData.items
      .filter((i) => i.debitNoteItemId === debitNoteItemId)
      .reduce(
        (sum, i) =>
          sum +
          (i.approvedQuantity ?? 0) +
          (i.rejectedQuantity ?? 0) +
          (i.replacementQty ?? 0), // ✅ FIX
        0,
      );
  };

  const getRemainingQty = (item) => {
    const buyerQty =
      item?.respondedQty ||
      (item?.refundQuantity ?? 0) + (item?.replacementQuantity ?? 0);

    const usedQty = getUsedQty(item?.debitNoteItemId);

    return Math.max(buyerQty - usedQty, 0);
  };

  /* Options */
  const defects = (item) => {
    const statuses = getQCDefectStatuses(item);

    if (!statuses?.length) return '-';

    return (
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => (
          <ConditionalRenderingStatus key={status} status={status} isQC />
        ))}
      </div>
    );
  };

  const itemsOptions = useMemo(() => {
    return items.map((item) => ({
      value: item.debitNoteItemId,
      label: (
        <div className="flex items-center gap-1">
          <span>
            {item.productName} ({item.skuId})
          </span>
          {defects(item)}
        </div>
      ),
      disabled: getRemainingQty(item) <= 0,
    }));
  }, [items, responseData.items]);

  const selectedOption = useMemo(() => {
    if (!selectedItem?.debitNoteItemId) return null;

    return itemsOptions.find(
      (opt) => opt.value === selectedItem.debitNoteItemId,
    );
  }, [itemsOptions, selectedItem?.debitNoteItemId]);

  const calculateTax = (approvedAmount, item) => {
    if (!approvedAmount || approvedAmount <= 0) {
      return {
        taxAmount: 0,
        cgstDetails: item?.cgstDetails
          ? { rate: item.cgstDetails.rate, amount: 0 }
          : null,
        sgstDetails: item?.sgstDetails
          ? { rate: item.sgstDetails.rate, amount: 0 }
          : null,
        igstDetails: item?.igstDetails
          ? { rate: item.igstDetails.rate, amount: 0 }
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
      taxAmount: Number(totalTax.toFixed(2)),

      cgstDetails: item?.cgstDetails
        ? {
            rate: cgstRate,
            amount: Number(cgstAmount.toFixed(2)),
          }
        : null,

      sgstDetails: item?.sgstDetails
        ? {
            rate: sgstRate,
            amount: Number(sgstAmount.toFixed(2)),
          }
        : null,

      igstDetails: item?.igstDetails
        ? {
            rate: igstRate,
            amount: Number(igstAmount.toFixed(2)),
          }
        : null,
    };
  };

  const handleDeleteItem = (rowItem) => {
    // Remove ONLY the clicked row
    setResponseData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.rowId !== rowItem.rowId),
    }));

    // Restore the exact row back into editor
    setSelectedItem({
      ...items.find((i) => i.debitNoteItemId === rowItem.debitNoteItemId),
      responseType: rowItem.responseType,
      approvedQuantity: rowItem.approvedQuantity,
      approvedAmount: rowItem.approvedAmount,
      rejectedQuantity: rowItem.rejectedQuantity,
      replacementQty: rowItem.replacementQty,
    });
  };

  const sellerResponseDebitNoteMutation = useMutation({
    mutationFn: sellerResponseDebitNote,
    onSuccess: () => {
      toast.success('Response added Successfully');
      queryClient.invalidateQueries([DebitNoteApi.getDebitNote.endpointKey]);
      onClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const normalizeItemForPayload = (item) => {
    const isAccepted = item.responseType === 'ACCEPTED';
    const isRejected = item.responseType === 'REJECTED';
    const isReplacement = item.responseType === 'REPLACEMENT';

    return {
      debitNoteItemId: item.debitNoteItemId,
      unitPrice: item.unitPrice,
      responseType: item.responseType,

      approvedQuantity: isAccepted ? item.approvedQuantity : 0,
      approvedAmount: isAccepted ? item.approvedAmount : 0,
      taxAmount: isAccepted ? item.taxAmount : 0,
      rejectedQuantity: isRejected ? item.rejectedQuantity : 0,
      replacementQty: isReplacement ? item.replacementQty : 0,

      cgstDetails: isAccepted ? item.cgstDetails : null,

      sgstDetails: isAccepted ? item.sgstDetails : null,

      igstDetails: isAccepted ? item.igstDetails : null,

      remarks: item.remarks || '',
    };
  };

  const buildCreditNotePayload = (items) => {
    const normalizedItems = items.map(normalizeItemForPayload);

    return {
      status: 'PENDING',
      approvedQuantity: normalizedItems.reduce(
        (sum, i) => sum + i.approvedQuantity,
        0,
      ),

      approvedAmount: normalizedItems.reduce(
        (sum, i) => sum + i.approvedAmount,
        0,
      ),

      taxAmount: normalizedItems.reduce((sum, i) => sum + i.taxAmount, 0),

      creditNoteItems: normalizedItems,
    };
  };

  const handleSubmit = () => {
    const payloadToSend = buildCreditNotePayload(responseData.items);

    if (payloadToSend) {
      sellerResponseDebitNoteMutation.mutate({
        id: debitNoteId,
        data: payloadToSend,
      });
    }
  };

  const createResponseColumns = useCreateResponseColumns({
    onDelete: handleDeleteItem,
  });

  return (
    <Wrapper className="relative flex h-full flex-col">
      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="mb-4 flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Item select */}
            <div className="col-span-3 flex flex-col gap-1 text-sm">
              <Label>
                Items <span className="text-red-600">*</span>
              </Label>

              <ReactSelect
                value={selectedOption}
                placeholder="Select Item"
                options={itemsOptions}
                styles={getStylesForSelectComponent()}
                isOptionDisabled={(opt) => opt.disabled}
                onChange={(option) => {
                  const item = items.find(
                    (i) => i.debitNoteItemId === option.value,
                  );
                  if (!item) return;

                  setSelectedItem({
                    ...item,
                    responseType: '',
                    approvedQuantity: 0,
                    approvedAmount: 0,
                    rejectedQuantity: 0,
                    rejectedAmount: 0,
                  });
                }}
              />
            </div>

            {/* Response Type */}
            <div className="flex flex-col gap-1">
              <Label>Response Type</Label>
              <Select
                value={selectedItem?.responseType}
                onValueChange={(value) => {
                  setSelectedItem((prev) => {
                    const remainingQty = getRemainingQty(prev);

                    // REJECTED → move everything to rejected bucket
                    if (value === 'REJECTED') {
                      return {
                        ...prev,
                        responseType: value,

                        approvedQuantity: 0,
                        approvedAmount: 0,

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
                      };
                    }

                    // ACCEPTED / REPLACEMENT
                    return {
                      ...prev,
                      responseType: value,
                      rejectedQuantity: 0,
                      rejectedAmount: 0,
                    };
                  });
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

            {/* Buyer Quantity */}
            <div className="flex flex-col gap-1">
              <Label>Buyer Quantity</Label>
              <Input disabled value={buyerQuantity || 0} />
            </div>

            {/* Unit Price */}
            <div className="flex flex-col gap-1">
              <Label>Unit Price</Label>
              <Input disabled value={selectedItem?.unitPrice ?? 0} />
            </div>

            {/* Approved - only visible when responseType is ACCEPTED */}
            {selectedItem?.responseType === 'ACCEPTED' && (
              <>
                <div className="flex flex-col gap-1">
                  <Label>
                    Approved Quantity <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={selectedItem?.approvedQuantity ?? ''}
                    disabled={selectedItem?.responseType === 'REJECTED'}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value < 0) return;

                      const remainingQty = getRemainingQty(selectedItem);
                      if (value > remainingQty) return;

                      const approvedAmount = value * selectedItem.unitPrice;
                      const taxData = calculateTax(
                        approvedAmount,
                        selectedItem,
                      );

                      setSelectedItem((prev) => ({
                        ...prev,
                        approvedQuantity: value,
                        approvedAmount,
                        ...taxData,
                      }));
                    }}
                  />
                  {selectedItem && (
                    <p className="text-xs text-gray-500">
                      Remaining Quantity: {getRemainingQty(selectedItem)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Label>
                    Approved Amount <span className="text-red-600">*</span>
                  </Label>

                  <Input
                    type="number"
                    disabled={selectedItem?.responseType === 'REJECTED'}
                    value={selectedItem?.approvedAmount ?? ''}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      if (value < 0) return;

                      const maxAmount =
                        (selectedItem?.approvedQuantity ?? 0) *
                        (selectedItem?.unitPrice ?? 0);

                      if (value > maxAmount) return;

                      const taxData = calculateTax(value, selectedItem);

                      setSelectedItem((prev) => ({
                        ...prev,
                        approvedAmount: value,
                        ...taxData,
                      }));
                    }}
                  />

                  <span className="text-xs text-gray-500">
                    Max allowed: ₹
                    {(
                      (selectedItem?.approvedQuantity ?? 0) *
                      (selectedItem?.unitPrice ?? 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {/* Rejected - only visible when responseType is REJECTED */}
            {selectedItem?.responseType === 'REJECTED' && (
              <div className="flex flex-col gap-1">
                <Label>
                  Rejected Quantity <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="number"
                  value={selectedItem?.rejectedQuantity ?? ''}
                  disabled={selectedItem?.responseType !== 'REJECTED'}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value < 0) return;

                    const remainingQty = getRemainingQty(selectedItem);
                    if (value > remainingQty) return;

                    setSelectedItem((prev) => ({
                      ...prev,
                      rejectedQuantity: value,
                      rejectedAmount: value * prev.unitPrice,
                      taxAmount: 0,
                    }));
                  }}
                />
                {selectedItem && (
                  <p className="text-xs text-gray-500">
                    Remaining Quantity: {getRemainingQty(selectedItem)}
                  </p>
                )}
              </div>
            )}

            {/* Replacement - only visible when responseType is REPLACEMENT */}
            {selectedItem?.responseType === 'REPLACEMENT' && (
              <div className="flex flex-col gap-1">
                <Label>
                  Replacement Quantity <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="number"
                  value={selectedItem?.replacementQty ?? ''}
                  disabled={selectedItem?.responseType !== 'REPLACEMENT'}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value < 0) return;

                    const remainingQty = getRemainingQty(selectedItem);
                    if (value > remainingQty) return;

                    setSelectedItem((prev) => ({
                      ...prev,
                      replacementQty: value,
                      taxAmount: 0, // replacement has no tax
                    }));
                  }}
                />
                <p className="text-xs text-gray-500">
                  Remaining Quantity: {getRemainingQty(selectedItem)}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedItem(null)}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              variant="blue_outline"
              disabled={
                !selectedItem?.debitNoteItemId ||
                !selectedItem?.responseType ||
                (selectedItem.responseType === 'ACCEPTED' &&
                  (!selectedItem?.approvedQuantity ||
                    selectedItem.approvedQuantity <= 0)) ||
                (selectedItem.responseType === 'REPLACEMENT' &&
                  (!selectedItem?.replacementQty ||
                    selectedItem.replacementQty <= 0))
              }
              onClick={() => {
                setResponseData((prev) => ({
                  ...prev,
                  items: [
                    ...prev.items,
                    {
                      rowId: crypto.randomUUID(), // UNIQUE UI ID

                      debitNoteItemId: selectedItem.debitNoteItemId,
                      productName: selectedItem.productName,
                      skuId: selectedItem.skuId,
                      responseType: selectedItem.responseType,

                      approvedQuantity: selectedItem.approvedQuantity,
                      approvedAmount: selectedItem.approvedAmount,
                      rejectedQuantity: selectedItem.rejectedQuantity,
                      replacementQty: selectedItem.replacementQty,

                      unitPrice: selectedItem.unitPrice,

                      taxAmount: selectedItem.taxAmount,
                      cgstDetails: selectedItem.cgstDetails || null,
                      sgstDetails: selectedItem.sgstDetails || null,
                      igstDetails: selectedItem.igstDetails || null,
                    },
                  ],
                }));

                setSelectedItem(null);
              }}
            >
              Add
            </Button>
          </div>
        </div>

        {/* selected item table */}
        <DataTable
          data={responseData?.items || []}
          columns={createResponseColumns}
        />
      </div>

      {/* STICKY FOOTER */}
      <div className="sticky bottom-0 z-20 border-t border-neutral-200 bg-white px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            disabled={sellerResponseDebitNoteMutation?.isPending}
            size="sm"
            onClick={handleSubmit}
          >
            {sellerResponseDebitNoteMutation?.isPending ? (
              <Loading />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default CreateResponseD;
