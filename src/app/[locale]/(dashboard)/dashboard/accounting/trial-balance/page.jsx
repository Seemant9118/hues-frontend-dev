'use client';

import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { InfiniteDataTable } from '@/app/[locale]/(dashboard)/dashboard/admin/data/InfiniteDataTable';
import { Button } from '@/components/ui/button';
import SearchInput from '@/components/ui/SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { Download, Filter, Plus, RefreshCw } from 'lucide-react';
import React from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/ui/Loading';
import ReviewCorrectEntry from './ReviewCorrectEntry';
import { useTrialBalanceWBColumns } from './useTrialBalanceWBColumns';

const CreateNewEntry = dynamic(
  () => import('@/components/accounting/CreateNewEntry'),
  {
    loading: () => <Loading />,
  },
);

const TrialBalance = () => {
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sourceFilter, setSourceFilter] = React.useState('all');
  const [isCreatingEntry, setIsCreatingEntry] = React.useState(false);
  const [reviewingEntry, setReviewingEntry] = React.useState(null);

  const data = React.useMemo(
    () => [
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
        actions: ['View', 'Review'],
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
        actions: ['View', 'Review'],
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
        actions: ['View', 'Review'],
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
        actions: ['View'],
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
        actions: ['View'],
      },
    ],
    [],
  );

  const filteredData = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((row) => {
      const matchesSearch =
        !term ||
        [
          row.eventId,
          row.transactionType,
          row.documentId,
          row.counterparty,
          row.debitLedger,
          row.creditLedger,
          row.amount,
          row.status,
          row.source,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);

      const matchesType =
        typeFilter === 'all' ||
        row.transactionType.toLowerCase() === typeFilter;

      const matchesSource =
        sourceFilter === 'all' || row.source.toLowerCase() === sourceFilter;

      return matchesSearch && matchesType && matchesSource;
    });
  }, [data, search, typeFilter, sourceFilter]);

  const trialBalanceColumns = useTrialBalanceWBColumns({
    onReview: (row) => setReviewingEntry(row),
  });

  const showTable = !isCreatingEntry && !reviewingEntry;

  return (
    <Wrapper className="flex h-screen flex-col gap-4">
      {showTable && (
        <>
          <SubHeader name="Trial Balance" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-gray-200 bg-white">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                toSearchTerm={search}
                setToSearchTerm={setSearch}
                searchPlaceholder="Search events, documents, counterparties..."
                className="w-[360px] rounded-md border border-gray-200 bg-white text-sm"
              />

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 w-[150px] gap-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sales invoice">Sales Invoice</SelectItem>
                  <SelectItem value="purchase invoice">
                    Purchase Invoice
                  </SelectItem>
                  <SelectItem value="payment receipt">
                    Payment Receipt
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-10 w-[170px] rounded-md border border-gray-200 bg-white text-sm font-medium text-gray-800">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="purchases">Purchases</SelectItem>
                  <SelectItem value="cashflow">Cashflow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => {
                  setIsCreatingEntry(true);
                }}
              >
                <Plus className="h-4 w-4" />
                New Entry
              </Button>
            </div>
          </div>

          <InfiniteDataTable
            id="trial-balance-table"
            columns={trialBalanceColumns}
            data={filteredData}
            fetchNextPage={async () => {}}
            isFetching={false}
            totalPages={1}
            currFetchedPage={1}
          />
        </>
      )}

      {isCreatingEntry && (
        <CreateNewEntry onCancel={() => setIsCreatingEntry(false)} />
      )}

      {reviewingEntry && (
        <ReviewCorrectEntry
          entry={reviewingEntry}
          onBack={() => setReviewingEntry(null)}
        />
      )}
    </Wrapper>
  );
};

const TrialBalancePage = () => (
  <FeatureFlagWrapper flag="ACCOUNTING.TRIAL_BALANCE" redirectTo="/dashboard">
    <TrialBalance />
  </FeatureFlagWrapper>
);

export default TrialBalancePage;
