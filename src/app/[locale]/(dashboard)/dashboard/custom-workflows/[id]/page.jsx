'use client';

import CustomWorkflowEmptyState from '@/components/custom-workflows/components/CustomWorkflowEmptyState';
import CustomWorkflowPageHeader from '@/components/custom-workflows/components/CustomWorkflowPageHeader';
import DynamicCreateCustomWorkflow from '@/components/custom-workflows/components/DynamicCreateCustomWorkflow';
import WorkflowInstanceDetailModal from '@/components/custom-workflows/components/WorkflowInstanceDetailModal';
import { useCustomWorkflowPage } from '@/components/custom-workflows/hooks/useCustomWorkflowPage';
import { useCustomWorkflowTableColumns } from '@/components/custom-workflows/hooks/useCustomWorkflowTableColumns';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import Loading from '@/components/ui/Loading';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useParams } from 'next/navigation';
import React, { Suspense } from 'react';

const PAGE_LIMIT = 10;

function CustomWorkflowDynamicPageContent() {
  const params = useParams();
  const definitionId = params?.id;

  const {
    definition,
    isLoadingDefinition,
    instances,
    paginationData,
    isLoadingInstances,
    isFetching,
    fetchNextPage,
    refetchInstances,
    isCreating,
    handleStartCreate,
    handleCancelCreate,
    handleCreateSuccess,
    selectedInstance,
    isInspectOpen,
    handleInspect,
    handleCloseInspect,
  } = useCustomWorkflowPage({ definitionId, limit: PAGE_LIMIT });

  const columns = useCustomWorkflowTableColumns({
    onInspect: handleInspect,
  });

  const moduleTitle = definition?.name || 'Custom Workflow';

  return (
    <ProtectedWrapper permissionCode="permission:view-dashboard">
      {isLoadingDefinition ? (
        <div className="flex h-screen items-center justify-center">
          <Loading />
        </div>
      ) : isCreating ? (
        <Wrapper className="h-screen overflow-hidden">
          <DynamicCreateCustomWorkflow
            definition={definition}
            definitionId={definitionId}
            onCancel={handleCancelCreate}
            onSuccess={handleCreateSuccess}
          />
        </Wrapper>
      ) : (
        <Wrapper className="flex h-screen flex-col overflow-hidden">
          {/* Header with Title, Refresh, and Create CTA */}
          <CustomWorkflowPageHeader
            moduleTitle={moduleTitle}
            onRefresh={() => refetchInstances()}
            onCreate={handleStartCreate}
            isRefreshing={isLoadingInstances}
            isFetching={isFetching}
          />

          {/* Table Area */}
          <div className="flex-1 overflow-y-auto pt-2">
            {isLoadingInstances && instances.length === 0 ? (
              <div className="py-20 text-center">
                <Loading />
              </div>
            ) : instances.length === 0 ? (
              <CustomWorkflowEmptyState
                moduleName={moduleTitle}
                onCreate={handleStartCreate}
              />
            ) : (
              <InfiniteDataTable
                id={`custom-workflow-${definitionId}-instances-table`}
                columns={columns}
                data={instances}
                fetchNextPage={fetchNextPage}
                isFetching={isFetching}
                totalPages={paginationData.totalPages}
                currFetchedPage={paginationData.currFetchedPage}
                onRowClick={(row) => handleInspect(row)}
              />
            )}
          </div>

          {/* Inspector Detail Modal */}
          <WorkflowInstanceDetailModal
            isOpen={isInspectOpen}
            onClose={handleCloseInspect}
            instance={selectedInstance}
          />
        </Wrapper>
      )}
    </ProtectedWrapper>
  );
}

export default function CustomWorkflowDynamicPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loading />
        </div>
      }
    >
      <CustomWorkflowDynamicPageContent />
    </Suspense>
  );
}
