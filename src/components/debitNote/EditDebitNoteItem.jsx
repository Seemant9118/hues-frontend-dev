'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getQCDefectStatuses } from '@/appUtils/helperFunctions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import { toast } from 'sonner';
import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import Loading from '../ui/Loading';

const EXPECTATIONS = {
  REFUND: 'REQUEST_REFUND',
  REPLACEMENT: 'REQUEST_REPLACEMENT',
  BOTH: 'REQUEST_BOTH',
};

const SEVERITY_INDICATOR = {
  MINOR: 'MINOR_DEFECT',
  MODERATE: 'MODERATE_DEFECT',
  SEVERE: 'SEVERE_DEFECT',
  TOTAL_FAILURE: 'TOTAL_FAILURE',
};

const DEFAULT_STATE = {
  buyerExpectation: EXPECTATIONS.REFUND,
  refundQuantity: 0,
  refundAmount: 0,
  replacementQty: 0,
  internalRemark: '',
};

export default function EditDebitNoteItem({
  open,
  onOpenChange,
  item,
  debitNoteId,
}) {
  const toNumber = (v) => Number(v) || 0;

  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_STATE);

  const isRefund =
    form.buyerExpectation === EXPECTATIONS.REFUND ||
    form.buyerExpectation === EXPECTATIONS.BOTH;

  const isReplacement =
    form.buyerExpectation === EXPECTATIONS.REPLACEMENT ||
    form.buyerExpectation === EXPECTATIONS.BOTH;

  const statuses = item ? getQCDefectStatuses(item) : [];

  const unitPrice = Number(item?.unitPrice || 0);
  const maxQuantity = Number(item?.maxQuantity || 0);
  const totalDefectQty = maxQuantity;
  // amount calculation
  const refundAmount = toNumber(form.refundAmount);
  const cgstRate = toNumber(item?.cgstDetails?.rate);
  const sgstRate = toNumber(item?.sgstDetails?.rate);
  const igstRate = toNumber(item?.igstDetails?.rate);
  const cgst = isRefund ? refundAmount * (cgstRate / 100) : 0;
  const sgst = isRefund ? refundAmount * (sgstRate / 100) : 0;
  const igst = isRefund ? refundAmount * (igstRate / 100) : 0;

  const totalClaimed = refundAmount + cgst + sgst + igst;

  const handleRefundQtyChange = (value) => {
    const qty = Math.max(0, Number(value) || 0);
    const cappedQty = Math.min(qty, totalDefectQty);

    if (form.buyerExpectation === EXPECTATIONS.REFUND) {
      setForm((prev) => ({
        ...prev,
        refundQuantity: cappedQty,
        refundAmount: cappedQty * unitPrice,
        replacementQty: 0,
      }));
      return;
    }

    if (form.buyerExpectation === EXPECTATIONS.BOTH) {
      const remaining = totalDefectQty - cappedQty;

      setForm((prev) => ({
        ...prev,
        refundQuantity: cappedQty,
        replacementQty: remaining,
        refundAmount: cappedQty * unitPrice,
      }));
    }
  };

  const handleReplacementQtyChange = (value) => {
    const qty = Math.max(0, Number(value) || 0);
    const cappedQty = Math.min(qty, totalDefectQty);

    if (form.buyerExpectation === EXPECTATIONS.REPLACEMENT) {
      setForm((prev) => ({
        ...prev,
        replacementQty: cappedQty,
        refundQuantity: 0,
        refundAmount: 0,
      }));
      return;
    }

    if (form.buyerExpectation === EXPECTATIONS.BOTH) {
      const remaining = totalDefectQty - cappedQty;

      setForm((prev) => ({
        ...prev,
        replacementQty: cappedQty,
        refundQuantity: remaining,
        refundAmount: remaining * unitPrice,
      }));
    }
  };

  const handleRefundAmountChange = (value) => {
    const amount = Math.max(0, Number(value) || 0);
    const maxAmount = form.refundQuantity * unitPrice;

    setForm((prev) => ({
      ...prev,
      refundAmount: Math.min(amount, maxAmount),
    }));
  };

  useEffect(() => {
    // Dialog closed → reset form
    if (!open) {
      setForm(DEFAULT_STATE);
      return;
    }

    // Dialog opened with item → initialize
    if (open && item) {
      setForm({
        buyerExpectation: item?.buyerExpectation || EXPECTATIONS.REFUND,
        severityIndicator: item?.metaData?.severityIndicator || '',
        refundQuantity: item?.refundQuantity || 0,
        refundAmount: item?.amount || 0,
        replacementQty: item?.replacementQuantity || 0,
        internalRemark: item?.metaData?.internalRemark || '',
      });
    }
  }, [open, item]);

  const isSaveDisabled =
    !form.refundQuantity && !form.replacementQty && !form.internalRemark;

  const updateDebitNoteMutation = useMutation({
    mutationFn: updateDebitNote,
    onSuccess: () => {
      toast.success('Item saved Successfully');
      onOpenChange(false);
      setForm(DEFAULT_STATE);
      queryClient.invalidateQueries([DebitNoteApi.getDebitNote.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'something went wrong');
    },
  });

  const handleSave = () => {
    const payload = {
      status: 'DRAFT', // or 'DRAFT'
      items: [
        {
          debitNoteItemId: item.id, // or item.debitNoteItemId
          buyerExpectation: form.buyerExpectation,

          ...(form.buyerExpectation === EXPECTATIONS.REFUND && {
            refundAmount: Number(refundAmount),
            refundQuantity: Number(form.refundQuantity),
            replacementQuantity: 0,
          }),

          ...(form.buyerExpectation === EXPECTATIONS.REPLACEMENT && {
            refundAmount: 0,
            refundQuantity: 0,
            replacementQuantity: Number(form.replacementQty),
          }),

          ...(form.buyerExpectation === EXPECTATIONS.BOTH && {
            refundAmount: Number(refundAmount),
            refundQuantity: Number(form.refundQuantity),
            replacementQuantity: Number(form.replacementQty),
          }),

          metaData: {
            internalRemark: form.internalRemark || '',
            severityIndicator: form.severityIndicator || '',
          },
        },
      ],
    };

    updateDebitNoteMutation.mutate({
      id: debitNoteId,
      data: payload,
    });
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-3xl flex-col p-0">
        <DialogHeader className="sticky top-0 z-10 rounded-sm border-b bg-background px-4 py-3">
          <DialogTitle className="flex items-center justify-between">
            <span>Editing Line Item</span>
            <div className="flex items-center gap-2">
              {statuses.map((status) => (
                <ConditionalRenderingStatus key={status} status={status} isQC />
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="scrollBarStyles flex-1 overflow-auto px-4 py-3">
          {/* SKU + Item */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">SKU ID</p>
              <p className="font-medium">
                {item?.invoiceItem?.orderItemId?.productDetails?.skuId || '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Item Name</p>
              <p className="font-medium">
                {item?.invoiceItem?.orderItemId?.productDetails?.productName ||
                  '-'}
              </p>
            </div>
          </div>

          {/* Qty block */}
          <div className="grid grid-cols-4 gap-4 rounded-lg bg-muted/40 p-4">
            <Stat label="Qty Ordered" value={item?.qtyOrdered} />
            <Stat label="Qty Received" value={item?.qtyReceived} />
            {item?.isShortDelivery && (
              <Stat label="Short Qty" value={item?.shortQty} highlight />
            )}
            {item?.isUnsatisfactory && (
              <Stat
                label="Qty Rejected"
                value={item?.quantityRejected}
                highlight
              />
            )}

            <Stat label="Unit Price" value={`₹${item?.unitPrice}`} />
          </div>

          {/* Severity Indicator */}
          {item.isUnsatisfactory && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity Indicator</label>
              <Select
                value={form.severityIndicator}
                onValueChange={(value) =>
                  setForm((p) => ({ ...p, severityIndicator: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select severity Indicator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEVERITY_INDICATOR.MINOR}>
                    Minor Defect
                  </SelectItem>

                  <SelectItem value={SEVERITY_INDICATOR.MODERATE}>
                    Moderate Defect
                  </SelectItem>

                  <SelectItem value={SEVERITY_INDICATOR.SEVERE}>
                    Severe Defect
                  </SelectItem>

                  <SelectItem value={SEVERITY_INDICATOR.TOTAL_FAILURE}>
                    Cannot Use / Total Failure
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Buyer expectation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Buyer Expectation</label>
            <Select
              value={form.buyerExpectation}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  buyerExpectation: value,
                  refundQuantity: 0,
                  refundAmount: 0,
                  replacementQty: 0,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expectation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EXPECTATIONS.REFUND}>
                  Request Refund Amount
                </SelectItem>
                <SelectItem value={EXPECTATIONS.REPLACEMENT}>
                  Request Replacement
                </SelectItem>
                <SelectItem value={EXPECTATIONS.BOTH}>
                  Request Both (Refund + Replacement)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative my-6 grid grid-cols-2 gap-2">
            {isRefund && (
              <section className="rounded-sm border p-2">
                <h2 className="absolute top-[-10px] bg-white px-2 text-sm font-semibold">
                  Refund
                </h2>

                {/* Refund Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quantity</label>
                  <Input
                    type="number"
                    min={0}
                    max={maxQuantity}
                    value={form.refundQuantity}
                    onChange={(e) => handleRefundQtyChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max Quantity: {maxQuantity}
                  </p>
                </div>

                {/* Refund Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    max={form.refundQuantity * unitPrice}
                    value={form.refundAmount}
                    disabled={!form.refundQuantity}
                    onChange={(e) => handleRefundAmountChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Max Amount: ₹
                    {(form.refundQuantity * unitPrice).toLocaleString('en-IN')}
                  </p>
                </div>
              </section>
            )}

            {isReplacement && (
              <section className="rounded-sm border p-2">
                <h2 className="absolute top-[-10px] bg-white px-2 text-sm font-semibold">
                  Replacement
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Qty Expected</label>

                  <Input
                    type="number"
                    min={0}
                    max={item.maxQuantity}
                    value={form.replacementQty}
                    onChange={(e) => handleReplacementQtyChange(e.target.value)}
                  />

                  <p className="text-xs text-muted-foreground">
                    Max Quantity: {item.maxQuantity}
                  </p>
                </div>
              </section>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-lg bg-muted/40 p-4">
            {item?.cgstDetails && (
              <Stat
                label={`CGST (${cgstRate}%)`}
                value={`₹${cgst.toFixed(2)}`}
              />
            )}
            {item?.sgstDetails && (
              <Stat
                label={`SGST (${sgstRate}%)`}
                value={`₹${sgst.toFixed(2)}`}
              />
            )}
            {item?.igstDetails && (
              <Stat
                label={`IGST (${igstRate}%)`}
                value={`₹${igst.toFixed(2)}`}
              />
            )}
            <Stat
              label="Claimed Amount"
              value={`₹${totalClaimed.toFixed(2)}`}
              bold
            />
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Internal Remark</label>
            <Textarea
              value={form.internalRemark}
              onChange={(e) =>
                setForm((p) => ({ ...p, internalRemark: e.target.value }))
              }
              placeholder="Add internal remark"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="rounded-sm border-t bg-background px-4 py-3">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleSave}
            disabled={isSaveDisabled || updateDebitNoteMutation.isPending}
          >
            {updateDebitNoteMutation.isPending ? <Loading /> : 'Save Item'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Clear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Small helper ---------- */
const Stat = ({ label, value, highlight, bold }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p
      className={`text-sm ${
        highlight ? 'font-semibold text-orange-600' : ''
      } ${bold ? 'font-semibold' : ''}`}
    >
      {value}
    </p>
  </div>
);
