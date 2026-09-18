'use client';

import { Calendar, Clock, CreditCard, Phone, ShieldCheck } from 'lucide-react';
import React from 'react';

export default function SharePrivateConfig({
  recipient,
  onRecipientChange,
  hasExpiry,
  setHasExpiry,
  expiryDate,
  setExpiryDate,
  expiryTime,
  setExpiryTime,
  errors,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      {/* Information Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <div className="space-y-1">
          <p className="font-bold">Private Identity Verification Required</p>
          <p className="text-[11px] leading-relaxed text-blue-700/90">
            The generated link is locked to this specific individual. Before the
            custom form can be viewed or submitted, the recipient must verify
            their identity by entering their PAN and mobile number matching
            these records, followed by a secure SMS OTP.
          </p>
        </div>
      </div>

      {/* Recipient Details Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* PAN Number */}
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-700">
            Recipient PAN Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. ABCDE1234F"
              value={recipient.panNumber}
              disabled={disabled}
              maxLength={10}
              onChange={(e) => onRecipientChange('panNumber', e.target.value)}
              className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-xs uppercase tracking-wider text-neutral-800 placeholder:normal-case placeholder:tracking-normal focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <CreditCard className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          {errors?.panNumber ? (
            <p className="mt-1 text-[11px] font-medium text-red-500">
              {errors.panNumber}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-neutral-400">
              Standard 10-character Permanent Account Number.
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-700">
            Recipient Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-neutral-300 bg-neutral-100 px-2.5 text-xs font-semibold text-neutral-600">
              +{recipient.countryCode || '91'}
            </span>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={recipient.mobileNumber}
              disabled={disabled}
              maxLength={15}
              onChange={(e) =>
                onRecipientChange('mobileNumber', e.target.value)
              }
              className="h-9 w-full rounded-r-lg border border-neutral-300 bg-white px-3 font-mono text-xs text-neutral-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <Phone className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
          </div>
          {errors?.mobileNumber ? (
            <p className="mt-1 text-[11px] font-medium text-red-500">
              {errors.mobileNumber}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-neutral-400">
              OTP will be sent to this number upon recipient link access.
            </p>
          )}
        </div>
      </div>

      {/* Expiry Toggle & Options */}
      <div className="mt-2 rounded-lg border border-neutral-100 bg-neutral-50/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-800">
              Set Link Expiration (Optional)
            </span>
            <p className="text-[11px] text-neutral-500">
              Private link will become invalid after this date.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={hasExpiry}
              disabled={disabled}
              onChange={(e) => setHasExpiry(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-neutral-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
          </label>
        </div>

        {hasExpiry && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-neutral-200/60 pt-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-neutral-600">
                Expiration Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  disabled={disabled}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <Calendar className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
              </div>
              {errors?.expiryDate && (
                <p className="mt-1 text-[11px] font-medium text-red-500">
                  {errors.expiryDate}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-semibold text-neutral-600">
                Expiration Time (Local)
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={expiryTime}
                  disabled={disabled}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <Clock className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
