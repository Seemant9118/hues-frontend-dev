'use client';

import { Calendar, Clock, Globe } from 'lucide-react';
import React from 'react';

export default function SharePublicConfig({
  hasExpiry,
  setHasExpiry,
  expiryDate,
  setExpiryDate,
  expiryTime,
  setExpiryTime,
  errors,
  disabled,
}) {
  const handlePresetDays = (days) => {
    setHasExpiry(true);
    const target = new Date();
    target.setDate(target.getDate() + days);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setExpiryDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      {/* Information Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs text-emerald-800">
        <Globe className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <div className="space-y-1">
          <p className="font-bold">Public Share Configuration</p>
          <p className="text-[11px] leading-relaxed text-emerald-700/90">
            Public links are accessible by any respondent. Anyone with this link
            will be able to view fields and submit responses. You can optionally
            set an expiry date after which the link automatically ceases to
            function.
          </p>
        </div>
      </div>

      {/* Expiry Toggle & Options */}
      <div className="rounded-lg border border-neutral-100 bg-neutral-50/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-800">
              Set Link Expiration
            </span>
            <p className="text-[11px] text-neutral-500">
              Link will automatically expire and reject new submissions after
              this date.
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
          <div className="mt-4 space-y-3 border-t border-neutral-200/60 pt-4">
            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-neutral-400">
                Quick Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '7 Days', days: 7 },
                  { label: '14 Days', days: 14 },
                  { label: '30 Days', days: 30 },
                  { label: '90 Days', days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    disabled={disabled}
                    onClick={() => handlePresetDays(preset.days)}
                    className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition hover:border-primary hover:text-primary"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time Selectors */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          </div>
        )}
      </div>
    </div>
  );
}
