/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getCustomersByNumber } from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { createInvoice } from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'sonner';
import { useCreateSalesInvoiceColumns } from '../columns/useCreateSalesInvoiceColumns';
import DatePickers from '../ui/DatePickers';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithSelect from '../ui/InputWithSelect';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';
import InvoiceTypePopover from './InvoiceTypePopover';

const CreateB2CInvoice = ({
  name,
  isOrder,
  isCreatingInvoice,
  onCancel,
  invoiceType,
  setInvoiceType,
}) => {
  const translations = useTranslations('components.create_B2C_Invoice');

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const b2CInvoiceDraft = SessionStorageService.get('b2CInvoiceDraft');

  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState({
    productName: b2CInvoiceDraft?.itemDraft?.productName || '',
    serviceName: b2CInvoiceDraft?.itemDraft?.serviceName || '',
    sac: b2CInvoiceDraft?.itemDraft?.sac || '',
    hsnCode: b2CInvoiceDraft?.itemDraft?.hsnCode || '',
    productType: b2CInvoiceDraft?.itemDraft?.productType || '',
    productId: b2CInvoiceDraft?.itemDraft?.productId || null,
    quantity: b2CInvoiceDraft?.itemDraft?.quantity || null,
    unitId: b2CInvoiceDraft?.itemDraft?.unitId || null,
    unitPrice: b2CInvoiceDraft?.itemDraft?.unitPrice || null,
    gstPerUnit: b2CInvoiceDraft?.itemDraft?.gstPerUnit || null,
    totalAmount: b2CInvoiceDraft?.itemDraft?.totalAmount || null,
    totalGstAmount: b2CInvoiceDraft?.itemDraft?.totalGstAmount || null,
    batch: b2CInvoiceDraft?.itemDraft?.batch || null,
    batches: b2CInvoiceDraft?.itemDraft?.batches || [],
    expiryDate: b2CInvoiceDraft?.itemDraft?.expiryDate || '',
  });
  const [order, setOrder] = useState({
    clientType: 'B2C',
    sellerEnterpriseId: enterpriseId,
    buyerId: b2CInvoiceDraft?.buyerId || null,
    buyerName: b2CInvoiceDraft?.buyerName || null,
    addressType: b2CInvoiceDraft?.addressType || null,
    buyerAddress: b2CInvoiceDraft?.buyerAddress || null,
    gstAmount: b2CInvoiceDraft?.gstAmount || null,
    amount: b2CInvoiceDraft?.amount || null,
    orderType: 'SALES',
    roundOffType: b2CInvoiceDraft?.roundOffType || 'ADD',
    invoiceType: b2CInvoiceDraft?.invoiceType || '',
    orderItems: b2CInvoiceDraft?.orderItems || [],
    bankAccountId: b2CInvoiceDraft?.bankAccountId || null,
    socialLinks: b2CInvoiceDraft?.socialLinks || null,
    remarks: b2CInvoiceDraft?.remarks || null,
    pin: b2CInvoiceDraft?.pin || null,
    invoiceDate: b2CInvoiceDraft?.invoiceDate || null,
  });
  const [productBatchesMap, setProductBatchesMap] = useState({});

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // save draft to session storage
  function saveDraftToSession({ key, data }) {
    SessionStorageService.set(key, data);
  }

  // [GST/NON-GST Checking]
  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!isCreatingInvoice,
  });
  const isGstApplicableForSalesOrders =
    !!profileDetails?.enterpriseDetails?.gstNumber;

  // [B2C customers]
  useEffect(() => {
    const handler = setTimeout(() => {
      setCustomerIdentifier(inputValue); // This triggers the search query
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler); // Clear on cleanup
    };
  }, [inputValue]);

  // Fetch customers (only when there's input)
  const { data: customersSearchList } = useQuery({
    queryKey: [
      customerApis.getCustomersByNumber.endpointKey,
      customerIdentifier,
    ],
    queryFn: () => getCustomersByNumber(customerIdentifier),
    select: (data) => data.data.data,
    refetchOnWindowFocus: false,
  });

  // Transform API response into select options
  useEffect(() => {
    if (customersSearchList) {
      const transformedSearchedCustomers = customersSearchList.map(
        (customer) => ({
          value: customer.id || customer.mobileNumber,
          label: `${customer.countryCode} ${customer.mobileNumber}`,
          name: customer?.name,
          address: customer?.address,
          number: customer?.numobileNumber,
        }),
      );
      setOptions(transformedSearchedCustomers);
    }
  }, [customersSearchList]);

  // Handle existing selection
  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setOrder((prev) => ({
        ...prev,
        buyerId: selectedOption.value,
        buyerAddress: selectedOption.address,
        buyerName: selectedOption.name,
        addressType: 'deliveryPurchase',
      }));
      // Save the selected existing customer to session storage
      saveDraftToSession({
        key: 'b2CInvoiceDraft',
        data: {
          ...order,
          buyerId: selectedOption.value,
          buyerAddress: selectedOption.address,
          buyerName: selectedOption.name,
          addressType: 'deliveryPurchase',
        },
      });
    } else {
      setOrder((prev) => ({
        ...prev,
        buyerId: null,
        buyerAddress: null,
        buyerName: null,
        addressType: null,
      }));
      // remove the selected existing customer to session storage
      saveDraftToSession({
        key: 'b2CInvoiceDraft',
        data: {
          ...order,
          buyerId: null,
          buyerAddress: null,
          buyerName: null,
          addressType: null,
        },
      });
    }
  };

  // Handle creation of new customer (not in list)
  const handleCreate = (inputValue) => {
    const newOption = {
      value: inputValue,
      label: inputValue,
      name: null,
      address: null,
    };

    if (inputValue?.length === 10) {
      setOptions((prev) => [...prev, newOption]);
      setOrder((prev) => ({
        ...prev,
        buyerId: inputValue,
        buyerName: null,
        buyerAddress: null,
        addressType: null,
      }));

      // Save the new customer to session storage
      saveDraftToSession({
        key: 'b2CInvoiceDraft',
        data: {
          ...order,
          buyerId: inputValue,
          buyerName: null,
          buyerAddress: null,
          addressType: null,
        },
      });
    }
  };

  // [address type]
  const addressTypesOptions = [
    {
      value: 'OTC',
      label: 'OTC (Over-the-Counter)',
    },
    {
      value: 'deliveryPurchase',
      label: 'Delivery Purchase',
    },
  ];

  // [item type]
  const itemTypeOptions = [
    {
      value: 'GOODS',
      label: translations('form.input.item_type.goods'),
    },
    // {
    //   value: 'SERVICE',
    //   label: translations('form.input.item_type.services'),
    // },
  ];

  // Items fetching
  // util fn to check it item is already present in orderItems or not?
  const isItemAlreadyAdded = (itemId, batchId = null) => {
    // 1. If specific batchId provided (checking for batch dropdown)
    if (batchId) {
      return order.orderItems?.some(
        (item) => item.productId === itemId && item.batch?.id === batchId,
      );
    }

    // 2. Checking for the product itself (initial item dropdown)

    // a. Check if added without a batch
    const hasNonBatched = order.orderItems?.some(
      (item) => item.productId === itemId && !item.batch,
    );
    if (hasNonBatched) return true;

    // b. Check if it's a batched item and all batches are added
    const batchesForThisItem = productBatchesMap[itemId];
    if (batchesForThisItem && batchesForThisItem.length > 0) {
      const addedBatchesCount = order.orderItems?.filter(
        (item) => item.productId === itemId && item.batch,
      ).length;
      return addedBatchesCount >= batchesForThisItem.length;
    }

    return false;
  };

  // [Client's Goods and Services]
  // client's catalogue's goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'GOODS',
  });
  // formatting - client's goods options
  const clientsGoodsOptions = goodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id);
    return { value, label, disabled };
  });

  // client's catalogue services fetching
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'SERVICE',
  });
  // formatting - client's services options
  const clientsServicesOptions = servicesData?.map((service) => {
    const value = {
      ...service,
      productType: 'SERVICE',
      serviceName: service.name,
    };
    const label = service.name;

    const disabled = isItemAlreadyAdded(service.id);
    return { value, label, disabled };
  });
  // itemClientListingOptions on the basis of item type
  const itemClientListingOptions =
    order.invoiceType === 'GOODS'
      ? clientsGoodsOptions
      : clientsServicesOptions;

  const validation = ({ order }) => {
    const errorObj = {};

    if (!order?.invoiceDate) {
      errorObj.invoiceDate = translations('form.errorMsg.invoice_date');
    }

    // Buyer Details (for B2C only)
    if (!order?.buyerId) {
      errorObj.buyerId = translations('form.errorMsg.customer');
    }
    if (!order?.buyerName || order.buyerName.trim() === '') {
      errorObj.buyerName = translations('form.errorMsg.customer_name');
    }
    if (
      order?.addressType === 'deliveryPurchase' &&
      (!order?.buyerAddress || order.buyerAddress.trim() === '')
    ) {
      errorObj.buyerAddress = translations('form.errorMsg.customer_address');
    }
    if (!order?.addressType) {
      errorObj.addressType = translations('form.errorMsg.address_type');
    }

    // Invoice Type
    if (order.invoiceType === '') {
      errorObj.invoiceType = translations('form.errorMsg.item_type');
    }

    // Order Items
    if (!order?.orderItems || order.orderItems.length === 0) {
      errorObj.orderItem = translations('form.errorMsg.itemInvoice');
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
        (isGstApplicable(isGstApplicableForSalesOrders)
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

  // mutation - create invoice
  const invoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: (res) => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );
      SessionStorageService.remove('b2CInvoiceDraft');
      router.push(`/dashboard/sales/sales-invoices/${res.data.data.id}`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // handling submit fn
  const handleSubmit = (updateOrder) => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order });

    if (Object.keys(isError).length === 0) {
      const mappedOrderItems = (updateOrder.orderItems || []).map((item) => ({
        ...item,
        batchNo: item.batch?.batchNo || null,
        expiryDate: item.expiryDate
          ? moment(item.expiryDate).format('YYYY-MM-DD')
          : null,
        gstPercentage: Number(item.gstPerUnit) || 0,
      }));

      invoiceMutation.mutate({
        ...updateOrder,
        orderItems: mappedOrderItems,
        invoiceItems: mappedOrderItems,
        buyerId: Number(order.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
      });
    } else {
      setErrorMsg(isError);
    }
  };

  // columns
  const createSalesInvoiceColumns = useCreateSalesInvoiceColumns(
    isOrder,
    setOrder,
    setSelectedItem,
    'b2CInvoiceDraft',
    isGstApplicableForSalesOrders,
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
      <div className="flex items-end gap-0.5">
        <SubHeader
          name={name === 'B2C Invoice' && translations('title.b2cInvoice')}
        ></SubHeader>

        <InvoiceTypePopover
          triggerInvoiceTypeModal={
            <ChevronDown
              className="cursor-pointer hover:text-primary"
              size={20}
            />
          }
          invoiceType={invoiceType}
          setInvoiceType={setInvoiceType}
        />
      </div>

      <>
        {/* Customer section */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Invoice Date */}
            <div className="flex flex-col gap-1.5">
              <Label>
                {translations('form.label.invoice_date')}
                <span className="text-red-600">*</span>
              </Label>

              <div className="relative flex h-10 items-center rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
                <DatePickers
                  selected={
                    order.invoiceDate ? new Date(order.invoiceDate) : null
                  }
                  onChange={(date) => {
                    const formattedForAPI = date
                      ? moment(date).format('YYYY-MM-DD')
                      : null;

                    setOrder((prev) => ({
                      ...prev,
                      invoiceDate: formattedForAPI,
                    }));

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        invoiceDate: formattedForAPI,
                      },
                    });
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="w-full"
                  popperPlacement="end"
                />
              </div>

              {errorMsg.invoiceDate && <ErrorBox msg={errorMsg.invoiceDate} />}
            </div>

            {/* Customer Number */}
            <div className="flex flex-col gap-1.5">
              <Label>
                {translations('form.label.customer')}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <CreatableSelect
                  value={
                    options.find((option) => option.value === order.buyerId) ||
                    null
                  }
                  onChange={handleChange}
                  onCreateOption={handleCreate}
                  onInputChange={(input, { action }) => {
                    if (action === 'input-change') {
                      setInputValue(input);
                    }
                  }}
                  styles={getStylesForSelectComponent()}
                  className="text-sm"
                  isClearable
                  placeholder="+91 1234567890"
                  options={options}
                  noOptionsMessage={() =>
                    translations('form.input.customer.placeholder')
                  }
                />

                {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
              </div>
            </div>

            {/* Customer Name */}
            {order?.buyerId && (
              <div className="flex flex-col gap-1.5">
                <Label>
                  {translations('form.label.customer_name')}
                  <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="text"
                  value={order.buyerName || ''}
                  onChange={(e) => {
                    setOrder((prev) => ({
                      ...prev,
                      buyerName: e.target.value,
                    }));

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        buyerName: e.target.value,
                      },
                    });
                  }}
                  placeholder={translations('form.label.customer_name')}
                  className="text-sm"
                />
                {errorMsg.buyerName && <ErrorBox msg={errorMsg.buyerName} />}
              </div>
            )}

            {/* Address Type */}
            {order?.buyerId && (
              <div className="flex flex-col gap-1.5">
                <Label>
                  {translations('form.label.address_type')}
                  <span className="text-red-600">*</span>
                </Label>
                <ReactSelect
                  value={addressTypesOptions.find(
                    (option) => option.value === order.addressType,
                  )}
                  onChange={(selectedOption) => {
                    if (selectedOption?.value === 'OTC') {
                      setErrorMsg({
                        ...errorMsg,
                        buyerAddress: '',
                      });
                    }
                    setOrder((prev) => ({
                      ...prev,
                      addressType: selectedOption ? selectedOption.value : null,
                      buyerAddress:
                        selectedOption?.value === 'OTC'
                          ? profileDetails?.enterpriseDetails?.address
                          : '',
                    }));

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        addressType: selectedOption
                          ? selectedOption.value
                          : null,
                        buyerAddress:
                          selectedOption?.value === 'OTC'
                            ? profileDetails?.enterpriseDetails?.address
                            : '',
                      },
                    });
                  }}
                  styles={getStylesForSelectComponent()}
                  className="text-sm"
                  isClearable
                  placeholder={translations('form.label.address_type')}
                  options={addressTypesOptions}
                />
                {errorMsg.addressType && (
                  <ErrorBox msg={errorMsg.addressType} />
                )}
              </div>
            )}

            {/* Address */}
            {order?.buyerId && (
              <div className="flex flex-col gap-1.5 lg:col-span-4">
                <Label>
                  {translations('form.label.customer_address')}
                  {order?.addressType === 'deliveryPurchase' && (
                    <span className="text-red-600">*</span>
                  )}
                </Label>

                <Input
                  type="text"
                  disabled={order?.addressType === 'OTC'}
                  value={order.buyerAddress || ''}
                  onChange={(e) => {
                    setOrder((prev) => ({
                      ...prev,
                      buyerAddress: e.target.value,
                    }));

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        buyerAddress: e.target.value,
                      },
                    });
                  }}
                  placeholder={translations('form.label.customer_address')}
                  className="text-sm"
                />
                {errorMsg.buyerAddress && (
                  <ErrorBox msg={errorMsg.buyerAddress} />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Add Items Section */}
        <section className="flex flex-col gap-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* Item Type */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  {translations('form.label.item_type')}
                  <span className="text-red-500">*</span>
                </Label>
                <ReactSelect
                  name="itemType"
                  isDisabled={order.buyerId === null || order.buyerId === ''}
                  placeholder={translations('form.input.item_type.placeholder')}
                  options={itemTypeOptions}
                  styles={getStylesForSelectComponent()}
                  className="w-40 text-sm"
                  value={
                    itemTypeOptions.find(
                      (option) => option.value === order.invoiceType,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    if (!selectedOption) return;

                    const clearedItem = {
                      productName: '',
                      serviceName: '',
                      sac: '',
                      hsnCode: '',
                      productType: '',
                      productId: null,
                      quantity: null,
                      unitId: null,
                      unitPrice: null,
                      gstPerUnit: null,
                      totalAmount: null,
                      totalGstAmount: null,
                      batch: null,
                      batches: [],
                      expiryDate: '',
                    };

                    setSelectedItem(clearedItem);
                    setOrder((prev) => ({
                      ...prev,
                      invoiceType: selectedOption.value,
                    }));

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        invoiceType: selectedOption.value,
                        itemDraft: clearedItem,
                      },
                    });
                  }}
                />
                {errorMsg.invoiceType && (
                  <ErrorBox msg={errorMsg.invoiceType} />
                )}
              </div>

              {/* Item */}
              <div className="flex flex-col gap-1.5">
                <Label>
                  {translations('form.label.item')}
                  <span className="text-red-500">*</span>
                </Label>
                <ReactSelect
                  name="items"
                  value={
                    itemClientListingOptions?.find(
                      (item) => item.value.id === selectedItem.productId,
                    ) ?? null
                  }
                  placeholder={translations('form.input.item.placeholder')}
                  options={itemClientListingOptions}
                  styles={getStylesForSelectComponent()}
                  isOptionDisabled={(option) => option.disabled}
                  className="w-64 text-sm"
                  isDisabled={order.buyerId == null || order.invoiceType === ''}
                  onChange={(selectedOption) => {
                    const selectedItemData = selectedOption?.value;

                    if (selectedItemData) {
                      const updatedItem =
                        selectedItemData.productType === 'GOODS'
                          ? {
                              ...selectedItem,
                              productId: selectedItemData.id,
                              productType: selectedItemData.productType,
                              hsnCode: selectedItemData.hsnCode,
                              productName: selectedItemData.productName,
                              unitPrice: selectedItemData.salesPrice,
                              gstPerUnit: isGstApplicable(
                                isGstApplicableForSalesOrders,
                              )
                                ? selectedItemData.gstPercentage
                                : 0,
                              batches: [],
                              batch: null,
                              expiryDate: '',
                            }
                          : {
                              ...selectedItem,
                              productId: selectedItemData.id,
                              productType: selectedItemData.productType,
                              sac: selectedItemData.sac,
                              serviceName: selectedItemData.serviceName,
                              unitPrice: selectedItemData.rate,
                              gstPerUnit: isGstApplicable(
                                isGstApplicableForSalesOrders,
                              )
                                ? selectedItemData.gstPercentage
                                : 0,
                              batches: [],
                              batch: null,
                              expiryDate: '',
                            };

                      setSelectedItem(updatedItem);

                      if (
                        selectedItemData.productType === 'GOODS' &&
                        selectedItemData.skuId
                      ) {
                        GetProductBatchList({
                          searchString: selectedItemData.skuId,
                        })
                          .then((res) => {
                            const batches = res.data.data.data || [];
                            setSelectedItem((prev) => ({ ...prev, batches }));

                            setProductBatchesMap((prev) => ({
                              ...prev,
                              [selectedItemData.id]: batches,
                            }));
                          })
                          .catch((err) => {
                            toast.error(err.response.data.message);
                          });
                      }

                      saveDraftToSession({
                        key: 'b2CInvoiceDraft',
                        data: {
                          ...order,
                          itemDraft: updatedItem,
                        },
                      });
                    }
                  }}
                />
                {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
              </div>

              {/* Batch */}
              <div className="flex flex-col gap-1.5">
                <Label>Batch</Label>
                <ReactSelect
                  name="batch"
                  value={
                    selectedItem.batch
                      ? {
                          value: selectedItem.batch.id,
                          label: `${selectedItem.batch.batchNo} & ${moment(selectedItem.batch.expiryDate).format('DD/MM/YYYY')}`,
                        }
                      : null
                  }
                  className="w-48 text-sm"
                  placeholder="Select Batch"
                  options={selectedItem.batches?.map((b) => ({
                    value: b.id,
                    label: (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">
                          Batch: {b.batchNo}
                        </span>
                        <span className="text-xs text-neutral-500">
                          Expiry: {moment(b.expiryDate).format('DD/MM/YYYY')}
                        </span>
                      </div>
                    ),
                    original: b,
                    disabled: isItemAlreadyAdded(selectedItem.productId, b.id),
                  }))}
                  isOptionDisabled={(option) => option.disabled}
                  styles={getStylesForSelectComponent()}
                  isDisabled={
                    order.buyerId == null ||
                    selectedItem.productType !== 'GOODS'
                  }
                  onChange={(selectedOption) => {
                    const batchData = selectedOption?.original;
                    const updatedItem = {
                      ...selectedItem,
                      batch: batchData,
                      expiryDate: batchData?.expiryDate || '',
                    };
                    setSelectedItem(updatedItem);
                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        itemDraft: updatedItem,
                      },
                    });
                  }}
                />
              </div>

              {/* Quantity */}
              <div className="flex w-28 flex-col gap-1.5">
                <InputWithSelect
                  id="quantity"
                  name={translations('form.label.quantity')}
                  required={true}
                  disabled={order.buyerId == null}
                  className="h-9"
                  value={
                    selectedItem.quantity == null || selectedItem.quantity === 0
                      ? ''
                      : selectedItem.quantity
                  }
                  onValueChange={(e) => {
                    const inputValue = e.target.value;

                    if (inputValue === '') {
                      setSelectedItem((prev) => ({
                        ...prev,
                        quantity: 0,
                        totalAmount: 0,
                        totalGstAmount: 0,
                      }));
                      return;
                    }

                    if (!/^\d+$/.test(inputValue)) return;
                    const value = Number(inputValue);
                    if (value < 1) return;

                    const totalAmt = parseFloat(
                      (value * (selectedItem.unitPrice || 0)).toFixed(2),
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

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        itemDraft: updatedItem,
                      },
                    });
                  }}
                  unit={selectedItem.unitId}
                  onUnitChange={(val) => {
                    setSelectedItem((prev) => {
                      const updated = { ...prev, unitId: Number(val) };
                      saveDraftToSession({
                        key: 'b2CInvoiceDraft',
                        data: {
                          ...order,
                          itemDraft: updated,
                        },
                      });
                      return updated;
                    });
                  }}
                  units={units?.quantity}
                />
                {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
              </div>

              {/* Price */}
              <div className="flex w-28 flex-col gap-1.5">
                <Label>
                  {translations('form.label.price')}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  disabled={order.buyerId == null}
                  value={
                    selectedItem.unitPrice == null ||
                    selectedItem.unitPrice === 0
                      ? ''
                      : selectedItem.unitPrice
                  }
                  className="h-9"
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    if (inputValue === '') {
                      setSelectedItem((prevValue) => ({
                        ...prevValue,
                        unitPrice: 0,
                        totalAmount: 0,
                        totalGstAmount: 0,
                      }));
                      return;
                    }

                    const value = Number(inputValue);
                    if (value < 0) return;

                    const totalAmt = parseFloat(
                      ((selectedItem.quantity || 0) * value).toFixed(2),
                    );
                    const gstAmt = parseFloat(
                      (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                    );

                    setSelectedItem((prevValue) => ({
                      ...prevValue,
                      unitPrice: value,
                      totalAmount: totalAmt,
                      totalGstAmount: gstAmt,
                    }));

                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...order,
                        itemDraft: {
                          ...selectedItem,
                          unitPrice: value,
                          totalAmount: totalAmt,
                          totalGstAmount: gstAmt,
                        },
                      },
                    });
                  }}
                />
                {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
              </div>

              {/* GST (%) */}
              {isGstApplicable(isGstApplicableForSalesOrders) && (
                <div className="flex w-16 flex-col gap-1.5">
                  <Label>GST %</Label>
                  <Input
                    disabled
                    value={selectedItem.gstPerUnit || ''}
                    className="h-9 bg-neutral-100"
                  />
                </div>
              )}

              {/* Total Value */}
              <div className="flex w-28 flex-col gap-1.5">
                <Label>{translations('form.label.value')}</Label>
                <Input
                  disabled
                  value={selectedItem.totalAmount || ''}
                  className="h-9 bg-neutral-100 font-medium"
                />
              </div>

              {/* Tax Amount */}
              {isGstApplicable(isGstApplicableForSalesOrders) && (
                <div className="flex w-24 flex-col gap-1.5">
                  <Label>Tax Amount</Label>
                  <Input
                    disabled
                    value={selectedItem.totalGstAmount || ''}
                    className="h-9 bg-neutral-100 font-medium"
                  />
                </div>
              )}

              {/* Total Amount */}
              <div className="flex w-40 flex-col gap-1.5">
                <Label>Total Amount</Label>
                <Input
                  disabled
                  value={
                    selectedItem.totalAmount != null
                      ? (
                          Number(selectedItem.totalAmount) +
                          (isGstApplicable(isGstApplicableForSalesOrders)
                            ? Number(selectedItem.totalGstAmount) || 0
                            : 0)
                        ).toFixed(2)
                      : ''
                  }
                  className="h-9 bg-neutral-100 font-semibold text-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-neutral-500 hover:text-red-500"
                onClick={() => {
                  const clearedItem = {
                    productName: '',
                    serviceName: '',
                    sac: '',
                    hsnCode: '',
                    productType: '',
                    productId: null,
                    quantity: null,
                    unitId: null,
                    unitPrice: null,
                    gstPerUnit: 0,
                    totalAmount: null,
                    totalGstAmount: null,
                    batch: null,
                    batches: [],
                    expiryDate: '',
                  };
                  setSelectedItem(clearedItem);

                  saveDraftToSession({
                    key: 'b2CInvoiceDraft',
                    data: {
                      ...order,
                      itemDraft: clearedItem,
                    },
                  });
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="h-9"
                disabled={
                  !selectedItem.productId ||
                  !selectedItem.quantity ||
                  selectedItem.quantity <= 0 ||
                  !selectedItem.unitPrice ||
                  selectedItem.unitPrice <= 0
                }
                onClick={() => {
                  const isDuplicate = isItemAlreadyAdded(
                    selectedItem.productId,
                    selectedItem.batch?.id,
                  );

                  if (isDuplicate) {
                    toast.error(
                      selectedItem.batch
                        ? 'This batch is already added.'
                        : 'This item is already added.',
                    );
                    return;
                  }

                  const updatedOrderItems = [
                    ...(order?.orderItems || []),
                    {
                      ...selectedItem,
                      gstPercentage: selectedItem.gstPerUnit ?? 0,
                    },
                  ];

                  const updatedOrder = {
                    ...order,
                    orderItems: updatedOrderItems,
                  };

                  const clearedItem = {
                    productName: '',
                    serviceName: '',
                    sac: '',
                    hsnCode: '',
                    productType: '',
                    productId: null,
                    quantity: null,
                    unitId: null,
                    unitPrice: null,
                    gstPerUnit: 0,
                    totalAmount: null,
                    totalGstAmount: null,
                    batch: null,
                    batches: [],
                    expiryDate: '',
                  };

                  setOrder(updatedOrder);
                  setSelectedItem(clearedItem);

                  saveDraftToSession({
                    key: 'b2CInvoiceDraft',
                    data: {
                      ...updatedOrder,
                      itemDraft: clearedItem,
                    },
                  });

                  setErrorMsg({});
                }}
                variant="blue_outline"
              >
                {translations('form.ctas.add')}
              </Button>
            </div>
          </div>
        </section>

        {/* selected item table */}
        <DataTable
          data={order.orderItems}
          columns={createSalesInvoiceColumns}
        />

        {/* Summary Footer Section */}
        <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-neutral-200 bg-white p-3 px-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {translations('form.footer.gross_amount')}
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  ₹{' '}
                  {grossAmt.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {translations('form.footer.tax_amount')}
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  ₹{' '}
                  {totalGstAmt.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <div className="h-8 w-[1px] bg-neutral-200"></div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                  Grand Total
                </span>
                <span className="text-sm font-bold text-primary">
                  ₹{' '}
                  {totalAmtWithGst.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button size="sm" onClick={onCancel} variant="outline">
                {translations('form.ctas.cancel')}
              </Button>
              <Button
                size="sm"
                onClick={() => handleSubmit(order)}
                disabled={invoiceMutation.isPending}
              >
                {invoiceMutation.isPending ? (
                  <Loading />
                ) : (
                  translations('form.ctas.create')
                )}
              </Button>
            </div>
          </div>
        </div>
      </>
    </Wrapper>
  );
};

export default CreateB2CInvoice;
