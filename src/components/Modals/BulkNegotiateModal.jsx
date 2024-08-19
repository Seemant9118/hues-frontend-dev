'use client';

import { orderApi } from '@/api/order_api/order_api';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocalStorageService } from '@/lib/utils';
import { createBulkNegotiaion } from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const BulkNegotiateModal = ({ orderDetails }) => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const isBid = pathName.includes('purchase-orders');
  const userId = LocalStorageService.get('user_profile');

  const [open, setOpen] = useState(false);
  const [bulkNegotiateOrder, setBulkNegotiateOrder] = useState([]);

  const createBulkNegotiationMutation = useMutation({
    mutationKey: orderApi.createBulkNegotiation.endpointKey,
    mutationFn: createBulkNegotiaion,
    onSuccess: () => {
      toast.success('Negotiation submitted Successfully');
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setOpen(false);
      setBulkNegotiateOrder([]);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedOrder = [...bulkNegotiateOrder];
    updatedOrder[index] = {
      ...updatedOrder[index],
      orderId: orderDetails?.orderItems?.[index]?.orderId,
      orderItemId: orderDetails?.orderItems?.[index]?.id,
      priceType: isBid ? 'BID' : 'OFFER',
      createdBy: userId,
      date: moment(new Date()).format('DD/MM/YYYY'),
      status: isBid ? 'BID_SUBMITTED' : 'OFFER_SUBMITTED',
      [name]: Number(value), // update the specific field (quantity or price)
      price: null,
    };
    setBulkNegotiateOrder(updatedOrder);
  };

  const extractData = () => {
    return {
      negotiations: bulkNegotiateOrder.map((item) => ({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        priceType: item.priceType,
        createdBy: item.createdBy,
        date: item.date,
        status: item.status,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        price: item.quantity * item.unitPrice,
      })),
    };
  };

  const handleSubmit = () => {
    const printedExtractedData = extractData();
    createBulkNegotiationMutation.mutate(printedExtractedData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open);
        setBulkNegotiateOrder([]);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-32 bg-[#F8BA05] text-white hover:bg-[#F8BA051A] hover:text-[#F8BA05]">
          Negotiate
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-w-2xl flex-col items-center justify-center gap-5">
        <DialogTitle>
          <span className="text-[#F8BA05]">Negotiation</span>
        </DialogTitle>

        <div className="grid w-full grid-cols-4 grid-rows-2 border border-black">
          {/* Header Row */}
          <div className="col-span-1 row-span-2 flex items-center justify-center border border-black p-2 text-2xl font-bold">
            Item
          </div>
          <div className="col-span-1 flex items-center justify-center border border-black p-2 font-bold">
            Qty
          </div>
          <div className="col-span-1 flex items-center justify-center border border-black p-2 font-bold">
            Rate
          </div>
          <div className="col-span-1 flex items-center justify-center border border-black p-2 font-bold">
            Total
          </div>

          {/* Subheader */}
          <div className="col-span-1 grid grid-cols-2 gap-2 border border-black">
            <div className="flex items-center justify-center p-1 font-bold">
              Ask
            </div>
            <div className="flex items-center justify-center p-1 font-bold">
              Counter
            </div>
          </div>
          <div className="col-span-1 grid grid-cols-2 gap-2 border border-black">
            <div className="flex items-center justify-center p-1 font-bold">
              Ask
            </div>
            <div className="flex items-center justify-center p-1 font-bold">
              Counter
            </div>
          </div>
          <div className="col-span-1 grid grid-cols-2 gap-2 border border-black">
            <div className="flex items-center justify-center p-1 font-bold">
              Ask
            </div>
            <div className="flex items-center justify-center p-1 font-bold">
              Counter
            </div>
          </div>

          {/* Data Rows */}
          {orderDetails?.orderItems?.map((item, index) => (
            <div key={item.id} className="col-span-4 grid grid-cols-4">
              <div className="flex items-center justify-center border border-black p-2 text-center">
                {item.productDetails.productName ??
                  item.productDetails.serviceName}
              </div>
              <div className="grid grid-cols-2 border border-black">
                <div className="flex items-center justify-center p-1">
                  {item?.negotiation
                    ? item?.negotiation?.quantity
                    : item?.quantity}
                </div>
                <div className="flex items-center justify-center p-1">
                  <Input
                    type="number"
                    name="quantity"
                    placeholder="Qty."
                    value={bulkNegotiateOrder?.[index]?.quantity || ''}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 border border-black">
                <div className="flex items-center justify-center p-1">
                  {item?.negotiation
                    ? item?.negotiation?.unitPrice
                    : item?.unitPrice}
                </div>
                <div className="flex items-center justify-center p-1">
                  <Input
                    type="number"
                    name="unitPrice"
                    placeholder="Rate"
                    value={bulkNegotiateOrder?.[index]?.unitPrice || ''}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 border border-black">
                <div className="flex items-center justify-center p-1">
                  {item?.negotiation
                    ? item?.negotiation?.price
                    : item.totalAmount}
                </div>
                <div className="flex items-center justify-center p-1">
                  {Number(bulkNegotiateOrder?.[index]?.quantity) *
                    Number(bulkNegotiateOrder?.[index]?.unitPrice) || 0}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex w-full justify-end gap-2">
          <Button
            variant="outline"
            className="w-32"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="w-32 bg-green-500 text-white hover:bg-green-700"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkNegotiateModal;
