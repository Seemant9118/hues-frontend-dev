import React from 'react';
import Select from 'react-select';

import {
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { Input } from '@/components/ui/input';

import ErrorBox from '@/components/ui/ErrorBox';
import InputWithSelect from '@/components/ui/InputWithSelect';
import { Button } from '@/components/ui/button';

export const AddItemSection = ({
  isOffer,
  order,
  setOrder,
  selectedItem,
  setSelectedItem,
  selectedOption,
  itemOptions,
  units,
  isCurrentGstApplicable,
  fields,
  handleSetFields,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  handleQuantityChange,
  handlePriceChange,
  calculateItem,
  initialItemState,
  errorMsg,
  setErrorMsg,
  translations,
  cta,
  SessionStorageService,
}) => {
  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-primary">
        Add Item
      </span>
      <section className="border-b bg-white p-2 shadow-none">
        <div className="flex flex-col gap-4">
          <DynamicFormRenderer
            module={isOffer ? 'SALES_ORDER' : 'PURCHASE_ORDER'}
            fields={fields}
            setFields={handleSetFields}
            formData={selectedItem}
            allowAddField={false}
            baseVersion={baseVersion}
            etag={etag}
            originalCustomFields={originalCustomFields}
            originalSystemFields={originalSystemFields}
            revision={revision}
            onSaveSuccess={handleSaveSuccess}
            onChange={(key, value) => {
              if (key === 'quantity') {
                handleQuantityChange({ target: { value } });
              } else if (key === 'unitPrice') {
                handlePriceChange({ target: { value } });
              }
            }}
            errors={errorMsg}
            gridCols="grid-cols-1 md:grid-cols-4"
            filterFn={(f) => {
              const itemKeys = [
                'productId',
                'quantity',
                'unitPrice',
                'totalAmount',
                'gstPerUnit',
                'totalGstAmount',
                'finalAmount',
              ];
              return itemKeys.includes(f.key);
            }}
            renderCustomField={(field) => {
              if (field.key === 'productId') {
                return (
                  <div className="flex flex-col">
                    <Select
                      name="items"
                      value={selectedOption}
                      placeholder={translations('form.input.item.placeholder')}
                      options={itemOptions}
                      styles={getStylesForSelectComponent()}
                      isOptionDisabled={(option) => option.disabled}
                      className="w-full text-sm font-medium"
                      classNamePrefix="select"
                      isDisabled={
                        (isOffer && order.buyerId == null) ||
                        (!isOffer && order.sellerEnterpriseId == null) ||
                        order.invoiceType === ''
                      }
                      onChange={(selectedOption) => {
                        const selectedItemData = selectedOption?.value;
                        if (!selectedItemData) return;

                        const gstPerUnit = isCurrentGstApplicable
                          ? Number(selectedItemData.gstPercentage) || 0
                          : 0;

                        const updatedItem = {
                          ...selectedItem,
                          productId: selectedItemData.id,
                          productType: 'GOODS',
                          unitPrice:
                            selectedItemData.salesPrice ??
                            selectedItemData.rate ??
                            selectedItemData.cataloguePrice ??
                            0,
                          gstPerUnit,
                          productName: selectedItemData.name,
                          hsnCode: selectedItemData.hsnCode,
                        };

                        const calculated = calculateItem(
                          updatedItem,
                          isCurrentGstApplicable,
                        );

                        setSelectedItem(calculated);
                        saveDraftToSession({
                          cta,
                          data: { ...order, itemDraft: calculated },
                        });
                      }}
                    />
                    {errorMsg.orderItem && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.orderItem} />
                      </div>
                    )}
                  </div>
                );
              }
              if (field.key === 'quantity') {
                return (
                  <div className="flex flex-col">
                    <InputWithSelect
                      id="quantity"
                      name=""
                      required={true}
                      disabled={
                        (isOffer && order.buyerId == null) ||
                        order.sellerEnterpriseId == null
                      }
                      className="h-10 rounded-lg border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                      value={
                        selectedItem.quantity == null ||
                        selectedItem.quantity === 0
                          ? ''
                          : selectedItem.quantity
                      }
                      onValueChange={handleQuantityChange}
                      unit={selectedItem.unitId}
                      onUnitChange={(val) => {
                        setSelectedItem((prev) => {
                          const updated = { ...prev, unitId: Number(val) };
                          saveDraftToSession({
                            cta,
                            data: { ...order, itemDraft: updated },
                          });
                          return updated;
                        });
                      }}
                      units={units?.quantity}
                      unitPlaceholder="Unit"
                      min={0}
                      step="any"
                    />
                    {errorMsg.quantity && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.quantity} />
                      </div>
                    )}
                  </div>
                );
              }
              if (field.key === 'unitPrice') {
                return (
                  <div className="flex flex-col">
                    <Input
                      type="number"
                      placeholder="0.00"
                      min={1}
                      disabled={
                        (isOffer && order.buyerId == null) ||
                        order.sellerEnterpriseId == null
                      }
                      value={
                        selectedItem.unitPrice == null ||
                        selectedItem.unitPrice === 0
                          ? ''
                          : selectedItem.unitPrice
                      }
                      className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                      onChange={handlePriceChange}
                    />
                    {errorMsg.unitPrice && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.unitPrice} />
                      </div>
                    )}
                  </div>
                );
              }
              if (field.key === 'totalAmount') {
                return (
                  <div className="flex flex-col">
                    <Input
                      disabled
                      value={selectedItem.totalAmount || '0.00'}
                      className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                    />
                    {errorMsg.totalAmount && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.totalAmount} />
                      </div>
                    )}
                  </div>
                );
              }
              if (field.key === 'gstPerUnit') {
                if (!isCurrentGstApplicable) return null;
                return (
                  <div className="flex flex-col">
                    <Input
                      disabled
                      value={selectedItem.gstPerUnit || '0'}
                      className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                    />
                    {errorMsg.gstPerUnit && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.gstPerUnit} />
                      </div>
                    )}
                  </div>
                );
              }
              if (field.key === 'totalGstAmount') {
                if (!isCurrentGstApplicable) return null;
                return (
                  <div className="flex flex-col">
                    <Input
                      disabled
                      value={selectedItem.totalGstAmount || '0.00'}
                      className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                    />
                    {errorMsg.totalGstAmount && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.totalGstAmount} />
                      </div>
                    )}
                  </div>
                );
              }
              if (field.key === 'finalAmount') {
                return (
                  <div className="flex flex-col">
                    <div className="flex h-10 items-center rounded-lg border border-blue-100 bg-blue-50/30 px-3 text-sm font-bold text-blue-700 shadow-sm">
                      ₹
                      {(
                        Number(selectedItem.finalAmount) ||
                        (Number(selectedItem.totalAmount) || 0) +
                          (isCurrentGstApplicable
                            ? Number(selectedItem.totalGstAmount) || 0
                            : 0)
                      ).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    {errorMsg.finalAmount && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.finalAmount} />
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Action Buttons */}
          <div className="mt-2 flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              className="w-28"
              disabled={
                !selectedItem.productId &&
                !selectedItem.quantity &&
                !selectedItem.unitPrice
              }
              onClick={() => {
                setSelectedItem(initialItemState);
                saveDraftToSession({
                  cta,
                  data: { ...order, itemDraft: initialItemState },
                });
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="w-28"
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
                    gstPerUnit: selectedItem.gstPerUnit ?? 0,
                  },
                ];
                const updatedOrder = {
                  ...order,
                  orderItems: updatedOrderItems,
                };
                setOrder(updatedOrder);
                setSelectedItem(initialItemState);

                const key = isOffer ? 'orderDraft' : 'bidDraft';
                const { itemDraft, ...rest } =
                  SessionStorageService.get(key) || {};
                saveDraftToSession({
                  cta,
                  data: { ...rest, ...updatedOrder },
                });
                setErrorMsg({});
              }}
            >
              Add Item
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
