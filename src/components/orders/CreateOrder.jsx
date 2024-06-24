import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { goodsApi } from '@/api/inventories/goods/goods';
import { servicesApi } from '@/api/inventories/services/services';
import { orderApi } from '@/api/order_api/order_api';
import { useCreateSalesColumns } from '@/components/columns/useCreateSalesColumns';
import { DataTable } from '@/components/table/data-table';
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
import { CreateEnterpriseUser } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
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
  CreateOrderService,
  createInvoice,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import AddModal from '../Modals/AddModal';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import SearchInput from '../ui/SearchInput';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const CreateOrder = ({ onCancel, name, cta, type, isOrder }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [errorMsg, setErrorMsg] = useState({});

  const [customerToSearch, setCustomerToSearch] = useState('');
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
  });
  const [order, setOrder] = useState(
    cta === 'offer'
      ? {
          sellerEnterpriseId: enterpriseId,
          buyerEnterperiseId: null,
          gstAmount: null,
          amount: null,
          orderType: 'SALES',
          invoiceType: '',
          orderItems: [],
        }
      : {
          sellerEnterpriseId: null,
          buyerEnterperiseId: enterpriseId,
          gstAmount: null,
          amount: null,
          orderType: 'PURCHASE',
          invoiceType: '',
          orderItems: [],
        },
  );

  const createSalesColumns = useCreateSalesColumns(setOrder);

  // client/vendor fetching
  const { data: customerData } = useQuery({
    queryKey: [
      clientEnterprise.getClients.endpointKey,
      vendorEnterprise.getVendors.endpointKey,
    ],
    queryFn: () => {
      if (cta === 'offer') {
        return getClients(enterpriseId);
      } else {
        return getVendors(enterpriseId);
      }
    },

    select: (res) => res.data.data,
  });

  // searching client/vendor from list given "customerData"
  const searchCustomerData = customerData?.filter((customer) => {
    const clientName = customer.client?.name ?? '';
    const userDetailsName = customer.invitation?.userDetails?.name ?? '';
    return (
      clientName.toLowerCase().includes(customerToSearch.toLowerCase()) ||
      userDetailsName.toLowerCase().includes(customerToSearch.toLowerCase())
    );
  });

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

  // both client goods & client services concatinated
  // const vendorItemData = [
  //   ...(formattedVendorGoodsData || []),
  //   ...(formattedVendorServicesData || []),
  // ];

  const vendorItemData =
    order.invoiceType === 'GOODS'
      ? formattedVendorGoodsData
      : formattedVendorServicesData;

  // searching vendor's item from list given "vendorItemData" - Inventory
  const searchVendorsItemData = vendorItemData?.filter((item) => {
    const itemName = item.productName ?? '';
    return itemName.toLowerCase().includes(itemToSearch.toLowerCase());
  });

  // mutation - create order
  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: () => {
      toast.success(
        cta === 'offer'
          ? 'Sales Order Created Successfully'
          : 'Purchase Order Created Successfully',
      );
      onCancel();
      queryClient.invalidateQueries({
        queryKey:
          cta === 'offer'
            ? [orderApi.getSales.endpointKey]
            : [orderApi.getPurchases.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation - create invoice
  const invoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success('Invoice Created Successfully');
      onCancel();
      queryClient.invalidateQueries({
        queryKey: [orderApi.getSales.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // validations
  const validation = ({ order, selectedItem }) => {
    const errorObj = {};

    if (cta === 'offer') {
      if (order?.buyerEnterperiseId == null) {
        errorObj.buyerEnterperiseId = '*Please select a client';
      }
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
      if (order?.sellerEnterpriseId == null) {
        errorObj.sellerEnterpriseId = '*Please select a vendor';
      }
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

  const handleSetTotalAmt = () => {
    const totalAmount = order.orderItems.reduce((totalAmt, orderItem) => {
      return totalAmt + orderItem.totalAmount;
    }, 0);

    const totalGstAmt = order.orderItems.reduce((totalGst, orderItem2) => {
      return totalGst + orderItem2.totalGstAmount;
    }, 0);

    return { totalAmount, totalGstAmt };
  };

  const handleCalculateGrossAmt = () => {
    const grossAmount = order.orderItems.reduce((acc, orderItem) => {
      return acc + orderItem.totalAmount;
    }, 0);
    return grossAmount;
  };
  const grossAmt = handleCalculateGrossAmt();

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError).length === 0) {
      if (isOrder === 'invoice') {
        invoiceMutation.mutate({
          ...order,
          amount: parseFloat(totalAmount.toFixed(2)),
          gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        });
        setErrorMsg({});
      } else {
        orderMutation.mutate({
          ...order,
          amount: parseFloat(totalAmount.toFixed(2)),
          gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        });
        setErrorMsg({});
      }
    } else {
      setErrorMsg(isError);
    }
  };

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Order" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex w-1/2 items-center gap-2">
          <Label>{cta === 'offer' ? 'Client' : 'Vendor'}</Label>
          <div className="flex w-full flex-col gap-1">
            <Select
              defaultValue=""
              onValueChange={(value) => {
                cta === 'offer'
                  ? setOrder((prev) => ({ ...prev, buyerEnterperiseId: value }))
                  : setOrder((prev) => ({
                      ...prev,
                      sellerEnterpriseId: value,
                    }));
              }}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {/* if expected client is not in the list add a new client */}
                {type === 'sales' && (
                  <AddModal
                    type={'Add Client'}
                    cta="client"
                    btnName="Add"
                    mutationFunc={CreateEnterpriseUser}
                  />
                )}
                {/* if expected vendor is not in the list add a new vendor */}
                {type === 'purchase' && (
                  <AddModal
                    type={'Add Vendor'}
                    cta="vendor"
                    btnName="Add"
                    mutationFunc={CreateEnterpriseUser}
                  />
                )}

                {/* search bar for searching clients/vendor */}
                {customerData?.length > 0 && (
                  <SearchInput
                    toSearchTerm={customerToSearch}
                    setToSearchTerm={setCustomerToSearch}
                  />
                )}

                {cta === 'offer' ? (
                  <>
                    {/* FILTER OUT ACCORDING TO CUSTOMERTOSEARCH */}
                    {searchCustomerData?.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer?.client?.id}
                      >
                        {customer?.client && customer?.client?.name !== null
                          ? customer?.client?.name
                          : customer?.invitation?.userDetails?.name}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <>
                    {/* FILTER OUT ACCORDING TO CUSTOMERTOSEARCH */}
                    {searchCustomerData?.map((customer) => (
                      <SelectItem
                        key={customer.id}
                        value={customer?.vendor?.id}
                      >
                        {customer?.vendor && customer?.vendor?.name !== null
                          ? customer?.vendor?.name
                          : customer?.invitation?.userDetails?.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            {cta === 'offer'
              ? errorMsg.buyerEnterperiseId && (
                  <ErrorBox msg={errorMsg.buyerEnterperiseId} />
                )
              : errorMsg.sellerEnterpriseId && (
                  <ErrorBox msg={errorMsg.sellerEnterpriseId} />
                )}
          </div>
        </div>
        <div className="flex w-1/2 items-center gap-2">
          <Label>Item Type</Label>
          <Select
            onValueChange={(value) => {
              setOrder((prev) => ({ ...prev, invoiceType: value }));
            }}
          >
            <SelectTrigger className="max-w-xs gap-5">
              <SelectValue placeholder="Select Item Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GOODS">Goods</SelectItem>
              <SelectItem value="SERVICE">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Label className="flex-shrink-0">Item</Label>
            <div className="flex flex-col gap-1">
              <Select
                disabled={
                  (cta === 'offer' && order.buyerEnterperiseId == null) ||
                  (cta === 'bid' && order.sellerEnterpriseId == null) ||
                  order.invoiceType === ''
                }
                // defaultValue={selectedItem.product_id}
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
              {/* {errorMsg.name && <ErrorBox msg={errorMsg.name} />} */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label>Quantity:</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled={
                  (cta === 'offer' && order.buyerEnterperiseId == null) ||
                  order.sellerEnterpriseId == null
                }
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
                disabled={
                  (cta === 'offer' && order.buyerEnterperiseId == null) ||
                  order.sellerEnterpriseId == null
                }
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
                productId: '',
                productType: '',
                productName: '',
                unitPrice: '',
                gstPerUnit: '',
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
      <DataTable data={order.orderItems} columns={createSalesColumns} />

      <div className="mt-auto h-[1px] bg-neutral-300"></div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold">Total Gross Amount : </span>
          <span className="rounded-md border bg-slate-100 p-2">{grossAmt}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant={'outline'}>
            Cancel
          </Button>
          <Button
            onClick={
              handleSubmit // invoke handle submit fn
            }
          >
            Create
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default CreateOrder;
