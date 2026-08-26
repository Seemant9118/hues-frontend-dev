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

import EmptyStageComponent from '../../../ui/EmptyStageComponent';
import { Button } from '../../../ui/button';

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

const DynamicGoodsDetail = ({
  formData: order,
  setFormData: setOrder,
  onCancel,
}) => {
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

    const updatedItem = { ...selectedItem, quantity: Number(inputValue) };
    const calculated = calculateItem(updatedItem, isCurrentGstApplicable);

    setSelectedItem(calculated);
    saveDraftToSession({ cta, data: { ...order, itemDraft: calculated } });
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

    const price = Number(inputValue);
    if (price < 0) return;

    const updatedItem = { ...selectedItem, unitPrice: price };
    const calculated = calculateItem(updatedItem, isCurrentGstApplicable);

    setSelectedItem(calculated);
    saveDraftToSession({ cta, data: { ...order, itemDraft: calculated } });
  };

  // Order Totals Hook
  const { grossAmount, totalGstAmount, finalAmount } = useOrderTotals(
    order?.orderItems || [],
    isCurrentGstApplicable,
  );

  useEffect(() => {
    setOrder((prev) => {
      if (
        prev.totals?.grossAmount === grossAmount &&
        prev.totals?.totalGstAmount === totalGstAmount &&
        prev.totals?.finalAmount === finalAmount &&
        prev.totals?.gstApplicable === isCurrentGstApplicable
      ) {
        return prev;
      }
      return {
        ...prev,
        totals: {
          grossAmount,
          totalGstAmount,
          finalAmount,
          gstApplicable: isCurrentGstApplicable,
        },
      };
    });
  }, [
    grossAmount,
    totalGstAmount,
    finalAmount,
    isCurrentGstApplicable,
    setOrder,
  ]);

  const selectedOption = useMemo(() => {
    if (!selectedItem?.productId) return null;

    return (
      itemOptions?.find(
        (item) => String(item.value.id) === String(selectedItem.productId),
      ) ?? null
    );
  }, [selectedItem?.productId, itemOptions]);

  const handleItemEdit = useCallback(
    (item) => {
      setSelectedItem({
        ...item,
        productId: item.id || item.productId,
      });

      setOrder((prev) => {
        const updatedItems = (prev.orderItems || []).filter(
          (oi) => oi.productId !== item.productId,
        );
        const updatedOrder = { ...prev, orderItems: updatedItems };

        const key = isOffer ? 'orderDraft' : 'bidDraft';
        const prevDraft = SessionStorageService.get(key) || {};
        SessionStorageService.set(key, {
          ...prevDraft,
          ...updatedOrder,
          itemDraft: item,
        });

        return updatedOrder;
      });
    },
    [isOffer, setOrder],
  );

  const handleItemDelete = useCallback(
    (item) => {
      setOrder((prev) => {
        const updatedItems = (prev.orderItems || []).filter(
          (oi) => oi.productId !== item.productId,
        );
        const updatedOrder = { ...prev, orderItems: updatedItems };

        const key = isOffer ? 'orderDraft' : 'bidDraft';
        const prevDraft = SessionStorageService.get(key) || {};
        SessionStorageService.set(key, {
          ...prevDraft,
          ...updatedOrder,
        });

        return updatedOrder;
      });
    },
    [isOffer, setOrder],
  );

  // 4. Table Columns Hook
  const columns = useGoodsTableColumns({
    isCurrentGstApplicable,
    isOffer,
    handleItemEdit,
    handleItemDelete,
  });

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Order" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col gap-4">
      {/* 1. Section: Client/Vendor Information */}
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
        clientOptions={clientOptions}
        vendorOptions={vendorOptions}
        setSelectedItem={setSelectedItem}
        initialItemState={INITIAL_ITEM_STATE}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setIsGstApplicableForPurchaseOrders={
          setIsGstApplicableForPurchaseOrders
        }
        errorMsg={errorMsg}
        translations={translations}
        cta={cta}
      />

      {/* 2. Section: Items/Services Related Fields */}
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

      {/* 3. Section: Custom/Additional Fields */}
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

      {/* 4. Section: DataTable */}
      <LineItemsTableSection orderItems={order.orderItems} columns={columns} />
    </div>
  );
};

export default DynamicGoodsDetail;
