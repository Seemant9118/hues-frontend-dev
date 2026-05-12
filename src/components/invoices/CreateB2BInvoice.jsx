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
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ChevronDown, Info, Plus } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import AddModal from '../Modals/AddModal';
import Tooltips from '../auth/Tooltips';
import { useCreateSalesInvoiceColumns } from '../columns/useCreateSalesInvoiceColumns';
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
  const [errorMsg, setErrorMsg] = useState({});

  const [selectedItem, setSelectedItem] = useState({
    productName: b2bInvoiceDraft?.itemDraft?.productName || '',
    productType: b2bInvoiceDraft?.itemDraft?.productType || '',
    hsnCode: b2bInvoiceDraft?.itemDraft?.hsnCode || '',
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

  const createSalesInvoiceColumns = useCreateSalesInvoiceColumns(
    isOrder,
    setOrder,
    setSelectedItem,
    'b2bInvoiceDraft',
    isGstApplicableForSalesOrders,
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
    (cta === 'offer' && order.buyerId == null) || !order.invoiceType;

  return (
    <Wrapper className="relative flex h-full flex-col py-2">
      <div className="flex items-end gap-0.5">
        <SubHeader name={name}></SubHeader>

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

      {!isInvoicePreview && (
        <div className="flex flex-col gap-6 pt-4">
          {/* Invoice Configuration Section */}
          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700">
              Invoice Details
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-4 lg:grid-cols-3">
              {/* Invoice Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex gap-1 text-xs font-medium text-neutral-600">
                  {translations('form.label.invoice_date')}
                  <span className="text-red-500">*</span>
                </Label>

                <div className="relative flex h-9 items-center rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring">
                  <DatePickers
                    selected={
                      order.invoiceDate ? new Date(order.invoiceDate) : null
                    }
                    onChange={(date) => {
                      const formattedForAPI = date ? date.toISOString() : null;

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
                    className="w-full bg-transparent outline-none"
                  />
                </div>

                {errorMsg.invoiceDate && (
                  <ErrorBox msg={errorMsg.invoiceDate} />
                )}
              </div>

              {/* Source */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex gap-1 text-xs font-medium text-neutral-600">
                  {translations('form.label.source')}
                  <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={order.source}
                  onValueChange={(value) => {
                    const updatedOrder = {
                      ...order,
                      source: value,
                      ...(value === 'hues' && { invoiceReferenceNumber: null }),
                    };
                    setOrder(updatedOrder);

                    saveDraftToSession({
                      key: 'b2bInvoiceDraft',
                      data: updatedOrder,
                    });
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue
                      placeholder={translations(
                        'form.input.source.placeholder',
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hues">Hues</SelectItem>
                    <SelectItem value="tally">Tally</SelectItem>
                    <SelectItem value="other">Other ERP</SelectItem>
                  </SelectContent>
                </Select>

                {errorMsg.source && <ErrorBox msg={errorMsg.source} />}
              </div>

              {/* Reference No. */}
              {order.source !== 'hues' ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="flex gap-1 text-xs font-medium text-neutral-600">
                    {translations('form.label.reference_number')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="h-9"
                    placeholder={translations(
                      'form.input.reference_number.placeholder',
                    )}
                    value={order.invoiceReferenceNumber || ''}
                    onChange={(e) => {
                      setOrder({
                        ...order,
                        invoiceReferenceNumber: e.target.value,
                      });
                    }}
                  />
                  {errorMsg.invoiceReferenceNumber && (
                    <ErrorBox msg={errorMsg.invoiceReferenceNumber} />
                  )}
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}

              {/* Client */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex gap-1 text-xs font-medium text-neutral-600">
                  {translations('form.label.client')}
                  <span className="text-red-500">*</span>
                </Label>

                <div className="flex w-full flex-col gap-1">
                  <ReactSelect
                    name="clients"
                    placeholder={translations('form.input.client.placeholder')}
                    options={clientOptions}
                    styles={getStylesForSelectComponent()}
                    className="text-sm"
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

                  {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
                </div>
              </div>

              {/* Item Type */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex gap-1 text-xs font-medium text-neutral-600">
                  {translations('form.label.item_type')}
                  <span className="text-red-500">*</span>
                </Label>

                <ReactSelect
                  name="itemType"
                  placeholder={translations('form.input.item_type.placeholder')}
                  options={itemTypeOptions}
                  styles={getStylesForSelectComponent()}
                  className="text-sm"
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
                      key: 'b2bInvoiceDraft',
                      data: { ...updatedOrder, itemDraft: clearedItem },
                    });
                  }}
                />

                {errorMsg.invoiceType && (
                  <ErrorBox msg={errorMsg.invoiceType} />
                )}
              </div>

              {/* linked with Order - AsyncSelect */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex gap-1 text-xs font-medium text-neutral-600">
                  {translations('form.label.linked_with_order')}
                  <Tooltips
                    trigger={
                      <Info
                        size={14}
                        className="cursor-pointer text-neutral-400"
                      />
                    }
                    content="Optional: Select an order to link its items. Otherwise, a new order will be created for this invoice."
                  />
                </Label>

                <div className="flex w-full flex-col gap-1">
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
                            const ordersData = response?.data?.data?.data || [];
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
                    className="text-sm"
                    classNamePrefix="select"
                    value={order.selectedOrder || null}
                    onChange={async (selectedOption) => {
                      let prependedItems = order.orderItems || [];
                      let prependedClientData = {};
                      let prependedItemTypeData = {};

                      // Fetch specific order details to prepend data
                      if (selectedOption?.value) {
                        try {
                          const detailsRes = await OrderDetails(
                            selectedOption.value,
                          );
                          const orderData = detailsRes?.data?.data;
                          if (orderData) {
                            if (orderData.orderItems) {
                              // Format order items and add flag
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

                              // Filter out any items from the order that might already be in prependedItems.
                              // Keep existing manually added items unaltered.
                              const manualItems = prependedItems.filter(
                                (i) => !i.isFromLinkedOrder,
                              );
                              prependedItems = [
                                ...formattedOrderItems,
                                ...manualItems,
                              ];
                            }

                            // Map Client
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

                            // Map Item Type
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
                        // If the user clears the linked order search, remove the linked items
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
                        orderItems: prependedItems, // Update with prepended items
                      };

                      setOrder(updatedOrder);
                      saveDraftToSession({
                        key: 'b2bInvoiceDraft',
                        data: updatedOrder,
                      });
                    }}
                    // isSearchable
                    // isClearable
                    noOptionsMessage={() => 'Type at least 3 characters'}
                    components={{
                      DropdownIndicator: () => null,
                      ClearIndicator: () => null,
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Item Add Section */}
          <section className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50/30 p-5">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-neutral-700">
                Add Items
              </h3>

              <div className="flex flex-wrap items-end gap-4">
                {/* Item Selection */}
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
                    className="w-56 text-sm"
                    placeholder={translations('form.input.item.placeholder')}
                    options={itemClientListingOptions}
                    styles={getStylesForSelectComponent()}
                    isOptionDisabled={(option) => option.disabled}
                    isDisabled={isItemInputsDisabled}
                    onChange={(selectedOption) => {
                      const selectedItemData = itemClientListingOptions?.find(
                        (item) => item.value.id === selectedOption?.value?.id,
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

                            // Store batches map to check if all batches are added
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
                  {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
                </div>

                {/* Batch & Expiry */}
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
                      disabled: isItemAlreadyAdded(
                        selectedItem.productId,
                        b.id,
                      ),
                    }))}
                    isOptionDisabled={(option) => option.disabled}
                    styles={getStylesForSelectComponent()}
                    isDisabled={
                      isItemInputsDisabled ||
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
                        key: 'b2bInvoiceDraft',
                        data: {
                          ...order,
                          itemDraft: updatedItem,
                        },
                      });
                    }}
                  />
                </div>

                {/* Quantity */}
                <div className="flex w-32 flex-col gap-1.5">
                  <InputWithSelect
                    id="quantity"
                    name={translations('form.label.quantity')}
                    required={true}
                    disabled={isItemInputsDisabled}
                    className="h-9"
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
                        (value * (Number(selectedItem.unitPrice) || 0)).toFixed(
                          2,
                        ),
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
                <div className="flex w-28 flex-col gap-1.5">
                  <Label>
                    {translations('form.label.price')}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    disabled={isItemInputsDisabled}
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
                        ((Number(selectedItem.quantity) || 0) * value).toFixed(
                          2,
                        ),
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
                  {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
                </div>

                {/* GST */}
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
                <div className="flex w-44 flex-col gap-1.5">
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
              {/* Add/Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pl-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 text-neutral-500 hover:text-red-500"
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
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="h-9 px-4"
                  disabled={
                    !selectedItem.productId ||
                    !selectedItem.quantity ||
                    selectedItem.quantity <= 0 ||
                    !selectedItem.unitPrice ||
                    selectedItem.unitPrice <= 0
                  }
                  onClick={() => {
                    // Check for duplicates before adding
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
                  variant="blue_outline"
                >
                  {translations('form.ctas.add')}
                </Button>
              </div>
            </div>
          </section>

          {/* selected items table */}
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
                    {totalAmount.toLocaleString('en-IN', {
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

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Round Off
                  </span>
                  <span className="text-sm font-medium text-neutral-600">
                    {Number(roundOff) > 0 ? `+${roundOff}` : roundOff}
                  </span>
                </div>

                <div className="h-8 w-[1px] bg-neutral-200"></div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70">
                    Grand Total
                  </span>
                  <span className="text-sm font-bold text-primary">
                    ₹{' '}
                    {roundedTotal.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={onCancel}
                  variant="outline"
                  // className="h-11 px-6 text-neutral-500"
                >
                  {translations('form.ctas.cancel')}
                </Button>

                <Button
                  size="sm"
                  // className="h-11 min-w-[140px] px-8 shadow-md transition-all hover:shadow-lg"
                  onClick={() => {
                    isOrder === 'invoice'
                      ? handlePreview(order)
                      : handleSubmit(order);
                  }}
                  disabled={invoiceMutation.isPending}
                >
                  {invoiceMutation.isPending ? (
                    <Loading />
                  ) : isOrder === 'invoice' ? (
                    <span className="flex items-center gap-2">
                      {translations('form.ctas.next')}
                    </span>
                  ) : (
                    translations('form.ctas.create')
                  )}
                </Button>
              </div>
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
    </Wrapper>
  );
};

export default CreateB2BInvoice;
