'use client';

import { MapPin, Package } from 'lucide-react';
import React from 'react';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const AddressCard = ({ title, name, address }) => {
  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-accent p-2 text-primary">
          <MapPin size={16} />
        </div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-neutral-900">{name || '-'}</p>
        <p className="text-xs text-neutral-600">{address || '-'}</p>
      </div>
    </div>
  );
};

const DispatchItemsList = ({ items = [] }) => {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-accent p-2 text-primary">
            <Package size={16} />
          </div>
          <p className="text-sm font-semibold text-neutral-900">
            Items to Dispatch
          </p>
        </div>

        <p className="text-xs text-neutral-500">{items?.length || 0} item(s)</p>
      </div>

      <div className="flex flex-col">
        {(items || []).map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <div key={item?.productId || idx}>
              <div className="flex items-start justify-between gap-4 py-3">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-neutral-900">
                    {item?.productName || '-'}
                  </p>
                </div>

                <p className="text-sm font-semibold text-neutral-900">
                  {item?.quantity || 0}{' '}
                  <span className="text-xs font-medium text-neutral-500">
                    {item?.unitLabel || 'pc'}
                  </span>
                </p>
              </div>

              {!isLast && <div className="h-px w-full bg-neutral-100" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ConfirmAndReviewLayout = ({ formData = {}, setFormData }) => {
  const isInternalLogistics =
    formData?.movementType ===
    'Internal logistics (stock transfer / repositioning)';

  // Internal logistics uses items from "items"
  const itemsToDispatch = formData?.items || [];

  // Address mapping
  const fromAddress = formData?.dispatchFromAddressId || '';
  const toAddress = isInternalLogistics
    ? formData?.dispatchToAddressId
    : formData?.billingFromAddressDetails ||
      formData?.billingFromAddressId ||
      {};

  const fromTitle = isInternalLogistics ? 'Dispatch From' : 'Dispatch From';
  const toTitle = isInternalLogistics ? 'Dispatch To' : 'Billing From';

  const pillText = isInternalLogistics
    ? 'Internal Logistic Transfer'
    : 'Supply for Sale';

  return (
    <div>
      {/* Movement Type Pill */}
      <div className="">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold',
            'bg-blue-50 text-primary',
          )}
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          {pillText}
        </div>
      </div>

      {/* Address Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <AddressCard
          title={fromTitle}
          name={fromAddress?.name || fromAddress?.warehouseName}
          address={
            fromAddress?.address ||
            fromAddress?.fullAddress ||
            fromAddress?.cityStatePincode
          }
        />

        <AddressCard
          title={toTitle}
          name={toAddress?.name || toAddress?.warehouseName}
          address={
            toAddress?.address ||
            toAddress?.fullAddress ||
            toAddress?.cityStatePincode
          }
        />
      </div>

      {/* Items */}
      <div className="mt-6">
        <DispatchItemsList items={itemsToDispatch} />
      </div>

      {/* Notes */}
      <div className="mt-6 flex flex-col gap-2">
        <Label className="text-sm font-semibold text-neutral-900">
          Additional Notes (Optional)
        </Label>

        <Textarea
          placeholder="Add any special instructions or notes for this dispatch..."
          className="min-h-[100px] resize-none"
          value={formData?.notes || ''}
          onChange={(e) =>
            setFormData?.((prev) => ({
              ...prev,
              notes: e.target.value,
            }))
          }
        />
      </div>
    </div>
  );
};

export default ConfirmAndReviewLayout;
