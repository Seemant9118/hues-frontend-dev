/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { SessionStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { previewDirectPurchaseInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { createPurchaseInvoice } from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Calendar } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ReactSelect from 'react-select';
import { toast } from 'sonner';
import AddBatch from '@/components/inventory/batch/AddBatch';
import AddModal from '../Modals/AddModal';
import DatePickers from '../ui/DatePickers';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithSelect from '../ui/InputWithSelect';
import InvoicePreview from '../ui/InvoicePreview';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Wrapper from '../wrappers/Wrapper';

const CreatePurchaseInvoice = ({ onCancel, name, cta, isOrder }) => {
  const translations = useTranslations('components.create_edit_order');
  const enterpriseId = getEnterpriseId();

  const purchaseInvoiceDraft = SessionStorageService.get(
    'purchaseInvoiceDraft',
  );

  const router = useRouter();

  const [isPINError, setIsPINError] = useState(false);
  const [url, setUrl] = useState(null);
  const [isInvoicePreview, setIsInvoicePreview] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  const [selectedItem, setSelectedItem] = useState({
    productName: purchaseInvoiceDraft?.itemDraft?.productName || '',
    productType: purchaseInvoiceDraft?.itemDraft?.productType || '',
    skuId: purchaseInvoiceDraft?.itemDraft?.skuId || '',
    hsnCode: purchaseInvoiceDraft?.itemDraft?.hsnCode || '',
    sac: purchaseInvoiceDraft?.itemDraft?.sac || '',
    serviceName: purchaseInvoiceDraft?.itemDraft?.serviceName || '',
    productId: purchaseInvoiceDraft?.itemDraft?.productId || null,
    quantity: purchaseInvoiceDraft?.itemDraft?.quantity || null,
    unitId: purchaseInvoiceDraft?.itemDraft?.unitId || null,
    unitPrice: purchaseInvoiceDraft?.itemDraft?.unitPrice || null,
    gstPerUnit: purchaseInvoiceDraft?.itemDraft?.gstPerUnit || 0,
    totalAmount: purchaseInvoiceDraft?.itemDraft?.totalAmount || null,
    totalGstAmount: purchaseInvoiceDraft?.itemDraft?.totalGstAmount || null,
    batch: purchaseInvoiceDraft?.itemDraft?.batch || null,
    batches: purchaseInvoiceDraft?.itemDraft?.batches || [],
    expiryDate: purchaseInvoiceDraft?.itemDraft?.expiryDate || '',
  });

  const [order, setOrder] = useState({
    clientType: 'B2B',
    sellerEnterpriseId: purchaseInvoiceDraft?.sellerEnterpriseId,
    buyerId: enterpriseId,
    gstAmount: purchaseInvoiceDraft?.gstAmount || null,
    amount: purchaseInvoiceDraft?.amount || null,
    orderType: 'PURCHASE',
    invoiceType: purchaseInvoiceDraft?.invoiceType || '',
    orderItems: purchaseInvoiceDraft?.orderItems || [],
    bankAccountId: purchaseInvoiceDraft?.bankAccountId || null,
    socialLinks: purchaseInvoiceDraft?.socialLinks || null,
    remarks: purchaseInvoiceDraft?.remarks || null,
    pin: purchaseInvoiceDraft?.pin || null,
    billingAddressId: purchaseInvoiceDraft?.billingAddressId || null,
    shippingAddressId: purchaseInvoiceDraft?.shippingAddressId || null,
    selectedValue: purchaseInvoiceDraft?.selectedValue || null,
    selectedGstNumber: null,
    getAddressRelatedData: purchaseInvoiceDraft?.getAddressRelatedData || null,
    invoiceDate: purchaseInvoiceDraft?.invoiceDate || null,
    source: purchaseInvoiceDraft?.source || '',
    refrenceNumber: purchaseInvoiceDraft?.refrenceNumber || '',
    roundOffAmount: purchaseInvoiceDraft?.roundOffAmount || 0,
    roundOffType: purchaseInvoiceDraft?.roundOffType || 'ADD',
  });
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  const [
    isGstApplicableForSelectedVendor,
    setIsGstApplicableForSelectedVendor,
  ] = useState(purchaseInvoiceDraft?.isGstApplicableForSelectedVendor || false);

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // vendors
  const { data: vendorData } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'PURCHASE' }),
    select: (res) => res.data.data.users,
    enabled: !!enterpriseId,
  });

  const vendorOptions = [
    ...(vendorData?.map((vendor) => {
      const vendorId = vendor?.id;
      const label = vendor?.invitation?.userDetails?.name || 'Unknown Vendor';
      const gstNumber = vendor?.invitation?.userDetails?.gstNumber || null;

      return {
        value: vendorId,
        label,
        gstNumber,
      };
    }) ?? []),

    {
      value: 'add-new-vendor',
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> Add New Vendor
        </span>
      ),
    },
  ];

  const itemTypeOptions = [
    {
      value: 'GOODS',
      label: translations('form.input.item_type.goods'),
    },
    {
      value: 'SERVICE',
      label: translations('form.input.item_type.services'),
    },
  ];

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

  // goods
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'GOODS',
  });

  const vendorsGoodsOptions =
    goodsData?.map((good) => {
      const value = { ...good, productType: 'GOODS', productName: good.name };
      const label = good.name;

      return { value, label, disabled: isItemAlreadyAdded(good.id) };
    }) ?? [];

  // services (kept for future)
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'SERVICE',
  });

  const vendorsServicesOptions =
    servicesData?.map((service) => {
      const value = {
        ...service,
        productType: 'SERVICE',
        serviceName: service.name,
      };
      const label = service.name;

      return { value, label, disabled: isItemAlreadyAdded(service.id) };
    }) ?? [];

  const itemVendorListingOptions =
    order.invoiceType === 'GOODS'
      ? vendorsGoodsOptions
      : vendorsServicesOptions;

  // Γ£à validations
  const validation = ({ order }) => {
    const errorObj = {};

    if (order?.sellerEnterpriseId == null) {
      errorObj.sellerEnterpriseId = '*Please select vendor';
    }

    if (!order.invoiceType) {
      errorObj.invoiceType = translations('form.errorMsg.item_type');
    }

    if (!order?.source || String(order.source).trim() === '') {
      errorObj.source = '*Please enter Source';
    }

    if (!order?.refrenceNumber || String(order.refrenceNumber).trim() === '') {
      errorObj.refrenceNumber = '*Please enter Invoice No.';
    }

    if (!order?.invoiceDate) {
      errorObj.invoiceDate = translations('form.errorMsg.invoice_date');
    }

    if (!order?.orderItems || order.orderItems.length === 0) {
      errorObj.orderItem =
        isOrder === 'invoice'
          ? translations('form.errorMsg.itemInvoice')
          : translations('form.errorMsg.itemOrder');
    }

    if (Number(order.roundOffAmount) < 0) {
      errorObj.roundOffAmount = '*Round-off amount cannot be negative';
    }

    return errorObj;
  };

  const handleSetTotalAmt = () => {
    const totalAmount = order.orderItems.reduce(
      (totalAmt, orderItem) => totalAmt + (Number(orderItem.totalAmount) || 0),
      0,
    );

    const totalGstAmt = order.orderItems.reduce((totalGst, orderItem) => {
      return (
        totalGst +
        (isGstApplicable(isGstApplicableForSelectedVendor)
          ? Number(orderItem.totalGstAmount) || 0
          : 0)
      );
    }, 0);

    const totalDiscountAmt = order.orderItems.reduce(
      (totalDisc, orderItem) =>
        totalDisc + (Number(orderItem.discountAmount) || 0),
      0,
    );

    return { totalAmount, totalGstAmt, totalDiscountAmt };
  };

  const addItemToOrder = () => {
    const updatedOrderItems = [
      ...(order?.orderItems || []),
      {
        ...selectedItem,
        unitPrice: Number(selectedItem.unitPrice),
        totalAmount: Number(selectedItem.totalAmount),
        totalGstAmount: Number(selectedItem.totalGstAmount),
        gstPercentage: Number(selectedItem.gstPerUnit ?? 0),
      },
    ];

    const updatedOrder = {
      ...order,
      orderItems: updatedOrderItems,
    };

    const clearedItem = {
      productName: '',
      productType: '',
      hsnCode: '',
      sac: '',
      serviceName: '',
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
      key: 'purchaseInvoiceDraft',
      data: {
        ...updatedOrder,
        itemDraft: clearedItem,
        isGstApplicableForSelectedVendor,
      },
    });

    setErrorMsg({});
  };

  const grossAmt = order.orderItems.reduce(
    (acc, orderItem) => acc + (Number(orderItem.totalAmount) || 0),
    0,
  );

  const { totalAmount, totalGstAmt, totalDiscountAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;
  const finalTotal =
    order.roundOffType === 'SUBTRACT'
      ? totalAmtWithGst - (Number(order.roundOffAmount) || 0)
      : totalAmtWithGst + (Number(order.roundOffAmount) || 0);

  // create invoice mutation
  const invoiceMutation = useMutation({
    mutationFn: createPurchaseInvoice,
    onSuccess: (res) => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );

      SessionStorageService.remove('purchaseInvoiceDraft');

      router.push(`/dashboard/purchases/purchase-invoices/${res.data.data.id}`);
    },
    onError: (error) => {
      if (
        error.response.data.error === 'USER_PIN_NOT_FOUND' ||
        error.response.data.error === 'INVALID_PIN'
      ) {
        setIsPINError(true);
      }
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = (updatedOrder) => {
    const isError = validation({ order: updatedOrder });

    if (Object.keys(isError).length === 0) {
      const mappedItems = updatedOrder.orderItems.map((item) => ({
        ...item,
        productId: item.productId || item.catalogueItemId || item.id,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        gstPerUnit: Number(item.gstPerUnit) || 0,
        totalAmount: Number(item.totalAmount) || 0,
        totalGstAmount: Number(item.totalGstAmount) || 0,
        productType: item.productType || updatedOrder.invoiceType || 'GOODS',
        discountPercentage: Number(item.discountPercentage) || 0,
        discountAmount: Number(item.discountAmount) || 0,
        batchNo: item.batch?.batchNo || null,
        expiryDate: item.expiryDate
          ? moment(item.expiryDate).format('YYYY-MM-DD')
          : null,
        gstPercentage: Number(item.gstPerUnit) || 0,
      }));

      invoiceMutation.mutate({
        ...updatedOrder,
        orderItems: mappedItems,
        invoiceItems: mappedItems,
        buyerId: Number(updatedOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        roundOffAmount: finalTotal,
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
      });
      setErrorMsg({});
    } else {
      setErrorMsg(isError);
    }
  };

  // preview invoice
  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewDirectPurchaseInvoice.endpointKey],
    mutationFn: previewDirectPurchaseInvoice,
    onSuccess: (data) => {
      if (data?.data?.data) {
        const base64StrToRenderPDF = data?.data?.data;
        const newUrl = `data:application/pdf;base64,${base64StrToRenderPDF}`;
        setUrl(newUrl);
        setIsInvoicePreview(true);
      }
    },
    onError: (error) =>
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      ),
  });

  const handlePreview = (updatedOrder) => {
    const isError = validation({ order: updatedOrder });

    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      const mappedItems = updatedOrder.orderItems.map((item) => ({
        ...item,
        productId: item.productId || item.catalogueItemId || item.id,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        gstPerUnit: Number(item.gstPerUnit) || 0,
        totalAmount: Number(item.totalAmount) || 0,
        totalGstAmount: Number(item.totalGstAmount) || 0,
        productType: item.productType || updatedOrder.invoiceType || 'GOODS',
        discountPercentage: Number(item.discountPercentage) || 0,
        discountAmount: Number(item.discountAmount) || 0,
        batchNo: item.batch?.batchNo || null,
        expiryDate: item.expiryDate
          ? moment(item.expiryDate).format('YYYY-MM-DD')
          : null,
        gstPercentage: Number(item.gstPerUnit) || 0,
      }));

      previewInvMutation.mutate({
        ...updatedOrder,
        orderItems: mappedItems,
        invoiceItems: mappedItems,
        buyerId: Number(updatedOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        roundOffAmount: finalTotal,
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
      });
    } else {
      setErrorMsg(isError);
    }
  };

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
      ...(isGstApplicable(isGstApplicableForSelectedVendor)
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
      ...(isGstApplicable(isGstApplicableForSelectedVendor)
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
                      key: 'purchaseInvoiceDraft',
                      data: {
                        ...updatedOrder,
                        itemDraft: item,
                        isGstApplicableForSelectedVendor,
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
                      key: 'purchaseInvoiceDraft',
                      data: {
                        ...updatedOrder,
                        isGstApplicableForSelectedVendor,
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [isGstApplicableForSelectedVendor],
  );

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Invoice" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  const isItemInputsDisabled =
    (cta === 'bid' && order.sellerEnterpriseId == null) || !order.invoiceType;

  return (
    <Wrapper>
      {!isAddingBatchFor && (
        <>
          <div className="sticky top-0 z-20 -mx-4 flex items-end gap-2 border-t bg-white px-3">
            <SubHeader
              name={name}
              className="text-xl font-bold text-neutral-800"
            />
          </div>

          {!isInvoicePreview && (
            <div className="flex min-h-[calc(100vh-100px)] flex-col">
              {/* Scrollable content area */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
                {/* Invoice Details Section */}
                <div className="flex-shrink-0">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
                    Invoice Details
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
                                ? date.toISOString()
                                : null;

                              setOrder((prev) => ({
                                ...prev,
                                invoiceDate: formattedForAPI,
                              }));

                              saveDraftToSession({
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...order,
                                  invoiceDate: formattedForAPI,
                                  isGstApplicableForSelectedVendor,
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

                      {/* Source */}
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.source')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={order.source}
                          onValueChange={(value) => {
                            const updatedOrder = {
                              ...order,
                              source: value,
                            };
                            setOrder(updatedOrder);

                            saveDraftToSession({
                              key: 'purchaseInvoiceDraft',
                              data: {
                                ...updatedOrder,
                                isGstApplicableForSelectedVendor,
                              },
                            });
                          }}
                        >
                          <SelectTrigger className="h-10 border-neutral-200 text-sm font-medium shadow-sm focus:ring-1 focus:ring-primary/20">
                            <SelectValue
                              placeholder={translations(
                                'form.input.source.placeholder',
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tally">Tally</SelectItem>
                            <SelectItem value="other">Other ERP</SelectItem>
                          </SelectContent>
                        </Select>
                        {errorMsg.source && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.source} />
                          </div>
                        )}
                      </div>

                      {/* Reference No */}
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.reference_number')}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                          placeholder={translations(
                            'form.input.reference_number.placeholder',
                          )}
                          value={order.refrenceNumber || ''}
                          onChange={(e) => {
                            const { value } = e.target;
                            const updatedOrder = {
                              ...order,
                              refrenceNumber: value,
                            };
                            setOrder(updatedOrder);
                            saveDraftToSession({
                              key: 'purchaseInvoiceDraft',
                              data: {
                                ...updatedOrder,
                                isGstApplicableForSelectedVendor,
                              },
                            });

                            if (errorMsg?.refrenceNumber) {
                              setErrorMsg((prev) => ({
                                ...prev,
                                refrenceNumber: '',
                              }));
                            }
                          }}
                        />
                        {errorMsg.refrenceNumber && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.refrenceNumber} />
                          </div>
                        )}
                      </div>

                      {/* Vendor Select */}
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Vendor
                          <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          name="vendors"
                          placeholder="Select vendor"
                          options={vendorOptions}
                          styles={getStylesForSelectComponent()}
                          className="text-sm font-medium"
                          classNamePrefix="select"
                          value={
                            vendorOptions?.find(
                              (option) =>
                                option.value === order?.sellerEnterpriseId,
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            if (!selectedOption) return;

                            const { value: id, gstNumber } = selectedOption;

                            if (id === 'add-new-vendor') {
                              setIsModalOpen(true);
                              return;
                            }

                            const gstApplicable = !!gstNumber;
                            setIsGstApplicableForSelectedVendor(gstApplicable);

                            const updatedOrder = {
                              ...order,
                              sellerEnterpriseId: id,
                              selectedValue: selectedOption,
                              buyerType: 'UNCONFIRMED_ENTERPRISE',
                              getAddressRelatedData: {
                                clientId: enterpriseId,
                                clientEnterpriseId: enterpriseId,
                              },
                            };

                            setOrder(updatedOrder);

                            saveDraftToSession({
                              key: 'purchaseInvoiceDraft',
                              data: {
                                ...updatedOrder,
                                isGstApplicableForSelectedVendor: gstApplicable,
                              },
                            });

                            if (errorMsg?.sellerEnterpriseId) {
                              setErrorMsg((prev) => ({
                                ...prev,
                                sellerEnterpriseId: '',
                              }));
                            }
                          }}
                        />
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
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.sellerEnterpriseId} />
                          </div>
                        )}
                      </div>

                      {/* Item Type */}
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.item_type')}
                          <span className="text-red-500">*</span>
                        </label>
                        <ReactSelect
                          name="itemType"
                          placeholder={translations(
                            'form.input.item_type.placeholder',
                          )}
                          options={itemTypeOptions}
                          styles={getStylesForSelectComponent()}
                          className="text-sm font-medium"
                          classNamePrefix="select"
                          value={
                            itemTypeOptions?.find(
                              (option) => option.value === order.invoiceType,
                            ) || null
                          }
                          onChange={(selectedOption) => {
                            if (!selectedOption) return;

                            const clearedItem = {
                              productName: '',
                              productType: '',
                              hsnCode: '',
                              sac: '',
                              serviceName: '',
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

                            const updatedOrder = {
                              ...order,
                              invoiceType: selectedOption.value,
                              orderItems: [],
                            };

                            setOrder(updatedOrder);

                            saveDraftToSession({
                              key: 'purchaseInvoiceDraft',
                              data: {
                                ...updatedOrder,
                                isGstApplicableForSelectedVendor,
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
                              itemVendorListingOptions?.find(
                                (item) =>
                                  item.value.id === selectedItem.productId,
                              ) ?? null
                            }
                            className="w-full text-sm font-medium"
                            classNamePrefix="select"
                            placeholder={translations(
                              'form.input.item.placeholder',
                            )}
                            options={itemVendorListingOptions}
                            styles={getStylesForSelectComponent()}
                            isOptionDisabled={(option) => option.disabled}
                            isDisabled={isItemInputsDisabled}
                            onChange={(selectedOption) => {
                              const selectedItemData = selectedOption?.value;

                              if (selectedItemData) {
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

                                const updatedItem =
                                  selectedItemData.productType === 'GOODS'
                                    ? {
                                        ...selectedItem,
                                        productId: selectedItemData.id,
                                        productType:
                                          selectedItemData.productType,
                                        skuId: selectedItemData.skuId,
                                        hsnCode: selectedItemData.hsnCode,
                                        productName:
                                          selectedItemData.productName,
                                        unitPrice: null,
                                        gstPerUnit: isGstApplicable(
                                          isGstApplicableForSelectedVendor,
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
                                        productType:
                                          selectedItemData.productType,
                                        sac: selectedItemData.sac,
                                        serviceName:
                                          selectedItemData.serviceName,
                                        unitPrice: null,
                                        gstPerUnit: isGstApplicable(
                                          isGstApplicableForSelectedVendor,
                                        )
                                          ? selectedItemData.gstPercentage
                                          : 0,
                                        batches: [],
                                        batch: null,
                                        expiryDate: '',
                                      };

                                setSelectedItem(updatedItem);

                                saveDraftToSession({
                                  key: 'purchaseInvoiceDraft',
                                  data: {
                                    ...order,
                                    itemDraft: updatedItem,
                                    isGstApplicableForSelectedVendor,
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
                            Batch & Expiry
                          </label>
                          <ReactSelect
                            name="batch"
                            value={
                              selectedItem.batch
                                ? {
                                    value: selectedItem.batch.id,
                                    label: `Batch-${selectedItem.batch.batchNo} & Expiry-${moment(selectedItem.batch.expiryDate).format('DD/MM/YYYY')}`,
                                  }
                                : null
                            }
                            className="w-full text-sm font-medium"
                            classNamePrefix="select"
                            placeholder="Select Batch & Expiry"
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
                                      {moment(b.expiryDate).format(
                                        'DD/MM/YYYY',
                                      )}
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
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...order,
                                  itemDraft: updatedItem,
                                  isGstApplicableForSelectedVendor,
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

                              const value = Number(inputValue);
                              if (!/^\d+$/.test(inputValue) || value < 1)
                                return;

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
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...order,
                                  itemDraft: updatedItem,
                                  isGstApplicableForSelectedVendor,
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
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...order,
                                  itemDraft: updatedItem,
                                  isGstApplicableForSelectedVendor,
                                },
                              });
                            }}
                            units={units?.quantity}
                            unitPlaceholder="Unit"
                          />
                          {errorMsg.quantity && (
                            <div className="mt-1">
                              <ErrorBox msg={errorMsg.quantity} />
                            </div>
                          )}
                        </div>

                        {/* Price Input */}
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
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...order,
                                  itemDraft: updatedItem,
                                  isGstApplicableForSelectedVendor,
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

                      {/* Row 2: Price, GST%, Live Item Total, Buttons */}
                      <div
                        className={`grid grid-cols-1 items-end gap-4 ${
                          isGstApplicable(isGstApplicableForSelectedVendor)
                            ? 'md:grid-cols-4'
                            : 'md:grid-cols-3'
                        }`}
                      >
                        {/* Gross Amount */}
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
                        {isGstApplicable(isGstApplicableForSelectedVendor) && (
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-neutral-500">
                              GST %
                            </label>
                            <Input
                              disabled
                              value={selectedItem.gstPerUnit || ''}
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
                              (isGstApplicable(isGstApplicableForSelectedVendor)
                                ? Number(selectedItem.totalGstAmount) || 0
                                : 0)
                            ).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                        </div>

                        {/* Action Buttons */}
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
                                productType: '',
                                hsnCode: '',
                                sac: '',
                                serviceName: '',
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
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...order,
                                  itemDraft: clearedItem,
                                  isGstApplicableForSelectedVendor,
                                },
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
                            disabled={isItemInputsDisabled}
                            onClick={() => {
                              if (
                                isItemAlreadyAdded(
                                  selectedItem.productId,
                                  selectedItem.batch?.id,
                                )
                              ) {
                                toast.error('Item/Batch already added');
                                return;
                              }
                              addItemToOrder();
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
                      {isGstApplicable(isGstApplicableForSelectedVendor) && (
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                            {translations('form.footer.gross_amount')}
                          </span>
                          <span className="mt-1 text-sm font-semibold text-neutral-700">
                            ₹
                            {grossAmt.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}

                      {/* Tax Amount */}
                      {isGstApplicable(isGstApplicableForSelectedVendor) && (
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

                      {/* Round Off Container */}
                      <div className="flex flex-col border-l border-neutral-200 pl-8 text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.footer.round_off')}
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                          <Select
                            value={order.roundOffType}
                            onValueChange={(val) => {
                              const updatedOrder = {
                                ...order,
                                roundOffType: val,
                              };
                              setOrder(updatedOrder);
                              saveDraftToSession({
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...updatedOrder,
                                  isGstApplicableForSelectedVendor,
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="h-8 w-24 border-neutral-200 text-[10px] font-semibold focus:ring-1 focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADD" className="text-xs">
                                (+) Add
                              </SelectItem>
                              <SelectItem value="SUBTRACT" className="text-xs">
                                (-) Subtract
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="text"
                            placeholder="0.00"
                            className="h-8 w-16 rounded-lg border-neutral-200 text-right text-xs font-semibold"
                            value={order.roundOffAmount}
                            onChange={(e) => {
                              const val = e.target.value.replace(
                                /[^0-9.]/g,
                                '',
                              );
                              const parts = val.split('.');
                              if (parts[1] && parts[1].length > 3) return;

                              const updatedOrder = {
                                ...order,
                                roundOffAmount: val,
                              };
                              setOrder(updatedOrder);
                              saveDraftToSession({
                                key: 'purchaseInvoiceDraft',
                                data: {
                                  ...updatedOrder,
                                  isGstApplicableForSelectedVendor,
                                },
                              });
                            }}
                          />
                        </div>
                        {errorMsg.roundOffAmount && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.roundOffAmount} />
                          </div>
                        )}
                      </div>

                      {/* Vertical line separator */}
                      <div className="h-10 w-[1px] bg-neutral-200"></div>

                      {/* Grand Total */}
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Grand Total
                        </span>
                        <span className="mt-1 text-base font-extrabold text-primary">
                          ₹
                          {finalTotal.toLocaleString('en-IN', {
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
                    onClick={() => {
                      isOrder === 'invoice'
                        ? handlePreview(order)
                        : handleSubmit(order);
                    }}
                    disabled={invoiceMutation.isPending}
                    size="sm"
                  >
                    {invoiceMutation.isPending ? (
                      <Loading />
                    ) : isOrder === 'invoice' ? (
                      translations('form.ctas.next')
                    ) : (
                      translations('form.ctas.create')
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isInvoicePreview && (
            <InvoicePreview
              order={order}
              setOrder={setOrder}
              getAddressRelatedData={order?.getAddressRelatedData}
              setIsPreviewOpen={setIsInvoicePreview}
              url={url}
              isPDFProp={true}
              isPendingInvoice={invoiceMutation.isPending}
              handleCreateFn={handleSubmit}
              handlePreview={handlePreview}
              isCreatable={true}
              isAddressAddable={true}
              isCustomerRemarksAddable={true}
              isBankAccountDetailsSelectable={true}
              isActionable={true}
              isPINError={isPINError}
              setIsPINError={setIsPINError}
            />
          )}
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

export default CreatePurchaseInvoice;
