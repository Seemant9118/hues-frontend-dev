'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { orderApi } from '@/api/order_api/order_api';
import { userAuth } from '@/api/user_auth/Users';
import {
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
} from '@/services/Orders_Services/Orders_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const EditOrder = ({
  onCancel,
  name,
  cta,
  orderId,
  isEditingOrder,
  setIsOrderCreationSuccess,
}) => {
  const queryClient = useQueryClient();

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const [selectedItem, setSelectedItem] = useState({
    productName: '',
    productType: '',
    productId: '',
    quantity: null,
    unitPrice: null,
    gstPerUnit: null,
    totalAmount: null,
    totalGstAmount: null,
    negotiationStatus: 'NEW',
  });

  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!isEditingOrder && isPurchasePage === false,
  });

  // for sales-order gst/non-gst check
  const isGstApplicableForSalesOrders =
    isPurchasePage === false && !!profileDetails?.enterpriseDetails?.gstNumber;

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
        totalAmount: item.totalAmount,
        totalGstAmount: item.totalGstAmount,
        unitPrice: item.unitPrice,
        version: item.version,
        negotiationStatus: item?.negotiationStatus || 'NEW',
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

  // mutation Fn for update order
  const updateOrderMutation = useMutation({
    mutationKey: [orderApi.updateOrder.endpointKey],
    mutationFn: (data) => updateOrder(orderId, data),
    onSuccess: () => {
      toast.success('Order Updated Successfully');
      onCancel();
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setIsOrderCreationSuccess((prev) => !prev);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    updateOrderMutation.mutate({
      ...order,
      amount: parseFloat(totalAmount.toFixed(2)),
      gstAmount: parseFloat(totalGstAmt.toFixed(2)),
    });
  };

  return (
    <Wrapper className="flex h-full flex-col py-2">
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex w-1/2 flex-col gap-2">
          <Label>{cta === 'offer' ? 'Client' : 'Vendor'}</Label>
          <div className="max-w-md rounded-md border bg-gray-100 p-2 text-sm hover:cursor-not-allowed">
            {cta === 'offer'
              ? orderDetails?.clientName
              : orderDetails?.vendorName}
          </div>
        </div>
        <div className="flex w-1/2 flex-col gap-2">
          <Label>Type</Label>
          <div className="max-w-md rounded-md border bg-gray-100 p-2 text-sm hover:cursor-not-allowed">
            {capitalize(orderDetails?.invoiceType)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-sm border border-neutral-200 p-4">
        <span className="font-semibold">Add Item</span>
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Label>Item</Label>
            <div className="flex flex-col gap-1">
              <Select
                name="items"
                placeholder="Select"
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
            <Label>Quantity</Label>
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                value={selectedItem.quantity}
                onChange={(e) => {
                  const totalAmt = parseFloat(
                    (e.target.value * selectedItem.unitPrice).toFixed(2),
                  ); // totalAmt excluding gst
                  const gstAmt = parseFloat(
                    (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                  ); // total gstAmt
                  setSelectedItem((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                    totalAmount: totalAmt,
                    totalGstAmount: gstAmt,
                  }));
                }}
                className="max-w-30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Price</Label>
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
                GST <span className="text-xs"> (%)</span>
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
            <Label className="flex gap-1">Value</Label>
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
                Tax Amount
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
              <Label>Amount</Label>
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
            Cancel
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
            Add
          </Button>
        </div>
      </div>
      {/* selected item / Edit item table */}
      <div className="scrollBarStyles min-h-42 relative flex flex-col gap-2 overflow-auto rounded-md border px-4">
        <span className="sticky top-0 z-20 w-full pt-4 font-bold">
          Edit Items
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
                      ITEM
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      QUANTITY
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      PRICE
                    </TableHead>

                    {isGstApplicable(
                      isPurchasePage
                        ? isGstApplicableForPurchaseOrders
                        : isGstApplicableForSalesOrders,
                    ) && (
                      <TableHead className="shrink-0 text-xs font-bold text-black">
                        GST (%)
                      </TableHead>
                    )}
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      VALUE
                    </TableHead>
                    {isGstApplicable(
                      isPurchasePage
                        ? isGstApplicableForPurchaseOrders
                        : isGstApplicableForSalesOrders,
                    ) && (
                      <>
                        <TableHead className="shrink-0 text-xs font-bold text-black">
                          TAX AMOUNT
                        </TableHead>
                        <TableHead className="shrink-0 text-xs font-bold text-black">
                          AMOUNT
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
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            handleInputChange(item, 'quantity', e.target.value)
                          }
                          className="w-24 border-2 font-semibold"
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
                <span className="font-bold">Gross Amount : </span>
                <span className="rounded-md border bg-slate-100 p-2">
                  {handleCalculateGrossAmt()?.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Tax Amount : </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {totalGstAmt.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold">Total Amount : </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {handleCalculateTotalAmounts()?.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onCancel} variant={'outline'}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? <Loading /> : 'Edit'}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default EditOrder;
