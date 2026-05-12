'use client';

import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';

import ReviewCorrectEntry from '@/app/[locale]/(dashboard)/dashboard/accounting/trial-balance/ReviewCorrectEntry';
import { capitalize, formattedAmount } from '@/appUtils/helperFunctions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, Copy, FileText, Link2 } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountingAPIs } from '@/api/accounting/accountingAPIs';
import { getJournalEntry } from '@/services/Accounting_Services/AccountingServices';
import Loading from '@/components/ui/Loading';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';

const statusStyles = {
  POSTED: 'bg-emerald-100 text-emerald-700 border-none',
  CLOSED: 'bg-gray-200 text-gray-700 border-none',
  AWAITING: 'bg-purple-100 text-purple-700 border-none',
  DRAFT: 'bg-amber-100 text-amber-700 border-none',
};

const buildEntryData = (rawData) => {
  const entry = rawData?.entry || rawData || {}; // fallback
  const lines = rawData?.lines || entry?.lines || [];

  const mappedLines =
    lines.length > 0
      ? lines.map((l, index) => ({
          id: l.id || index + 1,
          type: l.credit ? 'Credit' : 'Debit',
          ledger: l.accountName || l.ledger || 'Unknown Ledger',
          subLedger: l.subLedger || entry.counterparty || 'Unknown',
          amount: parseInt(l.credit || l.debit || l.amount, 10) || 0,
        }))
      : [
          {
            id: 1,
            type: 'Debit',
            ledger: entry.debitLedger || 'Unknown Ledger',
            subLedger: entry.counterparty || 'Unknown Subledger',
            amount: parseInt(entry.amount, 10) || 150000,
          },
          {
            id: 2,
            type: 'Credit',
            ledger: entry.creditLedger || 'Unknown Ledger',
            subLedger: 'Sales Revenue',
            amount: parseInt(entry.amount, 10) || 150000,
          },
        ];

  return {
    ...entry,
    documentId:
      entry.entryNumber || entry.publicId || entry.documentId || 'Unknown',
    transactionType: entry.journalType || entry.transactionType || 'Unknown',
    counterparty: entry.sellerType || entry.counterparty || 'System',
    status: entry.status || 'Unknown',
    amount: mappedLines
      .filter((l) => l.type === 'Debit')
      .reduce((s, l) => s + l.amount, 0),
    sourceModule: entry.sourceModule || 'N/A',
    sourceRef: entry.sourceRef || entry.id || 'N/A',
    period: entry.fiscalPeriodId || entry.period || 'N/A',
    description: entry.description || 'No description provided.',
    entryDate: entry.entryDate || 'N/A',
    lines: mappedLines,
    linkedDocuments: entry.linkedDocuments || [
      entry.entryNumber || entry.publicId || 'No Docs',
    ],
    tAccount: entry.tAccount || {
      debit: mappedLines
        .filter((l) => l.type === 'Debit')
        .map((l) => ({
          id: l.id,
          account: l.ledger,
          sub: l.subLedger,
          amount: l.amount,
        })),
      credit: mappedLines
        .filter((l) => l.type === 'Credit')
        .map((l) => ({
          id: l.id,
          account: l.ledger,
          sub: l.subLedger,
          amount: l.amount,
        })),
    },
    ledgerImpact:
      entry.ledgerImpact ||
      mappedLines.map((l) => ({
        id: l.id,
        ledger: l.ledger,
        subLedger: l.subLedger,
        side: l.type,
        jeAmount: l.amount,
        preJeState: 0,
      })),
  };
};

