import React, { useMemo, useState } from 'react';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { formattedAmount, getEnterpriseId } from '@/appUtils/helperFunctions';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import InputWithSelect from '@/components/ui/InputWithSelect';
import { Label } from '@/components/ui/label';
import { getProductCatalogue } from '@/services/Catalogue_Services/CatalogueServices';
import { useQuery } from '@tanstack/react-query';
import Select from 'react-select';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';

export const stockItemColumns = [
  {
    accessorKey: 'productName',
    header: 'Item',
    cell: ({ row }) => {
      return row?.original?.productName || '-';
    },
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => {
      return row?.original?.quantity ?? '-';
    },
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => {
      return row?.original?.unitPrice ?? '-';
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Amount',
    cell: ({ row }) => {
      return formattedAmount(row?.original?.totalAmount) ?? '-';
    },
  },
];

const getEmptyItem = () => ({
  productName: '',
  productType: '',
  productId: null,

  quantity: null,
  unitId: null,
  unitPrice: 0,

  totalAmount: 0,
});

const StockItemLayout = ({
  formData,
  onChangeItems = () => {},
  errors = {},
}) => {
  const enterpriseId = getEnterpriseId();

  const [selectedItem, setSelectedItem] = useState(getEmptyItem());
  const [errorMsg, setErrorMsg] = useState({});

  const isItemAlreadyAdded = (itemId) =>
    formData?.items?.some((item) => item.productId === itemId);

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // ✅ Fetch goods list
  const { data: goodsData, isLoading } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res?.data?.data || [],
    enabled: !!enterpriseId,
  });

  // ✅ Goods options (react-select format)
  const itemClientListingOptions = useMemo(() => {
    return (goodsData || []).map((good) => {
      return {
        label: good?.name,
        value: {
          ...good,
          id: good?.id,
          productType: 'GOODS',
          productName: good?.name,
          salesPrice: good?.salesPrice ?? 0,
        },
      };
    });
  }, [goodsData]);

  // ✅ Disable already added items in dropdown
  const updatedOptions = useMemo(() => {
    return (itemClientListingOptions || []).map((opt) => {
      const productId = opt?.value?.id;
      const alreadyAdded = isItemAlreadyAdded(productId);

      return {
        ...opt,
        isDisabled: alreadyAdded, // ✅ used by react-select
      };
    });
  }, [itemClientListingOptions, formData?.items]);

  const validateBeforeAdd = () => {
    const localErrors = {};

    if (!selectedItem.productId)
      localErrors.orderItem = 'Please select an item';
    if (!selectedItem.quantity || selectedItem.quantity <= 0)
      localErrors.quantity = 'Please enter quantity';

    setErrorMsg(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  const handleSelectProduct = (selectedOption) => {
    const selectedItemData = selectedOption?.value;
    if (!selectedItemData) return;

    const unitPrice = Number(selectedItemData.salesPrice || 0);

    // ✅ When item changes reset quantity + amount (better UX)
    setSelectedItem((prev) => ({
      ...prev,
      productId: selectedItemData.id,
      productType: selectedItemData.productType,
      productName: selectedItemData.productName || '',
      unitPrice,
      quantity: null,
      totalAmount: 0,
    }));

    setErrorMsg((prev) => ({ ...prev, orderItem: '' }));
  };

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setSelectedItem((prev) => ({
        ...prev,
        quantity: 0,
        totalAmount: 0,
      }));
      return;
    }

    if (!/^\d+$/.test(inputValue)) return;

    const qty = Number(inputValue);
    if (qty < 1) return;

    const totalAmount = parseFloat(
      (qty * (Number(selectedItem.unitPrice) || 0)).toFixed(2),
    );

    setSelectedItem((prev) => ({
      ...prev,
      quantity: qty,
      totalAmount,
    }));

    setErrorMsg((prev) => ({ ...prev, quantity: '' }));
  };

  const handleAddItem = () => {
    if (!validateBeforeAdd()) return;

    const alreadyExists = formData?.items?.some(
      (it) => it.productId === selectedItem.productId,
    );

    if (alreadyExists) {
      setErrorMsg({ orderItem: 'Item already added' });
      return;
    }

    const updatedItems = [...(formData?.items || []), { ...selectedItem }];

    onChangeItems(updatedItems);

    // ✅ clear after add
    setSelectedItem(getEmptyItem());
    setErrorMsg({});
  };

  const handleCancel = () => {
    setSelectedItem(getEmptyItem());
    setErrorMsg({});
  };

  const tableData = useMemo(() => formData?.items || [], [formData?.items]);

  return (
    <div className="flex flex-col gap-4">
      {/* ✅ Item Add Form */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          {/* ✅ Item Select */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              Item <span className="text-red-600">*</span>
            </Label>

            <div className="flex flex-col gap-1 text-sm">
              <Select
                name="items"
                value={
                  updatedOptions?.find(
                    (item) => item.value.id === selectedItem.productId,
                  ) ?? null
                }
                placeholder={isLoading ? 'Loading items...' : 'Select Item'}
                options={updatedOptions}
                isOptionDisabled={(option) => option.isDisabled}
                isDisabled={isLoading}
                onChange={handleSelectProduct}
              />

              {(errorMsg.orderItem || errors.stockItems) && (
                <ErrorBox msg={errorMsg.orderItem || errors.stockItems} />
              )}
            </div>
          </div>

          {/* ✅ Quantity */}
          <div className="flex flex-col gap-2">
            <InputWithSelect
              id="quantity"
              name="Quantity"
              required={true}
              disabled={!selectedItem.productId}
              value={
                selectedItem.quantity == null || selectedItem.quantity === 0
                  ? ''
                  : selectedItem.quantity
              }
              onValueChange={handleQuantityChange}
              unit={selectedItem.unitId}
              onUnitChange={(val) => {
                setSelectedItem((prev) => ({
                  ...prev,
                  unitId: Number(val),
                }));
              }}
              units={units?.quantity}
              unitPlaceholder="Select unit"
            />

            {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
          </div>

          {/* Unit Price (disabled + auto-filled) */}
          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              Price <span className="text-red-600">*</span>
            </Label>

            <Input disabled value={selectedItem.unitPrice || ''} />
          </div>

          {/* Amount (disabled + auto-calculated) */}
          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              Amount <span className="text-red-600">*</span>
            </Label>

            <Input disabled value={selectedItem.totalAmount || ''} />
          </div>
        </div>

        {/* ✅ Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            size="sm"
            variant="blue_outline"
            disabled={
              !selectedItem.productId ||
              !selectedItem.quantity ||
              selectedItem.quantity <= 0
            }
            onClick={handleAddItem}
          >
            Add
          </Button>
        </div>
      </div>

      {/* ✅ Selected Items Table */}
      <DataTable data={tableData} columns={stockItemColumns} />
    </div>
  );
};

export default StockItemLayout;
