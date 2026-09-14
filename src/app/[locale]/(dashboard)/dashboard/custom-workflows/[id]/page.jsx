'use client';

import DynamicCreateCustomWorkflow from '@/components/custom-workflows/components/DynamicCreateCustomWorkflow';
import WorkflowInstanceDetailModal from '@/components/custom-workflows/components/WorkflowInstanceDetailModal';
import { useCustomWorkflowTableColumns } from '@/components/custom-workflows/hooks/useCustomWorkflowTableColumns';
import { useCustomWorkflowPage } from '@/components/custom-workflows/hooks/useCustomWorkflowPage';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { Network, Plus, RefreshCw } from 'lucide-react';
import { useParams } from 'next/navigation';
import React from 'react';

const PAGE_LIMIT = 10;

export default function CustomWorkflowDynamicPage() {
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
          {/* SubHeader with Dynamic Title, Refresh, and Create CTA */}
          <SubHeader
            name={moduleTitle}
            className="sticky top-0 z-10 flex items-center justify-between bg-white"
          >
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant={'outline'}
                onClick={() => refetchInstances()}
                disabled={isFetching || isLoadingInstances}
                title="Refresh instances"
              >
                <RefreshCw
                  size={13}
                  className={isFetching ? 'animate-spin text-primary' : ''}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                size="sm"
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Create {moduleTitle}</span>
              </Button>
            </div>
          </SubHeader>

          {/* Table Area */}
          <div className="flex-1 overflow-y-auto pt-2">
            {isLoadingInstances && instances.length === 0 ? (
              <div className="py-20 text-center">
                <Loading />
              </div>
            ) : instances.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Network className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-base font-bold text-gray-900">
                  No {moduleTitle} Instances Found
                </h3>
                <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                  No execution responses have been created for this workflow
                  yet. Click below to create the first one.
                </p>
                <Button
                  type="button"
                  onClick={handleStartCreate}
                  className="mt-5 inline-flex items-center gap-2"
                  size="sm"
                >
                  <Plus size={15} />
                  <span>Create {moduleTitle}</span>
                </Button>
              </div>
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
