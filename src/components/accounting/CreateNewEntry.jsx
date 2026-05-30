'use client';

import { accountingAPIs } from '@/api/accounting/accountingAPIs';
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
import {
  getLedgerSubledgers,
  manualEnteriesCreated,
} from '@/services/Accounting_Services/AccountingServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import DocumentSearchModal from './DocumentSearchModal';

const defaultRow = (type) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type,
  ledger: '',
  subLedger: '',
  amount: '',
});

const documentTypeMap = {
  'sales-order': {
    title: 'Sales Order',
    url: (enterpriseId) => `/order/getsales/${enterpriseId}`,
    method: 'POST',
  },
  'sales-invoice': {
    title: 'Sales Invoice',
    url: (enterpriseId) =>
      `/order/invoice/getallsalesinvoicelist/${enterpriseId}`,
    method: 'POST',
  },
  'payment-receipt': {
    title: 'Sales Payments',
    url: () => `/payment/get?page=1&limit=10&context=SELLER&status=ALL`,
    method: 'GET',
  },
  'purchase-order': {
    title: 'Purchase Order',
    url: (enterpriseId) => `/order/getpurchases/${enterpriseId}`,
    method: 'POST',
  },
  'purchase-invoice': {
    title: 'Purchase Invoice',
    url: (enterpriseId) =>
      `/order/invoice/getallpurchaseinvoicelist/${enterpriseId}`,
    method: 'POST',
  },
  'payment-advice': {
    title: 'Purchase Payments',
    url: () => `/payment/get?page=1&limit=10&context=BUYER&status=ALL`,
    method: 'GET',
  },
};

