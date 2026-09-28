import React, { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AddBatch from '@/components/inventory/batch/AddBatch';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { LocalStorageService } from '@/lib/utils';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';

import B2CAddItemSection from '../components/B2CAddItemSection';
import B2CAdditionalInfoSection from '../components/B2CAdditionalInfoSection';
import B2CInvoiceDetailsSection from '../components/B2CInvoiceDetailsSection';
import B2CLineItemsTableSection from '../components/B2CLineItemsTableSection';
import { useB2CInvoiceActions } from '../hooks/useB2CInvoiceActions';
import { useB2CInvoiceFormConfig } from '../hooks/useB2CInvoiceFormConfig';
import { useB2CInvoiceQueries } from '../hooks/useB2CInvoiceQueries';
import { useB2CInvoiceTableColumns } from '../hooks/useB2CInvoiceTableColumns';

const B2CDynamicInvoiceDetail = ({
  formData: order,
  setFormData: setOrder,
}) => {
  const translations = useTranslations('components.create_B2C_Invoice');
  const { isDeveloperMode } = useDeveloperMode();

  const userId = useMemo(() => LocalStorageService.get('user_profile'), []);
  const enterpriseId = useMemo(() => getEnterpriseId(), []);

  const [inputValue, setInputValue] = useState('');
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  const [selectedItem, setSelectedItem] = useState(order.itemDraft || {});

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
    isCreatingInvoice: false,
    inputValue,
    invoiceType: order.invoiceType,
    orderItems: order.orderItems,
    productBatchesMap,
    translations,
  });

  useEffect(() => {
    if (
      isGstApplicableForSalesOrders !== undefined &&
      isGstApplicableForSalesOrders !== order.isGstApplicableForSalesOrders
    ) {
      setOrder((prev) => ({ ...prev, isGstApplicableForSalesOrders }));
    }
  }, [
    isGstApplicableForSalesOrders,
    order.isGstApplicableForSalesOrders,
    setOrder,
  ]);

  // Custom Table Columns Hook
  const columns = useB2CInvoiceTableColumns({
    isGstApplicableForSalesOrders,
    setSelectedItem,
    setOrder,
  });

  // Custom Form Actions Hook
  const { errorMsg, setErrorMsg, totalAmount, totalGstAmt, totalAmtWithGst } =
    useB2CInvoiceActions({
      order,
      fields,
      isGstApplicableForSalesOrders,
      translations,
      activeWorkflowData: order.activeWorkflowData,
    });

  useEffect(() => {
    setOrder((prev) => {
      const newTotals = {
        grossAmount: totalAmount,
        totalGstAmount: totalGstAmt,
        finalAmount: totalAmtWithGst,
        gstApplicable: !!isGstApplicableForSalesOrders,
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
    totalAmtWithGst,
    isGstApplicableForSalesOrders,
    setOrder,
  ]);

  if (!enterpriseId) return null;

  const isItemInputsDisabled = !order.buyerId || !order.invoiceType;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
      {!isAddingBatchFor && (
        <>
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

export default B2CDynamicInvoiceDetail;
