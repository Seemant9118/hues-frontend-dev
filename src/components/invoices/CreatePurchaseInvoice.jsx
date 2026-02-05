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
import { Label } from '@/components/ui/label';
import { SessionStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { previewDirectPurchaseInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { createPurchaseInvoice } from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import AddModal from '../Modals/AddModal';
import { useCreateSalesInvoiceColumns } from '../columns/useCreateSalesInvoiceColumns';
import DatePickers from '../ui/DatePickers';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithSelect from '../ui/InputWithSelect';
import InvoicePreview from '../ui/InvoicePreview';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
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
    refrenceNumber: purchaseInvoiceDraft?.refrenceNumber || '',
  });

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
  ];

  const isItemAlreadyAdded = (itemId) =>
    order.orderItems?.some((item) => item.productId === itemId);

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

  // ✅ validations
  const validation = ({ order }) => {
    const errorObj = {};

    if (order?.sellerEnterpriseId == null) {
      errorObj.sellerEnterpriseId = '*Please select vendor';
    }

    if (!order.invoiceType) {
      errorObj.invoiceType = translations('form.errorMsg.item_type');
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

    return { totalAmount, totalGstAmt };
  };

  const grossAmt = order.orderItems.reduce(
    (acc, orderItem) => acc + (Number(orderItem.totalAmount) || 0),
    0,
  );

  const { totalAmount, totalGstAmt } = handleSetTotalAmt();
  const totalAmtWithGst = totalAmount + totalGstAmt;

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
      invoiceMutation.mutate({
        ...updatedOrder,
        buyerId: Number(updatedOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
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
      previewInvMutation.mutate({
        ...updatedOrder,
        invoiceItems: updatedOrder.orderItems,
        buyerId: Number(updatedOrder.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
      });
    } else {
      setErrorMsg(isError);
    }
  };

  const createPurchaseInvoiceColumns = useCreateSalesInvoiceColumns(
    isOrder,
    setOrder,
    setSelectedItem,
    true,
    isGstApplicableForSelectedVendor,
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
    <Wrapper className="relative flex h-full flex-col py-2">
      <div className="flex items-end gap-0.5">
        <SubHeader name={name}></SubHeader>
      </div>

      {!isInvoicePreview && (
        <>
          <div className="grid grid-cols-4 gap-4 rounded-sm border border-neutral-200 p-4">
            {/* Invoice ID */}
            <div className="flex flex-col gap-1">
              <Label className="flex gap-1">
                {translations('form.label.invoiceNo')}
                <span className="text-red-600">*</span>
              </Label>

              <Input
                type="text"
                placeholder="Enter Invoice No."
                value={order?.refrenceNumber || ''}
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
                <ErrorBox msg={errorMsg.refrenceNumber} />
              )}
            </div>

            {/* Invoice Date */}
            <div className="flex flex-col gap-1">
              <Label className="flex gap-1">
                {translations('form.label.invoice_date')}
                <span className="text-red-600">*</span>
              </Label>

              <div className="relative flex items-center rounded-sm border p-2">
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
                      key: 'purchaseInvoiceDraft',
                      data: {
                        ...order,
                        invoiceDate: formattedForAPI,
                        isGstApplicableForSelectedVendor,
                      },
                    });
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="w-full"
                />
              </div>

              {errorMsg.invoiceDate && <ErrorBox msg={errorMsg.invoiceDate} />}
            </div>

            {/* Vendor Select */}
            <div className="flex flex-col gap-1">
              <Label className="flex gap-1">
                Vendor <span className="text-red-600">*</span>
              </Label>

              <div className="flex w-full flex-col gap-1">
                <Select
                  name="vendors"
                  placeholder="Select vendor"
                  options={vendorOptions}
                  styles={getStylesForSelectComponent()}
                  className="text-sm"
                  classNamePrefix="select"
                  value={
                    vendorOptions?.find(
                      (option) => option.value === order?.selectedValue?.value,
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
                  <ErrorBox msg={errorMsg.sellerEnterpriseId} />
                )}
              </div>
            </div>

            {/* Item Type */}
            <div className="flex flex-col gap-1">
              <Label className="flex gap-1">
                {translations('form.label.item_type')}
                <span className="text-red-600">*</span>
              </Label>

              <Select
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
                      itemDraft: clearedItem,
                      isGstApplicableForSelectedVendor,
                    },
                  });
                }}
              />

              {errorMsg.invoiceType && <ErrorBox msg={errorMsg.invoiceType} />}
            </div>
          </div>

          {/* Item Add Form */}
          <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Label className="flex gap-1">
                  {translations('form.label.item')}
                  <span className="text-red-600">*</span>
                </Label>

                <div className="flex flex-col gap-1">
                  <Select
                    name="items"
                    value={
                      itemVendorListingOptions?.find(
                        (item) => item.value.id === selectedItem.productId,
                      ) ?? null
                    }
                    placeholder={translations('form.input.item.placeholder')}
                    options={itemVendorListingOptions}
                    styles={getStylesForSelectComponent()}
                    isOptionDisabled={(option) => option.disabled}
                    isDisabled={isItemInputsDisabled}
                    onChange={(selectedOption) => {
                      const selectedItemData = itemVendorListingOptions?.find(
                        (item) => item.value.id === selectedOption?.value?.id,
                      )?.value;

                      if (!selectedItemData) return;

                      const isGstApplicableForPage = isGstApplicable(
                        isGstApplicableForSelectedVendor,
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
                            }
                          : {
                              ...selectedItem,
                              productId: selectedItemData.id,
                              productType: selectedItemData.productType,
                              sac: selectedItemData.sacCode,
                              serviceName: selectedItemData.serviceName,
                              unitPrice: selectedItemData.rate,
                              gstPerUnit,
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

                  {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <InputWithSelect
                  id="quantity"
                  name={translations('form.label.quantity')}
                  required={true}
                  disabled={isItemInputsDisabled}
                  value={
                    selectedItem.quantity == null || selectedItem.quantity === 0
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
                  unitPlaceholder="Select unit"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  {translations('form.label.price')}
                  <span className="text-red-600">*</span>
                </Label>

                <div className="flex flex-col gap-1">
                  <Input
                    type="number"
                    disabled={isItemInputsDisabled}
                    value={
                      selectedItem.unitPrice == null ||
                      selectedItem.unitPrice === 0
                        ? ''
                        : selectedItem.unitPrice
                    }
                    className="max-w-30"
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
                        key: 'purchaseInvoiceDraft',
                        data: {
                          ...order,
                          itemDraft: updatedItem,
                          isGstApplicableForSelectedVendor,
                        },
                      });
                    }}
                  />

                  {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
                </div>
              </div>

              {isGstApplicable(isGstApplicableForSelectedVendor) && (
                <div className="flex flex-col gap-2">
                  <Label className="flex">
                    {translations('form.label.gst')}
                    <span className="text-xs"> (%)</span>
                    <span className="text-red-600">*</span>
                  </Label>

                  <div className="flex flex-col gap-1">
                    <Input
                      disabled
                      value={selectedItem.gstPerUnit || ''}
                      className="max-w-14"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  {isOrder === 'invoice'
                    ? translations('form.label.invoice_value')
                    : translations('form.label.value')}
                  <span className="text-red-600">*</span>
                </Label>

                <Input
                  disabled
                  value={selectedItem.totalAmount || ''}
                  className="max-w-30"
                />
              </div>

              {isGstApplicable(isGstApplicableForSelectedVendor) && (
                <div className="flex flex-col gap-2">
                  <Label className="flex gap-1">
                    {translations('form.label.tax_amount')}
                    <span className="text-red-600">*</span>
                  </Label>

                  <Input
                    disabled
                    value={selectedItem.totalGstAmount || ''}
                    className="max-w-30"
                  />
                </div>
              )}

              {isGstApplicable(isGstApplicableForSelectedVendor) && (
                <div className="flex flex-col gap-2">
                  <Label className="flex gap-1">
                    {translations('form.label.amount')}
                    <span className="text-red-600">*</span>
                  </Label>

                  <Input
                    disabled
                    value={(
                      (Number(selectedItem.totalAmount) || 0) +
                      (Number(selectedItem.totalGstAmount) || 0)
                    ).toFixed(2)}
                    className="max-w-30"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                size="sm"
                variant="outline"
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
              >
                {translations('form.ctas.cancel')}
              </Button>

              <Button
                size="sm"
                disabled={
                  !selectedItem.productId ||
                  !selectedItem.quantity ||
                  selectedItem.quantity <= 0 ||
                  !selectedItem.unitPrice ||
                  selectedItem.unitPrice <= 0
                }
                onClick={() => {
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
                    productType: '',
                    productId: null,
                    quantity: null,
                    unitId: null,
                    unitPrice: null,
                    gstPerUnit: 0,
                    totalAmount: null,
                    totalGstAmount: null,
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
                }}
                variant="blue_outline"
              >
                {translations('form.ctas.add')}
              </Button>
            </div>
          </div>

          {/* selected items table */}
          <DataTable
            data={order.orderItems}
            columns={createPurchaseInvoiceColumns}
          />

          <div className="mt-auto h-[1px] bg-neutral-300"></div>

          <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-2">
              {isGstApplicable(isGstApplicableForSelectedVendor) && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {translations('form.footer.gross_amount')} :
                    </span>
                    <span className="rounded-sm border bg-slate-100 p-2">
                      {grossAmt.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {translations('form.footer.tax_amount')} :
                    </span>
                    <span className="rounded-sm border bg-slate-100 p-2">
                      {totalGstAmt.toFixed(2)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.total_amount')} :
                </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {totalAmtWithGst.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={onCancel} variant={'outline'}>
                {translations('form.ctas.cancel')}
              </Button>

              <Button
                size="sm"
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
                  translations('form.ctas.next')
                ) : (
                  translations('form.ctas.create')
                )}
              </Button>
            </div>
          </div>
        </>
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
    </Wrapper>
  );
};

export default CreatePurchaseInvoice;
