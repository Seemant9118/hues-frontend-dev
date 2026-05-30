'use client';

import { accountingAPIs } from '@/api/accounting/accountingAPIs';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { getJournalEntries } from '@/services/Accounting_Services/AccountingServices';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from 'boneyard-js/react';
import { Plus, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
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
  // const [typeFilter, setTypeFilter] = React.useState('all');
  // const [sourceFilter, setSourceFilter] = React.useState('all');
  const [isCreatingEntry, setIsCreatingEntry] = React.useState(false);
  const [reviewingEntry, setReviewingEntry] = React.useState(null);
  const queryClient = useQueryClient();

  // Fetch enteries data with infinite scroll
  const {
    data: enteriesRes,
    fetchNextPage,
    isFetching,
    isLoading: isEnteriesLoading,
    refetch,
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
    <Skeleton name="trialBalance" loading={isEnteriesLoading}>
      <Wrapper className="flex h-screen flex-col gap-3">
        {showTable && (
          <>
            <section className="mt-2 flex items-center justify-between">
              <SubHeader name="Trial Balance" />
              <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                  toSearchTerm={search}
                  setToSearchTerm={setSearch}
                  searchPlaceholder="Search events, documents, counterparties..."
                  className="w-[360px] rounded-sm border border-gray-200 bg-white text-sm"
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                  />
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
            </section>

            {isEnteriesLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loading />
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
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
                    className="flex min-h-0 flex-1 flex-col"
                    bodyClassName="flex-1 min-h-0 scrollBarStyles overflow-auto rounded-sm"
                  />
                )}
              </div>
            )}
          </>
        )}

        {isCreatingEntry && (
          <CreateNewEntry
            onCancel={() => {
              setIsCreatingEntry(false);
              queryClient.invalidateQueries([
                accountingAPIs.getJournalEntries.endpointKey,
              ]);
            }}
          />
        )}

        {reviewingEntry && (
          <ReviewCorrectEntry
            entry={reviewingEntry}
            onBack={() => setReviewingEntry(null)}
          />
        )}
      </Wrapper>
    </Skeleton>
  );
};

const TrialBalancePage = () => (
  <FeatureFlagWrapper flag="ACCOUNTING.TRIAL_BALANCE" redirectTo="/dashboard">
    <TrialBalance />
  </FeatureFlagWrapper>
);

export default TrialBalancePage;
