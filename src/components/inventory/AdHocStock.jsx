'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
import { GetAllProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import ReactSelect from 'react-select';
import {
  adHocStockIn,
  adHocStockOut,
} from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { toast } from 'sonner';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import InputWithSelect from '../ui/InputWithSelect';
import { Label } from '../ui/label';
import SubHeader from '../ui/Sub-header';
import Wrapper from '../wrappers/Wrapper';
import AddGoods from './AddGoods';
import { AddHocItemsColumns } from './AdHocItemsColumns';

const AdHocStock = ({ isStockIn, name, onClose }) => {
  const enterpriseId = getEnterpriseId();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItem, setSelectedItem] = useState({
    productId: null,
    quantity: '',
    unitPrice: '',
    gstPerUnit: '',
    gstPerUnitAmount: 0,
    amount: 0, // qty * unitPrice
    totalGstAmount: 0, // qty * gstAmountPerUnit
    totalAmount: 0, // amount + totalGstAmount
  });
  const [formData, setFormData] = useState({
    adjustmentReason: '',
    items: [],
  });
  const [errors, setErrors] = useState({});

  const reasonOptions = isStockIn
    ? [{ label: 'Manual Correction', value: 'MANUAL_CORRECTION' }]
    : [
        { label: 'Damage', value: 'DAMAGE' },
        { label: 'Count Difference', value: 'COUNT_DIFFERENCE' },
        { label: 'Expiry', value: 'EXPIRY' },
      ];

  const selectedReasonOption = useMemo(() => {
    return (
      reasonOptions.find((opt) => opt.value === formData.adjustmentReason) ||
      null
    );
  }, [formData.adjustmentReason]);

  const isItemAlreadyAdded = (itemId) =>
    formData.items?.some((item) => item.itemId === itemId);

  const { data: goods } = useQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey],
    queryFn: () =>
      GetAllProductGoods({
        id: enterpriseId,
      }),
    select: (res) => res?.data?.data?.data || [],
  });

  const GoodsOptions = useMemo(() => {
    return [
      ...(goods || []).map((good) => ({
        value: good.id,
        label: `${good.productName} (SKU: ${good.skuId})`,
        disabled: isItemAlreadyAdded(good.id),
        meta: {
          productName: good.productName,
          skuId: good.skuId,
          hsnCode: good.hsnCode,
          unitPrice: good.salesPrice ?? good.costPrice ?? 0,
          gstPercentage: good.gstPercentage,
        },
      })),
      ...(isStockIn
        ? [
            {
              value: 'ADD_NEW_GOODS',
              label: (
                <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
                  <Plus size={14} /> Add a new Goods
                </span>
              ),
            },
          ]
        : []),
    ];
  }, [goods, formData.items, isStockIn]);

  const selectedOption = useMemo(() => {
    if (!selectedItem.productId) return null;

    return GoodsOptions.find(
      (opt) => String(opt.value) === String(selectedItem.productId),
    );
  }, [selectedItem.productId, GoodsOptions]);

  // fetch units - GOODS
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  const round2 = (num) => Number(num.toFixed(2));

  const calculateAmounts = (item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const gstPerUnit = Number(item.gstPerUnit) || 0;

    const amount = round2(qty * price);

    // GST per unit calculated from percentage
    const gstAmountPerUnit = round2((price * gstPerUnit) / 100);

    const totalGstAmount = round2(qty * gstAmountPerUnit);
    const totalAmount = round2(amount + totalGstAmount);

    return {
      amount,
      gstPerUnit, // percentage (no rounding needed)
      gstAmountPerUnit, // ₹ per unit
      totalGstAmount,
      totalAmount,
    };
  };

  const handleQuantityChange = (e) => {
    const { value } = e.target;
    if (!/^\d*\.?\d*$/.test(value)) return;

    setSelectedItem((prev) => {
      const updated = { ...prev, quantity: value === '' ? '' : Number(value) };
      return { ...updated, ...calculateAmounts(updated) };
    });
  };

  const handlePriceChange = (e) => {
    const { value } = e.target;
    if (!/^\d*\.?\d*$/.test(value)) return;

    setSelectedItem((prev) => {
      const updated = { ...prev, unitPrice: value === '' ? '' : Number(value) };
      return { ...updated, ...calculateAmounts(updated) };
    });
  };

  const validateItem = () => {
    const errs = {};

    if (!selectedItem.productId) errs.item = 'Item is required';
    if (!selectedItem.quantity || selectedItem.quantity <= 0)
      errs.quantity = 'Quantity must be greater than 0';
    if (!selectedItem.unitPrice || selectedItem.unitPrice <= 0)
      errs.unitPrice = 'Price must be greater than 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddItem = () => {
    if (!validateItem()) return;

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          // identifiers
          itemId: selectedItem.productId,
          productName: selectedItem.productName,
          skuId: selectedItem.skuId,

          // pricing
          quantity: selectedItem.quantity,
          unitPrice: selectedItem.unitPrice,
          gstPerUnit: selectedItem.gstPerUnit, // GST %

          // calculated values
          amount: selectedItem.amount,
          totalGstAmount: selectedItem.totalGstAmount,
          totalAmount: selectedItem.totalAmount,
        },
      ],
    }));

    // reset form
    setSelectedItem({
      productId: null,
      productName: '',
      skuId: '',
      quantity: '',
      unitPrice: '',
      gstPerUnit: '',
      amount: 0,
      totalGstAmount: 0,
      totalAmount: 0,
    });

    setErrors({});
  };

  const handleEditItem = (index) => {
    const itemToEdit = formData.items[index];

    if (!itemToEdit) return;

    // 1️⃣ Load item into form
    setSelectedItem({
      productId: itemToEdit.itemId,
      productName: itemToEdit.productName,
      skuId: itemToEdit.skuId,
      quantity: itemToEdit.quantity,
      unitPrice: itemToEdit.unitPrice,
      gstPerUnit: itemToEdit.gstPerUnit,
      amount: itemToEdit.amount,
      totalGstAmount: itemToEdit.totalGstAmount,
      totalAmount: itemToEdit.totalAmount,
      ...calculateAmounts(itemToEdit),
    });

    // 2️⃣ Remove it from table
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const adHocStockInMutation = useMutation({
    mutationFn: adHocStockIn,
    onSuccess: () => {
      toast.success('Ad Hoc Stock in Successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const adHocStockOutMutation = useMutation({
    mutationFn: adHocStockOut,
    onSuccess: () => {
      toast.success('Ad Hoc Stock out Successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    // reset previous errors
    setErrors({});

    if (!formData.adjustmentReason) {
      setErrors({ adjustmentReason: 'Adjustment reason is required' });
      return;
    }

    if (!formData?.items || formData.items.length === 0) {
      setErrors({ items: 'Add at least 1 item to proceed' });
      return;
    }

    const payload = {
      adjustmentReason: formData.adjustmentReason,
      items: formData.items.map((item) => ({
        itemId: item.itemId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        gstAmountPerUnit: Number(item.gstPerUnit),
        totalGstAmount: Number(item.totalGstAmount),
        totalAmount: Number(item.totalAmount),
      })),
    };

    if (isStockIn) {
      adHocStockInMutation.mutate({ enterpriseId, data: payload });
    } else {
      adHocStockOutMutation.mutate({ enterpriseId, data: payload });
    }
  };

  const adHocItemsColumns = AddHocItemsColumns({
    onEdit: handleEditItem,
    onDelete: handleDeleteItem,
  });

  return (
    <Wrapper className="flex flex-col gap-4">
      {!isAdding && (
        <>
          <SubHeader name={name} />
          {/* Adjustment reason */}
          <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
            <div className="grid grid-cols-4 gap-2">
              {/* Adjustment reason */}
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Label className="flex gap-1">
                  Adjustment Reason
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1 text-sm">
                  <ReactSelect
                    value={selectedReasonOption}
                    options={reasonOptions}
                    isOptionDisabled={(opt) => opt.disabled}
                    styles={getStylesForSelectComponent()}
                    placeholder="Select adjustment Reason"
                    onChange={(opt) => {
                      if (!opt) return;

                      const { value } = opt;

                      setFormData((prev) => ({
                        ...prev,
                        adjustmentReason: value,
                      }));
                    }}
                  />

                  {errors.adjustmentReason && (
                    <ErrorBox msg={errors.adjustmentReason} />
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Items */}
          <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
            <div className="grid grid-cols-4 gap-2">
              {/* Items/Service */}
              <div className="flex w-full max-w-xs flex-col gap-2">
                <Label className="flex gap-1">
                  Item
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1 text-sm">
                  <ReactSelect
                    value={selectedOption}
                    options={GoodsOptions}
                    isOptionDisabled={(opt) => opt.disabled}
                    styles={getStylesForSelectComponent()}
                    placeholder="Select item"
                    onChange={(opt) => {
                      if (!opt) return;

                      if (opt.value === 'ADD_NEW_GOODS') {
                        setIsAdding(true);
                        return;
                      }

                      const { meta, value } = opt;

                      setSelectedItem({
                        productId: value,
                        productType: 'GOODS',
                        productName: meta.productName,
                        skuId: meta.skuId,
                        hsnCode: meta.hsnCode,
                        quantity: '',
                        unitId: null,
                        unitPrice: meta.unitPrice,
                        gstPerUnit: meta.gstPercentage,
                        amount: 0,
                        totalAmount: 0,
                        totalGstAmount: 0,
                      });
                    }}
                  />

                  {errors.items && <ErrorBox msg={errors.items} />}
                </div>
              </div>

              {/* Items/Service Quantity */}
              <div className="flex flex-col gap-1">
                <InputWithSelect
                  id="quantity"
                  name={'Quantity'}
                  required={true}
                  value={
                    selectedItem.quantity == null || selectedItem.quantity === 0
                      ? ''
                      : selectedItem.quantity
                  }
                  onValueChange={handleQuantityChange}
                  unit={selectedItem.unitId}
                  onUnitChange={(val) => {
                    setSelectedItem((prev) => {
                      const updated = { ...prev, unitId: Number(val) };
                      return updated;
                    });
                  }}
                  units={units?.quantity} // todo : units for services...
                  unitPlaceholder="Select unit"
                  min={0}
                  step="any" // <-- allows decimals
                />

                {errors.quantity && <ErrorBox msg={errors.quantity} />}
              </div>

              {/* Items/Service Price */}
              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  Price
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    type="number"
                    placeholder="0.00"
                    min={1}
                    value={
                      selectedItem.unitPrice == null ||
                      selectedItem.unitPrice === 0
                        ? ''
                        : selectedItem.unitPrice
                    }
                    className="max-w-30"
                    onChange={handlePriceChange}
                  />

                  {errors.unitPrice && <ErrorBox msg={errors.unitPrice} />}
                </div>
              </div>

              {/* Items Amount */}
              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  Amount
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    value={selectedItem.amount || ''}
                    className="max-w-30"
                  />
                  {errors.totalAmount && <ErrorBox msg={errors.amount} />}
                </div>
              </div>

              {/* Items Gst per unit */}
              <div className="flex flex-col gap-2">
                <Label className="flex">
                  GST
                  <span className="text-xs"> (%)</span>
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    type="number"
                    placeholder="GST per unit"
                    disabled
                    value={selectedItem.gstPerUnit || ''}
                  />

                  {errors.gstPerUnit && <ErrorBox msg={errors.gstPerUnit} />}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  Tax Amount
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    value={selectedItem.totalGstAmount || ''}
                    className="max-w-30"
                  />
                  {errors.totalGstAmount && (
                    <ErrorBox msg={errors.totalGstAmount} />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  Total Amount
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    value={selectedItem?.totalAmount}
                    className="max-w-30"
                  />
                  {errors.totalAmount && <ErrorBox msg={errors.totalAmount} />}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Reset selected item
                  setSelectedItem({
                    productId: null,
                    productName: '',
                    skuId: '',
                    quantity: '',
                    unitPrice: '',
                    gstPerUnit: '',
                    gstPerUnitAmount: 0,
                    amount: 0,
                    totalGstAmount: 0,
                    totalAmount: 0,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={
                  !selectedItem.productId ||
                  !selectedItem.quantity ||
                  selectedItem.quantity <= 0 ||
                  !selectedItem.unitPrice ||
                  selectedItem.unitPrice <= 0
                }
                onClick={handleAddItem}
                variant="blue_outline"
              >
                Add
              </Button>
            </div>
          </div>

          {/* selected item table */}
          <DataTable data={formData?.items} columns={adHocItemsColumns} />

          {/* add / cancel cta */}
          <div className="sticky bottom-0 flex justify-end gap-2">
            <Button size="sm" onClick={onClose} variant={'outline'}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                adHocStockInMutation?.isPending ||
                adHocStockOutMutation?.isPending
              }
            >
              {isStockIn ? 'Complete Stock-in' : 'Complete Stock-out'}
            </Button>
          </div>
        </>
      )}

      {isAdding && <AddGoods setIsCreatingGoods={setIsAdding} />}
    </Wrapper>
  );
};

export default AdHocStock;
