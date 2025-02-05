/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { userAuth } from '@/api/user_auth/Users';
import {
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { useCreateSalesColumns } from '@/components/columns/useCreateSalesColumns';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
  getVendorProductCatalogue,
  getVendorServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  createClient,
  getClients,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getCustomers } from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  CreateOrderService,
  createInvoice,
} from '@/services/Orders_Services/Orders_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'sonner';
import AddModal from '../Modals/AddModal';
import RedirectionToInvoiceModal from '../Modals/RedirectionToInvoiceModal';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const CreateOrder = ({
  isCreatingInvoice,
  isCreatingSales,
  isCreatingPurchase,
  setSalesListing,
  setPurchaseListing,
  onCancel,
  name,
  cta,
  isOrder,
}) => {
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const [redirectPopupOnFail, setRedirectPopUpOnFail] = useState(false);
  const [selectedValue, setSelectedValue] = useState(''); // Manage selected value
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
          clientType: 'B2B',
          sellerEnterpriseId: enterpriseId,
          buyerId: null,
          gstAmount: null,
          amount: null,
          orderType: 'SALES',
          invoiceType: '',
          orderItems: [],
        }
      : {
          clientType: 'B2B',
          sellerEnterpriseId: null,
          buyerId: enterpriseId,
          gstAmount: null,
          amount: null,
          orderType: 'PURCHASE',
          invoiceType: '',
          orderItems: [],
        },
  );

  // [GST/NON-GST Checking]
  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled:
      (!!isCreatingInvoice || !!isCreatingSales) && isPurchasePage === false,
  });
  // for sales-order gst/non-gst check
  const isGstApplicableForSalesOrders =
    isPurchasePage === false && !!profileDetails?.enterpriseDetails?.gstNumber;
  // for purchase-orders gst/non-gst check
  const [
    isGstApplicableForPurchaseOrders,
    setIsGstApplicableForPurchaseOrders,
  ] = useState('');

  // [clientType options]
  const clientTypeOptions = [
    {
      value: 'B2B',
      label: 'B2B',
    },
    {
      value: 'B2C',
      label: 'B2C',
    },
  ];

  // [B2C customers]
  // customer[B2C] api fetching
  const { data: customers } = useQuery({
    queryKey: [customerApis.getCustomers.endpointKey, enterpriseId],
    queryFn: () => getCustomers(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.clientType === 'B2C',
  });
  // customer options
  const [options, setOptions] = useState([]);
  // Transform customers data into options format
  useEffect(() => {
    if (customers) {
      const transformedOptions = customers.map((customer) => ({
        value: customer.mobileNumber,
        label: `${customer.countryCode} ${customer.mobileNumber}`, // Displaying country code with mobile number
      }));
      setOptions(transformedOptions);
    }
  }, [customers]);
  // Handle selection of an existing option
  const handleChange = (selectedOption) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      buyerId: selectedOption ? selectedOption.value : null,
    }));
  };
  // Handle creation of a new option
  const handleCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };

    // Add the new option to the list of options
    setOptions((prevOptions) => [...prevOptions, newOption]);

    // Update the order state
    setOrder((prevOrder) => ({
      ...prevOrder,
      buyerId: newOption.value,
    }));
  };

  // [clients]
  // clients[B2B] fetching
  const { data: customerData } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId, 'ORDER'),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && isCreatingSales && order.clientType === 'B2B',
  });
  // client options
  const clientOptions = [
    ...(customerData?.map((customer) => {
      const value = customer?.client?.id || customer?.id;
      const label =
        customer?.client?.name || customer.invitation?.userDetails?.name;
      const isAccepted =
        customer?.invitation === null || customer?.invitation === undefined
          ? 'ACCEPTED'
          : customer?.invitation?.status;

      return { value, label, isAccepted };
    }) ?? []),
    {
      value: 'add-new-client', // Special value for "Add New Client"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> Add a new client
        </span>
      ),
      isAccepted: 'ACCEPTED',
    },
  ];

  // [vendors]
  // vendors fetching
  const { data: vendorData } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors(enterpriseId, 'ORDER'),
    select: (res) => res.data.data,
    enabled: cta === 'bid' && isCreatingPurchase && order.clientType === 'B2B',
  });
  // vendors options
  const vendorOptions = [
    ...(
      vendorData?.filter(
        (vendor) => vendor?.vendor?.name && vendor?.vendor?.id !== null, // Filter valid vendors
      ) ?? []
    ) // Fallback to empty array if vendorData is undefined or null
      .map((vendor) => {
        const value = vendor?.vendor?.id || vendor?.id;
        const label =
          vendor?.vendor?.name || vendor.invitation?.userDetails?.name;
        const isAccepted =
          vendor?.invitation === null || vendor?.invitation === undefined
            ? 'ACCEPTED'
            : vendor?.invitation?.status;
        const gstNumber = vendor?.vendor?.gstNumber;

        return { value, label, isAccepted, gstNumber };
      }),
    // Special option for "Add New Vendor"
    {
      value: 'add-new-vendor', // Special value for "Add New Vendor"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> Add a new vendor
        </span>
      ),
      isAccepted: 'ACCEPTED',
      gstNumber: null, // Add any extra properties if needed
    },
  ];

  // [item type]
  const itemTypeOptions = [
    {
      value: 'GOODS',
      label: 'Goods',
    },
    {
      value: 'SERVICE',
      label: 'Service',
    },
  ];

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
      if (isPurchasePage) {
        setPurchaseListing((prev) => [res.data.data, ...prev]);
      } else {
        setSalesListing((prev) => [res.data.data, ...prev]);
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation - create invoice
  const invoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success(
        'Invoice created! Please refresh to view the latest Invoice',
      );
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
      if (order.clientType === 'B2B' && order?.buyerId == null) {
        errorObj.buyerId = '*Please select a client';
      }
      if (order.clientType === 'B2C' && order?.buyerId == null) {
        errorObj.buyerId = '*Please provide a phone number of customer';
      }
      if (order?.orderItems?.length === 0) {
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

    const totalGstAmt = order.orderItems.reduce((totalGst, orderItem) => {
      return (
        totalGst +
        (isGstApplicable(
          isPurchasePage
            ? isGstApplicableForPurchaseOrders
            : isGstApplicableForSalesOrders,
        )
          ? orderItem.totalGstAmount
          : 0)
      );
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
  const { totalGstAmt } = handleSetTotalAmt();

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError).length === 0) {
      if (isOrder === 'invoice') {
        invoiceMutation.mutate({
          ...order,
          buyerId: Number(order.buyerId),
          amount: parseFloat(totalAmount.toFixed(2)),
          gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        });
        setErrorMsg({});
      } else {
        orderMutation.mutate({
          ...order,
          buyerId: Number(order.buyerId),
          amount: parseFloat(totalAmount.toFixed(2)),
          gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        });
        setErrorMsg({});
      }
    } else {
      setErrorMsg(isError);
    }
  };

  // columns
  const createSalesColumns = useCreateSalesColumns(
    isOrder,
    setOrder,
    setSelectedItem,
    isPurchasePage,
    isGstApplicableForSalesOrders,
    isGstApplicableForPurchaseOrders,
  );

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
    <Wrapper className="relative flex h-full flex-col py-2">
      <SubHeader name={name}></SubHeader>
      {/* redirection to invoice modal */}
      {redirectPopupOnFail && (
        <RedirectionToInvoiceModal
          redirectPopupOnFail={redirectPopupOnFail}
          setRedirectPopUpOnFail={setRedirectPopUpOnFail}
          setSelectedValue={setSelectedValue}
          setOrder={setOrder}
        />
      )}

      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        {/* client type only showed in sales invoices not in sales/purchase offer */}
        {cta === 'offer' && isOrder === 'invoice' && (
          <div className="flex w-1/2 flex-col gap-2">
            <Label className="flex gap-1">
              {'Client Type'}
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex w-full flex-col gap-1">
              <Select
                name="clientType"
                placeholder="Select Client Type"
                options={clientTypeOptions}
                styles={getStylesForSelectComponent()}
                className="max-w-xs text-sm"
                classNamePrefix="select"
                defaultValue={clientTypeOptions[0]} // Provide the full object as the default value
                onChange={(selectedOption) => {
                  if (!selectedOption) return; // Guard clause for no selection
                  setOrder((prev) => ({
                    ...prev,
                    clientType: selectedOption.value,
                  })); // Update state with the selected value
                }}
              />
            </div>
          </div>
        )}

        {/* customer flow only show in sales invoices not in offer/bid creation */}
        {cta === 'offer' &&
          isOrder === 'invoice' &&
          order.clientType === 'B2C' && (
            <div className="flex w-1/2 flex-col gap-2">
              <Label className="flex gap-1">
                {'Customer'}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex w-full flex-col gap-1">
                <CreatableSelect
                  value={
                    options?.find((option) => option.value === order.buyerId) ||
                    null
                  }
                  onChange={handleChange}
                  onCreateOption={handleCreate}
                  styles={getStylesForSelectComponent()}
                  className="max-w-xs text-sm"
                  isClearable
                  placeholder="Customer Number"
                  options={options}
                />

                {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
              </div>
            </div>
          )}

        {cta === 'offer' ? (
          order.clientType === 'B2B' && (
            <div className="flex w-1/2 flex-col gap-2">
              <Label className="flex gap-1">
                {'Client'}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex w-full flex-col gap-1">
                <Select
                  name="clients"
                  placeholder="Select Client..."
                  options={clientOptions}
                  styles={getStylesForSelectComponent()}
                  className="max-w-xs text-sm"
                  classNamePrefix="select"
                  value={
                    clientOptions?.find(
                      (option) => option.value === selectedValue?.value,
                    ) || null
                  } // Match selected value
                  onChange={(selectedOption) => {
                    if (!selectedOption) return; // Guard clause for no selection

                    const { value: id, isAccepted } = selectedOption; // Extract id and isAccepted from the selected option

                    // Check if "Add New Client" is selected
                    if (selectedOption.value === 'add-new-client') {
                      setIsModalOpen(true); // Open the modal when "Add New Client" is selected
                    } else {
                      // Handle other client selections
                      if (
                        (id !== undefined &&
                          isAccepted === 'ACCEPTED' &&
                          name === 'Offer') ||
                        name === 'Invoice'
                      ) {
                        setRedirectPopUpOnFail(false);
                        setOrder((prev) => ({
                          ...prev,
                          buyerId: id,
                        }));
                      } else if (name !== 'Invoice') {
                        setOrder((prev) => ({
                          ...prev,
                          buyerId: id,
                        }));
                        setRedirectPopUpOnFail(true);
                      }

                      setSelectedValue(selectedOption); // Update the state with the selected option
                    }
                  }}
                />

                {/* Conditionally render the AddModal when "Add New Client" is selected */}
                {isModalOpen && (
                  <AddModal
                    type="Add"
                    cta="client"
                    btnName="Add a new Client"
                    mutationFunc={createClient}
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                  />
                )}
                {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
              </div>
            </div>
          )
        ) : (
          <div className="flex w-1/2 flex-col gap-2">
            <Label className="flex gap-1">
              {'Vendor'}
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex w-full flex-col gap-1">
              <Select
                name="vendors"
                placeholder="Select Vendors..."
                options={vendorOptions}
                styles={getStylesForSelectComponent()}
                className="max-w-xs text-sm"
                classNamePrefix="select"
                value={
                  vendorOptions?.find(
                    (option) => option.value === selectedValue?.value,
                  ) || null
                } // Match selected value
                onChange={(selectedOption) => {
                  if (!selectedOption) return; // Guard clause for no selection

                  const { value: id, gstNumber } = selectedOption; // Extract id and isAccepted from the selected option

                  // Check if "Add New Client" is selected
                  if (selectedOption.value === 'add-new-vendor') {
                    setIsModalOpen(true); // Open the modal when "Add New Vendor" is selected
                  } else {
                    setIsGstApplicableForPurchaseOrders(!!gstNumber); // setting gstNumber for check gst/non-gst vendor

                    setOrder((prev) => ({
                      ...prev,
                      sellerEnterpriseId: id,
                    }));

                    setSelectedValue(selectedOption); // Update the state with the selected option
                  }
                }}
              />

              {/* Conditionally render the AddModal when "Add New Client" is selected */}
              {isModalOpen && (
                <AddModal
                  type="Add"
                  cta="vendor"
                  btnName="Add a new Vendor"
                  mutationFunc={createVendor}
                  isOpen={isModalOpen}
                  setIsOpen={setIsModalOpen}
                />
              )}
              {errorMsg.sellerEnterpriseId && (
                <ErrorBox msg={errorMsg.sellerEnterpriseId} />
              )}
            </div>
          </div>
        )}

        <div className="flex w-1/2 flex-col gap-2">
          <Label className="flex gap-1">
            Item Type
            <span className="text-red-600">*</span>
          </Label>
          <Select
            name="itemType"
            placeholder="Select Item Type"
            options={itemTypeOptions}
            styles={getStylesForSelectComponent()}
            className="max-w-xs text-sm"
            classNamePrefix="select"
            onChange={(selectedOption) => {
              if (!selectedOption) return; // Guard clause for no selection
              setOrder((prev) => ({
                ...prev,
                invoiceType: selectedOption.value,
              })); // Update state with the selected value
            }}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex w-full max-w-xs flex-col gap-2">
            <Label className="flex gap-1">
              Item
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex flex-col gap-1">
              <Select
                name="items"
                placeholder="Select"
                options={
                  cta === 'offer'
                    ? itemClientListingOptions
                    : itemVendorListingOptions
                }
                styles={getStylesForSelectComponent()}
                isOptionDisabled={(option) => option.disabled} // Disable options conditionally
                isDisabled={
                  (cta === 'offer' && order.buyerId == null) ||
                  (cta === 'bid' && order.sellerEnterpriseId == null) ||
                  order.invoiceType === ''
                }
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
              {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              Quantity
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                disabled={
                  (cta === 'offer' && order.buyerId == null) ||
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
                className="max-w-30"
              />
              {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              Price
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled={
                  (cta === 'offer' && order.buyerId == null) ||
                  order.sellerEnterpriseId == null
                }
                value={selectedItem.unitPrice}
                className="max-w-30"
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

          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <div className="flex flex-col gap-2">
              <Label className="flex">
                GST <span className="text-xs"> (%)</span>
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  value={selectedItem.gstPerUnit}
                  className="max-w-14"
                />
                {errorMsg.gstPerUnit && <ErrorBox msg={errorMsg.gstPerUnit} />}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              {isOrder === 'invoice' ? 'Invoice Value' : 'Value'}
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.totalAmount}
                className="max-w-30"
              />
              {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />}
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
                {errorMsg.totalAmount && (
                  <ErrorBox msg={errorMsg.totalGstAmount} />
                )}
              </div>
            </div>
          )}

          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <div className="flex flex-col gap-2">
              <Label className="flex gap-1">
                Amount
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  value={(
                    (Number(selectedItem.totalAmount) || 0) +
                    (Number(selectedItem.totalGstAmount) || 0)
                  ).toFixed(2)}
                  className="max-w-30"
                />
                {errorMsg.totalAmount && (
                  <ErrorBox msg={errorMsg.totalAmount} />
                )}
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
          {isGstApplicable(
            isPurchasePage
              ? isGstApplicableForPurchaseOrders
              : isGstApplicableForSalesOrders,
          ) && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold">Gross Amount : </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {grossAmt.toFixed(2)}
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
            <span className="rounded-sm border bg-slate-100 p-2">
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
            disabled={orderMutation.isPending || invoiceMutation.isPending}
          >
            {orderMutation.isPending || invoiceMutation.isPending ? (
              <Loading />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default CreateOrder;
