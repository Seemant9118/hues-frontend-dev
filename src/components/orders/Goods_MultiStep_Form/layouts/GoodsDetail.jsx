import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  getEnterpriseId,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import useOrderTotals from '@/hooks/useOrderTotals';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';

import { AdditionalInfoSection } from './components/AdditionalInfoSection';
import { AddItemSection } from './components/AddItemSection';
import { ClientVendorSection } from './components/ClientVendorSection';
import { LineItemsTableSection } from './components/LineItemsTableSection';
import { useGoodsDetailQueries } from './hooks/useGoodsDetailQueries';
import { useGoodsFormConfig } from './hooks/useGoodsFormConfig';
import { useGoodsTableColumns } from './hooks/useGoodsTableColumns';

/** Default initial state for a single item draft */
const INITIAL_ITEM_STATE = {
  productName: '',
  productType: 'GOODS',
  productId: null,
  quantity: null,
  unitPrice: null,
  unitId: null,
  gstPerUnit: null,
  totalAmount: null,
  totalGstAmount: null,
  finalAmount: null,
};

/** Calculates item totals safely */
const calculateItem = (item, gstApplicable) => {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const gst = gstApplicable ? Number(item.gstPerUnit || 0) : 0;

  const baseValue = qty * price;
  const gstAmount = (baseValue * gst) / 100;
  const finalAmount = baseValue + gstAmount;

  return {
    ...item,
    discountPercentage: 0,
    discountAmount: 0,
    totalAmount: Number(baseValue.toFixed(2)),
    totalGstAmount: Number(gstAmount.toFixed(2)),
    finalAmount: Number(finalAmount.toFixed(2)),
  };
};

