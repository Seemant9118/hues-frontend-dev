'use client';

import { getCurrentFinancialYearPeriods } from '@/appUtils/helperFunctions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  syncInvoicesWithGSTR1,
  syncInvoicesWithGSTR2A,
} from '@/services/GST_Services/GST_Services';
import { useMutation } from '@tanstack/react-query';
import { ExternalLink, Info, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SyncInvoicesModal = ({
  isOpen,
  onClose,
  onSyncError,
  triggerSyncPeriod,
  type = 'SALES', // 'SALES' or 'PURCHASES'
}) => {
  const [step, setStep] = useState('selection');
  const [selectedSources, setSelectedSources] = useState(['gst']); // default
  const [syncResults, setSyncResults] = useState(null);
  // Periods from financial year
  const filingPeriods = getCurrentFinancialYearPeriods();
  const [selectedPeriod, setSelectedPeriod] = useState(
    triggerSyncPeriod || filingPeriods[0]?.value,
  );

  const sources = [
    { id: 'gst', label: 'GST (IMS / GSTR-1)' },
    { id: 'tally', label: 'Tally' },
  ];

  const { mutate: runSync, isPending: isLoading } = useMutation({
    mutationFn:
      type === 'SALES' ? syncInvoicesWithGSTR1 : syncInvoicesWithGSTR2A,
    onSuccess: (res) => {
      const data = res?.data?.data || {};
      setSyncResults({
        totalFetched: data.totalFetched || 0,
        matchesFound: data.matchesFound || 0,
        breakdown: data.breakdown || { gst: 0, tally: 0 },
        stats: data.stats || {
          matched: 0,
          partial: 0,
          portalOnly: 0,
          booksOnly: 0,
        },
        invoices: data.invoices || [],
      });
      setStep('results');
    },
    onError: (err) => {
      if (err?.response?.data?.error === 'RET11407') {
        onSyncError?.(selectedPeriod);
        return;
      }
      toast.error(err?.response?.data?.message || 'Failed to sync invoices');
    },
  });

  // Handle automatic sync if triggered from parent
  useEffect(() => {
    if (isOpen && triggerSyncPeriod) {
      setSelectedPeriod(triggerSyncPeriod);
      runSync(triggerSyncPeriod);
    }
  }, [isOpen, triggerSyncPeriod]);

  const handleRunSync = () => {
    runSync(selectedPeriod);
  };

  const resetAndClose = (open) => {
    if (!open) {
      setStep('selection');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <RefreshCw
              className={`size-5 text-primary ${isLoading ? 'animate-spin' : ''}`}
            />
            {step === 'selection'
              ? `Sync ${type === 'SALES' ? 'Sales' : 'Purchase'} Invoices`
              : 'Sync Results'}
          </DialogTitle>
        </DialogHeader>

        {step === 'selection' ? (
          <div className="space-y-4 p-6">
            <p className="text-sm text-neutral-500">
              Pull latest invoice data and update match statuses.
            </p>

            {/* Return Period Selector */}
            <div className="space-y-2 pb-2">
              <h4 className="px-1 text-sm font-semibold text-neutral-900">
                Filing Period
              </h4>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select filing period" />
                </SelectTrigger>
                <SelectContent className="max-h-[180px]">
                  {filingPeriods.map((period) => (
                    <SelectItem
                      key={period.value}
                      value={period.value}
                      className="text-xs"
                    >
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4 rounded-sm border border-neutral-200 p-6">
              <h4 className="text-sm font-semibold text-neutral-900">
                Portal Feeds
              </h4>
              <div className="space-y-2">
                {sources.map((source) => (
                  <div key={source.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={source.id}
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={(checked) => {
                        setSelectedSources((prev) =>
                          checked
                            ? [...prev, source.id]
                            : prev.filter((s) => s !== source.id),
                        );
                      }}
                    />
                    <label
                      htmlFor={source.id}
                      className="cursor-pointer text-sm font-medium text-neutral-700"
                    >
                      {source.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="px-6"
                onClick={() => resetAndClose(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRunSync}
                disabled={isLoading || selectedSources.length === 0}
                className="gap-2 px-6"
              >
                <RefreshCw
                  className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Run Sync
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Total Fetched
                </p>
                <h3 className="text-3xl font-bold text-neutral-900">
                  {syncResults?.totalFetched}
                </h3>
                <p className="mt-1 text-[10px] text-neutral-500">
                  GST: {syncResults?.breakdown.gst} · Tally:{' '}
                  {syncResults?.breakdown.tally}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Matches Found
                </p>
                <h3 className="text-3xl font-bold text-neutral-900">
                  {syncResults?.matchesFound}
                </h3>
              </div>
            </div>

            {/* Chips/Filters */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700"
              >
                Matched: {syncResults?.stats.matched}
              </Badge>
              <Badge
                variant="outline"
                className="border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700"
              >
                Partial: {syncResults?.stats.partial}
              </Badge>
              <Badge
                variant="outline"
                className="border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700"
              >
                Portal Only: {syncResults?.stats.portalOnly}
              </Badge>
              <Badge
                variant="outline"
                className="border-slate-100 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500"
              >
                Books Only: {syncResults?.stats.booksOnly}
              </Badge>
            </div>

            {/* Affected Invoices */}
            <div className="space-y-3">
              <h4 className="px-1 text-[10px] font-bold uppercase tracking-widest">
                Affected Invoices
              </h4>
              <div className="scrollBarStyles h-[220px] overflow-y-auto overflow-x-hidden rounded-sm border border-neutral-200 bg-white">
                <div className="divide-y divide-neutral-100">
                  {syncResults?.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-[11px] text-neutral-500">
                            Portal:{' '}
                            <span className="font-semibold text-neutral-900">
                              {inv.portalNo}
                            </span>
                          </p>
                          <p className="text-[11px] text-neutral-500">
                            Books:{' '}
                            <span className="font-semibold text-neutral-900">
                              {inv.booksNo}
                            </span>
                          </p>
                          <p className="pt-1 text-xs font-bold text-neutral-800">
                            {inv.entity}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`border-none px-2 py-0.5 text-[10px] ${inv.status === 'Partial' ? 'bg-amber-100 text-amber-700' : ''} ${inv.status === 'Portal Only' ? 'bg-sky-100 text-sky-700' : ''} ${inv.status === 'Matched' ? 'bg-emerald-100 text-emerald-700' : ''} `}
                            >
                              {inv.status}
                            </Badge>
                            <Info className="size-3.5 cursor-help text-neutral-400" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-3 text-[11px] font-semibold hover:bg-neutral-100"
                            onClick={() =>
                              window.open(
                                `/dashboard/${type === 'SALES' ? 'sales/sales-invoices' : 'purchases/purchase-invoices'}/${inv.id}`,
                                '_blank',
                              )
                            }
                          >
                            Open{' '}
                            <ExternalLink className="size-3 text-primary" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => resetAndClose(false)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SyncInvoicesModal;
