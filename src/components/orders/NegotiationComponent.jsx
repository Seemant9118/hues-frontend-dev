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
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import Wrapper from '../wrappers/Wrapper';
import ConditionalRenderingStatus from './ConditionalRenderingStatus';
import OrdersOverview from './OrdersOverview';

const NegotiationComponent = ({
  orderDetails,
  isNegotiation,
  setIsNegotiation,
}) => {
  const translations = useTranslations('components.negotiation_component');

  const queryClient = useQueryClient();
  const pathName = usePathname();
  const isBid = pathName.includes('purchase-orders');
  const pageIsSales = pathName.includes('sales-orders');
  const userId = LocalStorageService.get('user_profile');
  const [bulkNegotiateOrder, setBulkNegotiateOrder] = useState([]);
  const [historyVisible, setHistoryVisible] = useState({});
  const [negotiationDetails, setNegotiationDetails] = useState([]);
  // Initialize bulkNegotiateOrder state
  useEffect(() => {
    if (orderDetails?.orderItems) {
      const initialOrders = orderDetails.orderItems.map((item) => ({
        orderId: item.orderId,
        orderItemId: item.id,
        priceType: isBid ? 'BID' : 'OFFER',
        createdBy: userId,
        date: moment(new Date()).format('DD/MM/YYYY'),
        status: isBid ? 'BID_SUBMITTED' : 'OFFER_SUBMITTED',
        quantity: item?.negotiation?.quantity ?? item?.quantity,
        unitPrice: item?.negotiation?.unitPrice ?? item?.unitPrice,
        totalAmount: (
          (item?.negotiation?.quantity ?? item.quantity) *
          (item?.negotiation?.unitPrice ?? item.unitPrice)
        ).toFixed(2),
      }));
      setBulkNegotiateOrder(initialOrders);
    }
  }, [orderDetails]);

  // Fetch negotiationDetails
  const getNegotiationDetailsMutation = useMutation({
    mutationKey: [orderApi.getNegotiationDetails.endpointKey],
    mutationFn: GetNegotiationDetails,
    onSuccess: (data) => {
      setNegotiationDetails(data?.data?.data);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  // Create bulkNegotiation
  const createBulkNegotiationMutation = useMutation({
    mutationKey: [orderApi.createBulkNegotiation.endpointKey],
    mutationFn: createBulkNegotiaion,
    onSuccess: () => {
      toast.success(translations('successMsg.negotiation_submitted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setBulkNegotiateOrder([]);
      setIsNegotiation(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    const updatedOrder = [...bulkNegotiateOrder];

    updatedOrder[index] = {
      ...updatedOrder[index],
      [field]: Number(value),
    };

    const quantity = updatedOrder[index]?.quantity || 0;
    const unitPrice = updatedOrder[index]?.unitPrice || 0;
    updatedOrder[index].totalAmount = (quantity * unitPrice).toFixed(2);

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
        price: (item.quantity * item.unitPrice).toFixed(2),
      })),
    };
  };

  const toggleHistory = (index, itemData) => {
    setHistoryVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    if (!historyVisible[index]) {
      setNegotiationDetails([]); // Clear details to trigger loading state
      getNegotiationDetailsMutation.mutate({
        orderId: itemData.orderId,
        itemId: itemData.id,
      });
    }
  };

  const handleSubmit = () => {
    const extractedData = extractData();
    if (extractedData.negotiations.length === 0) {
      toast.error(translations('errorMsg.empty'));
      return;
    }
    createBulkNegotiationMutation.mutate(extractedData);
  };

  // multiStatus components
  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus
        status={
          pageIsSales
            ? orderDetails?.metaData?.sellerData?.orderStatus
            : orderDetails?.metaData?.buyerData?.orderStatus
        }
      />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="h-full py-2">
      {/* Collapsable overview */}
      <OrdersOverview
        isCollapsableOverview={true}
        orderDetails={orderDetails}
        orderId={orderDetails?.referenceNumber}
        multiStatus={multiStatus}
        Name={isBid ? orderDetails?.vendorName : orderDetails?.clientName}
        mobileNumber={
          isBid ? orderDetails?.vendorMobileNumber : orderDetails?.mobileNumber
        }
        amtPaid={orderDetails?.amountPaid}
        totalAmount={orderDetails.amount + orderDetails.gstAmount}
      />
      <Table>
        <TableHeader>
          {/* Main Header Row */}
          <TableRow>
            <TableHead
              colSpan={2}
              className="shrink-0 text-xs font-bold text-black"
            >
              {translations('table.header.label.item')}
            </TableHead>
            <TableHead
              colSpan={2}
              className="shrink-0 text-center text-xs font-bold text-black"
            >
              {translations('table.header.label.quantity')}
            </TableHead>
            <TableHead
              colSpan={2}
              className="shrink-0 text-center text-xs font-bold text-black"
            >
              {translations('table.header.label.rate')}
            </TableHead>
            <TableHead
              colSpan={2}
              className="shrink-0 text-center text-xs font-bold text-black"
            >
              {translations('table.header.label.total')}
            </TableHead>
            <TableHead></TableHead>
          </TableRow>

          {/* Sub Header Row */}
          <TableRow>
            <TableHead></TableHead>
            <TableHead></TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              {translations('table.child_table.header.label.ask')}
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              {translations('table.child_table.header.label.counter')}
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              {translations('table.child_table.header.label.ask')}
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              {translations('table.child_table.header.label.counter')}
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              {translations('table.child_table.header.label.ask')}
            </TableHead>
            <TableHead className="text-center text-xs font-semibold text-blue-900">
              {translations('table.child_table.header.label.counter')}
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
                    value={bulkNegotiateOrder?.[index]?.quantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0) {
                        handleChange(e, index, 'quantity');
                      }
                    }}
                    min="0" // Prevents user from entering values less than 0
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
                    value={bulkNegotiateOrder?.[index]?.unitPrice}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 0) {
                        handleChange(e, index, 'unitPrice');
                      }
                    }}
                    min="0" // Restricting user from typing a value less than 0
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
                  <Tooltips
                    trigger={
                      <History
                        className={
                          historyVisible[index]
                            ? 'cursor-pointer text-blue-900'
                            : 'cursor-pointer text-gray-500 hover:text-blue-900'
                        }
                        onClick={() => toggleHistory(index, item)}
                      />
                    }
                    content={translations(
                      'table.column_actions.history.placeholder',
                    )}
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
                              {translations('table.column_actions.who.you')}
                            </div>
                          ) : (
                            <div className="w-32 rounded-md bg-yellow-500 p-2 text-center text-white">
                              {translations('table.column_actions.who.buyer')}
                            </div>
                          ))}

                        {!pageIsSales &&
                          (negoData?.status === 'BID_SUBMITTED' ? (
                            <div className="flex w-32 items-center justify-center rounded-md bg-green-600 p-2 text-center text-white">
                              {translations('table.column_actions.who.you')}
                            </div>
                          ) : (
                            <div className="w-32 rounded-md bg-yellow-500 p-2 text-center text-white">
                              {translations('table.column_actions.who.seller')}
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
                          {translations(
                            'table.column_actions.history.infoTitle',
                          )}
                          {item?.productDetails?.productName}
                        </h4>
                        <p>
                          {translations(
                            'table.column_actions.history.infoPara',
                          )}
                        </p>
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
              {translations('ctas.cancel')}
            </Button>
            <Button
              className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
              size="sm"
              onClick={handleSubmit}
              disabled={createBulkNegotiationMutation?.isPending}
            >
              {createBulkNegotiationMutation?.isPending ? (
                <Loading size={14} />
              ) : (
                translations('ctas.submit')
              )}
            </Button>
          </section>
        </div>
      )}
    </Wrapper>
  );
};

export default NegotiationComponent;
