'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { qcApis } from '@/api/inventories/qc/qc';
import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GetAllProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { GetProductBatchList } from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { getBuckets } from '@/services/Inventories_Services/QC_Services/QC_Services';
import { adHocStockIn } from '@/services/Inventories_Services/Stocks_Services/Stocks_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import ErrorBox from '../ui/ErrorBox';
import AddBatch from './batch/AddBatch';

const QuickStockInModal = ({ isOpen, onClose, product }) => {
  const enterpriseId = getEnterpriseId();
  const queryClient = useQueryClient();

  const [adjustmentReason, setAdjustmentReason] = useState('MANUAL_CORRECTION');
  const [items, setItems] = useState([]);
  const [isAddingBatchFor, setIsAddingBatchFor] = useState(null);

  const [errors, setErrors] = useState({});

  const reasonOptions = [
    { label: 'Manual Correction', value: 'MANUAL_CORRECTION' },
    { label: 'Initial Setup', value: 'INITIAL_SETUP' },
  ];

  // Fetch buckets
  const { data: buckets = [] } = useQuery({
    queryKey: [qcApis.bucketOptions.endpointKey, enterpriseId],
    queryFn: () => getBuckets({ enterpriseId }),
    select: (res) => res?.data?.data || [],
    enabled: !!enterpriseId,
  });

  // Fetch all goods for addition
  const { data: allGoods = [] } = useQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey, enterpriseId],
    queryFn: () => GetAllProductGoods({ id: enterpriseId }),
    select: (res) => res?.data?.data?.data || [],
    enabled: !!enterpriseId,
  });

  // Initialize with current product
  useEffect(() => {
    if (product && items.length === 0 && isOpen) {
      const initialItem = {
        productId: product.id,
        productName: product.productName,
        skuId: product.skuId,
        gstPercentage: product.gstPercentage || 0,
        unitPrice: product.salesPrice || product.costPrice || 0,
        quantity: '',
        targetBucketId: '',
        batchNo: '',
        expiryDate: '',
        isQcOkay: true,
        batches: [],
      };

      setItems([initialItem]);

      // Fetch batches for initial product
      if (product.skuId) {
        GetProductBatchList({ searchString: product.skuId }).then((res) => {
          const batchList = res?.data?.data?.data || [];
          setItems((prev) =>
            prev.map((it) =>
              it.productId === product.id ? { ...it, batches: batchList } : it,
            ),
          );
        });
      }
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (!isAddingBatchFor && isOpen && items.length > 0) {
      items.forEach((item) => {
        if (item.skuId) {
          GetProductBatchList({ searchString: item.skuId }).then((res) => {
            const batchList = res?.data?.data?.data || [];
            setItems((prev) =>
              prev.map((it) =>
                it.productId === item.productId
                  ? { ...it, batches: batchList }
                  : it,
              ),
            );
          });
        }
      });
    }
  }, [isAddingBatchFor]);

  const calculateAmounts = (item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const gstPer = Number(item.gstPercentage) || 0;

    const amount = Number((qty * price).toFixed(2));
    const gstAmountPerUnit = Number(((price * gstPer) / 100).toFixed(2));
    const totalGstAmount = Number((qty * gstAmountPerUnit).toFixed(2));
    const totalAmount = Number((amount + totalGstAmount).toFixed(2));

    return {
      amount,
      totalGstAmount,
      totalAmount,
    };
  };

  const handleReasonChange = (val) => {
    setAdjustmentReason(val);
    if (errors.adjustmentReason) {
      setErrors((prev) => {
        const { adjustmentReason, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleItemChange = (productId, field, value) => {
    // Clear error if it exists
    if (errors.items) {
      const itemIndex = items.findIndex((it) => it.productId === productId);
      if (itemIndex !== -1 && errors.items[itemIndex]?.[field]) {
        setErrors((prev) => {
          const newItems = [...(prev.items || [])];
          if (newItems[itemIndex]) {
            const updatedItemError = { ...newItems[itemIndex] };
            delete updatedItemError[field];
            newItems[itemIndex] =
              Object.keys(updatedItemError).length > 0
                ? updatedItemError
                : null;
          }
          return { ...prev, items: newItems };
        });
      }
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.productId !== productId) return it;
        let newItem = { ...it, [field]: value };

        if (field === 'quantity' || field === 'unitPrice') {
          const amounts = calculateAmounts(newItem);
          newItem = { ...newItem, ...amounts };
        }

        if (field === 'productId') {
          const selectedGood = allGoods.find((g) => g.id === value);
          if (selectedGood) {
            newItem = {
              ...newItem,
              productName: selectedGood.productName,
              skuId: selectedGood.skuId,
              gstPercentage: selectedGood.gstPercentage || 0,
              unitPrice: selectedGood.salesPrice || selectedGood.costPrice || 0,
            };
            const amounts = calculateAmounts(newItem);
            newItem = { ...newItem, ...amounts };

            // Fetch batches
            if (selectedGood.skuId) {
              GetProductBatchList({ searchString: selectedGood.skuId }).then(
                (res) => {
                  const batchList = res?.data?.data?.data || [];
                  setItems((p) =>
                    p.map((item) =>
                      item.productId === productId
                        ? { ...item, batches: batchList }
                        : item,
                    ),
                  );
                },
              );
            }
          }
        }
        return newItem;
      }),
    );
  };

  const stockInMutation = useMutation({
    mutationFn: adHocStockIn,
    onSuccess: () => {
      toast.success('Stock In completed successfully');
      queryClient.invalidateQueries([stockApis.getStocksItems.endpointKey]);
      onClose();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to complete stock in',
      );
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!adjustmentReason) newErrors.adjustmentReason = 'Required';

    const itemErrors = items.map((item) => {
      const err = {};
      if (!item.productId) err.productId = 'Required';
      if (!item.targetBucketId) err.targetBucketId = 'Required';
      if (!item.quantity || item.quantity <= 0) err.quantity = 'Invalid';
      if (!item.unitPrice || item.unitPrice < 0) err.unitPrice = 'Invalid';
      return Object.keys(err).length > 0 ? err : null;
    });

    if (itemErrors.some((e) => e !== null)) newErrors.items = itemErrors;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      adjustmentReason,
      items: items.map((item) => ({
        itemId: item.productId,
        targetBucketId: Number(item.targetBucketId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        gstAmountPerUnit: Number(item.gstPercentage),
        totalGstAmount: Number(item.totalGstAmount),
        totalAmount: Number(item.totalAmount),
        isQcOkay: item.isQcOkay,
        batchNo: item.batchNo || null,
        expiryDate: item.expiryDate || null,
      })),
    };

    stockInMutation.mutate({ enterpriseId, data: payload });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[65vw] overflow-y-auto lg:max-w-[65vw]">
        {isAddingBatchFor ? (
          <div className="h-full w-full">
            <AddBatch
              setIsAdding={(val) => {
                if (!val) {
                  if (isAddingBatchFor?.skuId) {
                    GetProductBatchList({
                      searchString: isAddingBatchFor.skuId,
                    }).then((res) => {
                      const batchList = res?.data?.data?.data || [];
                      setItems((p) =>
                        p.map((item) =>
                          item.productId === isAddingBatchFor.productId
                            ? { ...item, batches: batchList }
                            : item,
                        ),
                      );
                    });
                  }
                  setIsAddingBatchFor(null);
                }
              }}
              setIsEditing={() => {}}
              initialSku={isAddingBatchFor}
            />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Quick Stock In</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-6 py-4">
              {/* Reason Section */}
              <div className="flex items-center gap-4 border-b pb-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Adjustment Reason <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={adjustmentReason}
                    onValueChange={handleReasonChange}
                  >
                    <SelectTrigger
                      className={`w-[240px] ${errors.adjustmentReason ? 'border-red-500' : ''}`}
                    >
                      <SelectValue placeholder="Select Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasonOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.adjustmentReason && (
                    <ErrorBox msg={errors.adjustmentReason} />
                  )}
                </div>
              </div>

              {/* Table Section */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">
                        Item Details
                      </TableHead>
                      <TableHead className="min-w-[150px]">Bucket</TableHead>
                      <TableHead className="min-w-[180px]">
                        Batch / Expiry
                      </TableHead>
                      <TableHead className="w-24">Qty</TableHead>
                      <TableHead className="w-28">Unit Price</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">QC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => {
                      const itemError = errors.items?.[index];
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-primary">
                                {item.productName}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                SKU: {item.skuId}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={String(item.targetBucketId)}
                              onValueChange={(val) =>
                                handleItemChange(
                                  item.productId,
                                  'targetBucketId',
                                  val,
                                )
                              }
                            >
                              <SelectTrigger
                                className={`h-9 ${
                                  itemError?.targetBucketId
                                    ? 'border-red-500 text-red-500'
                                    : ''
                                }`}
                              >
                                <SelectValue placeholder="Bucket" />
                              </SelectTrigger>
                              <SelectContent>
                                {buckets.map((b) => (
                                  <SelectItem key={b.id} value={String(b.id)}>
                                    {b.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {itemError?.targetBucketId && (
                              <ErrorBox msg={itemError.targetBucketId} />
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Select
                                value={item.batchNo || undefined}
                                onValueChange={(val) => {
                                  if (val === 'ADD_NEW_BATCH') {
                                    setIsAddingBatchFor({
                                      skuId: item.skuId,
                                      productName: item.productName,
                                      productId: item.productId,
                                    });
                                    return;
                                  }
                                  const selectedBatch = item.batches?.find(
                                    (b) => b.batchNo === val,
                                  );
                                  handleItemChange(
                                    item.productId,
                                    'batchNo',
                                    val,
                                  );
                                  handleItemChange(
                                    item.productId,
                                    'expiryDate',
                                    selectedBatch?.expiryDate || '',
                                  );
                                }}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Select Batch">
                                    {item.batchNo || undefined}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {item.batches?.map((b) => (
                                    <SelectItem
                                      key={b.batchNo}
                                      value={b.batchNo}
                                    >
                                      <div className="flex flex-col gap-0.5">
                                        <span className="text-xs font-semibold">
                                          Batch: {b.batchNo}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          Exp:{' '}
                                          {moment(b.expiryDate).format(
                                            'DD/MM/YYYY',
                                          )}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                  <SelectItem
                                    value="ADD_NEW_BATCH"
                                    className="font-semibold text-primary"
                                  >
                                    + Add a New Batch
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className={`h-9 px-2 ${
                                itemError?.quantity
                                  ? 'border-red-500 text-red-500 placeholder:text-red-300'
                                  : ''
                              }`}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  item.productId,
                                  'quantity',
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                            />
                            {itemError?.quantity && (
                              <ErrorBox msg={itemError.quantity} />
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className={`h-9 px-2 ${
                                itemError?.unitPrice
                                  ? 'border-red-500 text-red-500 placeholder:text-red-300'
                                  : ''
                              }`}
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  item.productId,
                                  'unitPrice',
                                  e.target.value,
                                )
                              }
                              placeholder="0.00"
                            />
                            {itemError?.unitPrice && (
                              <ErrorBox msg={itemError.unitPrice} />
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{item.totalGstAmount || '0'}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            ₹{item.totalAmount || '0'}
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={item.isQcOkay}
                              onChange={(e) =>
                                handleItemChange(
                                  item.productId,
                                  'isQcOkay',
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Total Stock In Value
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ₹{' '}
                    {items
                      .reduce((sum, it) => sum + (it.totalAmount || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={stockInMutation.isPending}
                    size="sm"
                  >
                    {stockInMutation.isPending
                      ? 'Processing...'
                      : 'Complete Stock In'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickStockInModal;
