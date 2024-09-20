import { orderApi } from '@/api/order_api/order_api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocalStorageService } from '@/lib/utils';
import {
  createBulkNegotiaion,
  GetNegotiationDetails,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, History } from 'lucide-react';
import moment from 'moment';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Wrapper from '../wrappers/Wrapper';
import Loading from '../ui/Loading';

const NegotiationComponent = ({
  orderDetails,
  isNegotiation,
  setIsNegotiation,
}) => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const isBid = pathName.includes('purchase-orders');
  const pageIsSales = pathName.includes('sales-orders');
  const userId = LocalStorageService.get('user_profile');
  const [bulkNegotiateOrder, setBulkNegotiateOrder] = useState([]);
  const [historyVisible, setHistoryVisible] = useState({});
  const [negotiationDetails, setNegotiationDetails] = useState([]);

  //  fetch negotiationDetails
  const getNegotiationDetailsMutation = useMutation({
    mutationKey: [orderApi.getNegotiationDetails.endpointKey],
    mutationFn: GetNegotiationDetails,
    onSuccess: (data) => {
      setNegotiationDetails(data?.data?.data);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong!');
    },
  });

  // create bulkNegotiation
  const createBulkNegotiationMutation = useMutation({
    mutationKey: orderApi.createBulkNegotiation.endpointKey,
    mutationFn: createBulkNegotiaion,
    onSuccess: () => {
      toast.success('Negotiation submitted successfully');
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setBulkNegotiateOrder([]);
      setIsNegotiation(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    const updatedOrder = [...bulkNegotiateOrder];
    const orderItem = orderDetails?.orderItems?.[index];

    updatedOrder[index] = {
      ...updatedOrder[index],
      orderId: orderItem?.orderId,
      orderItemId: orderItem?.id,
      priceType: isBid ? 'BID' : 'OFFER',
      createdBy: userId,
      date: moment(new Date()).format('DD/MM/YYYY'),
      status: isBid ? 'BID_SUBMITTED' : 'OFFER_SUBMITTED',
      [field]: Number(value),
    };

    const quantity = updatedOrder[index]?.quantity || 0;
    const unitPrice = updatedOrder[index]?.unitPrice || 0;
    updatedOrder[index].totalAmount = (quantity * unitPrice).toFixed(2);

    setBulkNegotiateOrder(updatedOrder);
  };

  const extractData = () => {
    const filteredOrders = bulkNegotiateOrder.filter(
      (item) => item && item.quantity && item.unitPrice,
    );

    return {
      negotiations: filteredOrders.map((item) => ({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        priceType: item.priceType,
        createdBy: item.createdBy,
        date: item.date,
        status: item.status,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        price: (item.quantity * item.unitPrice).toFixed(2),
      })),
    };
  };

  const toggleHistory = (index, itemData) => {
    setHistoryVisible((prev) => ({
      [index]: !prev[index], // This ensures that only one row's history is visible at a time
    }));

    // Fetch negotiation details when the history is toggled open
    if (!historyVisible[index]) {
      setNegotiationDetails([]); // Clear the details to trigger loading state
      getNegotiationDetailsMutation.mutate({
        orderId: itemData.orderId,
        itemId: itemData.id,
      });
    }
  };

  const handleSubmit = () => {
    const extractedData = extractData();
    if (extractedData.negotiations.length === 0) {
      toast.error('Please fill in at least one negotiation item.');
      return;
    }
    createBulkNegotiationMutation.mutate(extractedData);
  };

  return (
    <Wrapper className="relative">
      <Table>
        <TableHeader>
          {/* Main Header Row */}
          <TableRow>
            <TableHead
              colSpan={2}
              className="shrink-0 text-xs font-bold text-black"
            >
              ITEM
            </TableHead>
            <TableHead
              colSpan={2}
              className="shrink-0 text-center text-xs font-bold text-black"
            >
              QUANTITY
            </TableHead>
            <TableHead
              colSpan={2}
              className="shrink-0 text-center text-xs font-bold text-black"
            >
              RATE
            </TableHead>
            <TableHead
              colSpan={2}
              className="shrink-0 text-center text-xs font-bold text-black"
            >
              TOTAL
            </TableHead>
            <TableHead></TableHead>
          </TableRow>

          {/* Sub Header Row */}
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              ASK
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              COUNTER
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              ASK
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              COUNTER
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              ASK
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              COUNTER
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="shrink-0">
          {orderDetails?.orderItems?.map((item, index) => (
            <React.Fragment key={item?.id}>
              <TableRow>
                <TableCell colSpan={1}>
                  {item?.productDetails?.productName ??
                    item?.productDetails?.serviceName}
                </TableCell>
                <TableCell colSpan={1}></TableCell>
                <TableCell colSpan={1} className="text-center">
                  {item?.negotiation?.quantity ?? item?.quantity}
                </TableCell>
                <TableCell colSpan={1} className="flex justify-center">
                  <Input
                    className="w-24"
                    type="number"
                    placeholder="0"
                    value={bulkNegotiateOrder?.[index]?.quantity || ''}
                    onChange={(e) => handleChange(e, index, 'quantity')}
                  />
                </TableCell>
                <TableCell colSpan={1} className="text-center">
                  {item?.negotiation?.unitPrice ?? item?.unitPrice}
                </TableCell>
                <TableCell colSpan={1} className="flex justify-center">
                  <Input
                    className="w-24"
                    type="number"
                    placeholder="0"
                    value={bulkNegotiateOrder?.[index]?.unitPrice || ''}
                    onChange={(e) => handleChange(e, index, 'unitPrice')}
                  />
                </TableCell>
                <TableCell colSpan={1} className="text-center">
                  {item?.negotiation?.price?.toFixed(2) ??
                    item?.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell colSpan={1} className="flex justify-center">
                  <Input
                    className="w-24"
                    type="number"
                    placeholder="0"
                    value={bulkNegotiateOrder?.[index]?.totalAmount || ''}
                    readOnly
                    disabled
                  />
                </TableCell>
                <TableCell colSpan={1}>
                  <History
                    className={
                      historyVisible[index]
                        ? 'cursor-pointer text-blue-900'
                        : 'cursor-pointer text-gray-500 hover:text-blue-900'
                    }
                    onClick={() => toggleHistory(index, item)}
                  />
                </TableCell>
              </TableRow>

              {/* Loading state */}
              {historyVisible[index] &&
                getNegotiationDetailsMutation.isPending && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center">
                      <Loading />
                    </TableCell>
                  </TableRow>
                )}

              {/* DATA: Conditionally show history below each row */}
              {historyVisible[index] &&
                !getNegotiationDetailsMutation.isPending &&
                negotiationDetails.length > 0 &&
                negotiationDetails
                  ?.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                  )
                  ?.map((negoData) => (
                    <TableRow
                      key={negoData.id}
                      className="animate-fadeInUp text-xs font-semibold"
                    >
                      <TableCell colSpan={1}>
                        {pageIsSales &&
                          (negoData?.status === 'OFFER_SUBMITTED' ? (
                            <div className="flex w-32 items-center justify-center rounded-md bg-green-600 p-2 text-center text-white">
                              YOU
                            </div>
                          ) : (
                            <div className="w-32 rounded-md bg-yellow-500 p-2 text-center text-white">
                              BUYER
                            </div>
                          ))}

                        {!pageIsSales &&
                          (negoData?.status === 'BID_SUBMITTED' ? (
                            <div className="flex w-32 items-center justify-center rounded-md bg-green-600 p-2 text-center text-white">
                              YOU
                            </div>
                          ) : (
                            <div className="w-32 rounded-md bg-yellow-500 p-2 text-center text-white">
                              SELLER
                            </div>
                          ))}
                      </TableCell>
                      <TableCell colSpan={2}>
                        <div className="flex items-center justify-center gap-1 text-blue-400">
                          <Clock size={14} />
                          {moment(negoData?.createdAt).format(
                            'h:mm A | D MMM, YYYY',
                          )}
                        </div>
                      </TableCell>
                      <TableCell colSpan={2}>{negoData?.quantity}</TableCell>
                      <TableCell colSpan={2}>{negoData?.unitPrice}</TableCell>
                      <TableCell
                        colSpan={2}
                      >{`₹ ${negoData?.price.toFixed(2)}`}</TableCell>
                    </TableRow>
                  ))}

              {/* PLaceholder Text: If no history is available, show a text */}
              {historyVisible[index] &&
                !getNegotiationDetailsMutation.isPending &&
                negotiationDetails.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="border">
                      <div className="bg-gray-100 p-4">
                        <h4 className="font-semibold">
                          History for {item?.productDetails?.productName}
                        </h4>
                        <p>There is no negotiation history for this item.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

      <div className="mt-auto h-[1px] bg-neutral-300"></div>

      {isNegotiation && (
        <div className="sticky bottom-0 z-10 flex justify-end">
          <section className="flex gap-2">
            <Button
              variant="outline"
              className="w-32"
              size="sm"
              onClick={() => setIsNegotiation(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
              size="sm"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </section>
        </div>
      )}
    </Wrapper>
  );
};

export default NegotiationComponent;
