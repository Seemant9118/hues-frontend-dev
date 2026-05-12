'use client';

import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

const defaultRow = (type) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  ledger: '',
  subLedger: '',
  amount: '',
});

const ledgerOptions = [
  'Accounts Receivable',
  'Accounts Payable',
  'Cash',
  'Revenue',
  'Operating Expenses',
  'Capital Assets',
];

const subLedgerOptions = [
  'Customer A',
  'Customer B',
  'Vendor A',
  'Vendor B',
  'Project Alpha',
];

const CreateNewEntry = ({ onCancel }) => {
  const [rows, setRows] = React.useState([
    defaultRow('Debit'),
    defaultRow('Credit'),
  ]);

  const trialBalanceBreadCrumbs = [
    {
      id: 1,
      name: 'Trial Balance',
      path: '/dashboard/accounting/trial-balance',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Create New Entry',
      path: '/dashboard/accounting/trial-balance/create-new-entry',
      show: true, // Always show
    },
  ];

  const addRow = (type) => {
    setRows((prev) => [...prev, defaultRow(type)]);
  };

  const removeRow = (rowId) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const updateRow = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)),
    );
  };

  const totals = rows.reduce(
    (acc, row) => {
      const amount = Number(row.amount || 0);
      if (row.type === 'Debit') acc.debit += amount;
      if (row.type === 'Credit') acc.credit += amount;
      return acc;
    },
    { debit: 0, credit: 0 },
  );

  return (
    <div className="flex h-full flex-col gap-6 py-4">
      <OrderBreadCrumbs possiblePagesBreadcrumbs={trialBalanceBreadCrumbs} />
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-gray-800">
              Transaction Type
            </Label>
            <Select defaultValue="sales-invoice">
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales-invoice">Sales Invoice</SelectItem>
                <SelectItem value="purchase-invoice">
                  Purchase Invoice
                </SelectItem>
                <SelectItem value="payment-receipt">Payment Receipt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-800">
              Document ID
            </Label>
            <Input placeholder="Enter document ID" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-800">
              Amount (₹)
            </Label>
            <Input placeholder="0" type="number" />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-800">Notes</Label>
            <Textarea
              placeholder="Transaction notes..."
              className="min-h-[42px]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Accounting Entry Grid
          </h3>

          <Card className="border border-gray-200">
            <CardContent className="p-0">
              <Table>
                {/* Header */}
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Type</TableHead>
                    <TableHead>Ledger</TableHead>
                    <TableHead>Sub-Ledger</TableHead>
                    <TableHead>Amount (₹)</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>

                {/* Body */}
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      {/* Type */}
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                            row.type === 'Debit'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {row.type}
                        </span>
                      </TableCell>

                      {/* Ledger */}
                      <TableCell>
                        <Select
                          value={row.ledger}
                          onValueChange={(value) =>
                            updateRow(row.id, 'ledger', value)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select ledger" />
                          </SelectTrigger>
                          <SelectContent>
                            {ledgerOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Sub Ledger */}
                      <TableCell>
                        <Select
                          value={row.subLedger}
                          onValueChange={(value) =>
                            updateRow(row.id, 'subLedger', value)
                          }
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select sub-ledger" />
                          </SelectTrigger>
                          <SelectContent>
                            {subLedgerOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="0"
                          value={row.amount}
                          onChange={(event) =>
                            updateRow(row.id, 'amount', event.target.value)
                          }
                        />
                      </TableCell>

                      {/* Delete */}
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete row"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Footer - Totals */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <span>Totals</span>
                  <span className="text-gray-900">
                    Dr ₹{totals.debit.toLocaleString('en-IN')} / Cr ₹
                    {totals.credit.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span>{rows.length} rows</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => addRow('Debit')}
                >
                  <Plus className="h-4 w-4" />
                  Debit Row
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => addRow('Credit')}
                >
                  <Plus className="h-4 w-4" />
                  Credit Row
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-3 border-t pt-4">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm">Create Draft Bundle</Button>
      </div>
    </div>
  );
};

export default CreateNewEntry;
