'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
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
import { modifyAndAcceptPOD } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PINVerifyModal from '../invoices/PINVerifyModal';
import RemarkBox from '../remarks/RemarkBox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { DeliveryResultDialog } from './DeliveryResultDialog';

export const ModifyPOD = ({ open, onOpenChange, data = [], podId, type }) => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const [isOpenPinVerifyModal, setIsOpenPinVerifyModal] = useState(false);
  const [deliveryResultType, setDeliveryResultType] = useState(null);
  const [openDeliveryResult, setOpenDeliveryResult] = useState(false);
  const [isPINError, setIsPINError] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);

  /* Normalize API Data */
  const [items, setItems] = useState(
    data.map((item) => {
      const product = item.metaData?.productDetails || {};

      const deliveredQty =
        (item.acceptQuantity || 0) + (item.rejectQuantity || 0);

      return {
        id: item.id,
        dispatchNoteItemId: item.dispatchNoteItemId,
        skuId: product.skuId,
        itemName: product.productName,
        price: Number(product.salesPrice || 0),
        deliveredQty,
        acceptedQty: item.acceptQuantity || 0,
        rejectedQty: item.rejectQuantity || 0,
      };
    }),
  );

  const updateItemQty = (index, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const accepted = Math.max(
          0,
          Math.min(Number(value) || 0, item.deliveredQty),
        );
        return {
          ...item,
          acceptedQty: accepted,
          rejectedQty: item.deliveredQty - accepted, // auto-calculate
        };
      }),
    );
  };

  /* Derived Total */
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.acceptedQty, 0);
  }, [items]);

  /* Mutation - modify and accept (Buyer) */
  const modifyAndAcceptPODMutation = useMutation({
    mutationFn: modifyAndAcceptPOD,

    onSuccess: (data) => {
      setIsOpenPinVerifyModal(false);
      if (type === 'MARK_AS_DELIVERED') {
        toast.success('Marked as Delivered successfully');

        queryClient.invalidateQueries([deliveryProcess.getPODbyId.endpointKey]);
      } else {
        toast.success('POD modified and accepted successfully');
        router.push(`/dashboard/transport/grn/${data?.data?.data?.grn?.id}`);

        setDeliveryResultType('MODIFY');
        setOpenDeliveryResult(true);
      }

      onOpenChange(false);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
      setIsPINError(true);
    },
  });

  /* Submit */
  const handleModifyAndAcceptPODs = (data) => {
    const formData = new FormData();

    // primitive fields
    formData.append('pin', data.pin);
    formData.append('receiverRemarks', remarks?.trim() || '');
    formData.append('isSellerEnterprise', String(type === 'MARK_AS_DELIVERED'));

    // items as JSON array
    const itemsPayload = items.map((item) => ({
      dispatchNoteItemId: item.dispatchNoteItemId,
      acceptQuantity: item.acceptedQty,
      rejectQuantity: item.deliveredQty - item.acceptedQty,
      amount: item.price * item.acceptedQty,
    }));

    formData.append('items', JSON.stringify(itemsPayload));

    // files
    if (attachedFiles?.length) {
      attachedFiles.forEach((file) => {
        formData.append('files', file);
      });
    }

    modifyAndAcceptPODMutation.mutate({
      podId,
      data: formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-4xl flex-col p-0">
        {/* Header */}
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg font-semibold">
            Modify Quantities
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the accepted quantities for each item below.
          </p>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="scrollBarStyles flex-1 overflow-auto p-2">
          {/* Items Table */}
          <div className="rounded-sm border">
            <div className="flex items-center gap-2 border-b p-4 font-semibold">
              <Package size={18} />
              Items Delivered
            </div>

            <Table className="w-full text-sm">
              <TableHeader className="sticky top-0 bg-muted/40 text-left">
                <TableRow>
                  <TableHead className="p-3">Sr.</TableHead>
                  <TableHead className="p-3">SKU ID</TableHead>
                  <TableHead className="p-3">Item Name</TableHead>
                  <TableHead className="p-3">Qty Recieved</TableHead>
                  <TableHead className="p-3">Qty Accepted</TableHead>
                  <TableHead className="p-3">Qty Rejected</TableHead>
                  <TableHead className="p-3">Price</TableHead>
                  <TableHead className="p-3 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.dispatchNoteItemId} className="border-t">
                    <TableCell className="p-3">{index + 1}</TableCell>
                    <TableCell className="p-3">{item.skuId}</TableCell>
                    <TableCell className="p-3 font-medium">
                      {item.itemName}
                    </TableCell>
                    <TableCell className="p-3 font-medium">
                      {item.deliveredQty}
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          debounceTime={0}
                          disabled={item.acceptedQty <= 0}
                          onClick={() =>
                            updateItemQty(index, item.acceptedQty - 1)
                          }
                        >
                          −
                        </Button>

                        <Input
                          type="number"
                          className="w-20 text-center"
                          min={0}
                          max={item.deliveredQty}
                          value={item.acceptedQty}
                          onChange={(e) => updateItemQty(index, e.target.value)}
                        />

                        <Button
                          variant="outline"
                          size="sm"
                          debounceTime={0}
                          disabled={item.acceptedQty >= item.deliveredQty}
                          onClick={() =>
                            updateItemQty(index, item.acceptedQty + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="p-3">
                      <Input
                        type="number"
                        className="w-20 text-center"
                        value={item.rejectedQty}
                        disabled
                      />
                    </TableCell>

                    <TableCell className="p-3">₹{item.price}</TableCell>
                    <TableCell className="p-3 text-right font-semibold">
                      ₹{(item.price * item.acceptedQty).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Total */}
            <div className="flex items-center justify-end gap-2 border-t p-4 text-sm">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                {formattedAmount(totalAmount)}
              </span>
            </div>
          </div>

          {/* remarks with attachments */}
          <RemarkBox
            remarks={remarks}
            setRemarks={setRemarks}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={() => setIsOpenPinVerifyModal(true)}>
            Confirm Changes
          </Button>
        </DialogFooter>

        {/* PIN Modal */}
        {isOpenPinVerifyModal && (
          <PINVerifyModal
            open={isOpenPinVerifyModal}
            setOpen={setIsOpenPinVerifyModal}
            order={items}
            handleCreateFn={handleModifyAndAcceptPODs}
            isPINError={isPINError}
            setIsPINError={setIsPINError}
          />
        )}

        {/* Result Dialog */}
        <DeliveryResultDialog
          open={openDeliveryResult}
          type={deliveryResultType}
          onClose={() => {
            setOpenDeliveryResult(false);
            setDeliveryResultType(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
