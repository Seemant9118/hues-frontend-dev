import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
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
import {
  getProductCatalogue,
  getServiceCatalogue,
  getVendorProductCatalogue,
  getVendorServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { CreateEnterpriseUser } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  CreateOrderService,
  createInvoiceForUninvited,
} from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import AddModal from '../Modals/AddModal';
import RedirectionToInvoiceModal from '../Modals/RedirectionToInvoiceModal';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import SearchInput from '../ui/SearchInput';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const CreateOrder = ({
  setSalesListing,
  onCancel,
  name,
  cta,
  type,
  isOrder,
  setIsCreatingSales,
  setIsCreatingInvoice,
}) => {
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [errorMsg, setErrorMsg] = useState({});
  const [redirectPopupOnFail, setRedirectPopUpOnFail] = useState(false);
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
  const createSalesColumns = useCreateSalesColumns(
    isOrder,
    setOrder,
    setSelectedItem,
  );

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

  // client catalogue goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'GOODS',
  });
  const formattedGoodsData =
    goodsData?.map((good) => ({
      ...good,
      productType: 'GOODS',
      productName: good.name,
    })) || [];

  // client catalogue services fetching
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
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
  const formattedVendorGoodsData =
    vendorGoodsData?.map((good) => ({
      ...good,
      productType: 'GOODS',
      productName: good.productName,
    })) || [];

  // vendor catalogue services fetching
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

  // mutation - create order
  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: (res) => {
      toast.success(
        cta === 'offer'
          ? 'Sales Order Created Successfully'
          : 'Purchase Order Created Successfully',
      );
      onCancel();
      setSalesListing((prev) => [res.data.data, ...prev]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation - create invoice
  const invoiceMutation = useMutation({
    mutationFn: createInvoiceForUninvited,
    onSuccess: () => {
      toast.success('Invoice Created Successfully');
      onCancel();
      // setInvoiceListing((prev) => [res.data.data, ...prev]);
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

  const handleCalculateTotalAmounts = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    const totalAmountWithGST = totalAmount + totalGstAmt;
    return totalAmountWithGST;
  };
  const totalAmtWithGst = handleCalculateTotalAmounts();

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
    <Wrapper className="flex h-full flex-col py-2">
      <SubHeader name={name}></SubHeader>
      {/* redirection to invoice modal */}
      {redirectPopupOnFail && (
        <RedirectionToInvoiceModal
          redirectPopupOnFail={redirectPopupOnFail}
          setIsCreatingSales={setIsCreatingSales}
          setIsCreatingInvoice={setIsCreatingInvoice}
        />
      )}

      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex w-1/2 items-center gap-2">
          <Label>{cta === 'offer' ? 'Client' : 'Vendor'}</Label>
          <div className="flex w-full flex-col gap-1">
            <Select
              defaultValue=""
              onValueChange={(value) => {
                const selectedItem = JSON.parse(value); // Parse the JSON string
                const { id, isAcceptedCustomer } = selectedItem; // Destructure the parsed object

                if (cta === 'offer') {
                  if (
                    (id !== undefined &&
                      isAcceptedCustomer === 'ACCEPTED' &&
                      name === 'Offer') ||
                    name === 'Invoice'
                  ) {
                    setRedirectPopUpOnFail(false);
                    setOrder((prev) => ({
                      ...prev,
                      buyerEnterperiseId: id,
                    }));
                  } else if (name !== 'Invoice') {
                    setRedirectPopUpOnFail(true);
                  }
                } else {
                  setOrder((prev) => ({
                    ...prev,
                    sellerEnterpriseId: id,
                  }));
                }
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
                        value={JSON.stringify({
                          id:
                            customer?.client?.id ??
                            (name === 'Invoice' ? customer?.id : undefined),
                          isAcceptedCustomer:
                            customer?.invitation === null ||
                            customer?.invitation === undefined
                              ? 'ACCEPTED'
                              : customer?.invitation?.status,
                        })}
                      >
                        {customer?.client?.name ||
                          customer.invitation?.userDetails?.name}
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <>
                    {/* FILTER OUT ACCORDING TO CUSTOMERTOSEARCH */}
                    {searchCustomerData
                      ?.filter((customer) => !!customer?.vendor?.name)
                      .map((customer) => (
                        <SelectItem
                          key={customer.id}
                          value={JSON.stringify({
                            id: customer?.vendor?.id,
                            isAcceptedCustomer:
                              customer?.invitation === null ||
                              customer?.invitation === undefined
                                ? 'ACCEPTED'
                                : customer?.invitation?.status,
                          })}
                        >
                          {customer?.vendor?.name}
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
                type="number"
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
            <Label>{isOrder === 'invoice' ? 'Invoice Value' : 'Amount'}</Label>
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
            size="sm"
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

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold">Gross Amount : </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {grossAmt.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Total Amount : </span>
            <span className="rounded-md border bg-slate-100 p-2">
              {totalAmtWithGst.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onCancel} variant={'outline'}>
            Cancel
          </Button>
          <Button
            size="sm"
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
