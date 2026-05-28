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
import { ArrowLeft, FileText } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountingAPIs } from '@/api/accounting/accountingAPIs';
import { getJournalEntry } from '@/services/Accounting_Services/AccountingServices';
import Loading from '@/components/ui/Loading';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusStyles = {
  POSTED: 'bg-emerald-100 text-emerald-700 border-none',
  CLOSED: 'bg-gray-200 text-gray-700 border-none',
  AWAITING: 'bg-purple-100 text-purple-700 border-none',
  DRAFT: 'bg-amber-100 text-amber-700 border-none',
};

const formatFieldLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isNaN(amount) ? 0 : amount;
};

const buildEntryData = (rawData) => {
  const entry = rawData?.entry || rawData || {}; // fallback
  const lines = rawData?.lines || entry?.lines || [];

  const mappedLines =
    lines.length > 0
      ? lines.map((l, index) => {
          const amount = toAmount(l.amount || l.credit || l.debit);

          return {
            ...l,
            id: l.publicId || l.id || index + 1,
            lineId: l.id || index + 1,
            type: l.debitCredit,
            ledger: l.dimensionTags?.ledgerName || '--',
            subLedger: l.dimensionTags?.subledgerName || '--',
            accountCode: l.dimensionTags?.accountCode || l.accountCode || 'N/A',
            accountName:
              l.dimensionTags?.accountName || l.accountName || 'Unknown',
            accountType: l.dimensionTags?.accountType || l.accountType || 'N/A',
            subledgerType:
              l.dimensionTags?.subledgerType || l.subledgerType || 'N/A',
            postingRole: l.dimensionTags?.postingRole || l.postingRole || 'N/A',
            amount,
            baseAmount: toAmount(l.baseAmount || l.amount),
            description: l.description || 'N/A',
            rawLine: l,
          };
        })
      : [
          {
            id: 1,
            type: 'Debit',
            ledger: entry.debitLedger || 'Unknown Ledger',
            subLedger: entry.counterparty || 'Unknown Subledger',
            amount: parseInt(entry.amount, 10) || 150000,
            baseAmount: parseInt(entry.amount, 10) || 150000,
            accountCode: 'N/A',
            accountName: entry.debitLedger || 'Unknown',
            accountType: 'N/A',
            description: entry.description || 'N/A',
            rawLine: {},
          },
          {
            id: 2,
            type: 'Credit',
            ledger: entry.creditLedger || 'Unknown Ledger',
            subLedger: 'Sales Revenue',
            amount: parseInt(entry.amount, 10) || 150000,
            baseAmount: parseInt(entry.amount, 10) || 150000,
            accountCode: 'N/A',
            accountName: entry.creditLedger || 'Unknown',
            accountType: 'N/A',
            description: entry.description || 'N/A',
            rawLine: {},
          },
        ];

  const counterpartyLine = mappedLines.find(
    (line) =>
      line.dimensionTags?.counterpartyId ||
      line.dimensionTags?.counterpartyType,
  );
  const counterparty =
    counterpartyLine?.subLedger ||
    counterpartyLine?.dimensionTags?.counterpartyType ||
    entry.counterparty ||
    entry.sellerType ||
    entry.buyerType ||
    'System';

  return {
    ...entry,
    rawEntry: entry,
    documentId:
      entry.entryNumber || entry.publicId || entry.documentId || 'Unknown',
    transactionType: entry.journalType || entry.transactionType || 'Unknown',
    counterparty,
    status: entry.status || 'Unknown',
    amount: mappedLines
      .filter((l) => l.type === 'DEBIT')
      .reduce((s, l) => s + l.amount, 0),
    sourceModule: entry.sourceModule || 'N/A',
    sourceRef: entry.sourceRef || entry.id || 'N/A',
    period: entry.fiscalPeriodId || entry.period || 'N/A',
    description: entry.description || 'No description provided.',
    entryDate: entry.entryDate || 'N/A',
    effectiveDate: entry.effectiveDate || 'N/A',
    postedAt: entry.postedAt || 'N/A',
    currencyCode: entry.currencyCode || 'N/A',
    exchangeRate: entry.exchangeRate || 'N/A',
    lines: mappedLines,
    linkedDocuments: Array.isArray(entry.linkedDocuments)
      ? entry.linkedDocuments
      : [
          entry.sourceModule &&
            entry.sourceRef &&
            `${entry.sourceModule} #${entry.sourceRef}`,
          entry.entryNumber && `Entry #${entry.entryNumber}`,
          entry.publicId,
        ].filter(Boolean),
    tAccount: entry.tAccount || {
      debit: mappedLines
        .filter((l) => l.type === 'DEBIT')
        .map((l) => ({
          id: l.id,
          account: l.ledger,
          sub: l.subLedger,
          amount: l.amount,
        })),
      credit: mappedLines
        .filter((l) => l.type === 'CREDIT')
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
        baseAmount: l.baseAmount,
        preJeState: 0,
        accountType: l.accountType,
        postingRole: l.postingRole,
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
    .filter((l) => l.type === 'DEBIT')
    .reduce((s, l) => s + l.amount, 0);
  const totalCredit = entry.lines
    .filter((l) => l.type === 'CREDIT')
    .reduce((s, l) => s + l.amount, 0);
  const overviewData = {
    documentId: entry.documentId,
    counterparty: entry.counterparty,
    totalDebit,
    totalCredit,
    transactionType: <Badge variant="secondary">{entry.transactionType}</Badge>,
    linkedDocuments: (
      <>
        {entry?.linkedDocuments?.map((doc) => (
          <Badge variant="outline" key={doc}>
            {doc}
          </Badge>
        ))}
      </>
    ),
    status: entry.status,
    description: entry.description,
  };
  const overviewLabels = Object.keys(overviewData).reduce(
    (labels, key) => ({
      ...labels,
      [key]: formatFieldLabel(key),
    }),
    {},
  );
  const overviewRenderers = {
    amount: (value) => formattedAmount(toAmount(value)),
    totalDebit: (value) => formattedAmount(value),
    totalCredit: (value) => formattedAmount(value),
    status: (value) => (
      <Badge
        className={`w-fit px-2.5 py-1 text-xs font-semibold uppercase ${statusStyles[value] || statusStyles[value?.toUpperCase()] || 'border-none bg-gray-100 text-gray-700'}`}
      >
        {value}
      </Badge>
    ),
  };

  return (
    <Wrapper className="flex min-h-screen flex-col gap-3 py-6">
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
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="t-account">T-Account</TabsTrigger>
              <TabsTrigger value="ledger-impact">Ledger Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-1">
                <Overview
                  data={overviewData}
                  labelMap={overviewLabels}
                  customRender={overviewRenderers}
                />

                <Card className="rounded-sm border border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-2 border-b px-5 py-3 text-gray-900">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-semibold">
                        Journal Details
                      </span>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/70">
                          <TableHead>Type</TableHead>
                          <TableHead>Ledger</TableHead>
                          <TableHead>Sub-Ledger</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Base Amount</TableHead>
                          <TableHead>Amount (₹)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entry.lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${
                                  line.type === 'DEBIT'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {capitalize(line?.type)}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium text-blue-700">
                              {line.ledger}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {line.subLedger}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              <div className="flex flex-col">
                                <span>{line.accountName}</span>
                                <span className="text-xs text-gray-400">
                                  {line.accountCode} · {line.accountType}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[220px] text-gray-600">
                              {line.description}
                            </TableCell>
                            <TableCell className="text-right font-mono text-gray-700">
                              {formattedAmount(line.baseAmount)}
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
              </div>
            </TabsContent>

            <TabsContent value="t-account">
              <Card className="rounded-sm border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 border-b px-5 py-3 text-gray-900">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-semibold">T-Account</span>
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
                          <div>
                            <span className="font-medium text-gray-800">
                              {c.account}
                            </span>
                            {c.sub && (
                              <span className="ml-1 text-xs text-gray-400">
                                · {c.sub}
                              </span>
                            )}
                          </div>
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
            </TabsContent>

            <TabsContent value="ledger-impact">
              <Card className="rounded-sm border border-gray-200 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center gap-1 border-b px-5 py-3 text-gray-900">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-semibold">Ledger Impact</span>
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
                          Base Amount
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Account Type
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Posting Role
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
                          <TableCell className="text-right font-mono text-sm text-gray-700">
                            {formattedAmount(impact.baseAmount)}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {impact.accountType || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {impact.postingRole || 'N/A'}
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
            </TabsContent>
          </Tabs>
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
