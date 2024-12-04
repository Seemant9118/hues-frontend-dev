'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { goodsApi } from '@/api/inventories/goods/goods';
import { servicesApi } from '@/api/inventories/services/services';
import { orderApi } from '@/api/order_api/order_api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  GetAllProductGoods,
  GetProductGoodsVendor,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import {
  GetAllProductServices,
  GetServicesVendor,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import {
  OrderDetails,
  updateOrder,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../ui/Loading';
import SearchInput from '../ui/SearchInput';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const EditOrder = ({
  onCancel,
  name,
  cta,
  orderId,
  setIsOrderCreationSuccess,
}) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [itemToSearch, setItemToSearch] = useState('');

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

  // Fetch order details✅
  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, orderId],
    queryFn: () => OrderDetails(orderId),
    select: (data) => data.data.data,
  });

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
    buyerEnterpriseId: orderDetails?.buyerEnterpriseId || '',
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
              buyerEnterpriseId: orderDetails.buyerEnterpriseId,
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
      return totalGst + orderItem2.totalGstAmount;
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

  //   getclients : to getName of the client
  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
    enabled: order?.orderType === 'SALES',
  });
  const client = clients?.find((clientData) => {
    const clientId = clientData?.client?.id ?? clientData?.id;
    return clientId === order?.buyerEnterpriseId;
  });
  const clientName =
    client?.client === null
      ? client?.invitation?.userDetails?.name
      : client?.client?.name;

  //   getvendors : to getName of the vendor
  const { data: vendors } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors(enterpriseId),
    select: (res) => res.data.data,
    enabled: order?.orderType === 'PURCHASE',
  });
  const vendor = vendors?.find((vendorData) => {
    const vendorId = vendorData?.vendor?.id ?? vendorData?.id;
    return vendorId === order?.sellerEnterpriseId;
  });
  const vendorName =
    vendor?.vendor === null
      ? vendor?.invitation?.userDetails?.name
      : vendor?.vendor?.name;

  // client goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'GOODS',
  });
  const formattedGoodsData =
    goodsData?.map((good) => ({
      ...good,
      productType: 'GOODS',
      productName: good.productName,
    })) || [];
  // client services fetching
  const { data: servicesData } = useQuery({
    queryKey: [servicesApi.getAllProductServices.endpointKey],
    queryFn: () => GetAllProductServices(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'SERVICE',
  });
  const formattedServicesData =
    servicesData?.map((service) => ({
      ...service,
      productType: 'SERVICE',
      productName: service.serviceName,
    })) || [];
  // selected data on the basis of itemType
  const itemData =
    order.invoiceType === 'GOODS' ? formattedGoodsData : formattedServicesData;
  // searching item from list given "itemData" - Inventory
  const searchItemData = itemData?.filter((item) => {
    const itemName = item.productName ?? '';
    return itemName.toLowerCase().includes(itemToSearch.toLowerCase());
  });

  // vendor goods fetching
  const { data: vendorGoodsData } = useQuery({
    queryKey: [
      goodsApi.vendorProductGoods.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => GetProductGoodsVendor(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled: !!order.sellerEnterpriseId,
  });
  const formattedVendorGoodsData =
    vendorGoodsData?.map((good) => ({
      ...good,
      productType: 'GOODS',
      productName: good.productName,
    })) || [];
  // vendor services fetching
  const { data: vendorServicesData } = useQuery({
    queryKey: [
      servicesApi.vendorServices.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => GetServicesVendor(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled: !!order.sellerEnterpriseId,
  });
  const formattedVendorServicesData =
    vendorServicesData?.map((service) => ({
      ...service,
      productType: 'SERVICE',
      productName: service.serviceName,
    })) || [];
  const vendorItemData =
    order.invoiceType === 'GOODS'
      ? formattedVendorGoodsData
      : formattedVendorServicesData;
  // searching vendor's item from list given "vendorItemData" - Inventory
  const searchVendorsItemData = vendorItemData?.filter((item) => {
    const itemName = item.productName ?? '';
    return itemName.toLowerCase().includes(itemToSearch.toLowerCase());
  });

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
            {clientName || vendorName}
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
                onValueChange={(value) => {
                  const selectedItemData =
                    cta === 'offer'
                      ? itemData?.find((item) => value === item.id)
                      : vendorItemData?.find((item) => value === item.id);

                  setSelectedItem((prev) => ({
                    ...prev,
                    productId: value,
                    productType: selectedItemData.productType,
                    productName: selectedItemData.productName,
                    unitPrice: selectedItemData.rate,
                    gstPerUnit: selectedItemData.gstPercentage,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {itemData.length > 0 && (
                    <SearchInput
                      toSearchTerm={itemToSearch}
                      setToSearchTerm={setItemToSearch}
                    />
                  )}
                  {cta === 'offer' &&
                    searchItemData?.map((item) => (
                      <SelectItem
                        disabled={
                          !!order.orderItems.find(
                            (itemO) => itemO.productId === item.id,
                          )
                        }
                        key={item.id}
                        value={item.id}
                      >
                        {item.productName}
                      </SelectItem>
                    ))}

                  {cta !== 'offer' &&
                    searchVendorsItemData?.map((item) => (
                      <SelectItem
                        disabled={
                          !!order.orderItems.find(
                            (itemO) => itemO.productId === item.id,
                          )
                        }
                        key={item.id}
                        value={item.id}
                      >
                        {item.productName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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

          <div className="flex flex-col gap-2">
            <Label>GST (%)</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.gstPerUnit}
                className="max-w-14"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Amount</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.totalAmount}
                className="max-w-30"
              />
            </div>
          </div>
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
        <span className="sticky top-0 z-20 w-full bg-white pt-4 font-bold">
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
                      PRICE
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      QUANTITY
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      GST (%)
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      AMOUNT
                    </TableHead>
                    <TableHead className="shrink-0 text-xs font-bold text-black">
                      GST AMOUNT
                    </TableHead>
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
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleInputChange(item, 'unitPrice', e.target.value)
                          }
                          className="w-24 border-2 font-semibold"
                          placeholder="price"
                        />
                      </TableCell>
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
                      <TableCell>{item.gstPerUnit}</TableCell>
                      <TableCell>{`₹ ${item.totalAmount}`}</TableCell>
                      <TableCell>{`₹ ${item.totalGstAmount}`}</TableCell>
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
          <div className="flex items-center gap-2">
            <span className="font-bold">Gross Amount : </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {handleCalculateGrossAmt()?.toFixed(2)}
            </span>
          </div>
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
