'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Check, FileText } from 'lucide-react';

import AgreementSignModal from '@/components/Modals/AgreementSignModal';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { getUserAgreements } from '@/services/template-builder/TemplateBuilderServices';
import { useContractsColumns } from './useContractsColumns';

const PAGE_LIMIT = 10;

export default function ContractsPage() {
  const queryClient = useQueryClient();

  // States
  const [statusFilter, setStatusFilter] = useState('not_signed'); // 'not_signed' or 'signed'
  const [agreements, setAgreements] = useState([]);
  const [paginationData, setPaginationData] = useState({});
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  // Fetch agreements with infinite query
  const {
    data: agreementsQuery,
    isLoading,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['get_user_agreements', statusFilter],
    queryFn: ({ pageParam = 1 }) =>
      getUserAgreements({
        page: pageParam,
        limit: PAGE_LIMIT,
        status: statusFilter,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages =
        lastPage?.data?.data?.totalPages || lastPage?.data?.totalPages;
      const items = lastPage?.data?.data?.data || lastPage?.data?.data || [];
      const nextPage = allPages.length + 1;

      if (totalPages) {
        return nextPage <= totalPages ? nextPage : undefined;
      }
      return items.length === PAGE_LIMIT ? nextPage : undefined;
    },
    refetchOnWindowFocus: false,
  });

  // Flatten infinite query pages
  useEffect(() => {
    if (!agreementsQuery?.pages) return;

    const flattened = agreementsQuery.pages.flatMap((page) => {
      return page?.data?.data?.data || page?.data?.data || page?.data || [];
    });

    // Ensure uniqueness based on ID
    const uniqueData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );
    setAgreements(uniqueData);

    const lastPage = agreementsQuery.pages[agreementsQuery.pages.length - 1];
    const lastPageData = lastPage?.data?.data || lastPage?.data || {};

    setPaginationData({
      totalPages:
        lastPageData.totalPages ||
        agreementsQuery.pages.length +
          (uniqueData.length % PAGE_LIMIT === 0 ? 1 : 0),
      currFetchedPage: Number(
        lastPageData.currentPage || agreementsQuery.pages.length,
      ),
    });
  }, [agreementsQuery]);

  // Handle clicking row/action
  const handleRowClick = (agreement) => {
    setSelectedAgreement(agreement);
    setIsSignModalOpen(true);
  };

  // Define Columns
  const columns = useContractsColumns({ statusFilter, handleRowClick });

  return (
    <Wrapper className="scrollBarStyles flex h-screen flex-col">
      {/* Header Section */}
      <div className="space-y-1">
        <SubHeader name="Contracts" />
        <p className="text-xs text-gray-500">
          Review, sign, and manage legal agreements offered by your enterprises.
        </p>
      </div>

      {/* Tabs Filter */}
      <Tabs
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-fit"
      >
        <TabsList className="border border-gray-200 bg-gray-50 p-1">
          <TabsTrigger value="not_signed">To Be Signed</TabsTrigger>
          <TabsTrigger value="signed">Already Signed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Table Area */}
      <div className="flex min-h-[calc(100vh-130px)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex flex-grow items-center justify-center py-20">
            <Loading />
          </div>
        ) : agreements.length === 0 ? (
          <div className="flex flex-grow flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 rounded-full bg-blue-50 p-6 text-[#288AF9]">
              {statusFilter === 'not_signed' ? (
                <Check size={48} />
              ) : (
                <FileText size={48} />
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {statusFilter === 'not_signed'
                ? 'All Caught Up!'
                : 'No Agreements Found'}
            </h3>
            <p className="my-2 max-w-sm text-sm leading-relaxed text-gray-500">
              {statusFilter === 'not_signed'
                ? 'You have signed all required agreements. Great job!'
                : "You don't have any signed agreements recorded in your account yet."}
            </p>
          </div>
        ) : (
          <InfiniteDataTable
            id="user-contracts-table"
            columns={columns}
            data={agreements}
            fetchNextPage={fetchNextPage}
            isFetching={isFetching}
            totalPages={paginationData?.totalPages}
            currFetchedPage={paginationData?.currFetchedPage}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      {/* Agreement Signature Modal */}
      {selectedAgreement && (
        <AgreementSignModal
          isOpen={isSignModalOpen}
          onClose={() => {
            setIsSignModalOpen(false);
            setSelectedAgreement(null);
          }}
          agreementDocUrl={
            selectedAgreement?.signedDocument?.documentSlug ||
            selectedAgreement?.generatedDocument?.documentSlug ||
            selectedAgreement?.signedDocument ||
            selectedAgreement?.generatedDocument
          }
          agreementId={selectedAgreement?.id}
          isReadOnly={
            statusFilter === 'signed' || !!selectedAgreement?.signedDocument
          }
          enterpriseName={
            selectedAgreement?.enterprise?.name ||
            selectedAgreement?.enterpriseId?.name ||
            'Company'
          }
          onSignComplete={() => {
            queryClient.invalidateQueries({
              queryKey: ['get_user_agreements'],
            });
          }}
        />
      )}
    </Wrapper>
  );
}
