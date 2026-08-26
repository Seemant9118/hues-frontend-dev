import { ChevronDown } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import React, { useState, useMemo } from 'react';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AddBatch from '@/components/inventory/batch/AddBatch';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';

import B2BAddItemSection from './components/B2BAddItemSection';
import B2BAdditionalInfoSection from './components/B2BAdditionalInfoSection';
import B2BInvoiceDetailsSection from './components/B2BInvoiceDetailsSection';
import B2BInvoiceFooter from './components/B2BInvoiceFooter';
import B2BLineItemsTableSection from './components/B2BLineItemsTableSection';
import { useB2BInvoiceActions } from './hooks/useB2BInvoiceActions';
import { useB2BInvoiceFormConfig } from './hooks/useB2BInvoiceFormConfig';
import { useB2BInvoiceQueries } from './hooks/useB2BInvoiceQueries';
import { useB2BInvoiceTableColumns } from './hooks/useB2BInvoiceTableColumns';
import InvoiceTypePopover from '../InvoiceTypePopover';
import { Button } from '../../ui/button';
import EmptyStageComponent from '../../ui/EmptyStageComponent';
import InvoicePreview from '../../ui/InvoicePreview';
import SubHeader from '../../ui/Sub-header';
import Wrapper from '../../wrappers/Wrapper';

const DynamicCreateB2BInvoice = ({
  onCancel,
  name,
  cta,
  isOrder,
  invoiceType,
  setInvoiceType,
}) => {
  const translations = useTranslations('components.create_edit_order');
  const { isDeveloperMode } = useDeveloperMode();

  const userId = useMemo(() => LocalStorageService.get('user_profile'), []);
  const enterpriseId = useMemo(() => getEnterpriseId(), []);

  const [url, setUrl] = useState(null);
  const [isInvoicePreview, setIsInvoicePreview] = useState(false);
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  // Lazy Initializers for State
  const [selectedItem, setSelectedItem] = useState(() => {
    const draft = SessionStorageService.get('b2bInvoiceDraft');
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
    const draft = SessionStorageService.get('b2bInvoiceDraft');
    return {
      source: draft?.source || '',
      invoiceReferenceNumber: draft?.invoiceReferenceNumber || null,
      orderId: draft?.orderId || null,
      selectedOrder: draft?.selectedOrder || null,
      saveAsGstDraft: draft?.saveAsGstDraft || false,
      authorizedPersonId: draft?.authorizedPersonId || null,
      authorizedPerson: draft?.authorizedPerson || null,
      clientType: 'B2B',
      sellerEnterpriseId: enterpriseId,
      buyerId: draft?.buyerId || null,
      gstAmount: draft?.gstAmount || null,
      amount: draft?.amount || null,
      orderType: 'SALES',
      invoiceType: draft?.invoiceType || '',
      orderItems: draft?.orderItems || [],
      bankAccountId: draft?.bankAccountId || null,
      socialLinks: draft?.socialLinks || null,
      remarks: draft?.remarks || null,
      pin: draft?.pin || null,
      billingAddressId: draft?.billingAddressId || null,
      shippingAddressId: draft?.shippingAddressId || null,
      selectedValue: draft?.selectedValue || null,
      selectedGstNumber: draft?.selectedGstNumber || null,
      getAddressRelatedData: draft?.getAddressRelatedData || null,
      invoiceDate: draft?.invoiceDate || moment().format('YYYY-MM-DD'),
      buyerType: draft?.buyerType || null,
      roundOffAmount: draft?.roundOffAmount || 0,
      roundOffType: draft?.roundOffType || 'ADD',
    };
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
  } = useB2BInvoiceFormConfig({ enterpriseId, setOrder });

  // Custom Queries & Options Hook
  const {
    units,
    clientOptions,
    itemTypeOptions,
    isGstApplicableForSalesOrders,
    goodsData,
    itemClientListingOptions,
    isItemAlreadyAdded,
  } = useB2BInvoiceQueries({
    enterpriseId,
    userId,
    invoiceType: order.invoiceType,
    orderItems: order.orderItems,
    productBatchesMap,
    translations,
  });

  // Custom Table Columns Hook
  const columns = useB2BInvoiceTableColumns({
    isGstApplicableForSalesOrders,
    setSelectedItem,
    setOrder,
  });

  // Custom Form Actions & Calculations Hook
  const {
    isPINError,
    setIsPINError,
    errorMsg,
    setErrorMsg,
    totalAmount,
    totalGstAmt,
    roundedTotal,
    roundOff,
    invoiceMutation,
    handleSubmit,
    handlePreview,
  } = useB2BInvoiceActions({
    order,
    fields,
    isGstApplicableForSalesOrders,
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
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
                {/* 1. Invoice Details Section */}
                <B2BInvoiceDetailsSection
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
                  clientOptions={clientOptions}
                  itemTypeOptions={itemTypeOptions}
                  enterpriseId={enterpriseId}
                />

                {/* 2. Custom/Additional Fields Section */}
                <B2BAdditionalInfoSection
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
                />

                {/* 3. Add Items Section */}
                <B2BAddItemSection
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
                  itemClientListingOptions={itemClientListingOptions}
                  units={units}
                  goodsData={goodsData}
                  isGstApplicableForSalesOrders={isGstApplicableForSalesOrders}
                  isItemInputsDisabled={isItemInputsDisabled}
                  isItemAlreadyAdded={isItemAlreadyAdded}
                  setProductBatchesMap={setProductBatchesMap}
                  setIsAddingBatchFor={setIsAddingBatchFor}
                />

                {/* 4. Line Items Table */}
                <B2BLineItemsTableSection
                  columns={columns}
                  orderItems={order.orderItems}
                />
              </div>

              {/* 5. Footer Section */}
              <B2BInvoiceFooter
                totalAmount={totalAmount}
                totalGstAmt={totalGstAmt}
                roundOff={roundOff}
                roundedTotal={roundedTotal}
                isGstApplicableForSalesOrders={isGstApplicableForSalesOrders}
                onCancel={onCancel}
                isOrder={isOrder}
                handlePreview={handlePreview}
                handleSubmit={handleSubmit}
                order={order}
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

export default DynamicCreateB2BInvoice;
