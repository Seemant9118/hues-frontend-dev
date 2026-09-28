import React, { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AddBatch from '@/components/inventory/batch/AddBatch';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { SessionStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';

import PurchaseAddItemSection from '../components/PurchaseAddItemSection';
import PurchaseAdditionalInfoSection from '../components/PurchaseAdditionalInfoSection';
import PurchaseInvoiceDetailsSection from '../components/PurchaseInvoiceDetailsSection';
import PurchaseLineItemsTableSection from '../components/PurchaseLineItemsTableSection';
import { usePurchaseInvoiceActions } from '../hooks/usePurchaseInvoiceActions';
import { usePurchaseInvoiceFormConfig } from '../hooks/usePurchaseInvoiceFormConfig';
import { usePurchaseInvoiceQueries } from '../hooks/usePurchaseInvoiceQueries';
import { usePurchaseInvoiceTableColumns } from '../hooks/usePurchaseInvoiceTableColumns';

const PurchaseDynamicInvoiceDetail = ({
  formData: order,
  setFormData: setOrder,
}) => {
  const translations = useTranslations('components.create_edit_order');
  const { isDeveloperMode } = useDeveloperMode();
  const enterpriseId = useMemo(() => getEnterpriseId(), []);

  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  const [selectedItem, setSelectedItem] = useState(order.itemDraft || {});

  const [
    isGstApplicableForSelectedVendor,
    setIsGstApplicableForSelectedVendor,
  ] = useState(() => {
    const draft = SessionStorageService.get('purchaseInvoiceDraft');
    return draft?.isGstApplicableForSelectedVendor || false;
  });

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

  const columns = usePurchaseInvoiceTableColumns({
    isGstApplicableForSelectedVendor,
    setSelectedItem,
    setOrder,
  });

  const { errorMsg, setErrorMsg, totalAmount, totalGstAmt, finalTotal } =
    usePurchaseInvoiceActions({
      order,
      fields,
      isGstApplicableForSelectedVendor,
      isOrder: order.isOrder,
      translations,
      setUrl: () => {},
      setIsInvoicePreview: () => {},
      activeWorkflowData: order.activeWorkflowData,
    });

  useEffect(() => {
    setOrder((prev) => {
      const newTotals = {
        grossAmount: totalAmount,
        totalGstAmount: totalGstAmt,
        finalAmount: finalTotal,
        gstApplicable: !!isGstApplicableForSelectedVendor,
      };
      if (
        prev.totals?.grossAmount === newTotals.grossAmount &&
        prev.totals?.totalGstAmount === newTotals.totalGstAmount &&
        prev.totals?.finalAmount === newTotals.finalAmount &&
        prev.totals?.gstApplicable === newTotals.gstApplicable
      ) {
        return prev;
      }
      return { ...prev, totals: newTotals };
    });
  }, [
    totalAmount,
    totalGstAmt,
    finalTotal,
    isGstApplicableForSelectedVendor,
    setOrder,
  ]);

  if (!enterpriseId) return null;

  const isItemInputsDisabled =
    (!order.sellerId && !order.sellerEnterpriseId) || !order.invoiceType;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
      {!isAddingBatchFor && (
        <>
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
            isGstApplicableForSelectedVendor={isGstApplicableForSelectedVendor}
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
            isGstApplicableForSelectedVendor={isGstApplicableForSelectedVendor}
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
            isGstApplicableForSelectedVendor={isGstApplicableForSelectedVendor}
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
    </div>
  );
};

export default PurchaseDynamicInvoiceDetail;
