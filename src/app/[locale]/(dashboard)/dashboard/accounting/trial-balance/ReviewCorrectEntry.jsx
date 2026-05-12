'use client';

import { formattedAmount } from '@/appUtils/helperFunctions';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Edit3,
  FileText,
  Lock,
  RotateCcw,
  Shield,
  XCircle,
} from 'lucide-react';
import React from 'react';

const ledgerOptions = [
  'Accounts Receivable',
  'Accounts Payable',
  'Cash',
  'Revenue',
  'Operating Expenses',
  'Capital Assets',
];

const subLedgerOptions = [
  'Customer A',
  'Customer B',
  'Vendor A',
  'Vendor B',
  'Sales Revenue',
  'Project Alpha',
];

/* Section wrapper */
const SectionCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  defaultOpen = true,
  headerAction,
  iconColor = 'text-gray-500',
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50/60"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
          <div>
            <span className="text-sm font-semibold text-gray-900">{title}</span>
            {subtitle && (
              <span className="ml-2 text-xs text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {headerAction}
          {open ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>
      {open && <CardContent className="p-0">{children}</CardContent>}
    </Card>
  );
};

/* Read-only journal table */
const JournalTable = ({ lines, totalDebit, totalCredit }) => (
  <>
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
        {lines.map((line) => (
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
            <TableCell className="text-gray-600">{line.subLedger}</TableCell>
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
        Dr {formattedAmount(totalDebit)} / Cr {formattedAmount(totalCredit)}
      </span>
    </div>
  </>
);

/* T-Account panel */
const TAccountPanel = ({
  title,
  debitEntries,
  creditEntries,
  totalDebit,
  totalCredit,
}) => (
  <Card className="border border-gray-200 shadow-sm">
    <CardContent className="p-0">
      <div className="flex items-center justify-between border-b px-5 py-3">
        <span className="text-sm font-bold text-gray-900">{title}</span>
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
          {debitEntries.map((d) => (
            <div
              key={d.id}
              className="flex items-baseline justify-between gap-2 py-1 text-sm"
            >
              <div>
                <span className="font-medium text-gray-800">{d.account}</span>
                {d.sub && (
                  <span className="ml-1 text-xs text-gray-400">· {d.sub}</span>
                )}
              </div>
              <span className="font-mono text-gray-900">
                {formattedAmount(d.amount)}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-gray-900">
              {formattedAmount(totalDebit)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            Credit
          </p>
          {creditEntries.map((c) => (
            <div
              key={c.id}
              className="flex items-baseline justify-between gap-2 py-1 text-sm"
            >
              <span className="font-medium text-gray-800">{c.account}</span>
              <span className="font-mono text-gray-900">
                {formattedAmount(c.amount)}
              </span>
            </div>
          ))}
          <div className="mt-2 flex items-center justify-between border-t pt-2 text-sm">
            <span className="font-semibold text-gray-700">Total</span>
            <span className="font-bold text-gray-900">
              {formattedAmount(totalCredit)}
            </span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

/*  Ledger impact table */
const LedgerImpactTable = ({ rows }) => (
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
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-sm font-medium text-gray-800">
                {r.ledger}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {r.subLedger}
              </TableCell>
              <TableCell>
                <Badge
                  className={`border-none px-2 py-0.5 text-xs font-semibold ${
                    r.side === 'Debit'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {r.side}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-gray-900">
                {formattedAmount(r.jeAmount)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm text-gray-500">
                {formattedAmount(r.preJeState)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

/* main component */
const ReviewCorrectEntry = ({ entry: row, onBack }) => {
  const now = new Date();
  const bundleId = `RB-evt-a1-${now.getTime()}`;
  const createdAt = now.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  /* original entry lines  */
  const originalLines = [
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
  ];

  /* reversal lines (swap debit/credit)  */
  const reversalLines = originalLines.map((l) => ({
    ...l,
    type: l.type === 'Debit' ? 'Credit' : 'Debit',
  }));

  /* corrected entry (editable state) */
  const [correctedLines, setCorrectedLines] = React.useState(
    originalLines.map((l) => ({ ...l })),
  );
  const [isEditing, setIsEditing] = React.useState(false);

  const updateCorrectedLine = (idx, field, value) => {
    setCorrectedLines((prev) =>
      prev.map((l) =>
        l.id === idx
          ? { ...l, [field]: field === 'amount' ? Number(value) || 0 : value }
          : l,
      ),
    );
  };

  const corrTotalD = correctedLines
    .filter((l) => l.type === 'Debit')
    .reduce((s, l) => s + l.amount, 0);
  const corrTotalC = correctedLines
    .filter((l) => l.type === 'Credit')
    .reduce((s, l) => s + l.amount, 0);

  /* breadcrumbs */
  const breadcrumbs = [
    {
      id: 1,
      name: 'Trial Balance',
      path: '/dashboard/finance/trial-balance',
      show: true,
    },
    {
      id: 2,
      name: row.documentId,
      path: '#',
      show: true,
    },
    {
      id: 3,
      name: 'Review / Correct',
      path: '#',
      show: true,
    },
  ];

  /* T-Account data */
  const reversalDebitEntries = [
    {
      account: `${row.creditLedger} · Sales`,
      sub: row.counterparty,
      amount: 150000,
    },
  ];
  const reversalCreditEntries = [
    { account: `${row.debitLedger}`, sub: row.counterparty, amount: 150000 },
  ];

  const correctedDebitEntries = correctedLines
    .filter((l) => l.type === 'Debit')
    .map((l) => ({ account: l.ledger, sub: l.subLedger, amount: l.amount }));
  const correctedCreditEntries = correctedLines
    .filter((l) => l.type === 'Credit')
    .map((l) => ({
      account: `${l.ledger} · ${l.subLedger}`,
      amount: l.amount,
    }));

  /* ── ledger impact data ────────────────────────────────────── */
  const reversalImpact = [
    {
      ledger: row.creditLedger,
      subLedger: 'Sales Revenue',
      side: 'Debit',
      jeAmount: 150000,
      preJeState: 505000,
    },
    {
      ledger: row.debitLedger,
      subLedger: row.counterparty,
      side: 'Credit',
      jeAmount: 150000,
      preJeState: 473000,
    },
  ];

  const correctedImpact = correctedLines.map((l) => ({
    ledger: l.ledger,
    subLedger: l.subLedger,
    side: l.type,
    jeAmount: l.amount,
    preJeState: l.type === 'Debit' ? 473000 : 505000,
  }));

  /* audit trail */
  const auditTrail = [
    {
      id: 1,
      text: `Review initiated by Accountant · ${createdAt}`,
      icon: Clock,
    },
    {
      id: 2,
      text: 'Draft Correction Bundle auto-generated by System',
      icon: Shield,
    },
    {
      id: 3,
      text: 'Correction follows GR-12 (reversal-based rectification). Original entry remains immutable.',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="flex h-full flex-col gap-5 duration-300 animate-in fade-in">
      {/* breadcrumb */}
      <OrderBreadCrumbs possiblePagesBreadcrumbs={breadcrumbs} />

      {/* header */}
      <h2 className="text-xl font-bold text-zinc-900">
        Draft Correction Bundle: {bundleId}
      </h2>

      {/* info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          Posted entries cannot be directly edited. A correction bundle has been
          auto-generated containing reversal + corrected entry.
        </p>
      </div>

      {/* main 2-col layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* LEFT column — sections */}
        <div className="flex flex-col gap-5 lg:col-span-3">
          {/* Section 1: Original Entry */}
          <SectionCard
            icon={Lock}
            title="Section 1 — Original Entry"
            subtitle="(Read-Only / Immutable Audit Snapshot)"
            iconColor="text-gray-500"
          >
            <JournalTable
              lines={originalLines}
              totalDebit={150000}
              totalCredit={150000}
            />
            <div className="flex flex-wrap items-center gap-8 border-t px-5 py-3 text-sm text-gray-600">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Document ID
                </span>
                <p className="font-semibold text-gray-800">{row.documentId}</p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Posting Timestamp
                </span>
                <p className="font-semibold text-gray-800">
                  15/1/2026, 3:30:00 pm
                </p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Source Event
                </span>
                <p className="font-semibold text-gray-800">evt-a1</p>
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Reversal Entry */}
          <SectionCard
            icon={RotateCcw}
            title="Section 2 — Reversal Entry"
            subtitle="(System-Generated)"
            iconColor="text-orange-500"
          >
            <JournalTable
              lines={reversalLines}
              totalDebit={150000}
              totalCredit={150000}
            />
          </SectionCard>

          {/* Section 3: Corrected Entry */}
          <SectionCard
            icon={Edit3}
            title="Section 3 — Corrected Entry"
            iconColor="text-emerald-600"
            headerAction={
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(!isEditing);
                }}
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Corrected Entry
              </Button>
            }
          >
            {!isEditing ? (
              <JournalTable
                lines={correctedLines}
                totalDebit={corrTotalD}
                totalCredit={corrTotalC}
              />
            ) : (
              <>
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
                    {correctedLines.map((line) => (
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
                        <TableCell>
                          <Select
                            value={line.ledger}
                            onValueChange={(v) =>
                              updateCorrectedLine(line.id, 'ledger', v)
                            }
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ledgerOptions.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.subLedger}
                            onValueChange={(v) =>
                              updateCorrectedLine(line.id, 'subLedger', v)
                            }
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {subLedgerOptions.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.amount}
                            className="h-9 text-right"
                            onChange={(e) =>
                              updateCorrectedLine(
                                line.id,
                                'amount',
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-end gap-2 border-t bg-gray-50/50 px-5 py-3 text-sm">
                  <span className="font-medium text-gray-500">Totals</span>
                  <span className="font-bold text-gray-900">
                    Dr {formattedAmount(corrTotalD)} / Cr{' '}
                    {formattedAmount(corrTotalC)}
                  </span>
                </div>
              </>
            )}
          </SectionCard>

          {/* Section 4: Bundle Metadata */}
          <SectionCard
            icon={FileText}
            title="Section 4 — Bundle Metadata"
            iconColor="text-blue-600"
          >
            <div className="border-b px-5 py-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Bundle ID
                  </span>
                  <p className="mt-0.5 break-all text-sm font-semibold text-gray-800">
                    {bundleId}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Bundle Type
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    Correction
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </span>
                  <p className="mt-1">
                    <Badge className="border-none bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                      Awaiting
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Created
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    {createdAt}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Created By
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-gray-800">
                    System
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Source Event
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-blue-700">
                    evt-a1
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    Document (after posting)
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-blue-700 underline">
                    To be generated (SYS_ADJ)
                  </p>
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 pb-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-800">
                  Audit Trail
                </span>
              </div>
              <div className="space-y-2 border-l-2 border-blue-200 pl-4">
                {auditTrail.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 text-sm">
                    <span className="-ml-[21px] mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    <span className="font-medium text-gray-700">
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT column — T-Accounts, Impacts, Notes */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Reversal T-Account */}
          <TAccountPanel
            title="Reversal T-Account"
            debitEntries={reversalDebitEntries}
            creditEntries={reversalCreditEntries}
            totalDebit={150000}
            totalCredit={150000}
          />

          {/* Reversal Ledger Impact */}
          <LedgerImpactTable rows={reversalImpact} />

          {/* Corrected Entry T-Account */}
          <TAccountPanel
            title="Corrected Entry T-Account"
            debitEntries={correctedDebitEntries}
            creditEntries={correctedCreditEntries}
            totalDebit={corrTotalD}
            totalCredit={corrTotalC}
          />

          {/* Corrected Ledger Impact */}
          <LedgerImpactTable rows={correctedImpact} />

          {/* Audit Note */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <p className="pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Audit Note
              </p>
              <div className="space-y-1.5 text-sm text-gray-600">
                <p>
                  This correction follows <strong>GR-12</strong> (reversal-based
                  rectification).
                </p>
                <p>
                  Original entry remains immutable. <strong>SYS_ADJ</strong>{' '}
                  document will be minted after posting.
                </p>
                <p>No correction may occur without this bundle.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 -mx-2 mt-2 flex flex-wrap items-center gap-3 border-t bg-white px-4 py-4 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <Button
          size="sm"
          className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve Correction
        </Button>
        <Button
          size="sm"
          className="gap-2 bg-red-600 text-white hover:bg-red-700"
        >
          <XCircle className="h-4 w-4" />
          Reject Correction
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Edit3 className="h-4 w-4" />
          Edit Corrected Entry
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
};

export default ReviewCorrectEntry;
