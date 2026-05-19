import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import { Input } from '@/components/ui/input';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  createClient,
  getClients,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  createInvoiceForAcceptedOrder,
  previewDirectInvoice,
  previewInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import {
  createInvoice,
  GetSales,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronDown, Info, Plus, Calendar } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import AddBatch from '@/components/inventory/batch/AddBatch';
import AddModal from '../Modals/AddModal';
import Tooltips from '../auth/Tooltips';
import { DataTable } from '../table/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
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
import InvoiceTypePopover from './InvoiceTypePopover';

const CreateB2BInvoice = ({
  isCreatingInvoice,
  onCancel,
  name,
  cta,
  isOrder,
  invoiceType,
  setInvoiceType,
}) => {
  const translations = useTranslations('components.create_edit_order');

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const b2bInvoiceDraft = SessionStorageService.get('b2bInvoiceDraft');

  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');

  const [isPINError, setIsPINError] = useState(false);
  const [url, setUrl] = useState(null);
  const [isInvoicePreview, setIsInvoicePreview] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  const [selectedItem, setSelectedItem] = useState({
    productName: b2bInvoiceDraft?.itemDraft?.productName || '',
    productType: b2bInvoiceDraft?.itemDraft?.productType || '',
    hsnCode: b2bInvoiceDraft?.itemDraft?.hsnCode || '',
    skuId: b2bInvoiceDraft?.itemDraft?.skuId || '',
    sac: b2bInvoiceDraft?.itemDraft?.sac || '',
    serviceName: b2bInvoiceDraft?.itemDraft?.serviceName || '',
    productId: b2bInvoiceDraft?.itemDraft?.productId || null,
    quantity: b2bInvoiceDraft?.itemDraft?.quantity || null,
    unitId: b2bInvoiceDraft?.itemDraft?.unitId || null,
    unitPrice: b2bInvoiceDraft?.itemDraft?.unitPrice || null,
    gstPerUnit: b2bInvoiceDraft?.itemDraft?.gstPerUnit || 0,
    totalAmount: b2bInvoiceDraft?.itemDraft?.totalAmount || null,
    totalGstAmount: b2bInvoiceDraft?.itemDraft?.totalGstAmount || null,
    batch: b2bInvoiceDraft?.itemDraft?.batch || null,
    batches: b2bInvoiceDraft?.itemDraft?.batches || [],
    expiryDate: b2bInvoiceDraft?.itemDraft?.expiryDate || '',
  });

  const [order, setOrder] = useState({
    source: b2bInvoiceDraft?.source || '',
    invoiceReferenceNumber: b2bInvoiceDraft?.invoiceReferenceNumber || null,
    orderId: b2bInvoiceDraft?.orderId || null,
    selectedOrder: b2bInvoiceDraft?.selectedOrder || null,
    saveAsGstDraft: b2bInvoiceDraft?.saveAsGstDraft || false,
    authorizedPersonId: b2bInvoiceDraft?.authorizedPersonId || null,
    authorizedPerson: b2bInvoiceDraft?.authorizedPerson || null,
    clientType: 'B2B',
    sellerEnterpriseId: enterpriseId,
    buyerId: b2bInvoiceDraft?.buyerId || null,
    gstAmount: b2bInvoiceDraft?.gstAmount || null,
    amount: b2bInvoiceDraft?.amount || null,
    orderType: 'SALES',
    roundOffType: b2bInvoiceDraft?.roundOffType || 'ADD',
    invoiceType: b2bInvoiceDraft?.invoiceType || '',
    orderItems: b2bInvoiceDraft?.orderItems || [],
    bankAccountId: b2bInvoiceDraft?.bankAccountId || null,
    socialLinks: b2bInvoiceDraft?.socialLinks || null,
    remarks: b2bInvoiceDraft?.remarks || null,
    pin: b2bInvoiceDraft?.pin || null,
    billingAddressId: b2bInvoiceDraft?.billingAddressId || null,
    shippingAddressId: b2bInvoiceDraft?.shippingAddressId || null,
    selectedValue: b2bInvoiceDraft?.selectedValue || null,
    selectedGstNumber: null,
    getAddressRelatedData: b2bInvoiceDraft?.getAddressRelatedData || null,
    invoiceDate: b2bInvoiceDraft?.invoiceDate || moment().format('YYYY-MM-DD'),
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

  // profile details
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!isCreatingInvoice && isPurchasePage === false,
  });

  const isGstApplicableForSalesOrders =
    isPurchasePage === false && !!profileDetails?.enterpriseDetails?.gstNumber;

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
              {item.isFromLinkedOrder && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  From Order
                </span>
              )}
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
                <div className="text-center text-[10px] font-bold font-medium uppercase tracking-wider text-neutral-400">
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
              {/* Pencil/Edit Icon */}
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
                      key: 'b2bInvoiceDraft',
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
              {/* Cross/Delete Icon */}
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
                      key: 'b2bInvoiceDraft',
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
    [isGstApplicableForSalesOrders, translations],
  );

  // clients
  const { data: customerData } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
    enabled: order.clientType === 'B2B',
  });

  const clientOptions = [
    ...(customerData?.map((customer) => {
      const value = customer?.client?.id || customer?.id;
      const label =
        customer?.client?.name || customer.invitation?.userDetails?.name;

      const clientId = customer?.id;
      const clientEnterpriseId = customer?.client?.id;
      const isEnterpriseActive = !!customer?.client?.id;

      return {
        value,
        label,
        clientId,
        clientEnterpriseId,
        isEnterpriseActive,
      };
    }) ?? []),
    {
      value: 'add-new-client',
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('form.input.client.add_new_client')}
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
    enabled: cta === 'offer' && order.invoiceType === 'GOODS',
  });

  const clientsGoodsOptions =
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
    enabled: cta === 'offer' && order.invoiceType === 'SERVICE',
  });

  const clientsServicesOptions =
    servicesData?.map((service) => {
      const value = {
        ...service,
        productType: 'SERVICE',
        serviceName: service.name,
      };
      const label = service.name;

      return { value, label, disabled: isItemAlreadyAdded(service.id) };
    }) ?? [];

  const itemClientListingOptions =
    order.invoiceType === 'GOODS'
      ? clientsGoodsOptions
      : clientsServicesOptions;

  // validations
  const validation = ({ order }) => {
    const errorObj = {};

    if (!order.source) {
      errorObj.source = translations('form.errorMsg.source');
    }

    if (order.source !== 'hues' && !order.invoiceReferenceNumber) {
      errorObj.invoiceReferenceNumber = translations(
        'form.errorMsg.reference_number',
      );
    }

    if (order.clientType === 'B2B' && order?.buyerId == null) {
      errorObj.buyerId = translations('form.errorMsg.client');
    }

    if (!order.invoiceType) {
      errorObj.invoiceType = translations('form.errorMsg.item_type');
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
        (isGstApplicable(isGstApplicableForSalesOrders)
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

  const { totalAmount, totalGstAmt, totalDiscountAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;
  const roundedTotal = Math.round(totalAmtWithGst);
  const roundOff = (roundedTotal - totalAmtWithGst).toFixed(2);

  // create invoice mutation
  const invoiceMutation = useMutation({
    mutationFn: (data) => {
      if (data.orderId) {
        return createInvoiceForAcceptedOrder(data);
      }
      return createInvoice(data);
    },
    onSuccess: (res) => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );
      SessionStorageService.remove('b2bInvoiceDraft');
      router.push(`/dashboard/sales/sales-invoices/${res.data.data.id}`);
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

  const getMappedPayloadRows = (updatedOrder) => {
    return (updatedOrder.orderItems || []).map((item) => ({
      orderItemId: item.orderItemId || item.id,
      productName: item.productName || item.serviceName,
      productType: item.productType || updatedOrder.invoiceType || 'GOODS',
      hsnCode: item.hsnCode || null,
      sac: item.sac || 0,
      serviceName: item.serviceName || '',
      productId: item.productId || item.id,
      quantity: Number(item.quantity) || 0,
      unitId: item.unitId || null,
      unitPrice: Number(item.unitPrice) || 0,
      gstPerUnit: Number(item.gstPerUnit) || 0,
      totalAmount: Number(item.totalAmount) || 0,
      totalGstAmount: Number(item.totalGstAmount) || 0,
      discountPercentage: Number(item.discountPercentage) || 0,
      discountAmount: Number(item.discountAmount) || 0,
      batch: item.batch || null,
      batches: item.batches || [],
      batchNo: item.batch?.batchNo || null,
      expiryDate: item.expiryDate
        ? moment(item.expiryDate).format('YYYY-MM-DD')
        : null,
      gstPercentage: Number(item.gstPerUnit) || 0,
    }));
  };

  const handleSubmit = (updatedOrder) => {
    const isError = validation({ order: updatedOrder });

    if (Object.keys(isError).length === 0) {
      const mappedRows = getMappedPayloadRows(updatedOrder);
      invoiceMutation.mutate({
        ...updatedOrder,
        orderItems: mappedRows,
        invoiceItems: mappedRows,
        buyerId: Number(updatedOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        roundOffAmount: roundedTotal,
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
    mutationKey: ['mixed_previewInvoice'],
    mutationFn: (data) => {
      // If orderId is present, use previewInvoice, else use previewDirectInvoice (currently added)
      if (data.orderId) {
        return previewInvoice(data);
      }
      return previewDirectInvoice(data);
    },
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
      const mappedRows = getMappedPayloadRows(updatedOrder);
      setErrorMsg({});
      previewInvMutation.mutate({
        ...updatedOrder,
        orderItems: mappedRows,
        invoiceItems: mappedRows,
        buyerId: Number(updatedOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        roundOffAmount: roundedTotal,
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        discountAmount: parseFloat(totalDiscountAmt.toFixed(2)),
      });
    } else {
      setErrorMsg(isError);
    }
  };

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
    (cta === 'offer' && order.buyerId == null) || !order.invoiceType;

  return (
    <Wrapper>
      {!isAddingBatchFor && (
        <>
          <div className="sticky top-0 z-20 -mx-4 flex items-end gap-2 border-t bg-white px-3">
            <SubHeader
              name={name}
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

          {!isInvoicePreview && (
            <div className="flex min-h-[calc(100vh-100px)] flex-col">
              {/* Scrollable content area */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
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
                                key: 'b2bInvoiceDraft',
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
                              ...(value === 'hues' && {
                                invoiceReferenceNumber: null,
                              }),
                            };
                            setOrder(updatedOrder);

                            saveDraftToSession({
                              key: 'b2bInvoiceDraft',
                              data: updatedOrder,
                            });
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/20">
                            <SelectValue
                              placeholder={translations(
                                'form.input.source.placeholder',
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-lg border border-neutral-100 bg-white shadow-md">
                            <SelectItem value="hues">Hues</SelectItem>
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
                          {order.source !== 'hues' && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <Input
                          type="text"
                          disabled={order.source === 'hues'}
                          className={`h-10 w-full rounded-lg border-neutral-200 text-sm font-medium shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 ${
                            order.source === 'hues'
                              ? 'cursor-not-allowed border-dashed bg-neutral-50 text-neutral-400'
                              : 'bg-white text-neutral-700'
                          }`}
                          placeholder={
                            order.source === 'hues'
                              ? 'Not applicable for Hues'
                              : translations(
                                  'form.input.reference_number.placeholder',
                                )
                          }
                          value={
                            order.source === 'hues'
                              ? 'N/A'
                              : order.invoiceReferenceNumber || ''
                          }
                          onChange={(e) => {
                            if (order.source === 'hues') return;
                            setOrder({
                              ...order,
                              invoiceReferenceNumber: e.target.value,
                            });
                          }}
                        />
                        {order.source !== 'hues' &&
                          errorMsg.invoiceReferenceNumber && (
                            <div className="mt-1">
                              <ErrorBox msg={errorMsg.invoiceReferenceNumber} />
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Row 2 in Invoice Details */}
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                      {/* Client */}
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.client')}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex w-full flex-col gap-1">
                          <ReactSelect
                            name="clients"
                            placeholder={translations(
                              'form.input.client.placeholder',
                            )}
                            options={clientOptions}
                            styles={getStylesForSelectComponent()}
                            className="text-sm font-medium"
                            classNamePrefix="select"
                            value={
                              clientOptions?.find(
                                (option) =>
                                  option.value === order?.selectedValue?.value,
                              ) || null
                            }
                            onChange={(selectedOption) => {
                              if (!selectedOption) return;

                              const {
                                value: id,
                                clientId,
                                clientEnterpriseId,
                                isEnterpriseActive,
                              } = selectedOption;

                              if (id === 'add-new-client') {
                                setIsModalOpen(true);
                                return;
                              }

                              const updatedOrder = {
                                ...order,
                                buyerId: id,
                                selectedValue: selectedOption,
                                buyerType: isEnterpriseActive
                                  ? 'ENTERPRISE'
                                  : 'UNCONFIRMED_ENTERPRISE',
                                getAddressRelatedData: {
                                  clientId,
                                  clientEnterpriseId,
                                },
                              };

                              setOrder(updatedOrder);
                              saveDraftToSession({
                                key: 'b2bInvoiceDraft',
                                data: updatedOrder,
                              });
                            }}
                          />
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
                          {errorMsg.buyerId && (
                            <div className="mt-1">
                              <ErrorBox msg={errorMsg.buyerId} />
                            </div>
                          )}
                        </div>
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
                              skuId: '',
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
                              key: 'b2bInvoiceDraft',
                              data: { ...updatedOrder, itemDraft: clearedItem },
                            });
                          }}
                        />
                        {errorMsg.invoiceType && (
                          <div className="mt-1">
                            <ErrorBox msg={errorMsg.invoiceType} />
                          </div>
                        )}
                      </div>

                      {/* Linked Order */}
                      <div className="flex flex-col">
                        <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.label.linked_with_order')}
                          <Tooltips
                            trigger={
                              <Info
                                size={14}
                                className="mb-0.5 cursor-pointer text-neutral-400"
                              />
                            }
                            content="Optional: Select an order to link its items. Otherwise, a new order will be created for this invoice."
                          />
                        </label>
                        <div className="flex w-full flex-col gap-1">
                          {order.selectedOrder ? (
                            <div className="flex h-10 w-full items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 text-sm shadow-sm">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                                <span className="font-semibold text-emerald-800">
                                  Linked: {order.selectedOrder.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsOrderModalOpen(true)}
                                  className="text-xs font-bold text-emerald-700 underline transition-colors hover:text-emerald-900"
                                >
                                  Change
                                </button>
                                <span className="text-emerald-200">|</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const manualItems = (
                                      order.orderItems || []
                                    ).filter((i) => !i.isFromLinkedOrder);
                                    const updatedOrder = {
                                      ...order,
                                      orderId: null,
                                      selectedOrder: null,
                                      orderItems: manualItems,
                                    };
                                    setOrder(updatedOrder);
                                    saveDraftToSession({
                                      key: 'b2bInvoiceDraft',
                                      data: updatedOrder,
                                    });
                                  }}
                                  className="text-xs font-bold text-red-600 transition-colors hover:text-red-800"
                                >
                                  Unlink
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setIsOrderModalOpen(true)}
                              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 text-sm font-semibold text-neutral-600 shadow-sm transition-all hover:border-primary hover:bg-neutral-50 hover:text-primary"
                            >
                              <Plus
                                size={16}
                                className="text-neutral-400 transition-colors"
                              />
                              <span>Link an Active Order</span>
                            </button>
                          )}
                        </div>
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
                      {/* Row 1: Item, Batch, Qty */}
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
                            placeholder={translations(
                              'form.input.item.placeholder',
                            )}
                            options={itemClientListingOptions}
                            styles={getStylesForSelectComponent()}
                            isOptionDisabled={(option) => option.disabled}
                            isDisabled={isItemInputsDisabled}
                            onChange={(selectedOption) => {
                              const selectedItemData =
                                itemClientListingOptions?.find(
                                  (item) =>
                                    item.value.id === selectedOption?.value?.id,
                                )?.value;

                              if (!selectedItemData) return;

                              const isGstApplicableForPage = isGstApplicable(
                                isGstApplicableForSalesOrders,
                              );

                              const gstPerUnit = isGstApplicableForPage
                                ? selectedItemData.gstPercentage
                                : 0;

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
                                      gstPerUnit,
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
                                      gstPerUnit,
                                      batches: [],
                                      batch: null,
                                      expiryDate: '',
                                    };

                              setSelectedItem(updatedItem);
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
                                key: 'b2bInvoiceDraft',
                                data: {
                                  ...order,
                                  itemDraft: updatedItem,
                                },
                              });
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
                                key: 'b2bInvoiceDraft',
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
                                key: 'b2bInvoiceDraft',
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
                                key: 'b2bInvoiceDraft',
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
                                key: 'b2bInvoiceDraft',
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

                      {/* Row 2: Price, GST%, Live Item Total, Buttons */}
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
                            value={selectedItem.totalAmount}
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

                        {/* Live Item Total Amount (Gross Amount = amount + gstAmount) */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-blue-600">
                            Total Amount (Inc. GST)
                          </label>
                          <div className="flex h-10 items-center rounded-lg border border-blue-100 bg-blue-50/30 px-3 text-sm font-bold text-blue-700 shadow-sm">
                            ₹
                            {(
                              (Number(selectedItem.totalAmount) || 0) +
                              (Number(selectedItem.totalGstAmount) || 0)
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
                                key: 'b2bInvoiceDraft',
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
                                  sac: Number(selectedItem.sac),
                                  unitPrice: Number(selectedItem.unitPrice),
                                  totalAmount: Number(selectedItem.totalAmount),
                                  totalGstAmount: Number(
                                    selectedItem.totalGstAmount,
                                  ),
                                  gstPercentage: Number(
                                    selectedItem.gstPerUnit ?? 0,
                                  ),
                                },
                              ];

                              const updatedOrder = {
                                ...order,
                                orderItems: updatedOrderItems,
                              };

                              const clearedItem = {
                                productName: '',
                                productType: '',
                                skuId: '',
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
                                key: 'b2bInvoiceDraft',
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

                      {/* Round Off */}
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Round Off
                        </span>
                        <span className="mt-1 text-sm font-semibold text-neutral-500">
                          ₹
                          {Number(roundOff).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      {/* Vertical line separator */}
                      <div className="h-10 w-[1px] bg-neutral-200"></div>

                      {/* Grand Total */}
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Grand Total
                        </span>
                        <span className="mt-1 text-base font-extrabold text-neutral-900">
                          ₹
                          {roundedTotal.toLocaleString('en-IN', {
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
                      <span className="flex items-center gap-2">Next</span>
                    ) : (
                      'Next'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isInvoicePreview && (
            <InvoicePreview
              enterpriseId={enterpriseId}
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

          {isOrderModalOpen && (
            <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
              <DialogContent className="max-w-md rounded-xl border border-neutral-100 bg-white p-6 shadow-lg">
                <DialogHeader className="gap-1 text-left">
                  <DialogTitle className="text-lg font-bold text-neutral-800">
                    Link Active Sales Order
                  </DialogTitle>
                  <DialogDescription className="text-neutral-450 text-xs font-medium">
                    Search and select an active order (status: ACCEPTED) to link
                    its items and client details to this invoice.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Search Order
                    </label>
                    <AsyncSelect
                      cacheOptions
                      defaultOptions={false}
                      name="linkedOrder"
                      placeholder={translations(
                        'form.input.linked_with_order.placeholder',
                      )}
                      loadOptions={(inputValue) =>
                        new Promise((resolve) => {
                          if (inputValue.length < 3) {
                            resolve([]);
                            return;
                          }
                          if (window.searchOrderTimeout)
                            clearTimeout(window.searchOrderTimeout);
                          window.searchOrderTimeout = setTimeout(async () => {
                            try {
                              const response = await GetSales({
                                id: enterpriseId,
                                data: {
                                  page: 1,
                                  limit: 10,
                                  searchString: inputValue,
                                  status: ['ACCEPTED'],
                                },
                              });
                              const ordersData =
                                response?.data?.data?.data || [];
                              resolve(
                                ordersData.map((orderItem) => ({
                                  value: orderItem.id,
                                  label:
                                    orderItem.referenceNumber ||
                                    `Order #${orderItem.id}`,
                                  originalData: orderItem,
                                })),
                              );
                            } catch (e) {
                              resolve([]);
                            }
                          }, 500);
                        })
                      }
                      styles={getStylesForSelectComponent()}
                      className="text-sm font-medium"
                      classNamePrefix="select"
                      value={order.selectedOrder || null}
                      onChange={async (selectedOption) => {
                        let prependedItems = order.orderItems || [];
                        let prependedClientData = {};
                        let prependedItemTypeData = {};

                        if (selectedOption?.value) {
                          try {
                            const detailsRes = await OrderDetails(
                              selectedOption.value,
                            );
                            const orderData = detailsRes?.data?.data;
                            if (orderData) {
                              if (orderData.orderItems) {
                                const formattedOrderItems =
                                  orderData.orderItems.map((item) => {
                                    const pName =
                                      item.productType === 'GOODS'
                                        ? item.productDetails?.productName
                                        : item.productDetails?.serviceName;
                                    return {
                                      ...item,
                                      productName:
                                        pName ||
                                        item.productName ||
                                        'Unknown Item',
                                      serviceName: pName || item.serviceName,
                                      isFromLinkedOrder: true,
                                    };
                                  });

                                const manualItems = prependedItems.filter(
                                  (i) => !i.isFromLinkedOrder,
                                );
                                prependedItems = [
                                  ...formattedOrderItems,
                                  ...manualItems,
                                ];
                              }

                              if (orderData.buyerId) {
                                const matchedClient = clientOptions?.find(
                                  (opt) => opt.value === orderData.buyerId,
                                );
                                if (matchedClient) {
                                  prependedClientData = {
                                    buyerId: matchedClient.value,
                                    selectedValue: matchedClient,
                                    buyerType: matchedClient.isEnterpriseActive
                                      ? 'ENTERPRISE'
                                      : 'UNCONFIRMED_ENTERPRISE',
                                    getAddressRelatedData: {
                                      clientId: matchedClient.clientId,
                                      clientEnterpriseId:
                                        matchedClient.clientEnterpriseId,
                                    },
                                  };
                                }
                              }

                              const apiItemType =
                                orderData.invoiceType || orderData.orderType;
                              if (
                                apiItemType === 'GOODS' ||
                                apiItemType === 'SERVICE'
                              ) {
                                prependedItemTypeData = {
                                  invoiceType: apiItemType,
                                };
                              }
                            }
                          } catch (error) {
                            toast.error('Error fetching order details');
                          }
                        } else {
                          prependedItems = prependedItems.filter(
                            (i) => !i.isFromLinkedOrder,
                          );
                        }

                        const updatedOrder = {
                          ...order,
                          ...prependedClientData,
                          ...prependedItemTypeData,
                          orderId: selectedOption?.value || null,
                          selectedOrder: selectedOption || null,
                          orderItems: prependedItems,
                        };

                        setOrder(updatedOrder);
                        saveDraftToSession({
                          key: 'b2bInvoiceDraft',
                          data: updatedOrder,
                        });
                        setIsOrderModalOpen(false);
                      }}
                      noOptionsMessage={() => 'Type at least 3 characters'}
                      components={{
                        DropdownIndicator: () => null,
                        ClearIndicator: () => null,
                      }}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

export default CreateB2BInvoice;
