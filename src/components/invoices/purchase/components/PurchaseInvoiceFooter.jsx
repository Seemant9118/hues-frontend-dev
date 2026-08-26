import React from 'react';
import {
  isGstApplicable,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PurchaseInvoiceFooter({
  order,
  setOrder,
  totalAmount,
  totalGstAmt,
  finalTotal,
  isGstApplicableForSelectedVendor,
  onCancel,
  isOrder,
  handlePreview,
  handleSubmit,
  isPending,
  translations,
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-3 flex items-center justify-between gap-2 border-t border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-6">
        {/* Round off type select */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Round Off Type
          </span>
          <Select
            value={order.roundOffType || 'ADD'}
            onValueChange={(val) => {
              const updatedOrder = { ...order, roundOffType: val };
              setOrder(updatedOrder);
              saveDraftToSession({
                key: 'purchaseInvoiceDraft',
                data: {
                  ...updatedOrder,
                  isGstApplicableForSelectedVendor,
                },
              });
            }}
          >
            <SelectTrigger className="mt-1 h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="ADD">Add</SelectItem>
              <SelectItem value="SUBTRACT">Subtract</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Round off input */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Round Off Amount
          </span>
          <Input
            type="number"
            step="any"
            min={0}
            className="mt-1 h-8 w-24 text-xs"
            value={order.roundOffAmount || ''}
            onChange={(e) => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              if (val < 0) return;
              const updatedOrder = { ...order, roundOffAmount: val };
              setOrder(updatedOrder);
              saveDraftToSession({
                key: 'purchaseInvoiceDraft',
                data: {
                  ...updatedOrder,
                  isGstApplicableForSelectedVendor,
                },
              });
            }}
          />
        </div>

        <div className="flex items-center gap-8 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              {translations('form.footer.gross_amount')}
            </span>
            <span className="mt-1 text-sm font-semibold text-neutral-700">
              ₹
              {totalAmount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {isGstApplicable(isGstApplicableForSelectedVendor) && (
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {translations('form.footer.tax_amount')}
              </span>
              <span className="mt-1 text-sm font-semibold text-neutral-700">
                ₹
                {totalGstAmt.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="h-10 w-[1px] bg-neutral-200"></div>

          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Grand Total
            </span>
            <span className="mt-1 text-base font-extrabold text-neutral-900">
              ₹
              {finalTotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onCancel} size="sm" variant="outline">
          {translations('form.ctas.cancel')}
        </Button>
        <Button
          type="button"
          onClick={() => {
            isOrder === 'invoice' ? handlePreview(order) : handleSubmit(order);
          }}
          disabled={isPending}
          size="sm"
        >
          {isOrder === 'invoice'
            ? translations('form.ctas.next')
            : translations('form.ctas.submit')}
        </Button>
      </div>
    </div>
  );
}
