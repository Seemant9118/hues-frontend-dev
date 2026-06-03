'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import AsyncSelect from 'react-select/async';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
  debounce,
} from '@/appUtils/helperFunctions';
import {
  GetSales,
  GetPurchases,
} from '@/services/Orders_Services/Orders_Services';
import {
  getAllSalesInvoices,
  getAllPurchaseInvoices,
} from '@/services/Invoice_Services/Invoice_Services';
import { getPaymentsList } from '@/services/Payment_Services/PaymentServices';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const subCategoryOptions = {
  INVOICE: [
    { value: 'AMOUNT_MISMATCH', label: 'Amount Mismatch' },
    { value: 'DUPLICATE_INVOICE', label: 'Duplicate Invoice' },
    { value: 'MISSING_INVOICE', label: 'Missing Invoice' },
    { value: 'TAX_DISCREPANCY', label: 'Tax Discrepancy' },
    { value: 'INVOICE_REJECTED', label: 'Invoice Rejected' },
    { value: 'WRONG_DETAILS', label: 'Wrong Details' },
    { value: 'PAYMENT_NOT_LINKED', label: 'Payment Not Linked' },
    { value: 'CREDIT_NOTE_DISPUTE', label: 'Credit Note Dispute' },
    { value: 'OTHERS', label: 'Others' },
  ],
  ORDER: [
    { value: 'ORDER_DELAY', label: 'Order Delay' },
    { value: 'PARTIAL_FULFILLMENT', label: 'Partial Fulfillment' },
    { value: 'WRONG_ITEM', label: 'Wrong Item' },
    { value: 'DAMAGED_GOODS', label: 'Damaged Goods' },
    { value: 'ORDER_CANCELLED', label: 'Order Cancelled' },
    { value: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch' },
    { value: 'ORDER_NOT_RECEIVED', label: 'Order Not Received' },
    { value: 'PRICE_DISCREPANCY', label: 'Price Discrepancy' },
    { value: 'OTHERS', label: 'Others' },
  ],
  PAYMENT: [
    { value: 'PAYMENT_NOT_RECEIVED', label: 'Payment Not Received' },
    { value: 'PAYMENT_RECONCILIATION', label: 'Payment Reconciliation' },
    { value: 'EXCESS_PAYMENT', label: 'Excess Payment' },
    { value: 'SHORT_PAYMENT', label: 'Short Payment' },
    { value: 'DUPLICATE_PAYMENT', label: 'Duplicate Payment' },
    { value: 'REFUND_NOT_PROCESSED', label: 'Refund Not Processed' },
    { value: 'PAYMENT_FAILED', label: 'Payment Failed' },
    { value: 'WRONG_ACCOUNT', label: 'Wrong Account' },
    { value: 'OTHERS', label: 'Others' },
  ],
};

export default function TicketModal({
  isOpen,
  onOpenChange,
  mode,
  ticketForm,
  setTicketForm,
  onSubmit,
  onDelete,
  targetType,
  targetDetails,
  targetName,
}) {
  const enterpriseId = getEnterpriseId();

  const targetEnterpriseId = React.useMemo(() => {
    if (targetType === 'client') {
      return targetDetails?.client?.id || targetDetails?.id;
    } else {
      return targetDetails?.vendor?.id || targetDetails?.id;
    }
  }, [targetDetails, targetType]);

  const targetEnterpriseType = React.useMemo(() => {
    if (targetType === 'client') {
      return targetDetails?.client?.id
        ? 'ENTERPRISE'
        : 'UNCONFIRMED_ENTERPRISE';
    } else {
      return targetDetails?.vendor?.id
        ? 'ENTERPRISE'
        : 'UNCONFIRMED_ENTERPRISE';
    }
  }, [targetDetails, targetType]);

  const selectedOption = React.useMemo(() => {
    if (!ticketForm.referenceNumber) return null;
    return {
      value: ticketForm.contextId,
      label: ticketForm.referenceNumber,
    };
  }, [ticketForm.referenceNumber, ticketForm.contextId]);

  const debouncedFetchOptions = React.useMemo(() => {
    const fetchFunc = async (inputValue, callback) => {
      if (inputValue.length < 3) {
        callback([]);
        return;
      }
      try {
        let list = [];
        if (ticketForm.context === 'ORDER') {
          if (targetType === 'client') {
            const res = await GetSales({
              id: enterpriseId,
              data: { page: 1, limit: 50, searchString: inputValue },
            });
            list = res?.data?.data?.data || [];
          } else {
            const res = await GetPurchases({
              id: enterpriseId,
              data: { page: 1, limit: 50, searchString: inputValue },
            });
            list = res?.data?.data?.data || [];
          }
          const filtered = list
            .filter((item) => {
              if (targetType === 'client') {
                return (
                  Number(item.buyerId) === Number(targetEnterpriseId) ||
                  Number(item.buyerEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  (item.clientName &&
                    targetName &&
                    item.clientName
                      .toLowerCase()
                      .includes(targetName.toLowerCase())) ||
                  (item.customerName &&
                    targetName &&
                    item.customerName
                      .toLowerCase()
                      .includes(targetName.toLowerCase()))
                );
              } else {
                return (
                  Number(item.sellerEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  (item.vendorName &&
                    targetName &&
                    item.vendorName
                      .toLowerCase()
                      .includes(targetName.toLowerCase()))
                );
              }
            })
            .map((item) => ({
              value: item.id,
              label: item.referenceNumber || `Order #${item.id}`,
            }));
          callback(filtered);
        } else if (ticketForm.context === 'INVOICE') {
          if (targetType === 'client') {
            const res = await getAllSalesInvoices({
              id: enterpriseId,
              data: { page: 1, limit: 50, searchString: inputValue },
            });
            list = res?.data?.data?.data || [];
          } else {
            const res = await getAllPurchaseInvoices({
              id: enterpriseId,
              data: { page: 1, limit: 50, searchString: inputValue },
            });
            list = res?.data?.data?.data || [];
          }
          const filtered = list
            .filter((item) => {
              if (targetType === 'client') {
                return (
                  Number(item.buyerId) === Number(targetEnterpriseId) ||
                  Number(item.buyerEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  (item.customerName &&
                    targetName &&
                    item.customerName
                      .toLowerCase()
                      .includes(targetName.toLowerCase())) ||
                  (item.clientName &&
                    targetName &&
                    item.clientName
                      .toLowerCase()
                      .includes(targetName.toLowerCase()))
                );
              } else {
                return (
                  Number(item.sellerEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  (item.vendorName &&
                    targetName &&
                    item.vendorName
                      .toLowerCase()
                      .includes(targetName.toLowerCase()))
                );
              }
            })
            .map((item) => ({
              value: item.invoiceId || item.id,
              label:
                item.invoiceReferenceNumber ||
                item.invoicereferencenumber ||
                `Invoice #${item.invoiceId || item.id}`,
            }));
          callback(filtered);
        } else if (ticketForm.context === 'PAYMENT') {
          const contextParam = targetType === 'client' ? 'SELLER' : 'BUYER';
          const res = await getPaymentsList({
            page: 1,
            limit: 100,
            context: contextParam,
            status: 'ALL',
          });
          list = res?.data?.data?.data || [];
          const filtered = list
            .filter((item) => {
              if (targetType === 'client') {
                return (
                  Number(item.buyerId) === Number(targetEnterpriseId) ||
                  Number(item.buyerEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  Number(item.clientEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  item.clientName
                    ?.toLowerCase()
                    .includes(targetName?.toLowerCase())
                );
              } else {
                return (
                  Number(item.sellerEnterpriseId) ===
                    Number(targetEnterpriseId) ||
                  item.vendorName
                    ?.toLowerCase()
                    .includes(targetName?.toLowerCase())
                );
              }
            })
            .filter((item) => {
              const refNo =
                item.paymentReferenceNumber || item.transactionId || '';
              return refNo.toLowerCase().includes(inputValue.toLowerCase());
            })
            .map((item) => ({
              value: item.paymentId || item.id,
              label:
                item.paymentReferenceNumber ||
                item.transactionId ||
                `Payment #${item.paymentId || item.id}`,
            }));
          callback(filtered);
        } else {
          callback([]);
        }
      } catch (e) {
        callback([]);
      }
    };
    return debounce(fetchFunc, 500);
  }, [
    ticketForm.context,
    targetType,
    targetEnterpriseId,
    targetName,
    enterpriseId,
  ]);

  const handleContextChange = (newContext) => {
    setTicketForm({
      ...ticketForm,
      context: newContext,
      subCategory: subCategoryOptions[newContext][0].value,
      referenceNumber: '',
      contextId: null,
    });
  };

  const handleReferenceChange = (selected) => {
    setTicketForm({
      ...ticketForm,
      referenceNumber: selected ? selected.label : '',
      contextId: selected ? Number(selected.value) : null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e, {
        targetEnterpriseId,
        targetEnterpriseType,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden rounded-xl bg-white p-0 shadow-xl sm:max-w-2xl">
        <DialogHeader className="flex-shrink-0 border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Create Ticket' : 'Edit Ticket'}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-grow flex-col overflow-hidden"
        >
          {/* Scrollable content wrapper */}
          <div className="scrollBarStyles flex-grow space-y-4 overflow-y-auto px-6 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                required
                value={ticketForm.title}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, title: e.target.value })
                }
                placeholder="Brief description of the issue"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Description (optional)
              </Label>
              <Textarea
                rows={3}
                value={ticketForm.description}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, description: e.target.value })
                }
                placeholder="Detailed description of the issue"
                className="resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={ticketForm.priority}
                onValueChange={(val) =>
                  setTicketForm({ ...ticketForm, priority: val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Context */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={ticketForm.context}
                onValueChange={handleContextChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER">Order</SelectItem>
                  <SelectItem value="INVOICE">Invoice</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Sub Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={ticketForm.subCategory}
                onValueChange={(val) =>
                  setTicketForm({ ...ticketForm, subCategory: val })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent className="max-h-36 overflow-y-auto">
                  {(subCategoryOptions[ticketForm.context] || []).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reference Number */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Reference Document
              </Label>
              <AsyncSelect
                key={ticketForm.context}
                cacheOptions
                isClearable
                value={selectedOption}
                loadOptions={debouncedFetchOptions}
                onChange={handleReferenceChange}
                styles={getStylesForSelectComponent()}
                className="text-sm font-medium"
                classNamePrefix="select"
                placeholder={`Search and select Document (min 3 chars)`}
                defaultOptions={false}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="flex flex-shrink-0 items-center justify-end gap-2.5 border-t border-gray-100 px-6 py-4">
            {mode === 'edit' && onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                className="mr-auto rounded-xl"
              >
                Delete
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
