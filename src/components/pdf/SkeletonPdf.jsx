/* eslint-disable react/no-array-index-key */
import { cn } from '@/lib/utils'; // optional helper if you're using class merging
import React from 'react';

const SkeletonBlock = ({ className }) => (
  <div className={cn('animate-pulse rounded bg-gray-200', className)} />
);

const SkeletonPdf = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-8 rounded-md bg-white p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-12 w-32" /> {/* Logo */}
        <SkeletonBlock className="h-8 w-24" /> {/* Invoice Badge */}
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-56" />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-9 gap-2 border-b pb-2 text-sm font-medium">
        {[
          'Item',
          'SAC',
          'Price',
          'Qty',
          'CGST%',
          'CGST Amt',
          'SGST %',
          'SGST Amt',
          'Total',
        ].map((col, i) => (
          <SkeletonBlock key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Table Rows (3 placeholder rows) */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="grid grid-cols-9 gap-2 py-2">
          {[...Array(9)].map((__, j) => (
            <SkeletonBlock key={j} className="h-4 w-full" />
          ))}
        </div>
      ))}

      {/* Footer note & amount breakdown */}
      <div className="flex justify-between gap-8">
        {/* Note & bank details */}
        <div className="w-1/2 space-y-2">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-48" />
          <SkeletonBlock className="h-4 w-60" />
        </div>

        {/* Totals */}
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
          <div className="mt-2 flex justify-between font-bold">
            <SkeletonBlock className="h-6 w-28" />
            <SkeletonBlock className="h-6 w-28" />
          </div>
        </div>
      </div>

      {/* Footer with QR and contact */}
      <div className="mt-6 flex items-end justify-between border-t pt-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-20 w-20 rounded-md" />
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
        <SkeletonBlock className="h-10 w-24" /> {/* Logo again */}
      </div>
    </div>
  );
};

export default SkeletonPdf;
