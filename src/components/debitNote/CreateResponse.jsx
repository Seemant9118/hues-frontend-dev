import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import {
  convertSnakeToTitleCase,
  formattedAmount,
} from '@/appUtils/helperFunctions';
import { sellerResponseDebitNote } from '@/services/Debit_Note_Services/DebitNoteServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, MessageCircleX, Package, RefreshCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { DynamicTextInfo } from '../ui/dynamic-text-info';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const CreateResponse = ({ open, onOpenChange, data = [], id }) => {
  const queryClient = useQueryClient();
  const normalizeItems = (data = []) =>
    data.map((item) => {
      const product = item?.invoiceItem?.orderItemId?.productDetails || {};

      return {
        // Backend identifiers
        debitNoteItemId: item.id,
        invoiceItemId: item.invoiceItemId,

        // Pricing
        unitPrice: item.unitPrice,
        taxAmount: 0,
        amount: 0, // claimed amount
        maxAmount: item.maxAmount,

        // Quantities
        defectQty: item.refundQuantity + item.replacementQuantity, // max adjustable qty
        approvedQty:
          item?.metaData?.creditNoteDraftResponse?.approvedQuantity || 0,
        approvedAmount:
          item?.metaData?.creditNoteDraftResponse?.approvedAmount || 0,
        refundQuantity: item.refundQuantity,
        replacementQuantity: item.replacementQuantity,
        shortQty: item.shortQty,

        // Tax breakup
        cgstDetails: item.cgstDetails,
        sgstDetails: item.sgstDetails,
        igstDetails: item.igstDetails,

        // Status / expectations
        sellerResponse: item?.metaData?.creditNoteDraftResponse?.responseType,
        buyerExpectation: item.buyerExpectation, // REQUEST_REFUND | REQUEST_BOTH
        response: 'PENDING', // seller response (initial)
        remarks: item?.metaData?.internalRemark || '',

        // Product info (UI only)
        skuId: product.skuId,
        itemName: product.productName,
        issueType: item.isShortDelivery
          ? 'SHORT_QUANTITY'
          : item.isUnsatisfactory
            ? 'UNSATISFACTORY'
            : null,

        // UI state
        isSelected: false,
      };
    });

  /* Normalize API Data */
  const [items, setItems] = useState(() => normalizeItems(data));
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setItems(normalizeItems(data));
  }, [open, data]);

  const isAllSelected = items?.every((item) => item.isSelected);
  const toggleSelectAll = () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, isSelected: !isAllSelected })),
    );
  };
  const selectedItems = items.filter((i) => i.isSelected);
  const toggleItemSelection = (index) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isSelected: !item.isSelected } : item,
      ),
    );
  };

  const updateApprovedQty = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const approvedQty = Math.max(
          0,
          Math.min(Number(value) || 0, item.defectQty),
        );

        // Base amount (without tax)
        const approvedAmount = approvedQty * item.unitPrice;

        let taxAmount = 0;

        let { cgstDetails } = item;
        let { sgstDetails } = item;
        let { igstDetails } = item;

        // CGST
        if (cgstDetails?.rate) {
          const cgst = (approvedAmount * cgstDetails.rate) / 100;
          cgstDetails = { ...cgstDetails, amount: cgst };
          taxAmount += cgst;
        }

        // SGST
        if (sgstDetails?.rate) {
          const sgst = (approvedAmount * sgstDetails.rate) / 100;
          sgstDetails = { ...sgstDetails, amount: sgst };
          taxAmount += sgst;
        }

        // IGST
        if (igstDetails?.rate) {
          const igst = (approvedAmount * igstDetails.rate) / 100;
          igstDetails = { ...igstDetails, amount: igst };
          taxAmount += igst;
        }

        return {
          ...item,
          approvedQty,
          approvedAmount,
          taxAmount,
          cgstDetails,
          sgstDetails,
          igstDetails,
          // Optional UX rule
          response: approvedQty === 0 ? 'REJECT' : item.response,
        };
      }),
    );
  };

  const sellerResponseDebitNoteMutation = useMutation({
    mutationFn: sellerResponseDebitNote,
    onSuccess: () => {
      setErrorMsg(null);
      toast.success('Response added Successfully');

      queryClient.invalidateQueries({
        queryKey: [DebitNoteApi.getDebitNote.endpointKey],
      });

      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const buildCreditNotePayload = (itemsToSend, type) => {
    return {
      status: type || 'PENDING',
      approvedQuantity: itemsToSend.reduce((sum, i) => sum + i.approvedQty, 0),
      approvedAmount: itemsToSend.reduce((sum, i) => sum + i.approvedAmount, 0),
      taxAmount: itemsToSend.reduce((sum, i) => sum + i.taxAmount, 0),
      creditNoteItems: itemsToSend.map((item) => ({
        debitNoteItemId: item.debitNoteItemId,
        unitPrice: item.unitPrice,
        responseType: item.response,
        approvedQuantity: item.approvedQty,
        approvedAmount: item.approvedAmount,
        taxAmount: item.taxAmount,
        cgstDetails: item.cgstDetails,
        sgstDetails: item.sgstDetails,
        igstDetails: item.igstDetails,
        remarks: item.remarks,
      })),
    };
  };

  const applyBulkResponse = (type) => {
    let payloadToSend = null;

    setItems((prev) => {
      const updatedItems = prev.map((item) =>
        item.isSelected
          ? {
              ...item,
              response: type,
              approvedQty: type === 'REJECTED' ? 0 : item.approvedQty,
              approvedAmount:
                type === 'REJECTED' ? 0 : item.unitPrice * item.approvedQty,
            }
          : item,
      );

      const selected = updatedItems.filter((i) => i.isSelected);

      if (selected.length) {
        payloadToSend = buildCreditNotePayload(selected, type);
      }

      return updatedItems;
    });

    // API call
    if (payloadToSend) {
      sellerResponseDebitNoteMutation.mutate({ id, data: payloadToSend });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-6xl flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg font-semibold">
            Add Response
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the items to Add response as per your preference.
          </p>
          {errorMsg && <DynamicTextInfo variant="danger" title={errorMsg} />}
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="scrollBarStyles flex flex-col gap-6 overflow-auto p-2">
          {/* Items Table */}
          <div className="rounded-sm border">
            <div className="flex items-center gap-2 border-b p-4 font-semibold">
              <Package size={18} />
              Select Items
            </div>

            <Table className="w-full text-sm">
              <TableHeader className="sticky top-0 bg-muted/40 text-left">
                <TableRow>
                  <TableHead className="p-3">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="p-3">SKU ID</TableHead>
                  <TableHead className="p-3">Item Name</TableHead>
                  <TableHead className="p-3">Defects</TableHead>
                  <TableHead className="p-3">Seller Response</TableHead>
                  <TableHead className="p-3">Buyer Qty.</TableHead>
                  <TableHead className="p-3">Price</TableHead>
                  <TableHead className="p-3">Approved Qty.</TableHead>
                  <TableHead className="p-3">Approved Amount</TableHead>
                  <TableHead className="p-3">Buyer Expectation</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id} className="border-t">
                    <TableCell className="p-3">
                      <Checkbox
                        checked={item.isSelected}
                        onCheckedChange={() => {
                          toggleItemSelection(index);
                        }}
                        aria-label="Select all"
                      />
                    </TableCell>
                    <TableCell className="p-3">{item.skuId}</TableCell>
                    <TableCell className="p-3 font-medium">
                      {item.itemName}
                    </TableCell>
                    <TableCell className="p-3">
                      <ConditionalRenderingStatus
                        status={item.issueType}
                        isQC
                      />
                    </TableCell>
                    <TableCell>
                      {item?.sellerResponse ? (
                        <Badge
                          className={
                            item.sellerResponse === 'ACCEPTED'
                              ? 'border border-green-600 bg-green-100 text-green-700'
                              : item.sellerResponse === 'REJECTED'
                                ? 'border border-red-600 bg-red-100 text-red-700'
                                : 'border border-yellow-600 bg-yellow-100 text-yellow-700'
                          }
                        >
                          {item?.sellerResponse}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell className="p-3 font-medium">
                      {item.defectQty}
                    </TableCell>
                    <TableCell className="p-3">
                      {formattedAmount(item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="w-20"
                        disabled={item.response === 'REJECT'}
                        min={0}
                        max={item.defectQty}
                        value={item.approvedQty}
                        onChange={(e) =>
                          updateApprovedQty(index, e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell className="p-3">
                      {formattedAmount(item.approvedAmount)}
                    </TableCell>
                    <TableCell className="p-3">
                      {convertSnakeToTitleCase(item.buyerExpectation || '-')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-4">
          <div className="flex w-full items-center justify-between rounded-md border bg-muted/40 p-3">
            <span className="text-sm font-medium">
              {selectedItems.length} items selected
            </span>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-100 text-green-700 hover:bg-green-200"
                disabled={!selectedItems.length}
                onClick={() => applyBulkResponse('ACCEPTED')}
              >
                <CheckCircle size={14} /> Accept Full Claim
              </Button>

              <Button
                size="sm"
                disabled={!selectedItems.length}
                className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                onClick={() => applyBulkResponse('REPLACEMENT')}
              >
                <RefreshCcw size={14} /> Offer Replacement
              </Button>

              <Button
                size="sm"
                disabled={!selectedItems.length}
                className="bg-red-100 text-red-700 hover:bg-red-200"
                onClick={() => applyBulkResponse('REJECTED')}
              >
                <MessageCircleX size={14} /> Reject / Dispute
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateResponse;
