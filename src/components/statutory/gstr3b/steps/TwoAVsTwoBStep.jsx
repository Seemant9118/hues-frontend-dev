'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getGSTR2Avs2BMissing } from '@/services/GST_Services/GST_Services';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function TwoAVsTwoBStep({ formData, setFormData }) {
  const { period, handleGstError } = formData;

  const {
    data: missingInvoicesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [gstAPIs.getGSTR2Avs2BMissing.endpointKey, period],
    queryFn: () => getGSTR2Avs2BMissing(period),
    enabled: !!period,
    select: (res) => res?.data?.data,
    retry: (failureCount, err) => {
      if (err?.response?.data?.error === 'RET11407') {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (missingInvoicesResponse) {
      setFormData((prev) => ({
        ...prev,
        twoAVsTwoBData: missingInvoicesResponse?.invoices || [],
      }));
    }
  }, [missingInvoicesResponse, setFormData]);

  useEffect(() => {
    if (isError) {
      handleGstError(error);
    }
  }, [isError, error, handleGstError]);

  const invoices = missingInvoicesResponse?.invoices || [];

  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ArrowLeftRight className="text-muted-foreground" size={24} />
          2A vs 2B Evidence Gaps
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Identify gaps between 2A and 2B that affect ITC claims.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Showing missing invoices for the period: {period}
        </p>
      </div>

      <div className="my-3">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-xs text-muted-foreground">
            In 2A but not in 2B for this month.
          </p>
          {invoices.length > 0 && (
            <Badge variant="outline" className="text-[10px]">
              Total: {missingInvoicesResponse?.totalMissing || invoices.length}
            </Badge>
          )}
        </div>

        <div className="overflow-hidden rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow className="h-8 bg-muted/50">
                <TableHead className="text-xs font-bold uppercase">
                  Status
                </TableHead>
                <TableHead className="text-xs font-bold uppercase">
                  Doc No.
                </TableHead>
                <TableHead className="text-xs font-bold uppercase">
                  Vendor
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase">
                  Invoice Amt
                </TableHead>
                <TableHead className="text-right text-xs font-bold uppercase">
                  GST Amt
                </TableHead>
                <TableHead className="text-center text-xs font-bold uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Fetching missing invoices...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-destructive"
                  >
                    {error?.response?.data?.error === 'RET11407' ? (
                      <div className="flex flex-col items-center gap-2">
                        <span>
                          GST session expired or authentication failed.
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-primary underline"
                          onClick={() => handleGstError(error)}
                        >
                          Click here to re-authenticate
                        </Button>
                      </div>
                    ) : (
                      'Failed to fetch missing invoices. Please try again.'
                    )}
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No missing invoices found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice}>
                    <TableCell>
                      <Badge className="border-purple-200 bg-purple-100 text-[10px] text-purple-600">
                        Missing in 2B
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      {invoice.clientName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      ₹{invoice.invoiceamount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary">
                      ₹{invoice.gstAmount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      Read-only
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
