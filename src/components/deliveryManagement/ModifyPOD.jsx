'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modifyAndAcceptPOD } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { toast } from 'sonner';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { formattedAmount } from '@/appUtils/helperFunctions';
import { DeliveryResultDialog } from './DeliveryResultDialog';
import PINVerifyModal from '../invoices/PINVerifyModal';

export const ModifyPOD = ({ open, onOpenChange, data = [], podId }) => {
  const queryClient = useQueryClient();

  const [isOpenPinVerifyModal, setIsOpenPinVerifyModal] = useState(false);
  const [deliveryResultType, setDeliveryResultType] = useState(null);
  const [openDeliveryResult, setOpenDeliveryResult] = useState(false);
  const [isPINError, setIsPINError] = useState(false);

  const [remarks, setRemarks] = useState('');

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
      };
    }),
  );

  /* Derived Total */
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.acceptedQty, 0);
  }, [items]);

  /* Qty Change */
  const handleQtyChange = (index, value) => {
    const updated = [...items];
    const qty = Number(value);

    updated[index] = {
      ...updated[index],
      acceptedQty: qty < 0 ? 0 : qty,
    };

    setItems(updated);
  };

  /* Mutation */
  const modifyAndAcceptPODMutation = useMutation({
    mutationFn: modifyAndAcceptPOD,

    onSuccess: () => {
      toast.success('POD modified and accepted successfully');

      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getPOD.endpoint],
      });

      setDeliveryResultType('MODIFY');
      setOpenDeliveryResult(true);
      onOpenChange(false);
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
      setIsPINError(true);
    },
  });

  /* Submit */
  const handleModifyAndAcceptPODs = () => {
    setIsOpenPinVerifyModal(false);

    modifyAndAcceptPODMutation.mutate({
      podId,
      data: {
        updateData: {
          receiverRemarks: remarks.trim(),
          items: items.map((item) => ({
            dispatchNoteItemId: item.dispatchNoteItemId,
            acceptQuantity: item.acceptedQty,
            rejectQuantity: item.deliveredQty - item.acceptedQty,
            amount: item.price * item.acceptedQty,
          })),
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0">
        {/* Header */}
        <DialogHeader className="border-b p-4">
          <DialogTitle className="text-lg font-semibold">
            Modify Quantities
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adjust the accepted quantities for each item below.
          </p>
        </DialogHeader>

        {/* Items Table */}
        <div className="p-4">
          <div className="rounded-sm border">
            <div className="flex items-center gap-2 border-b p-4 font-semibold">
              <Package size={18} />
              Items Delivered
            </div>

            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left">
                <tr>
                  <th className="p-3">Sr.</th>
                  <th className="p-3">SKU ID</th>
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Qty Accepted</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={item.dispatchNoteItemId} className="border-t">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">{item.skuId}</td>
                    <td className="p-3 font-medium">{item.itemName}</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        className="w-20"
                        min={0}
                        max={item.deliveredQty}
                        value={item.acceptedQty}
                        onChange={(e) => handleQtyChange(index, e.target.value)}
                      />
                    </td>
                    <td className="p-3">₹{item.price}</td>
                    <td className="p-3 text-right font-semibold">
                      ₹{(item.price * item.acceptedQty).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex items-center justify-end gap-2 border-t p-4 text-sm">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-lg font-bold text-primary">
                {formattedAmount(totalAmount)}
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium">
              Remarks (Optional)
            </label>
            <Textarea
              placeholder="Add any remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t p-6">
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
