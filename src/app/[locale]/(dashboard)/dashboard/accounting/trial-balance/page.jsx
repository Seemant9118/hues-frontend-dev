'use client';

import { accountingAPIs } from '@/api/accounting/accountingAPIs';
import { InfiniteDataTable } from '@/app/[locale]/(dashboard)/dashboard/admin/data/InfiniteDataTable';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SearchInput from '@/components/ui/SearchInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SubHeader from '@/components/ui/Sub-header';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { getJournalEntries } from '@/services/Accounting_Services/AccountingServices';
import { Download, Filter, Plus, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import ReviewCorrectEntry from './ReviewCorrectEntry';
import { useTrialBalanceWBColumns } from './useTrialBalanceWBColumns';

const PAGE_LIMIT = 10;

const CreateNewEntry = dynamic(
  () => import('@/components/accounting/CreateNewEntry'),
  {
    loading: () => <Loading />,
  },
);

const TrialBalance = () => {
  const [entries, setEntries] = useState(null);
  const [paginationData, setPaginationData] = useState(null);
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sourceFilter, setSourceFilter] = React.useState('all');
  const [isCreatingEntry, setIsCreatingEntry] = React.useState(false);
  const [reviewingEntry, setReviewingEntry] = React.useState(null);

  // Fetch enteries data with infinite scroll
  const {
    data: enteriesRes,
    fetchNextPage,
    isFetching,
    isLoading: isEnteriesLoading,
  } = useInfiniteQuery({
    queryKey: [
      accountingAPIs.getJournalEntries.endpointKey,
      { page: 1, limit: PAGE_LIMIT },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getJournalEntries({
        page: pageParam,
        limit: PAGE_LIMIT,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      const totalPages =
        _lastGroup?.data?.totalPages || _lastGroup?.data?.data?.totalPages || 0;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    staleTime: Infinity, // data never becomes stale
    refetchOnMount: false, // don’t refetch on remount
    refetchOnWindowFocus: false, // already correct
  });

  // data flattening - formatting
  useEffect(() => {
    if (!enteriesRes?.pages) return;

    // Flatten entries data from all pages
    const flattenedEntriesData = enteriesRes.pages.flatMap(
      (page) => page?.data?.entries || page?.data?.data?.entries || [],
    );

    // Deduplicate entries data based on unique `id`
    const uniqueEntriesData = Array.from(
      new Map(
        flattenedEntriesData.map((entry) => [
          entry.id, // Assuming `id` is the unique identifier for each entry
          entry,
        ]),
      ).values(),
    );

    // Update state with deduplicated entries data
    setEntries(uniqueEntriesData);

    // Calculate pagination data using the last page's information
    const lastPage =
      enteriesRes.pages[enteriesRes.pages.length - 1]?.data?.data ||
      enteriesRes.pages[enteriesRes.pages.length - 1]?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages || 0,
      currFetchedPage: lastPage?.page || 1,
    });
  }, [enteriesRes]);

  const trialBalanceColumns = useTrialBalanceWBColumns({
    onReview: (row) => setReviewingEntry(row),
  });

  const showTable = !isCreatingEntry && !reviewingEntry;

  return (
    <Wrapper className="flex h-screen flex-col gap-3">
      {showTable && (
        <>
          <SubHeader name="Trial Balance" />
          <div className="flex flex-wrap items-center justify-between gap-2 border-gray-200 bg-white">
            <div className="flex flex-wrap items-center gap-3">
              <SearchInput
                toSearchTerm={search}
                setToSearchTerm={setSearch}
                searchPlaceholder="Search events, documents, counterparties..."
                className="w-[360px] rounded-sm border border-gray-200 bg-white text-sm"
              />

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-10 w-[150px] gap-2 rounded-sm border border-gray-200 bg-white text-sm font-medium text-gray-800">
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
                <SelectTrigger className="h-10 w-[170px] rounded-sm border border-gray-200 bg-white text-sm font-medium text-gray-800">
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

          {isEnteriesLoading ? (
            <Loading />
          ) : (
            <>
              {/* Case 1: no data → Empty stage */}
              {!entries?.length ? (
                <EmptyStageComponent
                  heading={'No Trial Balance Entries Found'}
                />
              ) : (
                <InfiniteDataTable
                  id="trial-balance-table"
                  columns={trialBalanceColumns}
                  data={entries}
                  fetchNextPage={fetchNextPage}
                  isFetching={isFetching}
                  totalPages={paginationData?.totalPages}
                  currFetchedPage={paginationData?.currFetchedPage}
                />
              )}
            </>
          )}
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
