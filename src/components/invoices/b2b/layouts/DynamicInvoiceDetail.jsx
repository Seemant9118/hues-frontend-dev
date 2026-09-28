'use client';

import React from 'react';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import { LocalStorageService } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import AddBatch from '@/components/inventory/batch/AddBatch';
import B2BAddItemSection from '../components/B2BAddItemSection';
import B2BAdditionalInfoSection from '../components/B2BAdditionalInfoSection';
import B2BInvoiceDetailsSection from '../components/B2BInvoiceDetailsSection';
import B2BLineItemsTableSection from '../components/B2BLineItemsTableSection';
import { useB2BInvoiceFormConfig } from '../hooks/useB2BInvoiceFormConfig';
import { useB2BInvoiceQueries } from '../hooks/useB2BInvoiceQueries';
import { useB2BInvoiceTableColumns } from '../hooks/useB2BInvoiceTableColumns';
import { useB2BInvoiceActions } from '../hooks/useB2BInvoiceActions';

const DynamicInvoiceDetail = ({ formData: order, setFormData: setOrder }) => {
  const translations = useTranslations('components.create_edit_order');
  const { isDeveloperMode } = useDeveloperMode();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();

  const [selectedItem, setSelectedItem] = React.useState(order.itemDraft || {});
  const [productBatchesMap, setProductBatchesMap] = React.useState({});
  const [isAddingBatchFor, setIsAddingBatchFor] = React.useState(null);

  // Hook integrations
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

  React.useEffect(() => {
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

  const columns = useB2BInvoiceTableColumns({
    isGstApplicableForSalesOrders,
    setSelectedItem,
    setOrder,
  });

  const {
    errorMsg,
    setErrorMsg,
    totalAmount,
    totalGstAmt,
    roundedTotal,
    roundOff,
  } = useB2BInvoiceActions({
    order,
    fields,
    isGstApplicableForSalesOrders,
    isOrder: order.isOrder,
    translations,
    setUrl: () => {},
    setIsInvoicePreview: () => {},
  });

  React.useEffect(() => {
    setOrder((prev) => {
      const newTotals = {
        grossAmount: totalAmount,
        totalGstAmount: totalGstAmt,
        finalAmount: roundedTotal,
        roundOff,
        gstApplicable: !!isGstApplicableForSalesOrders,
      };
      if (
        prev.totals?.grossAmount === newTotals.grossAmount &&
        prev.totals?.totalGstAmount === newTotals.totalGstAmount &&
        prev.totals?.finalAmount === newTotals.finalAmount &&
        prev.totals?.roundOff === newTotals.roundOff &&
        prev.totals?.gstApplicable === newTotals.gstApplicable
      ) {
        return prev;
      }
      return { ...prev, totals: newTotals };
    });
  }, [
    totalAmount,
    totalGstAmt,
    roundedTotal,
    roundOff,
    isGstApplicableForSalesOrders,
    setOrder,
  ]);

  const isItemInputsDisabled =
    (order.cta === 'offer' && order.buyerId == null) || !order.invoiceType;

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto pt-4">
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

      <B2BLineItemsTableSection
        columns={columns}
        orderItems={order.orderItems}
      />

      {isAddingBatchFor && (
        <div className="h-full w-full">
          <AddBatch
            setIsAdding={(val) => {
              if (!val) {
                if (isAddingBatchFor?.skuId) {
                  import('@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services').then(
                    ({ GetProductBatchList }) => {
                      GetProductBatchList({
                        searchString: isAddingBatchFor.skuId,
                      }).then((res) => {
                        const batches = res?.data?.data?.data || [];
                        if (
                          selectedItem.productId === isAddingBatchFor.productId
                        ) {
                          setSelectedItem((prev) => ({ ...prev, batches }));
                        }
                        setProductBatchesMap((prev) => ({
                          ...prev,
                          [isAddingBatchFor.productId]: batches,
                        }));
                      });
                    },
                  );
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

export default DynamicInvoiceDetail;
