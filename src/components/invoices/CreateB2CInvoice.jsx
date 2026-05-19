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
import { ChevronDown, Calendar, Plus } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'sonner';
import AddBatch from '@/components/inventory/batch/AddBatch';
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
  isOrder, // eslint-disable-line no-unused-vars
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
    skuId: b2CInvoiceDraft?.itemDraft?.skuId || '',
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
    invoiceDate: b2CInvoiceDraft?.invoiceDate || moment().format('YYYY-MM-DD'),
  });
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

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
  const clientsGoodsOptions =
    goodsData?.map((good) => {
      const value = { ...good, productType: 'GOODS', productName: good.name };
      const label = good.name;
      const disabled = isItemAlreadyAdded(good.id);
      return { value, label, disabled };
    }) ?? [];

  // client's catalogue services fetching
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'SERVICE',
  });
  // formatting - client's services options
  const clientsServicesOptions =
    servicesData?.map((service) => {
      const value = {
        ...service,
        productType: 'SERVICE',
        serviceName: service.name,
      };
      const label = service.name;

      const disabled = isItemAlreadyAdded(service.id);
      return { value, label, disabled };
    }) ?? [];

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
      return totalAmt + (Number(orderItem.totalAmount) || 0);
    }, 0);

    const totalGstAmt = order.orderItems.reduce((totalGst, orderItem) => {
      return (
        totalGst +
        (isGstApplicable(isGstApplicableForSalesOrders)
          ? Number(orderItem.totalGstAmount) || 0
          : 0)
      );
    }, 0);

    return { totalAmount, totalGstAmt };
  };

  const { totalAmount, totalGstAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;

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
    const isError = validation({ order: updateOrder });

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
        buyerId: Number(updateOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
      });
    } else {
      setErrorMsg(isError);
    }
  };

  // columns defined inline matching B2B visual style
  const columns = useMemo(
    () => [
      {
        accessorKey: 'productName',
        header: 'Item',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-semibold text-neutral-800">
                {item.productName || item.serviceName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'batch',
        header: 'Batch',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <span className="text-sm font-medium text-neutral-500">
              {item.batch?.batchNo || item.batch || '-'}
            </span>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: () => (
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Qty
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-center text-sm font-semibold text-neutral-600">
              {item.quantity}
            </div>
          );
        },
      },
      {
        accessorKey: 'unitPrice',
        header: () => (
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Price
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="pr-2 text-right text-sm font-semibold text-neutral-600">
              ₹
              {Number(item.unitPrice || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      ...(isGstApplicable(isGstApplicableForSalesOrders)
        ? [
            {
              accessorKey: 'gstPercentage',
              header: () => (
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  GST %
                </div>
              ),
              cell: ({ row }) => {
                const item = row.original;
                return (
                  <div className="text-center text-sm font-medium text-neutral-500">
                    {item.gstPercentage || item.gstPerUnit || 0}%
                  </div>
                );
              },
            },
          ]
        : []),
      {
        accessorKey: 'totalAmount',
        header: () => (
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Value
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const value = Number(item.totalAmount) || 0;
          return (
            <div className="text-neutral-750 pr-2 text-right text-sm font-bold">
              ₹
              {value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      ...(isGstApplicable(isGstApplicableForSalesOrders)
        ? [
            {
              accessorKey: 'totalGstAmount',
              header: () => (
                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Tax
                </div>
              ),
              cell: ({ row }) => {
                const item = row.original;
                const tax = Number(item.totalGstAmount) || 0;
                return (
                  <div className="pr-2 text-right text-sm font-semibold text-neutral-500">
                    ₹
                    {tax.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                );
              },
            },
          ]
        : []),
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          const { index } = row;
          return (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                title="Edit Item"
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-blue-600"
                onClick={() => {
                  setSelectedItem(item);
                  setOrder((prev) => {
                    const updatedItems = prev.orderItems.filter(
                      (_, i) => i !== index,
                    );
                    const updatedOrder = {
                      ...prev,
                      orderItems: updatedItems,
                    };
                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: {
                        ...updatedOrder,
                        itemDraft: item,
                      },
                    });
                    return updatedOrder;
                  });
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                type="button"
                title="Delete Item"
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500"
                onClick={() => {
                  setOrder((prev) => {
                    const updatedItems = prev.orderItems.filter(
                      (_, i) => i !== index,
                    );
                    const updatedOrder = {
                      ...prev,
                      orderItems: updatedItems,
                    };
                    saveDraftToSession({
                      key: 'b2CInvoiceDraft',
                      data: updatedOrder,
                    });
                    return updatedOrder;
                  });
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [isGstApplicableForSalesOrders],
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

  const isItemInputsDisabled = order.buyerId == null || !order.invoiceType;

  return (
    <Wrapper>
      {!isAddingBatchFor && (
        <>
          <div className="sticky top-0 z-20 -mx-4 flex items-end gap-2 border-t bg-white px-3">
            <SubHeader
              name={
                name === 'B2C Invoice' ? translations('title.b2cInvoice') : name
              }
              className="text-xl font-bold text-neutral-800"
            />
            <InvoiceTypePopover
              triggerInvoiceTypeModal={
                <ChevronDown
                  className="mb-1 cursor-pointer text-neutral-500 hover:text-primary"
                  size={20}
                />
              }
              invoiceType={invoiceType}
              setInvoiceType={setInvoiceType}
            />
          </div>

          <div className="flex min-h-[calc(100vh-100px)] flex-col">
            {/* Scrollable content area */}
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
              {/* Customer Details Section */}
              <div className="flex-shrink-0">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
                  Customer Details
                </span>
                <section className="border-b bg-white p-5 shadow-none">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Invoice Date */}
                    <div className="flex flex-col">
                      <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.label.invoice_date')}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex h-10 items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
                        <DatePickers
                          selected={
                            order.invoiceDate
                              ? new Date(order.invoiceDate)
                              : null
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
                          popperPlacement="end"
                          dateFormat="dd/MM/yyyy"
                          placeholderText="dd/mm/yyyy"
                          className="w-full bg-transparent pr-8 text-sm font-medium text-neutral-700 outline-none"
                        />
                        <Calendar
                          className="pointer-events-none absolute right-3 text-neutral-400"
                          size={16}
                        />
                      </div>
                      {errorMsg.invoiceDate && (
                        <div className="mt-1">
                          <ErrorBox msg={errorMsg.invoiceDate} />
                        </div>
                      )}
                    </div>

                    {/* Customer Number */}
                    <div className="flex flex-col">
                      <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.label.customer')}
                        <span className="text-red-500">*</span>
                      </label>
                      <CreatableSelect
                        value={
                          options.find(
                            (option) => option.value === order.buyerId,
                          ) || null
                        }
                        onChange={handleChange}
                        onCreateOption={handleCreate}
                        onInputChange={(input, { action }) => {
                          if (action === 'input-change') {
                            setInputValue(input);
                          }
                        }}
                        styles={getStylesForSelectComponent()}
                        className="text-sm font-medium"
                        classNamePrefix="select"
                        isClearable
                        placeholder="+91 1234567890"
                        options={options}
                        noOptionsMessage={() =>
                          translations('form.input.customer.placeholder')
                        }
                      />
                      {errorMsg.buyerId && (
                        <div className="mt-1">
                          <ErrorBox msg={errorMsg.buyerId} />
                        </div>
                      )}
                    </div>

                    {/* Customer Name */}
                    {order?.buyerId && (
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.customer_name')}
                          <span className="text-red-500">*</span>
                        </label>
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
                          className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                        />
                        {errorMsg.buyerName && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.buyerName} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Address Type */}
                    {order?.buyerId && (
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.address_type')}
                          <span className="text-red-500">*</span>
                        </label>
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
                              addressType: selectedOption
                                ? selectedOption.value
                                : null,
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
                          className="text-sm font-medium"
                          classNamePrefix="select"
                          isClearable
                          placeholder={translations('form.label.address_type')}
                          options={addressTypesOptions}
                        />
                        {errorMsg.addressType && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.addressType} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Item Type */}
                    <div className="flex flex-col">
                      <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.label.item_type')}
                        <span className="text-red-500">*</span>
                      </label>
                      <ReactSelect
                        name="itemType"
                        isDisabled={
                          order.buyerId === null || order.buyerId === ''
                        }
                        placeholder={translations(
                          'form.input.item_type.placeholder',
                        )}
                        options={itemTypeOptions}
                        styles={getStylesForSelectComponent()}
                        className="text-sm font-medium"
                        classNamePrefix="select"
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
                            gstPerUnit: 0,
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
                        <div className="mt-1">
                          <ErrorBox msg={errorMsg.invoiceType} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {order?.buyerId && (
                    <div className="mt-6 flex flex-col">
                      <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.label.customer_address')}
                        {order?.addressType === 'deliveryPurchase' && (
                          <span className="text-red-500">*</span>
                        )}
                      </label>
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
                        placeholder={translations(
                          'form.label.customer_address',
                        )}
                        className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                      />
                      {errorMsg.buyerAddress && (
                        <div className="mt-1">
                          <ErrorBox msg={errorMsg.buyerAddress} />
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>

              {/* Add Items Section */}
              <div className="flex-shrink-0">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
                  Add Item
                </span>
                <section className="border-b bg-white p-4 shadow-none">
                  <div className="flex flex-col gap-4">
                    {/* Row 1: Item, Batch, Qty, Price */}
                    <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                      {/* Item Selection */}
                      <div className="flex flex-col gap-1.5">
                        <label className="flex gap-1 text-xs font-medium text-neutral-500">
                          {translations('form.label.item')}
                          <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          name="items"
                          value={
                            itemClientListingOptions?.find(
                              (item) =>
                                item.value.id === selectedItem.productId,
                            ) ?? null
                          }
                          className="w-full text-sm font-medium"
                          classNamePrefix="select"
                          placeholder={translations(
                            'form.input.item.placeholder',
                          )}
                          options={itemClientListingOptions}
                          styles={getStylesForSelectComponent()}
                          isOptionDisabled={(option) => option.disabled}
                          isDisabled={isItemInputsDisabled}
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
                                      skuId: selectedItemData.skuId,
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
                                    setSelectedItem((prev) => ({
                                      ...prev,
                                      batches,
                                    }));

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
                        {errorMsg.orderItem && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.orderItem} />
                          </div>
                        )}
                      </div>

                      {/* Batch Select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-500">
                          Batch
                        </label>
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
                          className="w-full text-sm font-medium"
                          classNamePrefix="select"
                          placeholder="Select Batch"
                          options={[
                            ...(selectedItem.batches?.map((b) => ({
                              value: b.id,
                              label: (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-semibold">
                                    Batch: {b.batchNo}
                                  </span>
                                  <span className="text-xs text-neutral-400">
                                    Expiry:{' '}
                                    {moment(b.expiryDate).format('DD/MM/YYYY')}
                                  </span>
                                </div>
                              ),
                              original: b,
                              disabled: isItemAlreadyAdded(
                                selectedItem.productId,
                                b.id,
                              ),
                            })) || []),
                            {
                              value: 'ADD_NEW_BATCH',
                              label: (
                                <span className="font-semibold text-primary">
                                  + Add a New Batch
                                </span>
                              ),
                            },
                          ]}
                          isOptionDisabled={(option) => option.disabled}
                          styles={getStylesForSelectComponent()}
                          isDisabled={
                            isItemInputsDisabled ||
                            selectedItem.productType !== 'GOODS'
                          }
                          onChange={(selectedOption) => {
                            if (selectedOption?.value === 'ADD_NEW_BATCH') {
                              setIsAddingBatchFor({
                                skuId:
                                  selectedItem.skuId ||
                                  goodsData?.find(
                                    (g) => g.id === selectedItem.productId,
                                  )?.skuId,
                                productName: selectedItem.productName,
                                productId: selectedItem.productId,
                              });
                              return;
                            }

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

                      {/* Qty Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-500">
                          Qty
                        </label>
                        <InputWithSelect
                          id="quantity"
                          required={true}
                          disabled={isItemInputsDisabled}
                          className="h-10 rounded-lg border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                          value={
                            selectedItem.quantity == null ||
                            selectedItem.quantity === 0
                              ? ''
                              : selectedItem.quantity
                          }
                          onValueChange={(e) => {
                            const inputValue = e.target.value;

                            if (inputValue === '') {
                              const updatedItem = {
                                ...selectedItem,
                                quantity: 0,
                                totalAmount: 0,
                                totalGstAmount: 0,
                              };
                              setSelectedItem(updatedItem);
                              return;
                            }

                            if (!/^\d+$/.test(inputValue)) return;
                            const value = Number(inputValue);
                            if (value < 1) return;

                            const totalAmt = parseFloat(
                              (
                                value * (Number(selectedItem.unitPrice) || 0)
                              ).toFixed(2),
                            );
                            const gstAmt = parseFloat(
                              (
                                totalAmt *
                                ((Number(selectedItem.gstPerUnit) || 0) / 100)
                              ).toFixed(2),
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
                            const updatedItem = {
                              ...selectedItem,
                              unitId: Number(val),
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
                          units={units?.quantity}
                          unitPlaceholder="Unit"
                        />
                      </div>

                      {/* Price */}
                      <div className="flex flex-col gap-1.5">
                        <label className="flex gap-1 text-xs font-medium text-neutral-500">
                          {translations('form.label.price')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          disabled={isItemInputsDisabled}
                          value={
                            selectedItem.unitPrice == null ||
                            selectedItem.unitPrice === 0
                              ? ''
                              : selectedItem.unitPrice
                          }
                          className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                          onChange={(e) => {
                            const inputValue = e.target.value;

                            if (inputValue === '') {
                              const updatedItem = {
                                ...selectedItem,
                                unitPrice: 0,
                                totalAmount: 0,
                                totalGstAmount: 0,
                              };
                              setSelectedItem(updatedItem);
                              return;
                            }

                            const value = Number(inputValue);
                            if (value < 0) return;

                            const totalAmt = parseFloat(
                              (
                                (Number(selectedItem.quantity) || 0) * value
                              ).toFixed(2),
                            );
                            const gstAmt = parseFloat(
                              (
                                totalAmt *
                                ((Number(selectedItem.gstPerUnit) || 0) / 100)
                              ).toFixed(2),
                            );

                            const updatedItem = {
                              ...selectedItem,
                              unitPrice: value,
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
                        />
                        {errorMsg.unitPrice && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.unitPrice} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Gross amount, GST%, Live Item Total, Buttons */}
                    <div
                      className={`grid grid-cols-1 items-end gap-4 ${
                        isGstApplicable(isGstApplicableForSalesOrders)
                          ? 'md:grid-cols-4'
                          : 'md:grid-cols-3'
                      }`}
                    >
                      {/* Gross amount */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-neutral-500">
                          Gross amount
                        </label>
                        <Input
                          disabled
                          value={selectedItem.totalAmount || ''}
                          className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                        />
                      </div>

                      {/* GST % */}
                      {isGstApplicable(isGstApplicableForSalesOrders) && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-medium text-neutral-500">
                            GST %
                          </label>
                          <Input
                            disabled
                            value={selectedItem.gstPerUnit || '18'}
                            className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                          />
                        </div>
                      )}

                      {/* Live Item Total Amount */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-blue-600">
                          Total Amount (Inc. GST)
                        </label>
                        <div className="flex h-10 items-center rounded-lg border border-blue-100 bg-blue-50/30 px-3 text-sm font-bold text-blue-700 shadow-sm">
                          ₹
                          {(
                            (Number(selectedItem.totalAmount) || 0) +
                            (isGstApplicable(isGstApplicableForSalesOrders)
                              ? Number(selectedItem.totalGstAmount) || 0
                              : 0)
                          ).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>

                      {/* Action CTA Buttons */}
                      <div className="flex h-10 items-center gap-3">
                        <Button
                          type="button"
                          disabled={
                            !selectedItem.productId &&
                            !selectedItem.quantity &&
                            !selectedItem.unitPrice
                          }
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
                              data: { ...order, itemDraft: clearedItem },
                            });
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Clear
                        </Button>
                        <Button
                          type="button"
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
                          size="sm"
                          className="flex-1"
                        >
                          <Plus size={15} strokeWidth={2.5} />
                          Add Item
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Line Items Section */}
              <div className="flex-shrink-0">
                <span className="mb-2 block flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary">
                  Line Items
                </span>
                <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border-0 bg-white shadow-none">
                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="min-h-0 w-full flex-1 overflow-auto">
                      <DataTable
                        columns={columns}
                        data={order.orderItems || []}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center bg-gray-100 p-4 text-center text-neutral-400">
                      <svg
                        className="mb-2 h-10 w-10 text-neutral-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3m-11 0h3m-2 0a1 1 0 00-1 1v1a1 1 0 001 1h3a1 1 0 001-1v-1a1 1 0 00-1-1m-3 0h3"
                        />
                      </svg>
                      <p className="text-sm font-medium text-neutral-500">
                        No items added yet
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        Select and add items above to build your invoice.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>

            {/* Action Footer */}
            <div className="sticky bottom-0 z-20 mt-3 flex items-center justify-between gap-2 border-t border-neutral-200 bg-white p-4">
              <div>
                {/* Summary Row */}
                <div className="flex justify-end">
                  <div className="flex items-center gap-8">
                    {/* Gross Amount */}
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.footer.gross_amount')}
                      </span>
                      <span className="mt-1 text-sm font-semibold text-neutral-700">
                        ₹
                        {totalAmount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* Tax Amount */}
                    {isGstApplicable(isGstApplicableForSalesOrders) && (
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.footer.tax_amount')}
                        </span>
                        <span className="mt-1 text-sm font-semibold text-neutral-700">
                          ₹
                          {totalGstAmt.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    )}

                    {/* Vertical line separator */}
                    <div className="h-10 w-[1px] bg-neutral-200"></div>

                    {/* Grand Total */}
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        Grand Total
                      </span>
                      <span className="mt-1 text-base font-extrabold text-neutral-900">
                        ₹
                        {totalAmtWithGst.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={onCancel} size="sm" variant="outline">
                  {translations('form.ctas.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleSubmit(order)}
                  disabled={invoiceMutation.isPending}
                  size="sm"
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
      )}

      {isAddingBatchFor && (
        <div className="h-full w-full">
          <AddBatch
            setIsAdding={(val) => {
              if (!val) {
                if (isAddingBatchFor?.skuId) {
                  GetProductBatchList({
                    searchString: isAddingBatchFor.skuId,
                  }).then((res) => {
                    const batches = res?.data?.data?.data || [];
                    if (selectedItem.productId === isAddingBatchFor.productId) {
                      setSelectedItem((prev) => ({ ...prev, batches }));
                    }
                    setProductBatchesMap((prev) => ({
                      ...prev,
                      [isAddingBatchFor.productId]: batches,
                    }));
                  });
                }
                setIsAddingBatchFor(null);
              }
            }}
            setIsEditing={() => {}}
            initialSku={isAddingBatchFor}
          />
        </div>
      )}
    </Wrapper>
  );
};

export default CreateB2CInvoice;
