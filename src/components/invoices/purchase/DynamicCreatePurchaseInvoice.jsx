import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AddBatch from '@/components/inventory/batch/AddBatch';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { SessionStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';

import PurchaseAddItemSection from './components/PurchaseAddItemSection';
import PurchaseAdditionalInfoSection from './components/PurchaseAdditionalInfoSection';
import PurchaseInvoiceDetailsSection from './components/PurchaseInvoiceDetailsSection';
import PurchaseInvoiceFooter from './components/PurchaseInvoiceFooter';
import PurchaseLineItemsTableSection from './components/PurchaseLineItemsTableSection';
import { usePurchaseInvoiceActions } from './hooks/usePurchaseInvoiceActions';
import { usePurchaseInvoiceFormConfig } from './hooks/usePurchaseInvoiceFormConfig';
import { usePurchaseInvoiceQueries } from './hooks/usePurchaseInvoiceQueries';
import { usePurchaseInvoiceTableColumns } from './hooks/usePurchaseInvoiceTableColumns';
import { Button } from '../../ui/button';
import EmptyStageComponent from '../../ui/EmptyStageComponent';
import InvoicePreview from '../../ui/InvoicePreview';
import SubHeader from '../../ui/Sub-header';
import Wrapper from '../../wrappers/Wrapper';

const DynamicCreatePurchaseInvoice = ({ onCancel, name, isOrder }) => {
  const translations = useTranslations('components.create_edit_order');
  const { isDeveloperMode } = useDeveloperMode();
  const enterpriseId = useMemo(() => getEnterpriseId(), []);

  const [url, setUrl] = useState(null);
  const [isInvoicePreview, setIsInvoicePreview] = useState(false);
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  // Lazy Initializers for state
  const [selectedItem, setSelectedItem] = useState(() => {
    const draft = SessionStorageService.get('purchaseInvoiceDraft');
    return {
      productName: draft?.itemDraft?.productName || '',
      productType: draft?.itemDraft?.productType || '',
      skuId: draft?.itemDraft?.skuId || '',
      hsnCode: draft?.itemDraft?.hsnCode || '',
      sac: draft?.itemDraft?.sac || '',
      serviceName: draft?.itemDraft?.serviceName || '',
      productId: draft?.itemDraft?.productId || null,
      quantity: draft?.itemDraft?.quantity || null,
      unitId: draft?.itemDraft?.unitId || null,
      unitPrice: draft?.itemDraft?.unitPrice || null,
      gstPerUnit: draft?.itemDraft?.gstPerUnit || 0,
      totalAmount: draft?.itemDraft?.totalAmount || null,
      totalGstAmount: draft?.itemDraft?.totalGstAmount || null,
      batch: draft?.itemDraft?.batch || null,
      batches: draft?.itemDraft?.batches || [],
      expiryDate: draft?.itemDraft?.expiryDate || '',
    };
  });

  const [order, setOrder] = useState(() => {
    const draft = SessionStorageService.get('purchaseInvoiceDraft');
    return {
      clientType: 'B2B',
      sellerId: draft?.sellerId || draft?.sellerEnterpriseId || null,
      sellerEnterpriseId: draft?.sellerId || draft?.sellerEnterpriseId || null,
      buyerId: enterpriseId,
      gstAmount: draft?.gstAmount || null,
      amount: draft?.amount || null,
      orderType: 'PURCHASE',
      invoiceType: draft?.invoiceType || '',
      orderItems: draft?.orderItems || [],
      bankAccountId: draft?.bankAccountId || null,
      socialLinks: draft?.socialLinks || null,
      remarks: draft?.remarks || null,
      pin: draft?.pin || null,
      billingAddressId: draft?.billingAddressId || null,
      shippingAddressId: draft?.shippingAddressId || null,
      selectedValue: draft?.selectedValue || null,
      selectedGstNumber: null,
      getAddressRelatedData: draft?.getAddressRelatedData || {
        clientId: enterpriseId,
        clientEnterpriseId: enterpriseId,
      },
      invoiceDate: draft?.invoiceDate || null,
      source: draft?.source || '',
      invoiceReferenceNumber:
        draft?.invoiceReferenceNumber || draft?.refrenceNumber || null,
      refrenceNumber:
        draft?.invoiceReferenceNumber || draft?.refrenceNumber || '',
      roundOffAmount: draft?.roundOffAmount || 0,
      roundOffType: draft?.roundOffType || 'ADD',
    };
  });

  const [
    isGstApplicableForSelectedVendor,
    setIsGstApplicableForSelectedVendor,
  ] = useState(() => {
    const draft = SessionStorageService.get('purchaseInvoiceDraft');
    return draft?.isGstApplicableForSelectedVendor || false;
  });

  // Custom Form Config Hook
  const {
    fields,
    baseVersion,
    revision,
    etag,
    originalCustomFields,
    originalSystemFields,
    handleSetFields,
    handleSaveSuccess,
  } = usePurchaseInvoiceFormConfig({ enterpriseId, setOrder });

  // Custom Queries Hook
  const {
    units,
    vendorData,
    vendorOptions,
    itemTypeOptions,
    goodsData,
    itemVendorListingOptions,
    isItemAlreadyAdded,
  } = usePurchaseInvoiceQueries({
    enterpriseId,
    invoiceType: order.invoiceType,
    orderItems: order.orderItems,
    productBatchesMap,
    translations,
  });

  // Custom Table Columns Hook
  const columns = usePurchaseInvoiceTableColumns({
    isGstApplicableForSelectedVendor,
    setSelectedItem,
    setOrder,
  });

  // Custom Form Actions Hook
  const {
    isPINError,
    setIsPINError,
    errorMsg,
    setErrorMsg,
    totalAmount,
    totalGstAmt,
    finalTotal,
    invoiceMutation,
    handleSubmit,
    handlePreview,
  } = usePurchaseInvoiceActions({
    order,
    fields,
    isGstApplicableForSelectedVendor,
    isOrder,
    translations,
    setUrl,
    setIsInvoicePreview,
  });

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
    (!order.sellerId && !order.sellerEnterpriseId) || !order.invoiceType;

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
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
                {/* 1. Invoice Details Section */}
                <PurchaseInvoiceDetailsSection
                  fields={fields}
                  handleSetFields={handleSetFields}
                  order={order}
                  setOrder={setOrder}
                  setSelectedItem={setSelectedItem}
                  baseVersion={baseVersion}
                  etag={etag}
                  originalCustomFields={originalCustomFields}
                  originalSystemFields={originalSystemFields}
                  revision={revision}
                  handleSaveSuccess={handleSaveSuccess}
                  errorMsg={errorMsg}
                  setErrorMsg={setErrorMsg}
                  translations={translations}
                  vendorOptions={vendorOptions}
                  vendorData={vendorData}
                  itemTypeOptions={itemTypeOptions}
                  isGstApplicableForSelectedVendor={
                    isGstApplicableForSelectedVendor
                  }
                  setIsGstApplicableForSelectedVendor={
                    setIsGstApplicableForSelectedVendor
                  }
                />

                {/* 2. Custom/Additional Fields Section */}
                <PurchaseAdditionalInfoSection
                  fields={fields}
                  handleSetFields={handleSetFields}
                  order={order}
                  setOrder={setOrder}
                  baseVersion={baseVersion}
                  etag={etag}
                  originalCustomFields={originalCustomFields}
                  originalSystemFields={originalSystemFields}
                  revision={revision}
                  handleSaveSuccess={handleSaveSuccess}
                  errorMsg={errorMsg}
                  isDeveloperMode={isDeveloperMode}
                  isGstApplicableForSelectedVendor={
                    isGstApplicableForSelectedVendor
                  }
                />

                {/* 3. Add Items Section */}
                <PurchaseAddItemSection
                  fields={fields}
                  handleSetFields={handleSetFields}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  order={order}
                  setOrder={setOrder}
                  baseVersion={baseVersion}
                  etag={etag}
                  originalCustomFields={originalCustomFields}
                  originalSystemFields={originalSystemFields}
                  revision={revision}
                  handleSaveSuccess={handleSaveSuccess}
                  errorMsg={errorMsg}
                  setErrorMsg={setErrorMsg}
                  translations={translations}
                  itemVendorListingOptions={itemVendorListingOptions}
                  units={units}
                  goodsData={goodsData}
                  isGstApplicableForSelectedVendor={
                    isGstApplicableForSelectedVendor
                  }
                  isItemInputsDisabled={isItemInputsDisabled}
                  isItemAlreadyAdded={isItemAlreadyAdded}
                  setProductBatchesMap={setProductBatchesMap}
                  setIsAddingBatchFor={setIsAddingBatchFor}
                />

                {/* 4. Line Items Table */}
                <PurchaseLineItemsTableSection
                  columns={columns}
                  orderItems={order.orderItems}
                />
              </div>

              {/* 5. Footer Section */}
              <PurchaseInvoiceFooter
                order={order}
                setOrder={setOrder}
                totalAmount={totalAmount}
                totalGstAmt={totalGstAmt}
                finalTotal={finalTotal}
                isGstApplicableForSelectedVendor={
                  isGstApplicableForSelectedVendor
                }
                onCancel={onCancel}
                isOrder={isOrder}
                handlePreview={handlePreview}
                handleSubmit={handleSubmit}
                isPending={invoiceMutation.isPending}
                translations={translations}
              />
            </div>
          )}
        </>
      )}

      {isInvoicePreview && (
        <InvoicePreview
          enterpriseId={enterpriseId}
          order={order}
          setOrder={setOrder}
          getAddressRelatedData={
            order?.getAddressRelatedData || {
              clientId: enterpriseId,
              clientEnterpriseId: enterpriseId,
            }
          }
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

export default DynamicCreatePurchaseInvoice;