const TrialBalanceEntryPage = ({ params }) => {
  const router = useRouter();
  const [isReviewing, setIsReviewing] = React.useState(false);

  const entryId = decodeURIComponent(params.tb_id);

  // fetch journal entry
  const { data: entryRes, isLoading } = useQuery({
    queryKey: [accountingAPIs.getJournalEntry.endpointKey, entryId],
    queryFn: () => getJournalEntry({ id: entryId }),
    enabled: !!entryId,
  });

  const rawRow = entryRes?.data?.data || entryRes?.data || null;

  if (isLoading) {
    return (
      <Wrapper className="flex h-screen flex-col items-center justify-center gap-4 py-24 text-center">
        <Loading />
      </Wrapper>
    );
  }

  /* fallback if not found */
  if (!rawRow) {
    return (
      <Wrapper className="flex h-screen flex-col gap-4">
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <FileText className="h-12 w-12 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-700">Entry not found</h2>
          <p className="text-sm text-gray-500">
            No entry found for ID: <strong>{params.tb_id}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.push('/dashboard/accounting/trial-balance')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trial Balance
          </Button>
        </div>
      </Wrapper>
    );
  }

  const entry = buildEntryData(rawRow);

  const totalDebit = entry.lines
    .filter((l) => l.type === 'Debit')
    .reduce((s, l) => s + l.amount, 0);
  const totalCredit = entry.lines
    .filter((l) => l.type === 'Credit')
    .reduce((s, l) => s + l.amount, 0);

  return (
    <Wrapper className="flex min-h-screen flex-col gap-5 py-6">
      {/* headers */}
      <OrderBreadCrumbs
        possiblePagesBreadcrumbs={[
          {
            id: 'tb-root',
            name: 'Trial Balance',
            path: '/dashboard/accounting/trial-balance',
            show: true,
          },
          {
            id: 'tb-[id]',
            name: `Entry No. ${entry.documentId}`,
            path: `/dashboard/accounting/trial-balance/${params.tb_id}`,
            onClick: () => {
              if (isReviewing) setIsReviewing(false);
            },
            show: true,
          },
          {
            id: 'tb-review',
            name: 'Review / Correct',
            path: `/dashboard/accounting/trial-balance/${params.tb_id}`,
            show: isReviewing,
          },
        ]}
      />

      {/* ── Review/Correct mode ──────────────────────────────── */}
      {isReviewing ? (
        <ReviewCorrectEntry
          entry={rawRow}
          onBack={() => setIsReviewing(false)}
        />
      ) : (
        <>
          {/* ── status + action bar ──────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
            <div className="flex items-center gap-6">
              <Badge
                className={`px-2.5 py-1 text-xs font-semibold uppercase ${statusStyles[entry.status] || statusStyles[entry.status?.toUpperCase()] || 'border-none bg-gray-100 text-gray-700'}`}
              >
                {entry.status}
              </Badge>
              <span className="font-semibold text-gray-900">
                {capitalize(entry.transactionType)}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">
                {capitalize(entry.counterparty)}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">
                {formattedAmount(entry.amount)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* {entry.status?.toUpperCase() !== 'POSTED' && (
                <Button
                  size="sm"
                  className="gap-2 bg-[#163b7d] text-white hover:bg-[#0f2f63]"
                  onClick={() => setIsReviewing(true)}
                >
                  Review / Correct
                </Button>
              )} */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  router.push('/dashboard/accounting/trial-balance')
                }
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          </div>

          {/* ── main 2-col content ────────────────────────────── */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            {/* LEFT — 3 cols */}
            <div className="flex flex-col gap-5 lg:col-span-3">
              {/* Journal Details */}
              <Card className="rounded-sm border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 border-b px-5 py-3">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      Journal Details
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/70">
                        <TableHead className="w-[90px] text-xs font-bold uppercase tracking-wider text-blue-900">
                          Type
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          Ledger
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          Sub-Ledger
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-blue-900">
                          Amount (₹)
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                                line.type === 'Debit'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {line.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-blue-700">
                            {line.ledger}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {line.subLedger}
                          </TableCell>
                          <TableCell className="text-right font-mono text-gray-900">
                            {formattedAmount(line.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-end gap-2 border-t bg-gray-50/50 px-5 py-3 text-sm">
                    <span className="font-medium text-gray-500">Totals</span>
                    <span className="font-bold text-gray-900">
                      Dr {formattedAmount(totalDebit)} / Cr{' '}
                      {formattedAmount(totalCredit)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Meta row */}
              <div className="flex flex-wrap items-start gap-8 px-1 text-sm text-gray-600">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Source
                  </span>
                  <p className="font-semibold text-gray-800">
                    {entry.sourceModule} ({entry.sourceRef})
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Date
                  </span>
                  <p className="font-semibold text-blue-700">
                    {entry.entryDate}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Fiscal Period
                  </span>
                  <p
                    className="max-w-[200px] truncate font-semibold text-gray-800"
                    title={entry.period}
                  >
                    {entry.period}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Description
                  </span>
                  <p className="max-w-[300px] italic text-gray-800">
                    {entry.description}
                  </p>
                </div>
              </div>

              {/* Linked Documents */}
              <Card className="rounded-sm border border-gray-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 pb-3">
                    <Link2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      Linked Documents
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.linkedDocuments.map((doc) => (
                      <span
                        key={doc}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <FileText className="h-3.5 w-3.5 text-gray-400" />
                        {doc}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT — 2 cols */}
            <div className="flex flex-col gap-5 lg:col-span-2">
              {/* T-Account */}
              <Card className="rounded-sm border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b px-5 py-3">
                    <span className="text-sm font-bold text-gray-900">
                      T-Account
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-gray-500"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy T-Account
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 divide-x">
                    <div className="p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Debit
                      </p>
                      {entry.tAccount.debit.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-baseline justify-between gap-2 py-1 text-sm"
                        >
                          <div>
                            <span className="font-medium text-gray-800">
                              {d.account}
                            </span>
                            {d.sub && (
                              <span className="ml-1 text-xs text-gray-400">
                                · {d.sub}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-gray-900">
                            {formattedAmount(d.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
                        <span className="font-semibold text-gray-700">
                          Total
                        </span>
                        <span className="font-bold text-gray-900">
                          {formattedAmount(totalDebit)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                        Credit
                      </p>
                      {entry.tAccount.credit.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-baseline justify-between gap-2 py-1 text-sm"
                        >
                          <span className="font-medium text-gray-800">
                            {c.account}
                          </span>
                          <span className="font-mono text-gray-900">
                            {formattedAmount(c.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
                        <span className="font-semibold text-gray-700">
                          Total
                        </span>
                        <span className="font-bold text-gray-900">
                          {formattedAmount(totalCredit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ledger Impact */}
              <Card className="rounded-sm border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="border-b px-5 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Ledger Impact
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/70">
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Ledger
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Subledger
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Entry Side
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                          JE Amount
                        </TableHead>
                        <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                          Pre-JE State
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entry.ledgerImpact.map((impact) => (
                        <TableRow key={impact.id}>
                          <TableCell className="text-sm font-medium text-gray-800">
                            {impact.ledger}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {impact.subLedger}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`border-none px-2 py-0.5 text-xs font-semibold ${
                                impact.side === 'Debit'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {impact.side}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-gray-900">
                            {formattedAmount(impact.jeAmount)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-gray-500">
                            {formattedAmount(impact.preJeState)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </Wrapper>
  );
};

const TrialBalanceEntryPageGuarded = ({ params }) => (
  <FeatureFlagWrapper flag="ACCOUNTING.TRIAL_BALANCE" redirectTo="/dashboard">
    <TrialBalanceEntryPage params={params} />
  </FeatureFlagWrapper>
);

export default TrialBalanceEntryPageGuarded;
