'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

const GSTR1SummaryModal = ({ isOpen, onClose, data, onConfirm, isLoading }) => {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            GSTR-1 Summary Review
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium text-gray-500">
              Gross Taxable Value
            </p>
            <p className="text-2xl font-bold">
              ₹{data?.taxable_value || '0.00'}
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm font-medium text-gray-500">
              Total Tax Amount
            </p>
            <p className="text-2xl font-bold text-blue-600">
              ₹{data?.total_tax || '0.00'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-md font-semibold">Summary Breakdown</h3>
          <div className="divide-y rounded-lg border">
            <div className="flex justify-between p-3">
              <span className="text-sm">Total B2B Invoices</span>
              <Badge variant="secondary">{data?.b2b_count || 0}</Badge>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-sm">Central Tax (CGST)</span>
              <span className="font-medium text-blue-600">
                ₹{data?.cgst || '0.00'}
              </span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-sm">State/UT Tax (SGST)</span>
              <span className="font-medium text-green-600">
                ₹{data?.sgst || '0.00'}
              </span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-sm">Integrated Tax (IGST)</span>
              <span className="font-medium text-purple-600">
                ₹{data?.igst || '0.00'}
              </span>
            </div>
            <div className="flex justify-between bg-gray-50 p-3 font-bold">
              <span className="text-sm">Grand Total Amount</span>
              <span>₹{data?.total_value || '0.00'}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} isLoading={isLoading}>
            Confirm & Proceed to File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GSTR1SummaryModal;
