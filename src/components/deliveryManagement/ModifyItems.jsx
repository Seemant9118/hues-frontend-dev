'use client';

import { Package } from 'lucide-react';
import { useMemo, useState } from 'react';

import { formattedAmount } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import RemarkBox from '../remarks/RemarkBox';
import { Label } from '../ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import InfoBanner from '../auth/InfoBanner';

export default function ModifyQuantityDialog({
  open,
  onOpenChange,

  title = 'Modify Quantities',
  description = 'Adjust the accepted quantities for each item below.',
  tableTitle = 'Items Delivered',

  confirmText = 'Confirm Changes',
  cancelText = 'Cancel',

  showInput = true,
  deliveryChallan,
  setDeliveryChallan,
  dcIdLabel = 'Delivery Challan No.',
  dcIdLabelPlaceholder = 'Enter Delivery Challan No.',

  ewb,
  setEwb,
  ewbLabel = 'E-way bill No.',
  ewbPlaceholder = 'Enter E-way bill No.',

  items = [],
  setItems,

  showRemarks = true,
  remarks,
  setRemarks,

  // Events
  onConfirm,
  onCancel,

  isConfirmDisabled = false,

  footerRightSlot = null,
}) {
  // Block submit if no item was modified
  const [submitError, setSubmitError] = useState('');

  const hasAnyItemChanged = useMemo(() => {
    return items.some((item) => Number(item.dispatchQuantity || 0) > 0);
  }, [items]);

  // Totals (Gross + GST)
  const totals = useMemo(() => {
    const totalAmount = items.reduce(
      (sum, item) =>
        sum + Number(item.unitPrice || 0) * Number(item.acceptedQty || 0),
      0,
    );

    const totalGstAmount = items.reduce(
      (sum, item) =>
        sum + Number(item.gstPerUnit || 0) * Number(item.acceptedQty || 0),
      0,
    );

    return {
      totalAmount,
      totalGstAmount,
      grandTotal: totalAmount + totalGstAmount,
    };
  }, [items]);

  // Dispatch Qty change (max = remaining qty)
  const updateDispatchQty = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const remainingQty = Number(item.quantity || 0);

        const dispatchQty = Math.max(
          0,
          Math.min(Number(value) || 0, remainingQty),
        );

        // accepted cannot exceed dispatch
        const acceptedQty = Math.min(
          Number(item.acceptedQty || 0),
          dispatchQty,
        );

        return {
          ...item,
          dispatchQuantity: dispatchQty,
          acceptedQty,
          rejectedQty: dispatchQty - acceptedQty,
        };
      }),
    );
  };

  // Accepted Qty change (max = dispatch qty)
  const updateAcceptedQty = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const dispatchQty = Number(item.dispatchQuantity || 0);
        const acceptedQty = Math.max(
          0,
          Math.min(Number(value) || 0, dispatchQty),
        );

        return {
          ...item,
          acceptedQty,
          rejectedQty: dispatchQty - acceptedQty,
        };
      }),
    );
  };

  // Confirm
  const handleConfirm = () => {
    if (!hasAnyItemChanged) {
      setSubmitError(
        'Please modify at least one item quantity before submitting.',
      );
      return;
    }

    setSubmitError('');
    onConfirm?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>

          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}

          {/* Input : DC and EWB (Always visible even if items are empty) */}
          {showInput && (
            <div className="flex gap-2 pt-5">
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Label>{dcIdLabel}</Label>
                </div>

                <Input
                  value={deliveryChallan || ''}
                  placeholder={dcIdLabelPlaceholder}
                  onChange={(e) => {
                    setDeliveryChallan?.(e.target.value);
                  }}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Label>{ewbLabel}</Label>
                </div>

                <Input
                  value={ewb || ''}
                  placeholder={ewbPlaceholder}
                  onChange={(e) => {
                    setEwb?.(e.target.value);
                  }}
                />
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="scrollBarStyles flex-1 overflow-auto p-2">
          {/* Empty State */}
          {items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-sm border bg-muted/30 p-6 text-center">
              <Package size={22} className="text-muted-foreground" />
              <p className="text-sm font-semibold">
                No items available to dispatch
              </p>
              <p className="text-xs text-muted-foreground">
                All items are already dispatched or there are no remaining
                quantities.
              </p>
            </div>
          ) : (
            <div className="rounded-sm border">
              <div className="flex items-center gap-2 border-b p-4 font-semibold">
                <Package size={18} />
                {tableTitle}
              </div>

              <Table className="w-full text-sm">
                <TableHeader className="sticky top-0 bg-muted/40 text-left">
                  <TableRow>
                    <TableHead className="p-3">SKU ID</TableHead>
                    <TableHead className="p-3">Item Name</TableHead>
                    <TableHead className="p-3">Invoice Qty</TableHead>
                    <TableHead className="p-3">Remaining Qty</TableHead>
                    <TableHead className="p-3">Dispatch Qty</TableHead>
                    <TableHead className="p-3">Qty Received</TableHead>
                    {/* <TableHead className="p-3">Qty Rejected</TableHead> */}
                    <TableHead className="p-3">Price</TableHead>
                    <TableHead className="p-3 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={item.id || index} className="border-t">
                      <TableCell className="p-3">{item.skuId}</TableCell>
                      <TableCell className="p-3 font-medium">
                        {item.itemName}
                      </TableCell>

                      <TableCell className="p-3 font-medium">
                        {item.invoiceQty}
                      </TableCell>

                      <TableCell className="p-3 font-medium">
                        {item.quantity}
                      </TableCell>

                      {/* Dispatch Qty input */}
                      <TableCell className="p-3 font-medium">
                        <div className="flex flex-col gap-1">
                          <Input
                            type="number"
                            className="w-20 text-center"
                            min={0}
                            max={item.quantity}
                            value={item.dispatchQuantity}
                            onChange={(e) =>
                              updateDispatchQty(index, e.target.value)
                            }
                          />

                          <p className="text-center text-xs text-muted-foreground">
                            Dispatched: {item.dispatchQuantity} /{' '}
                            {item.quantity}
                          </p>
                        </div>
                      </TableCell>

                      {/* Accepted Qty input */}
                      <TableCell className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            debounceTime={0}
                            disabled={item.acceptedQty <= 0}
                            onClick={() =>
                              updateAcceptedQty(index, item.acceptedQty - 1)
                            }
                          >
                            −
                          </Button>

                          <Input
                            type="number"
                            className="w-20 text-center"
                            min={0}
                            max={item.dispatchQuantity}
                            value={item.acceptedQty}
                            onChange={(e) =>
                              updateAcceptedQty(index, e.target.value)
                            }
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            debounceTime={0}
                            disabled={item.acceptedQty >= item.dispatchQuantity}
                            onClick={() =>
                              updateAcceptedQty(index, item.acceptedQty + 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>

                      {/* Rejected Qty */}
                      {/* <TableCell className="p-3">
                        <Input
                          type="number"
                          className="w-20 text-center"
                          value={item.rejectedQty}
                          disabled
                        />
                      </TableCell> */}

                      <TableCell className="p-3">₹{item.unitPrice}</TableCell>

                      <TableCell className="p-3 text-right font-semibold">
                        ₹
                        {(
                          Number(item.unitPrice || 0) *
                          Number(item.acceptedQty || 0)
                        ).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Total */}
              <div className="flex items-center justify-end gap-2 border-t p-4 text-sm">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-primary">
                  {formattedAmount(totals.grandTotal)}
                </span>
              </div>
            </div>
          )}

          {/* Remarks + Attachments */}
          {showRemarks && (
            <RemarkBox
              remarks={remarks}
              setRemarks={setRemarks}
              isAttachmentDisabled={true}
            />
          )}
        </div>

        {submitError && (
          <InfoBanner text={submitError} showSupportLink={false} />
        )}

        {/* Footer */}
        <DialogFooter className="border-t p-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {cancelText}
          </Button>

          <div className="flex items-center gap-2">
            {footerRightSlot}
            <Button
              size="sm"
              disabled={isConfirmDisabled || !hasAnyItemChanged}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
