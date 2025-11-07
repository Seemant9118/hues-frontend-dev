'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  getProductCatalogue,
  getServiceCatalogue,
  getVendorProductCatalogue,
  getVendorServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  OrderDetails,
  updateOrder,
  updateOrderForUnrepliedSales,
} from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import InputWithSelect from '../ui/InputWithSelect';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const EditOrder = ({
  onCancel,
  cta,
  orderId,
  isEditingOrder,
  setIsOrderCreationSuccess,
}) => {
  const translations = useTranslations('components.create_edit_order');

  const queryClient = useQueryClient();
  const router = useRouter();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const [selectedItem, setSelectedItem] = useState({
    productName: '',
    productType: '',
    productId: '',
    quantity: null,
    unitId: null,
    unitPrice: null,
    gstPerUnit: null,
    totalAmount: null,
    totalGstAmount: null,
    negotiationStatus: 'NEW',
  });

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // fetch profileDetails API only for sales orders
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey, userId],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: Boolean(isEditingOrder && !isPurchasePage),
  });

  // for sales-order gst/non-gst check
  const isGstApplicableForSalesOrders =
    !isPurchasePage && Boolean(profileDetails?.enterpriseDetails?.gstNumber);

  // for purchase-orders gst/non-gst check
  const [
    isGstApplicableForPurchaseOrders,
    setIsGstApplicableForPurchaseOrders,
  ] = useState('');

  // Fetch order details✅
  const {
    isLoading,
    data: orderDetails,
    isSuccess: isOrderDetailsSuccess,
  } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, orderId],
    queryFn: () => OrderDetails(orderId),
    select: (data) => data.data.data,
  });

  useEffect(() => {
    setIsGstApplicableForPurchaseOrders(!!orderDetails?.vendorGstNumber);
  }, [isOrderDetailsSuccess]);

  //   formatted data we needed in table rendering
  const transformOrderItems = (orderItems) => {
    return orderItems?.map((item) => {
      const { productDetails } = item;
      return {
        id: item.id,
        gstPerUnit: item.gstPerUnit,
        productId: productDetails?.id ?? null, // Use null as default if undefined
        productName: productDetails?.productName || productDetails?.serviceName, // Use empty string as default if undefined
        productType: item.productType,
        quantity: item.quantity,
        unitId: item.unitId,
        totalAmount: item.totalAmount,
        totalGstAmount: item.totalGstAmount,
        unitPrice: item.unitPrice,
        version: item.version,
        negotiationStatus: item?.negotiationStatus || 'NEW',
        ...item,
      };
    });
  };

  const transformedItems = transformOrderItems(orderDetails?.orderItems);

  // Default order state
  const defaultOrder = {
    sellerEnterpriseId: enterpriseId,
    buyerId: orderDetails?.buyerId || '',
    gstAmount: orderDetails?.gstAmount || 0,
    amount: orderDetails?.amount || 0,
    orderType: orderDetails?.orderType || '',
    invoiceType: orderDetails?.invoiceType || '',
    version: orderDetails?.version,
    orderItems: transformedItems || [],
    deletedItems: [],
    negotiationStatus: orderDetails?.negotiationStatus,
  };

  const [order, setOrder] = useState(defaultOrder);

  // Ensure useState uses updated order details
  useEffect(() => {
    if (orderDetails) {
      const newOrder =
        orderDetails.orderType === 'SALES'
          ? {
              ...defaultOrder,
              buyerId: orderDetails.bueryId,
            }
          : {
              ...defaultOrder,
              sellerEnterpriseId: orderDetails.sellerEnterpriseId,
            };
      setOrder(newOrder);
    }
  }, [orderDetails]);

  // for calculations grossAmt,totalGstAmounts
  const handleSetTotalAmt = () => {
    const totalAmount = order?.orderItems?.reduce((totalAmt, orderItem) => {
      return totalAmt + orderItem.totalAmount;
    }, 0);

    const totalGstAmt = order?.orderItems?.reduce((totalGst, orderItem2) => {
      return (
        totalGst +
        (isGstApplicable(
          isPurchasePage
            ? isGstApplicableForPurchaseOrders
            : isGstApplicableForSalesOrders,
        )
          ? orderItem2.totalGstAmount
          : 0)
      );
    }, 0);

    return { totalAmount, totalGstAmt };
  };

  const handleCalculateGrossAmt = () => {
    const grossAmount = order?.orderItems?.reduce((acc, orderItem) => {
      return acc + orderItem.totalAmount;
    }, 0);
    return grossAmount;
  };
  const handleCalculateTotalAmounts = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    const totalAmountWithGST = totalAmount + totalGstAmt;
    return totalAmountWithGST;
  };

  const { totalGstAmt } = handleSetTotalAmt();

  useEffect(() => {
    handleSetTotalAmt();
    handleCalculateGrossAmt();
    handleCalculateTotalAmounts();
  }, [order]);

  // Update the order state when input values change
  const handleInputChange = (rowItem, key, newValue) => {
    setOrder((prev) => ({
      ...prev,
      orderItems: prev.orderItems.map((item) => {
        if (item.productId === rowItem.productId) {
          const updatedItem = {
            ...item,
            [key]: Number(newValue),
          };
          // Recalculate totalAmount using updated values
          updatedItem.totalAmount =
            updatedItem.quantity * updatedItem.unitPrice;

          // Recalculate totalGstAmount based on the updated totalAmount and gstPerUnit
          updatedItem.totalGstAmount = parseFloat(
            (updatedItem.totalAmount * (updatedItem.gstPerUnit / 100)).toFixed(
              2,
            ),
          );

          return updatedItem;
        }

        return item;
      }),
    }));
  };

  // [Client's Goods and Services]
  // client's catalogue's goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'GOODS',
  });
  // client's goods options
  const clientsGoodsOptions = goodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;

    return { value, label };
  });
  // client catalogue services fetching
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'SERVICE',
  });
  // client's services options
  const clientsServicesOptions = servicesData?.map((service) => {
    const value = {
      ...service,
      productType: 'SERVICE',
      productName: service.name,
    };
    const label = service.name;

    return { value, label };
  });
  // itemClientListingOptions on the basis of item type
  const itemClientListingOptions =
    order.invoiceType === 'GOODS'
      ? clientsGoodsOptions
      : clientsServicesOptions;

  // [Vendor's Goods and Services]
  // vendor catalogue goods fetching
  const { data: vendorGoodsData } = useQuery({
    queryKey: [
      catalogueApis.getVendorProductCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorProductCatalogue(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled:
      isPurchasePage &&
      order.invoiceType === 'GOODS' &&
      !!order.sellerEnterpriseId,
  });
  // vendor's goods options
  const vendorGoodsOptions = vendorGoodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;

    return { value, label };
  });
  // vendor's catalogue services fetching
  const { data: vendorServicesData } = useQuery({
    queryKey: [
      catalogueApis.getVendorServiceCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorServiceCatalogue(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled:
      isPurchasePage &&
      order.invoiceType === 'SERVICE' &&
      !!order.sellerEnterpriseId,
  });
  // vendor's service options
  const vendorServiceOptions = vendorServicesData?.map((service) => {
    const value = {
      ...service,
      productType: 'SERVICE',
      productName: service.name,
    };
    const label = service.name;

    return { value, label };
  });
  // itemVendorListingOptions on the basis of item type
  const itemVendorListingOptions =
    order.invoiceType === 'GOODS' ? vendorGoodsOptions : vendorServiceOptions;

  // fn for capitalization
  function capitalize(str) {
    // eslint-disable-next-line no-unsafe-optional-chaining
    return str?.charAt(0).toUpperCase() + str?.slice(1).toLowerCase();
  }

  // mutation Fn for update order (purchase || sales && unconfirmed clients)
  const updateOrderMutation = useMutation({
    mutationKey: [orderApi.updateOrder.endpointKey],
    mutationFn: (data) => updateOrder(orderId, data),
    onSuccess: () => {
      toast.success(translations('form.successMsg.order_revised_successfully'));
      onCancel();
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setIsOrderCreationSuccess((prev) => !prev);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation Fn for update order (confirmed clients with no reply recieved)
  const updateOrderForUnRepliedSalesMutation = useMutation({
    mutationKey: [orderApi.updateOrderForUnrepliedSales.endpointKey],
    mutationFn: (data) => updateOrderForUnrepliedSales(data),
    onSuccess: (res) => {
      toast.success(translations('form.successMsg.order_revised_successfully'));
      // onCancel();
      // queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      // setIsOrderCreationSuccess((prev) => !prev);
      router.push(`/dashboard/sales/sales-orders/${res.data.data.newOrderId}`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    // if purchase page or sales order with unconfirmed clients
    if (
      isPurchasePage ||
      (!isPurchasePage && orderDetails?.buyerType === 'UNINVITED-ENTERPRISE')
    ) {
      updateOrderMutation.mutate({
        ...order,
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
      });
    } else {
      updateOrderForUnRepliedSalesMutation.mutate({
        ...order,
        orderId,
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
      });
    }
  };

  return (
    <Wrapper className="flex h-full flex-col py-2">
      <SubHeader name={translations('title.revise')}></SubHeader>
      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex w-1/2 flex-col gap-2">
          <Label>
            {cta === 'offer'
              ? translations('form.label.client')
              : translations('form.label.vendor')}
          </Label>
          <div className="max-w-md rounded-md border bg-gray-100 p-2 text-sm hover:cursor-not-allowed">
            {cta === 'offer'
              ? orderDetails?.clientName
              : orderDetails?.vendorName}
          </div>
        </div>
        <div className="flex w-1/2 flex-col gap-2">
          <Label>{translations('form.label.item_type')}</Label>
          <div className="max-w-md rounded-md border bg-gray-100 p-2 text-sm hover:cursor-not-allowed">
            {capitalize(orderDetails?.invoiceType)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-sm border border-neutral-200 p-4">
        <span className="font-semibold">
          {translations('title.sub_titles.add_item')}
        </span>
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Label>{translations('form.label.item')}</Label>
            <div className="flex flex-col gap-1">
              <Select
                name="items"
                placeholder={translations('form.input.item.placeholder')}
                options={
                  cta === 'offer'
                    ? itemClientListingOptions?.map((item) => ({
                        ...item,
                        isDisabled: !!order?.orderItems?.find(
                          (orderItem) => orderItem.productId === item.value.id,
                        ),
                      }))
                    : itemVendorListingOptions?.map((item) => ({
                        ...item,
                        isDisabled: !!order?.orderItems?.find(
                          (orderItem) => orderItem.productId === item.value.id,
                        ),
                      }))
                }
                styles={getStylesForSelectComponent()}
                onChange={(selectedOption) => {
                  const selectedItemData =
                    cta === 'offer'
                      ? itemClientListingOptions?.find(
                          (item) => item.value.id === selectedOption?.value?.id, // Match based on the `id`
                        )?.value
                      : itemVendorListingOptions?.find(
                          (item) => item.value.id === selectedOption?.value?.id, // Match based on the `id`
                        )?.value;

                  if (selectedItemData) {
                    setSelectedItem((prev) => ({
                      ...prev,
                      productId: selectedItemData.id,
                      productType: selectedItemData.productType,
                      productName: selectedItemData.productName,
                      unitPrice: selectedItemData.rate,
                      gstPerUnit: isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      )
                        ? selectedItemData.gstPercentage
                        : 0,
                    }));
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <InputWithSelect
                id="quantity"
                name={translations('form.label.quantity')}
                required={true}
                value={selectedItem.quantity}
                onValueChange={(e) => {
                  const inputValue = e.target.value;

                  // Allow user to clear input
                  if (inputValue === '') {
                    setSelectedItem((prev) => ({
                      ...prev,
                      quantity: 0,
                      totalAmount: 0,
                      totalGstAmount: 0,
                    }));
                    return;
                  }

                  // Prevent non-integer or negative input
                  const value = Number(inputValue);

                  // Reject if not a positive integer
                  if (!/^\d+$/.test(inputValue) || value < 1) return;

                  const totalAmt = parseFloat(
                    (value * selectedItem.unitPrice).toFixed(2),
                  );
                  const gstAmt = parseFloat(
                    (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                  );

                  const updatedItem = {
                    ...selectedItem,
                    quantity: value,
                    totalAmount: totalAmt,
                    totalGstAmount: gstAmt,
                  };
                  setSelectedItem(updatedItem);
                }}
                unit={selectedItem.unitId} // unitId from state
                onUnitChange={(val) => {
                  setSelectedItem((prev) => {
                    const updated = { ...prev, unitId: Number(val) }; // store ID
                    return updated;
                  });
                }}
                units={units?.quantity} // pass the full object list
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>{translations('form.label.price')}</Label>
            <div className="flex flex-col gap-1">
              <Input
                value={selectedItem.unitPrice}
                onChange={(e) => {
                  const totalAmt = parseFloat(
                    (selectedItem.quantity * e.target.value).toFixed(2),
                  ); // totalAmt excluding gst
                  const gstAmt = parseFloat(
                    (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                  ); // total gstAmt
                  setSelectedItem((prevValue) => ({
                    ...prevValue,
                    unitPrice: e.target.value,
                    totalAmount: totalAmt,
                    totalGstAmount: gstAmt,
                  }));
                }}
                className="max-w-30"
              />
            </div>
          </div>

          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <div className="flex flex-col gap-2">
              <Label className="flex">
                {translations('form.label.gst')}
                <span className="text-xs"> (%)</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  value={selectedItem.gstPerUnit}
                  className="max-w-14"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.value')}
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.totalAmount}
                className="max-w-30"
              />
            </div>
          </div>

          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <div className="flex flex-col gap-2">
              <Label className="flex gap-1">
                {translations('form.label.tax_amount')}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  value={selectedItem.totalGstAmount}
                  className="max-w-30"
                />
              </div>
            </div>
          )}

          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <div className="flex flex-col gap-2">
              <Label>{translations('form.label.amount')}</Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  value={(Number(selectedItem.totalAmount) || 0).toFixed(2)}
                  className="max-w-30"
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem((prev) => ({
                ...prev,
                productName: '',
                productType: '',
                productId: '',
                quantity: null,
                unitPrice: null,
                gstPerUnit: null,
                totalAmount: null,
                totalGstAmount: null,
              }));
            }}
          >
            {translations('form.ctas.cancel')}
          </Button>
          <Button
            size="sm"
            disabled={Object.values(selectedItem).some(
              (value) => value === '' || value === null || value === undefined,
            )} // if any item of selectedItem is empty then button must be disabled
            onClick={() => {
              setOrder((prev) => ({
                ...prev,
                orderItems: [...prev.orderItems, selectedItem],
              }));
              setSelectedItem({
                productName: '',
                productType: '',
                productId: '',
                quantity: '',
                unitPrice: '',
                gstPerUnit: '',
                totalAmount: '',
                totalGstAmount: '',
              });
            }}
            variant="blue_outline"
          >
            {translations('form.ctas.add')}
          </Button>
        </div>
      </div>
      {/* selected item / Edit item table */}
      <div className="scrollBarStyles min-h-42 relative flex flex-col gap-2 overflow-auto rounded-md border px-4">
        <span className="sticky top-0 z-20 w-full pt-4 font-bold">
          {translations('title.sub_titles.edit_item')}
        </span>
        {isLoading ? (
          <Loading />
        ) : (
          <div>
            <div className="rounded-[6px]">
              <Table id={orderId}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      {translations('form.table.header.item')}
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      {translations('form.table.header.quantity')}
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      {translations('form.table.header.price')}
                    </TableHead>

                    {isGstApplicable(
                      isPurchasePage
                        ? isGstApplicableForPurchaseOrders
                        : isGstApplicableForSalesOrders,
                    ) && (
                      <TableHead className="shrink-0 text-xs font-bold text-black">
                        {translations('form.table.header.gst')}
                      </TableHead>
                    )}
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      {translations('form.table.header.value')}
                    </TableHead>
                    {isGstApplicable(
                      isPurchasePage
                        ? isGstApplicableForPurchaseOrders
                        : isGstApplicableForSalesOrders,
                    ) && (
                      <>
                        <TableHead className="shrink-0 text-xs font-bold text-black">
                          {translations('form.table.header.tax_amount')}
                        </TableHead>
                        <TableHead className="shrink-0 text-xs font-bold text-black">
                          {translations('form.table.header.amount')}
                        </TableHead>
                      </>
                    )}

                    <TableHead className="shrink-0 text-xs font-bold text-black"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="italic">
                  {order?.orderItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>
                        <InputWithSelect
                          required={true}
                          value={item.quantity === 0 ? '' : item.quantity}
                          onValueChange={(e) => {
                            const inputValue = e.target.value;

                            // Allow user to clear input
                            if (inputValue === '') {
                              handleInputChange(
                                { ...item, unitId: item.unitId },
                                'quantity',
                                0,
                              );
                              return;
                            }

                            // Allow decimals but reject negatives / invalid numbers
                            if (
                              !/^\d*\.?\d*$/.test(inputValue) ||
                              inputValue < 0
                            )
                              return;

                            // Reuse your existing updater logic
                            handleInputChange(
                              { ...item, unitId: item.unitId },
                              'quantity',
                              inputValue,
                            );
                          }}
                          unit={item.unitId} // bind unitId here
                          onUnitChange={(val) => {
                            // Update the order state with new unitId
                            setOrder((prev) => ({
                              ...prev,
                              orderItems: prev.orderItems.map((orderItem) =>
                                orderItem.productId === item.productId
                                  ? { ...orderItem, unitId: Number(val) }
                                  : orderItem,
                              ),
                            }));
                          }}
                          units={units?.quantity}
                          min={0}
                          step="any" // <-- allows decimals
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleInputChange(item, 'unitPrice', e.target.value)
                          }
                          className="w-24 border-2 font-semibold"
                          placeholder="price"
                        />
                      </TableCell>

                      {isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      ) && <TableCell>{item.gstPerUnit}</TableCell>}

                      <TableCell>{`₹ ${item.totalAmount.toFixed(2)}`}</TableCell>

                      {isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      ) && (
                        <>
                          <TableCell>{`₹ ${item.totalGstAmount}`}</TableCell>
                          <TableCell>{`₹ ${item.totalAmount.toFixed(2)}`}</TableCell>
                        </>
                      )}

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            className="text-red-500"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setOrder((prev) => ({
                                ...prev,
                                orderItems: prev.orderItems.filter(
                                  (orderItem) =>
                                    orderItem.productId !== item.productId,
                                ),
                                deletedItems: [
                                  ...(prev.deletedItems || []),
                                  item.id,
                                ],
                              }));
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto h-[1px] bg-neutral-300"></div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.gross_amount')} :{' '}
                </span>
                <span className="rounded-md border bg-slate-100 p-2">
                  {handleCalculateGrossAmt()?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.tax_amount')} :{' '}
                </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {totalGstAmt.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {translations('form.footer.total_amount')} :{' '}
            </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {handleCalculateTotalAmounts()?.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onCancel} variant={'outline'}>
            {translations('form.ctas.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? (
              <Loading />
            ) : (
              translations('form.ctas.revise')
            )}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default EditOrder;
