import React from 'react';
import { isGstApplicable } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';

export default function B2CInvoiceFooter({
  totalAmount,
  totalGstAmt,
  totalAmtWithGst,
  isGstApplicableForSalesOrders,
  onCancel,
  handleSubmit,
  order,
  isPending,
  translations,
}) {
  return (
    <div className="sticky bottom-0 z-20 mt-3 flex items-center justify-between gap-2 border-t border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-8 pl-4">
          {/* Gross Amount */}
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

          {/* Tax Amount */}
          {isGstApplicable(isGstApplicableForSalesOrders) && (
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

          {/* Grand Total */}
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Grand Total
            </span>
            <span className="mt-1 text-base font-extrabold text-neutral-900">
              ₹
              {totalAmtWithGst.toLocaleString('en-IN', {
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
          onClick={() => handleSubmit(order)}
          size="sm"
          disabled={isPending}
        >
          {translations('form.ctas.submit')}
        </Button>
      </div>
    </div>
  );
}
