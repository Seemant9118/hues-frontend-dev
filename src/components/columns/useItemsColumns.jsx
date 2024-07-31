'use client';

import { useState, useEffect } from 'react';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const useItemsColumns = ({
  setInvoicedData,
  invoicedData,
  setProductDetailsList,
  productDetailsList,
}) => {
  const [initialQuantities, setInitialQuantities] = useState([]);

  useEffect(() => {
    const initialQtys = productDetailsList?.map((item) => item.quantity);
    setInitialQuantities(initialQtys);
  }, [productDetailsList]);

  const handleRowSelection = (row, value) => {
    const updatedSelection = value
      ? [...invoicedData.invoiceItems, row.original]
      : invoicedData.invoiceItems.filter(
          (item) => item.orderItemId !== row.original.orderItemId,
        );
    // Calculate the total amount and GST amount
    const totalAmount = updatedSelection.reduce(
      (acc, item) => acc + item.totalAmount,
      0,
    );
    const totalGstAmount = updatedSelection.reduce(
      (acc, item) => acc + (item.totalAmount * item.gstPercentage) / 100,
      0,
    );

    setInvoicedData({
      ...invoicedData,
      invoiceItems: updatedSelection,
      amount: Number(totalAmount.toFixed(2)),
      gstAmount: Number(totalGstAmount.toFixed(2)),
    });
  };

  const updateProductDetailsList = (index, newQuantity) => {
    const updatedList = productDetailsList.map((item, idx) =>
      idx === index
        ? {
            ...item,
            quantity: newQuantity,
            totalAmount: newQuantity * item.unitPrice,
            totalGstAmount: parseFloat(
              (newQuantity * item.unitPrice * (item.gstPerUnit / 100)).toFixed(
                2,
              ),
            ),
          }
        : item,
    );
    setProductDetailsList(updatedList);
    setInvoicedData({
      ...invoicedData,
      invoiceItems: updatedList,
    });
  };

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleRowSelection(row, !!value);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'productName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEM NAME" />
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
      cell: ({ row }) => {
        const { index } = row;
        const { quantity } = row.original;

        const handleDecrement = () => {
          const newQty = quantity - 1;
          if (newQty >= 1) {
            updateProductDetailsList(index, newQty);
          }
        };

        const handleIncrement = () => {
          const newQty = quantity + 1;
          if (newQty <= initialQuantities[index]) {
            updateProductDetailsList(index, newQty);
          }
        };

        const handleInputChange = (event) => {
          const value = parseInt(event.target.value, 10);
          const newQty = Number.isNaN(value) ? 1 : Math.max(1, value);
          updateProductDetailsList(index, newQty);
        };

        return (
          <div className="flex gap-1">
            <Button
              className="disabled:hover:cursor-not-allowed"
              variant="export"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              -
            </Button>
            <Input
              type="text"
              name="quantity"
              className="w-20"
              value={quantity}
              onChange={handleInputChange}
            />
            <Button
              className="disabled:cursor-not-allowed"
              variant="export"
              onClick={handleIncrement}
              // disabled={quantity >= initialQuantities[index]}
            >
              +
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: 'unitPrice',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UNIT PRICE" />
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="TOTAL AMOUNT" />
      ),
      cell: ({ row }) => {
        const totalAmt = row.original.quantity * row.original.unitPrice;
        return (
          <Input
            type="text"
            name="totalAmount"
            disabled
            className="w-20 disabled:cursor-not-allowed"
            value={totalAmt}
          />
        );
      },
    },
  ];
};