const GoodsDetail = ({ formData: order, setFormData: setOrder, onCancel }) => {
  const translations = useTranslations('components.create_edit_order');
  const { isDeveloperMode } = useDeveloperMode();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const { isCreatingSales, isCreatingPurchase, cta, referenceOrderId } = order;
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const isOffer = cta === 'offer';
  const isOfferType = order?.invoiceType;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  // 1. Form Schema Config Hook
  const {
    fields,
    handleSetFields,
    baseVersion,
    revision,
    etag,
    originalCustomFields,
    originalSystemFields,
    handleSaveSuccess,
  } = useGoodsFormConfig({ cta, isOffer, setOrder });

  // 2. React Queries & Options Hook
  const {
    units,
    clientOptions,
    vendorOptions,
    itemOptions,
    isCurrentGstApplicable,
    setIsGstApplicableForPurchaseOrders,
  } = useGoodsDetailQueries({
    order,
    setOrder,
    userId,
    enterpriseId,
    isPurchasePage,
    isOffer,
    isOfferType,
    referenceOrderId,
    translations,
  });

  // 3. Lazy state initialization for item draft
  const [selectedItem, setSelectedItem] = useState(() => {
    const orderDraft = isCreatingSales
      ? SessionStorageService.get('orderDraft')
      : null;
    const bidDraft = isCreatingPurchase
      ? SessionStorageService.get('bidDraft')
      : null;
    const itemDraft = isOffer ? orderDraft?.itemDraft : bidDraft?.itemDraft;

    return itemDraft
      ? {
          productName: itemDraft.productName || '',
          productType: 'GOODS',
          productId: itemDraft.productId || null,
          quantity: itemDraft.quantity || null,
          unitPrice: itemDraft.unitPrice || null,
          unitId: itemDraft.unitId || null,
          gstPerUnit: itemDraft.gstPerUnit || null,
          totalAmount: itemDraft.totalAmount || null,
          totalGstAmount: itemDraft.totalGstAmount || null,
          finalAmount: itemDraft.finalAmount || null,
        }
      : INITIAL_ITEM_STATE;
  });

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      const cleared = {
        ...selectedItem,
        quantity: 0,
        discountAmount: 0,
        totalGstAmount: 0,
        totalAmount: 0,
      };
      setSelectedItem(cleared);
      saveDraftToSession({ cta, data: { ...order, itemDraft: cleared } });
      return;
    }

    if (!/^\d*\.?\d*$/.test(inputValue)) return;

    const val = Number(inputValue);
    const updated = calculateItem(
      { ...selectedItem, quantity: val },
      isCurrentGstApplicable,
    );
    setSelectedItem(updated);
    saveDraftToSession({ cta, data: { ...order, itemDraft: updated } });
  };

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      const cleared = {
        ...selectedItem,
        unitPrice: 0,
        discountAmount: 0,
        totalGstAmount: 0,
        totalAmount: 0,
      };
      setSelectedItem(cleared);
      saveDraftToSession({ cta, data: { ...order, itemDraft: cleared } });
      return;
    }

    if (!/^\d*\.?\d*$/.test(inputValue)) return;

    const val = Number(inputValue);
    const updated = calculateItem(
      { ...selectedItem, unitPrice: val },
      isCurrentGstApplicable,
    );
    setSelectedItem(updated);
    saveDraftToSession({ cta, data: { ...order, itemDraft: updated } });
  };

  // Recalculate order totals whenever line items or GST status changes
  const { totalValue, totalGst, grandTotal } = useOrderTotals(
    order.orderItems,
    isCurrentGstApplicable,
  );

  useEffect(() => {
    const parsedAmount = Number(totalValue.toFixed(2));
    const parsedGst = Number(totalGst.toFixed(2));

    if (order.amount !== parsedAmount || order.gstAmount !== parsedGst) {
      const updatedOrder = {
        ...order,
        amount: parsedAmount,
        gstAmount: parsedGst,
      };
      setOrder(updatedOrder);
      saveDraftToSession({ cta, data: updatedOrder });
    }
  }, [totalValue, totalGst, order, setOrder, cta]);

  const selectedOption = useMemo(() => {
    if (!selectedItem?.productId || !itemOptions) return null;
    return (
      itemOptions.find((opt) => opt.value === selectedItem.productId) || null
    );
  }, [selectedItem?.productId, itemOptions]);

  const handleItemEdit = useCallback(
    (itemToEdit) => {
      setSelectedItem({
        productName: itemToEdit.productName || itemToEdit.serviceName || '',
        productType: itemToEdit.productType || 'GOODS',
        productId: itemToEdit.productId || null,
        quantity: itemToEdit.quantity || null,
        unitPrice: itemToEdit.unitPrice || null,
        unitId: itemToEdit.unitId || null,
        gstPerUnit: itemToEdit.gstPerUnit || null,
        totalAmount: itemToEdit.totalAmount || null,
        totalGstAmount: itemToEdit.totalGstAmount || null,
        finalAmount: itemToEdit.finalAmount || null,
      });

      const updatedItems = (order.orderItems || []).filter(
        (i) => i.productId !== itemToEdit.productId,
      );
      const updatedOrder = { ...order, orderItems: updatedItems };
      setOrder(updatedOrder);
      saveDraftToSession({ cta, data: updatedOrder });
    },
    [order, setOrder, cta],
  );

  const handleItemDelete = useCallback(
    (itemToDelete) => {
      const updatedItems = (order.orderItems || []).filter(
        (i) => i.productId !== itemToDelete.productId,
      );
      const updatedOrder = { ...order, orderItems: updatedItems };
      setOrder(updatedOrder);
      saveDraftToSession({ cta, data: updatedOrder });
    },
    [order, setOrder, cta],
  );

  const columns = useGoodsTableColumns({
    isCurrentGstApplicable,
    isOffer,
    handleItemEdit,
    handleItemDelete,
  });

  return (
    <div className="flex flex-col gap-3">
      {/* 1. Client/Vendor Selector Section */}
      <ClientVendorSection
        isOffer={isOffer}
        isOfferType={isOfferType}
        order={order}
        setOrder={setOrder}
        fields={fields}
        handleSetFields={handleSetFields}
        baseVersion={baseVersion}
        etag={etag}
        originalCustomFields={originalCustomFields}
        originalSystemFields={originalSystemFields}
        revision={revision}
        handleSaveSuccess={handleSaveSuccess}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        isPurchasePage={isPurchasePage}
        clientOptions={clientOptions}
        vendorOptions={vendorOptions}
        translations={translations}
        cta={cta}
        setIsGstApplicableForPurchaseOrders={
          setIsGstApplicableForPurchaseOrders
        }
      />

      {/* 2. Add Item Input Section */}
      <AddItemSection
        isOffer={isOffer}
        order={order}
        setOrder={setOrder}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        selectedOption={selectedOption}
        itemOptions={itemOptions}
        units={units}
        isCurrentGstApplicable={isCurrentGstApplicable}
        fields={fields}
        handleSetFields={handleSetFields}
        baseVersion={baseVersion}
        etag={etag}
        originalCustomFields={originalCustomFields}
        originalSystemFields={originalSystemFields}
        revision={revision}
        handleSaveSuccess={handleSaveSuccess}
        handleQuantityChange={handleQuantityChange}
        handlePriceChange={handlePriceChange}
        calculateItem={calculateItem}
        initialItemState={INITIAL_ITEM_STATE}
        errorMsg={errorMsg}
        setErrorMsg={setErrorMsg}
        translations={translations}
        cta={cta}
        SessionStorageService={SessionStorageService}
      />

      {/* 3. Dynamic Custom Fields Section */}
      <AdditionalInfoSection
        isOffer={isOffer}
        order={order}
        setOrder={setOrder}
        fields={fields}
        handleSetFields={handleSetFields}
        baseVersion={baseVersion}
        etag={etag}
        originalCustomFields={originalCustomFields}
        originalSystemFields={originalSystemFields}
        revision={revision}
        handleSaveSuccess={handleSaveSuccess}
        errorMsg={errorMsg}
        isDeveloperMode={isDeveloperMode}
        cta={cta}
      />

      {/* 4. Line Items Table Section */}
      <LineItemsTableSection orderItems={order.orderItems} columns={columns} />

      {/* 5. Footer Summary Bar */}
      {order.orderItems && order.orderItems.length > 0 ? (
        <section className="sticky bottom-0 z-10 flex items-center justify-between border-t border-neutral-200 bg-white py-3 shadow-md">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Item Value
              </span>
              <span className="text-sm font-semibold text-neutral-700">
                ₹
                {totalValue.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            {isCurrentGstApplicable && (
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Total Tax
                </span>
                <span className="text-sm font-semibold text-neutral-500">
                  ₹
                  {totalGst.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div className="border-l border-neutral-200 pl-6">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Grand Total
              </span>
              <span className="text-base font-bold text-neutral-900">
                ₹
                {grandTotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </section>
      ) : (
        <EmptyStageComponent />
      )}
    </div>
  );
};

export default GoodsDetail;
