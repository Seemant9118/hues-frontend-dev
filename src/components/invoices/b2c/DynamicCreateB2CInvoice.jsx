import { ChevronDown } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import React, { useMemo, useState } from 'react';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AddBatch from '@/components/inventory/batch/AddBatch';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';

import B2CAddItemSection from './components/B2CAddItemSection';
import B2CAdditionalInfoSection from './components/B2CAdditionalInfoSection';
import B2CInvoiceDetailsSection from './components/B2CInvoiceDetailsSection';
import B2CInvoiceFooter from './components/B2CInvoiceFooter';
import B2CLineItemsTableSection from './components/B2CLineItemsTableSection';
import { useB2CInvoiceActions } from './hooks/useB2CInvoiceActions';
import { useB2CInvoiceFormConfig } from './hooks/useB2CInvoiceFormConfig';
import { useB2CInvoiceQueries } from './hooks/useB2CInvoiceQueries';
import { useB2CInvoiceTableColumns } from './hooks/useB2CInvoiceTableColumns';
import InvoiceTypePopover from '../InvoiceTypePopover';
import { Button } from '../../ui/button';
import EmptyStageComponent from '../../ui/EmptyStageComponent';
import SubHeader from '../../ui/Sub-header';
import Wrapper from '../../wrappers/Wrapper';

const DynamicCreateB2CInvoice = ({
  name,
  isCreatingInvoice,
  onCancel,
  invoiceType,
  setInvoiceType,
}) => {
  const translations = useTranslations('components.create_B2C_Invoice');
  const { isDeveloperMode } = useDeveloperMode();

  const userId = useMemo(() => LocalStorageService.get('user_profile'), []);
  const enterpriseId = useMemo(() => getEnterpriseId(), []);

  const [inputValue, setInputValue] = useState('');
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  // Lazy Initializers for state
  const [selectedItem, setSelectedItem] = useState(() => {
    const draft = SessionStorageService.get('b2CInvoiceDraft');
    return {
      productName: draft?.itemDraft?.productName || '',
      serviceName: draft?.itemDraft?.serviceName || '',
      sac: draft?.itemDraft?.sac || '',
      hsnCode: draft?.itemDraft?.hsnCode || '',
      skuId: draft?.itemDraft?.skuId || '',
      productType: draft?.itemDraft?.productType || '',
      productId: draft?.itemDraft?.productId || null,
      quantity: draft?.itemDraft?.quantity || null,
      unitId: draft?.itemDraft?.unitId || null,
      unitPrice: draft?.itemDraft?.unitPrice || null,
      gstPerUnit: draft?.itemDraft?.gstPerUnit || null,
      totalAmount: draft?.itemDraft?.totalAmount || null,
      totalGstAmount: draft?.itemDraft?.totalGstAmount || null,
      batch: draft?.itemDraft?.batch || null,
      batches: draft?.itemDraft?.batches || [],
      expiryDate: draft?.itemDraft?.expiryDate || '',
    };
  });

  const [order, setOrder] = useState(() => {
    const draft = SessionStorageService.get('b2CInvoiceDraft');
    return {
      clientType: 'B2C',
      sellerEnterpriseId: enterpriseId,
      buyerId: draft?.buyerId || null,
      buyerName: draft?.buyerName || null,
      addressType: draft?.addressType || null,
      buyerAddress: draft?.buyerAddress || null,
      gstAmount: draft?.gstAmount || null,
      amount: draft?.amount || null,
      orderType: 'SALES',
      roundOffType: draft?.roundOffType || 'ADD',
      invoiceType: draft?.invoiceType || '',
      orderItems: draft?.orderItems || [],
      bankAccountId: draft?.bankAccountId || null,
      socialLinks: draft?.socialLinks || null,
      remarks: draft?.remarks || null,
      pin: draft?.pin || null,
      invoiceDate: draft?.invoiceDate || moment().format('YYYY-MM-DD'),
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
  } = useB2CInvoiceFormConfig({ enterpriseId, setOrder });

  // Custom Queries & Options Hook
  const {
    units,
    options,
    setOptions,
    isGstApplicableForSalesOrders,
    addressTypesOptions,
    itemTypeOptions,
    goodsData,
    itemClientListingOptions,
    isItemAlreadyAdded,
  } = useB2CInvoiceQueries({
    enterpriseId,
    userId,
    isCreatingInvoice,
    inputValue,
    invoiceType: order.invoiceType,
    orderItems: order.orderItems,
    productBatchesMap,
    translations,
  });

  // Custom Table Columns Hook
  const columns = useB2CInvoiceTableColumns({
    isGstApplicableForSalesOrders,
    setSelectedItem,
    setOrder,
  });

  // Custom Form Actions Hook
  const {
    errorMsg,
    setErrorMsg,
    totalAmount,
    totalGstAmt,
    totalAmtWithGst,
    invoiceMutation,
    handleSubmit,
  } = useB2CInvoiceActions({
    order,
    fields,
    isGstApplicableForSalesOrders,
    translations,
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

  const isItemInputsDisabled = !order.buyerId || !order.invoiceType;

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

          <div className="flex min-h-[calc(100vh-100px)] flex-col">
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
              {/* 1. Invoice Details Section */}
              <B2CInvoiceDetailsSection
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
                inputValue={inputValue}
                setInputValue={setInputValue}
                options={options}
                setOptions={setOptions}
                addressTypesOptions={addressTypesOptions}
                itemTypeOptions={itemTypeOptions}
              />

              {/* 2. Custom/Additional Fields Section */}
              <B2CAdditionalInfoSection
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
              <B2CAddItemSection
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
              <B2CLineItemsTableSection
                columns={columns}
                orderItems={order.orderItems}
              />
            </div>

            {/* 5. Footer Section */}
            <B2CInvoiceFooter
              totalAmount={totalAmount}
              totalGstAmt={totalGstAmt}
              totalAmtWithGst={totalAmtWithGst}
              isGstApplicableForSalesOrders={isGstApplicableForSalesOrders}
              onCancel={onCancel}
              handleSubmit={handleSubmit}
              order={order}
              isPending={invoiceMutation.isPending}
              translations={translations}
            />
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

export default DynamicCreateB2CInvoice;