const CreateNewEntry = ({ onCancel }) => {
  const [rows, setRows] = React.useState([
    defaultRow('Debit'),
    defaultRow('Credit'),
  ]);
  // Form states
  const [documentType, setDocumentType] = React.useState('sales-invoice');
  const [documentId, setDocumentId] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [notes, setNotes] = React.useState('');

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

  // Modal & Search states
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);

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

  // Fetch Ledger Subledgers options with useQuery
  const { data: ledgerSubledgers = [] } = useQuery({
    queryKey: [accountingAPIs.ledgerSubledgers.endpointKey],
    queryFn: async () => {
      const response = await getLedgerSubledgers();
      let list = [];
      if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        list = response.data.data;
      }
      return list;
    },
    refetchOnWindowFocus: false,
  });

  // Submit manual journal entry mutation
  const submitMutation = useMutation({
    mutationFn: manualEnteriesCreated,
    onSuccess: () => {
      toast.success('Draft bundle created successfully!');
      onCancel?.();
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Failed to create draft bundle.',
      );
    },
  });

  const handleLedgerChange = (rowId, ledgerId) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, ledger: ledgerId, subLedger: '' } : row,
      ),
    );
  };

  const handleDocumentTypeChange = (value) => {
    setDocumentType(value);
    setDocumentId('');
    setAmount('');
  };
  const handleSubmit = () => {
    if (!documentId) {
      toast.error('Please select a Document ID.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (totals.debit !== totals.credit) {
      toast.error('Total Debits must equal Total Credits.');
      return;
    }
    if (totals.debit === 0) {
      toast.error('Accounting entry grid cannot be empty.');
      return;
    }

    const journalLines = rows.map((row) => ({
      type: row.type.toUpperCase(),
      ledgerId: row.ledger,
      subLedgerId: row.subLedger || undefined,
      amount: parseFloat(row.amount || 0),
    }));

    const payload = {
      transactionType: documentType.replace('-', '_').toUpperCase(),
      docRef: documentId,
      amount: parsedAmount,
      notes: notes || '',
      journalLines,
    };

    // eslint-disable-next-line no-console
    console.log(payload);
    submitMutation.mutate(payload);
  };

  return (
    <div className="flex h-full flex-col gap-6 py-4">
      <OrderBreadCrumbs possiblePagesBreadcrumbs={trialBalanceBreadCrumbs} />
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-gray-800">
              Document Type
            </Label>
            <Select
              value={documentType}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales-order">Sales Order</SelectItem>
                <SelectItem value="sales-invoice">Sales Invoice</SelectItem>
                <SelectItem value="payment-receipt">Payment Receipt</SelectItem>
                <SelectItem value="purchase-order">Purchase Order</SelectItem>
                <SelectItem value="purchase-invoice">
                  Purchase Invoice
                </SelectItem>
                <SelectItem value="payment-advice">Payment Advice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1 block text-sm font-medium text-gray-800">
              Document ID
            </Label>
            <div className="flex w-full flex-col gap-1">
              {documentId ? (
                <div className="flex h-10 w-full items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/30 px-3 text-sm shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-emerald-800">
                      Selected: {documentId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSearchModalOpen(true)}
                      className="text-xs font-bold text-emerald-700 underline transition-colors hover:text-emerald-900"
                    >
                      Change
                    </button>
                    <span className="text-emerald-200">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentId('');
                        setAmount('');
                      }}
                      className="text-xs font-bold text-red-600 transition-colors hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-dashed border-neutral-300 bg-neutral-50/50 text-sm font-semibold text-neutral-600 shadow-sm transition-all hover:border-primary hover:bg-neutral-50 hover:text-primary"
                >
                  <Plus
                    size={16}
                    className="text-neutral-400 transition-colors"
                  />
                  <span>
                    Select {documentTypeMap[documentType]?.title || 'Document'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-800">
              Amount (₹)
            </Label>
            <Input
              placeholder="0"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-800">Notes</Label>
            <Input
              placeholder="Transaction notes..."
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                  {rows.map((row) => {
                    const selectedLedgerObj = ledgerSubledgers.find(
                      (item) => item.ledgerId === row.ledger,
                    );
                    const subLedgersForSelectedLedger =
                      selectedLedgerObj?.subLedger || [];

                    return (
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
                              handleLedgerChange(row.id, value)
                            }
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select ledger" />
                            </SelectTrigger>
                            <SelectContent className="scrollBarStyles max-h-[200px]">
                              {ledgerSubledgers.map((item) => (
                                <SelectItem
                                  key={item.ledgerId}
                                  value={item.ledgerId}
                                >
                                  {item.ledger}
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
                            disabled={subLedgersForSelectedLedger.length === 0}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue
                                placeholder={
                                  subLedgersForSelectedLedger.length === 0
                                    ? 'No sub-ledger'
                                    : 'Select sub-ledger'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent className="scrollBarStyles max-h-[200px]">
                              {subLedgersForSelectedLedger.map((subItem) => (
                                <SelectItem
                                  key={subItem.subLedgerId}
                                  value={subItem.subLedgerId}
                                >
                                  {subItem.subLedger}
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
                    );
                  })}
                </TableBody>
              </Table>

              {/* Footer - Totals */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <span>Totals</span>
                  <span className="text-gray-900">
                    Dr ₹{totals.debit.toLocaleString('en-IN')} / Cr ₹
                    {totals.credit.toLocaleString('en-IN')}
                  </span>
                  {totals.debit === totals.credit ? (
                    <span className="inline-flex animate-pulse items-center rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                      MATCHED
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">
                      NOT MATCHED
                    </span>
                  )}
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
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitMutation.isPending || totals.debit !== totals.credit}
        >
          {submitMutation.isPending ? 'Creating...' : 'Create Draft Bundle'}
        </Button>
      </div>

      {/* modal for search */}
      <DocumentSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        documentType={documentType}
        documentTypeMap={documentTypeMap}
        onSelect={(id, amt) => {
          setDocumentId(id);
          if (amt) {
            setAmount(String(amt));
          }
        }}
      />
    </div>
  );
};

export default CreateNewEntry;
