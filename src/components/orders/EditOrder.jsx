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
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useEditColumns } from '../columns/useEditColumns';
import { DataTable } from '../table/data-table';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';
import SearchInput from '../ui/SearchInput';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const EditOrder = ({ onCancel, name, cta, orderId }) => {
  //   const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [itemToSearch, setItemToSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState({});

  const [selectedItem, setSelectedItem] = useState({
    productName: '',
    productType: '',
    productId: '',
    quantity: null,
    unitPrice: null,
    gstPerUnit: null,
    totalAmount: null,
    totalGstAmount: null,
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
        gstPerUnit: item.gstPerUnit,
        productId: productDetails?.id ?? null, // Use null as default if undefined
        productName: productDetails?.productName || productDetails?.serviceName, // Use empty string as default if undefined
        productType: item.productType,
        quantity: item.quantity,
        totalAmount: item.totalAmount,
        totalGstAmount: item.totalGstAmount,
        unitPrice: item.unitPrice,
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
    orderItems: transformedItems || [],
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
  let grossAmt = handleCalculateGrossAmt();

  const handleCalculateTotalAmounts = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    const totalAmountWithGST = totalAmount + totalGstAmt;
    return totalAmountWithGST;
  };
  let totalAmtWithGst = handleCalculateTotalAmounts();

  useEffect(() => {
    grossAmt = handleCalculateGrossAmt();
    totalAmtWithGst = handleCalculateTotalAmounts();
  }, [order]);

  const editColumns = useEditColumns(
    setSelectedItem,
    setOrder,
    orderDetails?.orderType,
  );

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
    return vendorId === order?.buyerEnterpriseId;
  });
  const vendorName =
    vendor?.vendor === null
      ? vendor?.invitation?.userDetails?.name
      : vendor?.vendor?.name;

  // client goods fetching✅
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

  // client services fetching✅
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

  // selected data on the basis of itemType✅
  const itemData =
    order.invoiceType === 'GOODS' ? formattedGoodsData : formattedServicesData;

  // searching item from list given "itemData" - Inventory✅
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
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // validations
  const validation = ({ order, selectedItem }) => {
    const errorObj = {};

    if (cta === 'offer') {
      if (order?.orderItem?.length === 0) {
        errorObj.orderItem = '*Please add atleast one item to create order';
      }
      if (selectedItem.quantity === null) {
        errorObj.quantity = '*Required Quantity';
      }
      if (selectedItem.unitPrice === null) {
        errorObj.unitPrice = '*Required Price';
      }
      if (selectedItem.gstPerUnit === null) {
        errorObj.gstPerUnit = '*Required GST (%)';
      }
      if (selectedItem.totalAmount === null) {
        errorObj.totalAmount = '*Required Amount';
      }
    } else {
      if (order?.orderItem?.length === 0) {
        errorObj.orderItem = '*Please add atleast one item to create order';
      }
      if (selectedItem.quantity === null) {
        errorObj.quantity = '*Required Quantity';
      }
      if (selectedItem.unitPrice === null) {
        errorObj.unitPrice = '*Required Price';
      }
      if (selectedItem.gstPerUnit === null) {
        errorObj.gstPerUnit = '*Required GST (%)';
      }
      if (selectedItem.totalAmount === null) {
        errorObj.totalAmount = '*Required Amount';
      }
    }

    return errorObj;
  };

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError).length === 0) {
      totalAmount;
      totalGstAmt;
      // orderEditMutation.mutate({
      //   ...order,
      //   amount: parseFloat(totalAmount.toFixed(2)),
      //   gstAmount: parseFloat(totalGstAmt.toFixed(2)),
      // });
    } else {
      setErrorMsg(isError);
    }
  };

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex w-1/2 items-center gap-2">
          <Label>{cta === 'offer' ? 'Client' : 'Vendor'}:</Label>
          <div className="w-full rounded-md border bg-gray-100 p-2 text-sm">
            {clientName || vendorName}
          </div>
        </div>
        <div className="flex w-1/2 items-center gap-2">
          <Label>Type:</Label>
          <div className="w-full rounded-md border bg-gray-100 p-2 text-sm">
            {capitalize(orderDetails?.invoiceType)}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-sm border border-neutral-200 p-4">
        <span className="font-semibold">Add Item</span>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Label className="flex-shrink-0">Item:</Label>
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
                <SelectTrigger className="max-w-xs gap-5">
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
              {errorMsg.name && <ErrorBox msg={errorMsg.name} />}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label>Quantity:</Label>
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
                className="max-w-20"
              />
              {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Price:</Label>
            <div className="flex flex-col gap-1">
              <Input
                value={selectedItem.unitPrice}
                className="max-w-20"
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
              />
              {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>GST (%) :</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.gstPerUnit}
                className="max-w-20"
              />
              {errorMsg.gstPerUnit && <ErrorBox msg={errorMsg.gstPerUnit} />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Amount:</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.totalAmount}
                className="max-w-20"
              />
              {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button
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
              setErrorMsg({});
            }}
            variant="blue_outline"
          >
            Add
          </Button>
        </div>
      </div>
      {/* selected item table */}
      <div className="scrollBarStyles min-h-42 relative flex flex-col gap-2 overflow-auto rounded-md border px-4">
        <span className="sticky top-0 z-20 w-full bg-white pt-4 font-bold">
          Edit Items
        </span>
        {isLoading ? (
          <Loading />
        ) : (
          <DataTable data={order?.orderItems} columns={editColumns} />
        )}
      </div>

      <div className="mt-auto h-[1px] bg-neutral-300"></div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">Gross Amount : </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {grossAmt?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Total Amount : </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {totalAmtWithGst?.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onCancel} variant={'outline'}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Edit</Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default EditOrder;
