'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getGstr3bOffsetPayload,
  retOffsetGstr3b,
} from '@/services/GST_Services/GST_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Calculator,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export default function GstOffsetStep({ formData }) {
  const { period, handleGstError } = formData;
  const queryClient = useQueryClient();

  const {
    data: rawData = null,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [gstAPIs.getGstr3bOffsetPayload.endpointKey, period],
    queryFn: () => getGstr3bOffsetPayload(period),
    enabled: !!period,
    select: (res) => res?.data?.data || null,
    retry: (failureCount, err) => {
      if (err?.response?.data?.error === 'RET11407') {
        return false;
      }
      return failureCount < 3;
    },
  });

  const retOffsetMutation = useMutation({
    mutationFn: () => retOffsetGstr3b(period),
    onSuccess: () => {
      toast.success('Liability offset successfully!');
      queryClient.invalidateQueries({
        queryKey: [gstAPIs.getGstr3bOffsetPayload.endpointKey, period],
      });
    },
    onError: (err) => {
      if (err?.response?.data?.error === 'RET11407') {
        handleGstError(err);
      } else {
        toast.error(
          err?.response?.data?.message || 'Failed to offset liability.',
        );
      }
    },
  });

  useEffect(() => {
    if (isError && error) {
      handleGstError(error);
    }
  }, [isError, error, handleGstError]);

  const handleOffsetLiability = () => {
    retOffsetMutation.mutate();
  };

  // Resilient data extraction
  const { pditc, pdcash } = useMemo(() => {
    const itc = rawData?.pditc || {};
    // Handle pdcash as array or object
    const cash =
      (Array.isArray(rawData?.pdcash) ? rawData?.pdcash[0] : rawData?.pdcash) ||
      {};
    return { pditc: itc, pdcash: cash };
  }, [rawData]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === 0 || val === '-')
      return '₹0';
    // Handle string values that might be numbers
    const num =
      typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
    if (Number.isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const itcUtilizationRows = useMemo(
    () => [
      {
        id: 'igst',
        description: 'Integrated Tax (IGST)',
        igst: pditc.i_pdi,
        cgst: pditc.i_pdc,
        sgst: pditc.i_pds,
        cess: '-',
      },
      {
        id: 'cgst',
        description: 'Central Tax (CGST)',
        igst: pditc.c_pdi,
        cgst: pditc.c_pdc,
        sgst: '-',
        cess: '-',
      },
      {
        id: 'sgst',
        description: 'State/UT Tax (SGST)',
        igst: pditc.s_pdi,
        cgst: '-',
        sgst: pditc.s_pds,
        cess: '-',
      },
      {
        id: 'cess',
        description: 'Cess',
        igst: '-',
        cgst: '-',
        sgst: '-',
        cess: pditc.cs_pdcs,
      },
    ],
    [pditc],
  );

  const cashPaymentRows = useMemo(
    () => [
      {
        id: 'igst-cash',
        description: 'Integrated Tax (IGST)',
        tax: pdcash.ipd,
        interest: pdcash.i_intrpd,
        lateFee: '-',
      },
      {
        id: 'cgst-cash',
        description: 'Central Tax (CGST)',
        tax: pdcash.cpd,
        interest: pdcash.c_intrpd,
        lateFee: pdcash.c_lfeepd,
      },
      {
        id: 'sgst-cash',
        description: 'State/UT Tax (SGST)',
        tax: pdcash.spd,
        interest: pdcash.s_intrpd,
        lateFee: pdcash.s_lfeepd,
      },
      {
        id: 'cess-cash',
        description: 'Cess',
        tax: pdcash.cspd,
        interest: pdcash.cs_intrpd,
        lateFee: '-',
      },
    ],
    [pdcash],
  );

  const hasNoData =
    !rawData ||
    (Object.keys(pditc).length === 0 && Object.keys(pdcash).length === 0);

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Preparing liability offset data...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Calculator className="text-muted-foreground" size={24} />
            GST Offset
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review the utilization of ITC and cash payment for the current tax
            period.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching || retOffsetMutation.isPending}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleOffsetLiability}
            disabled={
              retOffsetMutation.isPending || isFetching || isError || hasNoData
            }
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            size="sm"
          >
            {retOffsetMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 size={16} />
            )}
            Offset Liability
          </Button>
        </div>
      </div>

      {hasNoData ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Calculator className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-sm font-semibold">No Offset Data</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn&apos;t find any offset payload for this period. Try
            refreshing or check if the return summary is generated.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4"
          >
            Refresh Data
          </Button>
        </div>
      ) : (
        <>
          {/* ITC Utilization Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Wallet size={16} />
              Paid through ITC
            </div>
            <div className="overflow-hidden rounded-sm border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="h-10 bg-muted/50">
                    <TableHead className="w-[200px] text-[10px] font-bold uppercase tracking-wider">
                      Description
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      IGST ITC
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      CGST ITC
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      SGST ITC
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      Cess ITC
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itcUtilizationRows.map((row) => (
                    <TableRow key={row.id} className="h-10 hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold">
                        {row.description}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(row.igst)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(row.cgst)}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {formatCurrency(row.sgst)}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-emerald-600">
                        {formatCurrency(row.cess)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Cash Payment Table */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Wallet size={16} />
              Paid through Cash
            </div>
            <div className="overflow-hidden rounded-sm border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="h-10 bg-muted/50">
                    <TableHead className="w-[200px] text-[10px] font-bold uppercase tracking-wider">
                      Description
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      Tax Paid in Cash
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      Interest
                    </TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
                      Late Fee
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashPaymentRows.map((row) => (
                    <TableRow key={row.id} className="h-10 hover:bg-muted/30">
                      <TableCell className="text-xs font-semibold">
                        {row.description}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-sky-600">
                        {formatCurrency(row.tax)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-orange-600">
                        {formatCurrency(row.interest)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-rose-600">
                        {formatCurrency(row.lateFee)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="rounded-md border border-sky-100 bg-sky-50 p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-200">
                <span className="text-[10px] font-bold text-sky-700">i</span>
              </div>
              <div className="text-xs leading-relaxed text-sky-700">
                <p className="mb-1 font-bold">Important Note:</p>
                The values shown above are calculated based on your current ITC
                balance and tax liability. Clicking{' '}
                <strong>&quot;Offset Liability&quot;</strong> will post these
                entries to your electronic liability ledger and electronic
                credit/cash ledger. This action is irreversible.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
