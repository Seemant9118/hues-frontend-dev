import { Plus } from 'lucide-react';
import moment from 'moment';
import React from 'react';
import ReactSelect from 'react-select';
import { toast } from 'sonner';
import {
  getStylesForSelectComponent,
  isGstApplicable,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputWithSelect from '@/components/ui/InputWithSelect';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';

export default function PurchaseAddItemSection({
  fields,
  handleSetFields,
  selectedItem,
  setSelectedItem,
  order,
  setOrder,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  errorMsg,
  setErrorMsg,
  translations,
  itemVendorListingOptions,
  units,
  goodsData,
  isGstApplicableForSelectedVendor,
  isItemInputsDisabled,
  isItemAlreadyAdded,
  setProductBatchesMap,
  setIsAddingBatchFor,
}) {
  return (
    <div className="flex-shrink-0">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Add Item
      </span>
      <section className="border-b bg-white p-4 shadow-none">
        <div className="flex flex-col gap-4">
          <DynamicFormRenderer
            module="PURCHASE_B2BINVOICE"
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
            filterFn={(f) => {
              const itemKeys = [
                'productId',
                'batch',
                'quantity',
                'unitPrice',
                'gstPerUnit',
                'totalAmount',
                'totalGstAmount',
                'expiryDate',
              ];
              return itemKeys.includes(f.key);
            }}
            gridCols="grid-cols-1 md:grid-cols-4"
            onChange={() => {}}
            errors={errorMsg}
            renderCustomField={(field) => {
              if (field.key === 'productId') {
                return (
                  <ReactSelect
                    name="items"
                    value={
                      itemVendorListingOptions?.find(
                        (item) => item.value.id === selectedItem.productId,
                      ) ?? null
                    }
                    className="w-full text-sm font-medium"
                    classNamePrefix="select"
                    placeholder={translations('form.input.item.placeholder')}
                    options={itemVendorListingOptions}
                    styles={getStylesForSelectComponent()}
                    isOptionDisabled={(option) => option.disabled}
                    isDisabled={isItemInputsDisabled}
                    onChange={(selectedOption) => {
                      const selectedItemData = selectedOption?.value;
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
                              skuId: selectedItemData.skuId,
                              unitPrice:
                                selectedItemData.salesPrice ||
                                selectedItemData.cataloguePrice ||
                                0,
                              gstPerUnit,
                              batches: [],
                              batch: null,
                              expiryDate: '',
                            }
                          : {
                              ...selectedItem,
                              productId: selectedItemData.id,
                              productType: selectedItemData.productType,
                              sac: selectedItemData.sac,
                              serviceName: selectedItemData.serviceName,
                              unitPrice:
                                selectedItemData.rate ||
                                selectedItemData.cataloguePrice ||
                                0,
                              gstPerUnit,
                              batches: [],
                              batch: null,
                              expiryDate: '',
                            };

                      setSelectedItem(updatedItem);

                      if (
                        selectedItemData.productType === 'GOODS' &&
                        selectedItemData.skuId
                      ) {
                        GetProductBatchList({
                          searchString: selectedItemData.skuId,
                        })
                          .then((res) => {
                            const batches = res.data.data.data || [];
                            setSelectedItem((prev) => ({
                              ...prev,
                              batches,
                            }));
                            setProductBatchesMap((prev) => ({
                              ...prev,
                              [selectedItemData.id]: batches,
                            }));
                          })
                          .catch((err) => {
                            toast.error(err.response?.data?.message);
                          });
                      }

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
                );
              }
              if (field.key === 'batch') {
                return (
                  <ReactSelect
                    name="batch"
                    value={
                      selectedItem.batch
                        ? {
                            value: selectedItem.batch.id,
                            label: `${selectedItem.batch.batchNo} & ${moment(selectedItem.batch.expiryDate).format('DD/MM/YYYY')}`,
                          }
                        : null
                    }
                    className="w-full text-sm font-medium"
                    classNamePrefix="select"
                    placeholder="Select Batch"
                    options={[
                      ...(selectedItem.batches?.map((b) => ({
                        value: b.id,
                        label: (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-semibold">
                              Batch: {b.batchNo}
                            </span>
                            <span className="text-xs text-neutral-400">
                              Expiry:{' '}
                              {moment(b.expiryDate).format('DD/MM/YYYY')}
                            </span>
                          </div>
                        ),
                        original: b,
                        disabled: isItemAlreadyAdded(
                          selectedItem.productId,
                          b.id,
                        ),
                      })) || []),
                      {
                        value: 'ADD_NEW_BATCH',
                        label: (
                          <span className="font-semibold text-primary">
                            + Add a New Batch
                          </span>
                        ),
                      },
                    ]}
                    isOptionDisabled={(option) => option.disabled}
                    styles={getStylesForSelectComponent()}
                    isDisabled={
                      isItemInputsDisabled ||
                      selectedItem.productType !== 'GOODS'
                    }
                    onChange={(selectedOption) => {
                      if (selectedOption?.value === 'ADD_NEW_BATCH') {
                        setIsAddingBatchFor({
                          skuId:
                            selectedItem.skuId ||
                            goodsData?.find(
                              (g) => g.id === selectedItem.productId,
                            )?.skuId,
                          productName: selectedItem.productName,
                          productId: selectedItem.productId,
                        });
                        return;
                      }

                      const batchData = selectedOption?.original;
                      const updatedItem = {
                        ...selectedItem,
                        batch: batchData,
                        expiryDate: batchData?.expiryDate || '',
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
                );
              }
              if (field.key === 'quantity') {
                return (
                  <InputWithSelect
                    id="quantity"
                    required={true}
                    disabled={isItemInputsDisabled}
                    className="h-10 rounded-lg border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                    value={
                      selectedItem.quantity == null ||
                      selectedItem.quantity === 0
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
                    unitPlaceholder="Unit"
                  />
                );
              }
              if (field.key === 'unitPrice') {
                return (
                  <Input
                    type="number"
                    disabled={isItemInputsDisabled}
                    value={
                      selectedItem.unitPrice == null ||
                      selectedItem.unitPrice === 0
                        ? ''
                        : selectedItem.unitPrice
                    }
                    className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
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
                );
              }
              if (field.key === 'gstPerUnit') {
                if (!isGstApplicable(isGstApplicableForSelectedVendor))
                  return null;
                return (
                  <Input
                    disabled
                    value={selectedItem.gstPerUnit || '0'}
                    className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                  />
                );
              }
              if (field.key === 'totalAmount') {
                return (
                  <Input
                    disabled
                    value={selectedItem.totalAmount || '0.00'}
                    className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                  />
                );
              }
              if (field.key === 'totalGstAmount') {
                return (
                  <div className="flex flex-col">
                    <div className="flex h-10 items-center rounded-lg border border-blue-100 bg-blue-50/30 px-3 text-sm font-bold text-blue-700 shadow-sm">
                      ₹
                      {(
                        (Number(selectedItem.totalAmount) || 0) +
                        (Number(selectedItem.totalGstAmount) || 0)
                      ).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                );
              }
              if (field.key === 'expiryDate') {
                if (selectedItem.productType !== 'GOODS') return null;
                return (
                  <Input
                    disabled
                    value={
                      selectedItem.expiryDate
                        ? moment(selectedItem.expiryDate).format('DD/MM/YYYY')
                        : '-'
                    }
                    className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                  />
                );
              }
              return null;
            }}
          />

          {/* Action CTA Buttons */}
          <div className="mt-2 flex h-10 items-center justify-end gap-3 md:col-span-4">
            <Button
              type="button"
              disabled={
                !selectedItem.productId &&
                !selectedItem.quantity &&
                !selectedItem.unitPrice
              }
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
                  batch: null,
                  batches: [],
                  expiryDate: '',
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
              variant="outline"
              size="sm"
              className="w-24"
            >
              Clear
            </Button>
            <Button
              type="button"
              disabled={
                !selectedItem.productId ||
                !selectedItem.quantity ||
                selectedItem.quantity <= 0 ||
                !selectedItem.unitPrice ||
                selectedItem.unitPrice <= 0
              }
              onClick={() => {
                const isDuplicate = isItemAlreadyAdded(
                  selectedItem.productId,
                  selectedItem.batch?.id,
                );

                if (isDuplicate) {
                  toast.error(
                    selectedItem.batch
                      ? 'This batch is already added.'
                      : 'This item is already added.',
                  );
                  return;
                }

                const updatedOrderItems = [
                  ...(order?.orderItems || []),
                  {
                    ...selectedItem,
                    unitPrice: Number(selectedItem.unitPrice),
                    totalAmount: Number(selectedItem.totalAmount),
                    totalGstAmount: Number(selectedItem.totalGstAmount),
                    gstPercentage: Number(selectedItem.gstPerUnit ?? 0),
                  },
                ];

                const updatedOrder = {
                  ...order,
                  orderItems: updatedOrderItems,
                };

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
                  batch: null,
                  batches: [],
                  expiryDate: '',
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
              size="sm"
              className="w-32"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Item
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
