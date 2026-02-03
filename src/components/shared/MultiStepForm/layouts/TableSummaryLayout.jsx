/* eslint-disable react/no-array-index-key */

import { invoiceApi } from '@/api/invoice/invoiceApi';
import InfoBanner from '@/components/auth/InfoBanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { useQuery } from '@tanstack/react-query';
import { Minus, Plus } from 'lucide-react';
import { useMemo } from 'react';

export default function TableSummaryLayout({
  selectedInvoice,
  selectedItems = [],
  onSelectedItemsChange,
  errors,
}) {
  const { isLoading, data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, selectedInvoice],
    queryFn: () => getInvoice(selectedInvoice),
    select: (data) => data?.data?.data,
    enabled: !!selectedInvoice,
  });

  // ✅ Normalize API invoice items (gstPerUnit is %)
  const tableItems = useMemo(() => {
    const rawItems = invoiceDetails?.invoiceItemDetails || [];

    return rawItems.map((it) => {
      const invoiceItemId = Number(it?.id);
      const id = String(it?.orderItemId?.id); // UI selection key

      const invoiceQty = Number(it?.quantity || it?.invoiceQty || 0);
      const unitPrice = Number(it?.unitPrice || it?.price || 0);

      // ✅ this is % in your old component (example: 18)
      const gstPerUnit = Number(it?.gstPerUnit || 0);

      return {
        id,
        invoiceItemId,
        productName:
          it?.orderItemId?.productDetails?.productName || it?.name || 'Item',
        skuId: it?.orderItemId?.productDetails?.skuId || it?.code || '-',
        quantity: invoiceQty,
        unitPrice,
        gstPerUnit, // ✅ percent

        // ✅ IMPORTANT: disabled if fully dispatched
        isFullyDispatched: Boolean(it?.isFullyDispatched),
      };
    });
  }, [invoiceDetails]);

  // ✅ helpers
  const isSelected = (id) => selectedItems.some((x) => x.id === id);
  const getSelectedItem = (id) => selectedItems.find((x) => x.id === id);

  const totalItemsCount = tableItems.length;
  const selectedCount = selectedItems.length;

  const dispatchValue = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );
  }, [selectedItems]);

  const summaryCards = [
    {
      label: 'Total Items',
      value: String(totalItemsCount),
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Selected',
      value: String(selectedCount),
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Dispatch Value',
      value: `₹${dispatchValue.toFixed(2)}`,
      bgColor: 'bg-gray-50',
    },
  ];

  const selectableItems = useMemo(() => {
    return tableItems.filter((x) => !x.isFullyDispatched);
  }, [tableItems]);

  const allSelected =
    selectableItems.length > 0 && selectedCount === selectableItems.length;

  const someSelected = selectedCount > 0 && !allSelected;

  // ✅ Select all items (ONLY selectable ones)
  const handleSelectAll = () => {
    if (allSelected) {
      onSelectedItemsChange?.([]);
      return;
    }

    const all = selectableItems.map((item) => {
      const dispatchQty = item.quantity;

      // ✅ SAME AS OLD COMPONENT
      const amount = Number((dispatchQty * item.unitPrice).toFixed(2));
      const gstAmount = Number((amount * (item.gstPerUnit / 100)).toFixed(2));

      return {
        id: item.id,
        invoiceItemId: item.invoiceItemId,
        productName: item.productName,
        skuId: item.skuId,

        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstPerUnit: item.gstPerUnit,

        dispatchQty,
        amount,
        gstAmount,
      };
    });

    onSelectedItemsChange?.(all);
  };

  // ✅ Select single item (blocked if fully dispatched)
  const handleToggleItem = (item) => {
    if (item?.isFullyDispatched) return;

    const exists = isSelected(item.id);

    if (exists) {
      onSelectedItemsChange?.(selectedItems.filter((x) => x.id !== item.id));
      return;
    }

    const dispatchQty = item.quantity;

    // ✅ SAME AS OLD COMPONENT
    const amount = Number((dispatchQty * item.unitPrice).toFixed(2));
    const gstAmount = Number((amount * (item.gstPerUnit / 100)).toFixed(2));

    const newItem = {
      id: item.id,
      invoiceItemId: item.invoiceItemId,
      productName: item.productName,
      skuId: item.skuId,

      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstPerUnit: item.gstPerUnit,

      dispatchQty,
      amount,
      gstAmount,
    };

    onSelectedItemsChange?.([...selectedItems, newItem]);
  };

  // ✅ Qty update
  const updateQty = (item, newQty) => {
    if (item?.isFullyDispatched) return;

    const safeQty = Math.max(0, Math.min(item.quantity, Number(newQty || 0)));

    const updated = selectedItems.map((x) => {
      if (x.id !== item.id) return x;

      const amount = Number((safeQty * x.unitPrice).toFixed(2));
      const gstAmount = Number((amount * (x.gstPerUnit / 100)).toFixed(2));

      return {
        ...x,
        dispatchQty: safeQty,
        amount,
        gstAmount,
      };
    });

    onSelectedItemsChange?.(updated);
  };

  // ✅ Qty adjust
  const handleQtyAdjust = (item, delta) => {
    if (item?.isFullyDispatched) return;

    const selectedItem = getSelectedItem(item.id);

    // ✅ auto-select when user clicks +/- (blocked if fully dispatched)
    if (!selectedItem) {
      const dispatchQty = 1;

      const amount = Number((dispatchQty * item.unitPrice).toFixed(2));
      const gstAmount = Number((amount * (item.gstPerUnit / 100)).toFixed(2));

      const newItem = {
        id: item.id,
        invoiceItemId: item.invoiceItemId,
        productName: item.productName,
        skuId: item.skuId,

        quantity: item.quantity,
        unitPrice: item.unitPrice,
        gstPerUnit: item.gstPerUnit,

        dispatchQty,
        amount,
        gstAmount,
      };

      onSelectedItemsChange?.([...selectedItems, newItem]);
      return;
    }

    const nextQty = (selectedItem.dispatchQty || 0) + delta;
    updateQty(item, nextQty);
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        Loading invoice items...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {errors?.selectedItems && (
        <InfoBanner
          showSupportLink={false}
          text={errors?.selectedItems}
          variant="danger"
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryCards.map((card, index) => (
          <Card key={index} className={cn('p-4', card.bgColor || 'bg-gray-50')}>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {card.value}
              </span>
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    allSelected ? true : someSelected ? 'indeterminate' : false
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Invoice Qty</TableHead>
              <TableHead className="text-center">Dispatch Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tableItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No items available
                </TableCell>
              </TableRow>
            ) : (
              tableItems.map((item) => {
                const selected = isSelected(item.id);
                const selectedItem = getSelectedItem(item.id);

                const dispatchQty = selectedItem?.dispatchQty ?? 0;
                const total = Number((dispatchQty * item.unitPrice).toFixed(2));

                const disabledRow = item?.isFullyDispatched;

                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      'cursor-pointer',
                      selected && 'bg-primary/5',
                      disabledRow && 'cursor-not-allowed opacity-60',
                    )}
                    onClick={() => {
                      if (disabledRow) return;
                      handleToggleItem(item);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected}
                        disabled={disabledRow}
                        onCheckedChange={() => handleToggleItem(item)}
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {item.productName}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {item.skuId}
                          </span>

                          {disabledRow && (
                            <span className="text-xs font-medium text-red-600">
                              Fully dispatched
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      {item.quantity} pc
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          debounceTime={0}
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => handleQtyAdjust(item, -1)}
                          disabled={
                            disabledRow || !selected || dispatchQty <= 0
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <Input
                          type="number"
                          value={dispatchQty}
                          disabled={disabledRow || !selected}
                          onChange={(e) => updateQty(item, e.target.value)}
                          className="h-7 w-16 text-center"
                          min={0}
                          max={item.quantity}
                        />

                        <span className="text-sm text-muted-foreground">
                          pc
                        </span>

                        <Button
                          debounceTime={0}
                          size="icon"
                          variant="outline"
                          className="h-7 w-7"
                          onClick={() => handleQtyAdjust(item, 1)}
                          disabled={disabledRow || dispatchQty >= item.quantity}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      ₹{item.unitPrice.toFixed(2)}
                    </TableCell>

                    <TableCell className="text-right font-semibold text-gray-900">
                      ₹{total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
