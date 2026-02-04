import React, { useMemo, useState } from 'react';

import { qcApis } from '@/api/inventories/qc/qc';
import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { formattedAmount, getEnterpriseId } from '@/appUtils/helperFunctions';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import InputWithSelect from '@/components/ui/InputWithSelect';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getBuckets } from '@/services/Inventories_Services/QC_Services/QC_Services';
import { getStocksItems } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useQuery } from '@tanstack/react-query';
import ReactSelect from 'react-select';
import { Trash } from 'lucide-react';

export const stockItemColumns = ({ onDelete }) => [
  {
    accessorKey: 'bucketName',
    header: 'Bucket',
    cell: ({ row }) => row?.original?.bucketName || '-',
  },
  {
    accessorKey: 'productName',
    header: 'Item',
    cell: ({ row }) => row?.original?.productName || '-',
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity',
    cell: ({ row }) => row?.original?.quantity ?? '-',
  },
  {
    accessorKey: 'unitPrice',
    header: 'Unit Price',
    cell: ({ row }) => row?.original?.unitPrice ?? '-',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => formattedAmount(row?.original?.amount) ?? '-',
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => {
      const inventoryId = row?.original?.inventoryId;

      return (
        <Trash
          className="cursor-pointer text-red-500 hover:bg-red-100"
          size={14}
          onClick={() => onDelete(inventoryId)}
        />
      );
    },
  },
];

const getEmptyItem = () => ({
  inventoryId: null,
  quantity: null,
  unitId: null,
  unitPrice: 0,
  amount: 0,
});

