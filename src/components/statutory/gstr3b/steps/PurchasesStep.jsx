'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import { formattedAmount } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
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
import { syncInvoicesWithGSTR2A } from '@/services/GST_Services/GST_Services';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, RefreshCw, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PurchasesStep({ formData }) {
  const router = useRouter();

  const {
    data: purchaseInvoices = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [gstAPIs.syncInvoicesWithGSTR2A.endpointKey, formData.period],
    queryFn: () => syncInvoicesWithGSTR2A(formData.period),
    enabled: !!formData.period,
    retry: (failureCount, err) => {
      if (err?.response?.data?.error === 'RET11407') {
        return false;
      }
      return failureCount < 3;
    },
    select: (res) => {
      const innerData = res?.data?.data || {};
      const b2bData = innerData.data?.b2b || [];
      const matchedInvoices = innerData.matchedInvoices || [];

      const processed = [];

      // Portal invoices
      b2bData.forEach((b2bItem) => {
        const { ctin } = b2bItem;
        b2bItem.inv?.forEach((inv) => {
          const match = matchedInvoices.find(
            (m) => m.portalInvoiceNumber === inv.inum && m.ctin === ctin,
          );

          processed.push({
            id: match?.systemInvoiceNumber || inv.inum,
            docNo: inv.inum,
            date: inv.idt,
            vendor: ctin,
            books: match
              ? formattedAmount(match.result?.totalAmount || 0)
              : '-',
            portal: formattedAmount(inv.val || 0),
            status:
              match?.result?.status === 'MATCHED' ? 'Matched' : 'Portal Only',
            systemInvoiceNumber: match?.systemInvoiceNumber,
          });
        });
      });

      // Books only
      matchedInvoices.forEach((m) => {
        const alreadyAdded = processed.some(
          (p) => p.docNo === m.portalInvoiceNumber && p.vendor === m.ctin,
        );
        if (!alreadyAdded) {
          processed.push({
            id: m.systemInvoiceNumber || m.portalInvoiceNumber,
            docNo: m.systemInvoiceNumber || 'N/A',
            date: m.result?.invoiceDate || 'N/A',
            vendor: m.ctin,
            books: formattedAmount(m.result?.totalAmount || 0),
            portal: '-',
            status: 'Books Only',
            systemInvoiceNumber: m.systemInvoiceNumber,
          });
        }
      });

      return processed;
    },
  });

  useEffect(() => {
    if (isError && error) {
      formData.handleGstError(error);
    }
  }, [isError, error, formData]);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Matched':
        return 'border-emerald-200 bg-emerald-100 text-emerald-600';
      case 'Partial':
        return 'border-orange-200 bg-orange-100 text-orange-600';
      case 'Portal Only':
        return 'border-sky-200 bg-sky-100 text-sky-600';
      case 'Books Only':
        return 'border-slate-200 bg-slate-100 text-slate-600';
      default:
        return 'border-purple-200 bg-purple-100 text-purple-600';
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <ShoppingCart className="text-muted-foreground" size={24} />
          Purchases vs GSTR-2A
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare purchase invoices against GSTR-2A.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Books as-of: {new Date().toLocaleString()} • 2A as-of:{' '}
          {new Date().toLocaleString()}
        </p>
      </div>

      <InfoBanner
        text="3B is a control tower. To notify vendors or resolve, use the Resolve button."
        showSupportLink={false}
      />

      <div className="overflow-hidden rounded-sm border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Doc No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Books</TableHead>
              <TableHead className="text-right">Portal</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw
                      className="animate-spin text-primary"
                      size={20}
                    />
                    <span>Fetching purchase invoices...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-destructive"
                >
                  {error?.response?.data?.error === 'RET11407' ? (
                    <div className="flex flex-col items-center gap-2">
                      <span>GST session expired or authentication failed.</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary underline"
                        onClick={() => formData.handleGstError(error)}
                      >
                        Click here to re-authenticate
                      </Button>
                    </div>
                  ) : (
                    'Failed to fetch purchase invoices. Please try again.'
                  )}
                </TableCell>
              </TableRow>
            ) : purchaseInvoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No differences found for this period.
                </TableCell>
              </TableRow>
            ) : (
              purchaseInvoices.map((row) => (
                <TableRow key={`${row.docNo}-${row.vendor}-${row.status}`}>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusStyles(row.status)}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{row.docNo}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.vendor}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {row.books}
                  </TableCell>
                  <TableCell className="text-right">{row.portal}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!row.systemInvoiceNumber}
                        onClick={() =>
                          router.push(
                            `/dashboard/purchases/purchase-invoices/${row.systemInvoiceNumber}`,
                          )
                        }
                        className="flex h-8 flex-col items-center gap-0 leading-none"
                      >
                        <div className="flex items-center gap-1 text-primary">
                          <ExternalLink size={14} />
                          <span>Resolve</span>
                        </div>
                        <span className="mt-0.5 text-[10px] text-muted-foreground">
                          Opens Purchase Invoice&apos;s details
                        </span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-8">
                        Skip
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
