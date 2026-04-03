'use client';

import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';

import ReviewCorrectEntry from '@/app/[locale]/(dashboard)/dashboard/accounting/trial-balance/ReviewCorrectEntry';
import { formattedAmount } from '@/appUtils/helperFunctions';
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

const statusStyles = {
  Posted: 'bg-emerald-100 text-emerald-700 border-none',
  Closed: 'bg-gray-200 text-gray-700 border-none',
  Awaiting: 'bg-purple-100 text-purple-700 border-none',
  'Draft Bundle': 'bg-amber-100 text-amber-700 border-none',
};

/* ─── mock entry lookup ──────────────────────────────────────── */
const ALL_ENTRIES = [
  {
    eventId: 'E001',
    transactionType: 'Sales Invoice',
    documentId: 'INV-2026-001',
    counterparty: 'Customer A',
    debitLedger: 'Accounts Receivable',
    creditLedger: 'Revenue',
    amount: '₹1,50,000',
    status: 'Posted',
    source: 'Sales',
  },
  {
    eventId: 'E001B',
    transactionType: 'Sales Invoice',
    documentId: 'INV-2026-002',
    counterparty: 'Customer B',
    debitLedger: 'Accounts Receivable',
    creditLedger: 'Revenue',
    amount: '₹2,00,000',
    status: 'Posted',
    source: 'Sales',
  },
  {
    eventId: 'E001C',
    transactionType: 'Sales Invoice',
    documentId: 'INV-2026-008',
    counterparty: 'Customer C',
    debitLedger: 'Accounts Receivable',
    creditLedger: 'Revenue',
    amount: '₹3,20,000',
    status: 'Posted',
    source: 'Sales',
  },
  {
    eventId: 'E001D',
    transactionType: 'Sales Invoice',
    documentId: 'ORD-000150',
    counterparty: 'Customer E',
    debitLedger: 'Accounts Receivable',
    creditLedger: 'Revenue',
    amount: '₹60,000',
    status: 'Closed',
    source: 'Sales',
  },
  {
    eventId: 'E001E',
    transactionType: 'Sales Invoice',
    documentId: 'ORD-000160',
    counterparty: 'Customer F',
    debitLedger: 'Accounts Receivable',
    creditLedger: 'Revenue',
    amount: '₹1,80,000',
    status: 'Closed',
    source: 'Sales',
  },
];

const buildEntryData = (row) => ({
  ...row,
  ruleId: 'R001',
  period: 'FY2025-26-Q4',
  lines: [
    {
      id: 1,
      type: 'Debit',
      ledger: row.debitLedger,
      subLedger: row.counterparty,
      amount: 150000,
    },
    {
      id: 2,
      type: 'Credit',
      ledger: row.creditLedger,
      subLedger: 'Sales Revenue',
      amount: 150000,
    },
  ],
  linkedDocuments: [row.documentId],
  tAccount: {
    debit: [
      {
        id: 1,
        account: row.debitLedger,
        sub: row.counterparty,
        amount: 150000,
      },
    ],
    credit: [{ id: 2, account: `${row.creditLedger} · Sales`, amount: 150000 }],
  },
  ledgerImpact: [
    {
      id: 1,
      ledger: row.debitLedger,
      subLedger: row.counterparty,
      side: 'Debit',
      jeAmount: 150000,
      preJeState: 473000,
    },
    {
      id: 2,
      ledger: row.creditLedger,
      subLedger: 'Sales',
      side: 'Credit',
      jeAmount: 150000,
      preJeState: 65000,
    },
  ],
});

const TrialBalanceEntryPage = ({ params }) => {
  const router = useRouter();
  const [isReviewing, setIsReviewing] = React.useState(false);

  /* look up entry by documentId (tb_id param) */
  const rawRow = ALL_ENTRIES.find(
    (e) => e.documentId === decodeURIComponent(params.tb_id),
  );

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
      {/* ── breadcrumb row ───────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => router.push('/dashboard/accounting/trial-balance')}
          className="font-semibold text-blue-600 hover:underline"
        >
          Trial Balance
        </button>
        <span className="text-gray-400">/</span>
        {isReviewing ? (
          <>
            <button
              type="button"
              onClick={() => setIsReviewing(false)}
              className="font-semibold text-blue-600 hover:underline"
            >
              {entry.documentId}
            </button>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">
              Review / Correct
            </span>
          </>
        ) : (
          <span className="font-semibold text-gray-900">
            {entry.documentId}
          </span>
        )}
      </div>

      {/* ── Review/Correct mode ──────────────────────────────── */}
      {isReviewing ? (
        <ReviewCorrectEntry
          entry={rawRow}
          onBack={() => setIsReviewing(false)}
        />
      ) : (
        <>
          {/* ── header ──────────────────────────────────────── */}
          <h2 className="text-xl font-bold text-zinc-900">
            Entry: {entry.documentId}
          </h2>

          {/* ── status + action bar ──────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3">
            <div className="flex items-center gap-3">
              <Badge
                className={`px-2.5 py-1 text-xs font-semibold ${statusStyles[entry.status] || 'bg-gray-100 text-gray-700'}`}
              >
                {entry.status}
              </Badge>
              <span className="font-semibold text-gray-900">
                {entry.transactionType}
              </span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-600">
                {entry.counterparty} · {entry.amount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {entry.status === 'Posted' && (
                <Button
                  size="sm"
                  className="gap-2 bg-[#163b7d] text-white hover:bg-[#0f2f63]"
                  onClick={() => setIsReviewing(true)}
                >
                  Review / Correct
                </Button>
              )}
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
              <Card className="border border-gray-200 shadow-sm">
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
              <div className="flex flex-wrap items-center gap-8 px-1 text-sm text-gray-600">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Event ID
                  </span>
                  <p className="font-semibold text-gray-800">{entry.eventId}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Rule ID
                  </span>
                  <p className="font-semibold text-blue-700">{entry.ruleId}</p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Period
                  </span>
                  <p className="font-semibold text-gray-800">{entry.period}</p>
                </div>
              </div>

              {/* Linked Documents */}
              <Card className="border border-gray-200 shadow-sm">
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
              <Card className="border border-gray-200 shadow-sm">
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
              <Card className="border border-gray-200 shadow-sm">
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