const StockItemLayout = ({
  formData,
  onChangeItems = () => {},
  onChange = () => {},
  errors = {},
}) => {
  const enterpriseId = getEnterpriseId();

  const [selectedItem, setSelectedItem] = useState(getEmptyItem());
  const [errorMsg, setErrorMsg] = useState({});

  const isItemAlreadyAdded = (inventoryId) =>
    (formData?.items || []).some(
      (item) => Number(item.inventoryId) === Number(inventoryId),
    );

  // Buckets
  const { data: bucketOptions = [], isLoading: isBucketLoading } = useQuery({
    queryKey: [qcApis.bucketOptions.endpointKey, enterpriseId],
    queryFn: () => getBuckets({ enterpriseId }),
    select: (res) => res?.data?.data || [],
    enabled: !!enterpriseId,
  });

  const selectedBucketType = useMemo(() => {
    if (!formData?.bucketId) return null;

    const bucketObj = bucketOptions?.find(
      (b) => Number(b.id) === Number(formData.bucketId),
    );

    return bucketObj?.bucketType || null;
  }, [formData?.bucketId, bucketOptions]);

  // Stocks Query (only when bucket selected + filter exists)
  const { data: stocksQuery = [], isLoading: isStockLoading } = useQuery({
    queryKey: [
      stockApis.getStocksItems.endpointKey,
      enterpriseId,
      selectedBucketType,
    ],
    queryFn: () =>
      getStocksItems({
        enterpriseId,
        filter: selectedBucketType,
      }),
    select: (res) => {
      const raw = res?.data?.data;

      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.items)) return raw.items;
      if (Array.isArray(raw?.data)) return raw.data;

      return [];
    },
    enabled: !!enterpriseId && !!selectedBucketType,
    staleTime: 5 * 60 * 1000, // ✅ optional caching
  });

  // item options from STOCKS
  const stockItemOptions = useMemo(() => {
    return (stocksQuery || []).map((stock) => {
      return {
        label: stock?.productname || '-',
        value: {
          id: stock?.inventoryid, // ✅ depends on your API response
          productName: stock?.productname || '',
          unitPrice: stock?.unitprice || 0,
        },
      };
    });
  }, [stocksQuery]);

  // disable already added items
  const updatedOptions = useMemo(() => {
    return (stockItemOptions || []).map((opt) => ({
      ...opt,
      isDisabled: isItemAlreadyAdded(opt?.value?.id),
    }));
  }, [stockItemOptions, formData?.items]);

  const validateBeforeAdd = () => {
    const localErrors = {};

    if (!formData?.bucketId) localErrors.bucketId = 'Please select bucket';
    if (!selectedItem.inventoryId)
      localErrors.orderItem = 'Please select an item';
    if (!selectedItem.quantity || selectedItem.quantity <= 0)
      localErrors.quantity = 'Please enter quantity';

    setErrorMsg(localErrors);
    return Object.keys(localErrors).length === 0;
  };

  // Units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  const handleBucketChange = (value) => {
    const bucketId = Number(value);

    onChange('bucketId', bucketId);

    setSelectedItem(getEmptyItem());

    setErrorMsg((prev) => ({
      ...prev,
      bucketId: '',
      orderItem: '',
      quantity: '',
    }));
  };

  const handleSelectProduct = (selectedOption) => {
    const selectedItemData = selectedOption?.value;
    if (!selectedItemData) return;

    const unitPrice = Number(selectedItemData.unitPrice || 0);

    setSelectedItem((prev) => ({
      ...prev,
      inventoryId: selectedItemData.id,
      unitPrice,
      quantity: null,
      amount: 0,
    }));

    setErrorMsg((prev) => ({ ...prev, orderItem: '' }));
  };

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      setSelectedItem((prev) => ({
        ...prev,
        quantity: null,
        amount: 0,
      }));
      return;
    }

    if (!/^\d+$/.test(inputValue)) return;

    const qty = Number(inputValue);
    if (qty < 1) return;

    const amount = parseFloat(
      (qty * (Number(selectedItem.unitPrice) || 0)).toFixed(2),
    );

    setSelectedItem((prev) => ({
      ...prev,
      quantity: qty,
      amount,
    }));

    setErrorMsg((prev) => ({ ...prev, quantity: '' }));
  };

  const handleAddItem = () => {
    if (!validateBeforeAdd()) return;

    const inventoryId = Number(selectedItem.inventoryId);

    const alreadyExists = (formData?.items || []).some(
      (it) => Number(it.inventoryId) === inventoryId,
    );

    if (alreadyExists) {
      setErrorMsg((prev) => ({ ...prev, orderItem: 'Item already added' }));
      return;
    }

    const qty = Number(selectedItem.quantity || 0);
    const unitPrice = Number(selectedItem.unitPrice || 0);

    const amount = parseFloat((qty * unitPrice).toFixed(2));

    // ✅ store correct amount
    const newItem = {
      inventoryId,
      bucketId: Number(formData.bucketId),
      quantity: qty,
      amount, // ✅ qty * unitPrice
    };

    const updatedItems = [...(formData?.items || []), newItem];

    // ✅ update items in parent
    onChangeItems(updatedItems);

    // ✅ update totalAmount in parent
    const totalAmount = updatedItems.reduce(
      (sum, it) => sum + Number(it.amount || 0),
      0,
    );

    onChange('totalAmount', parseFloat(totalAmount.toFixed(2)));

    setSelectedItem(getEmptyItem());
    setErrorMsg({});
  };

  const handleDeleteItem = (inventoryId) => {
    const updatedItems = (formData?.items || []).filter(
      (it) => Number(it.inventoryId) !== Number(inventoryId),
    );

    onChangeItems(updatedItems);

    const totalAmount = updatedItems.reduce(
      (sum, it) => sum + Number(it.amount || 0),
      0,
    );

    onChange('totalAmount', parseFloat(totalAmount.toFixed(2)));
  };

  const handleCancel = () => {
    setSelectedItem(getEmptyItem());
    setErrorMsg({});
  };

  // table render using stocksQuery data (map by inventoryId)
  const tableData = useMemo(() => {
    const mapById = new Map(
      (stocksQuery || []).map((s) => [Number(s?.inventoryid), s]),
    );

    return (formData?.items || []).map((it) => {
      const stockItem = mapById.get(Number(it.inventoryId));

      const unitPrice = Number(stockItem?.unitprice || 0);
      const qty = Number(it.quantity || 0);

      return {
        inventoryId: it.inventoryId,
        bucketId: it.bucketId,
        bucketName: stockItem?.bucketname || '-', // for table
        quantity: qty,
        unitPrice,
        amount: qty * unitPrice,
        productName: stockItem?.productname || '-',
      };
    });
  }, [formData?.items, stocksQuery]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Bucket Select */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              Select Bucket <span className="text-red-600">*</span>
            </Label>

            <div className="flex flex-col gap-1 text-sm">
              <Select
                value={formData?.bucketId ? String(formData.bucketId) : ''}
                onValueChange={handleBucketChange}
                disabled={isBucketLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Bucket" />
                </SelectTrigger>

                <SelectContent>
                  {isBucketLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading buckets...
                    </SelectItem>
                  ) : !bucketOptions?.length ? (
                    <SelectItem value="no-data" disabled>
                      No buckets found
                    </SelectItem>
                  ) : (
                    bucketOptions.map((bucket) => (
                      <SelectItem key={bucket.id} value={String(bucket.id)}>
                        {bucket.displayName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {(errorMsg.bucketId || errors.bucketId) && (
                <ErrorBox msg={errorMsg.bucketId || errors.bucketId} />
              )}
            </div>
          </div>

          {/* Item Select */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              Item <span className="text-red-600">*</span>
            </Label>

            <div className="flex flex-col gap-1 text-sm">
              <ReactSelect
                name="items"
                value={
                  updatedOptions?.find(
                    (item) =>
                      Number(item.value.id) ===
                      Number(selectedItem.inventoryId),
                  ) ?? null
                }
                styles={{
                  menuList: (base) => ({
                    ...base,
                    maxHeight: '180px',
                    overflowY: 'auto',
                  }),
                }}
                placeholder={
                  !formData?.bucketId
                    ? 'Select bucket first'
                    : isStockLoading
                      ? 'Loading stock items...'
                      : 'Select Item'
                }
                options={updatedOptions}
                isOptionDisabled={(option) => option.isDisabled}
                isDisabled={!formData?.bucketId || isStockLoading}
                onChange={handleSelectProduct}
              />

              {(errorMsg.orderItem || errors.stockItems) && (
                <ErrorBox msg={errorMsg.orderItem || errors.stockItems} />
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-2">
            <InputWithSelect
              id="quantity"
              name="Quantity"
              required={true}
              disabled={!selectedItem.inventoryId}
              value={selectedItem.quantity == null ? '' : selectedItem.quantity}
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

          {/* Unit Price */}
          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              Price <span className="text-red-600">*</span>
            </Label>
            <Input disabled value={selectedItem.unitPrice || ''} />
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              Amount <span className="text-red-600">*</span>
            </Label>
            <Input disabled value={selectedItem.amount || ''} />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            size="sm"
            variant="blue_outline"
            disabled={
              !formData?.bucketId ||
              !selectedItem.inventoryId ||
              !selectedItem.quantity ||
              selectedItem.quantity <= 0
            }
            onClick={handleAddItem}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Selected Items Table */}
      <DataTable
        data={tableData}
        columns={stockItemColumns({ onDelete: handleDeleteItem })}
      />
    </div>
  );
};

export default StockItemLayout;
