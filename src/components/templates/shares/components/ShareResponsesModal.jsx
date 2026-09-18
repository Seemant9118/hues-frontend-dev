'use client';

import { FileText } from 'lucide-react';
import React from 'react';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useShareResponses } from '../hooks/useShareResponses';
import { useShareResponsesColumns } from '../hooks/useShareResponsesColumns';

export default function ShareResponsesModal({ isOpen, onClose, shareId }) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useShareResponses(shareId, 10, isOpen);

  const dataItems = React.useMemo(
    () => data?.pages?.flatMap((page) => page?.data || []) || [],
    [data],
  );

  const stats = data?.pages?.[0]?.stats || {};
  const totalPages = data?.pages?.[0]?.totalPages || 1;

  const { columns } = useShareResponsesColumns(dataItems);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-[900px] flex-col overflow-hidden p-6">
        <DialogHeader className="mb-4 shrink-0 border-b border-neutral-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-neutral-800">
                Share Responses
              </DialogTitle>
              <p className="text-xs text-neutral-500">
                Viewing submissions for share link #{shareId}
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
          </div>
        ) : isError ? (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error?.message || 'Failed to load responses.'}
          </div>
        ) : !dataItems.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-12 text-center text-neutral-500">
            <FileText className="mb-2 h-8 w-8 text-neutral-300" />
            <p className="text-sm font-medium">No responses yet</p>
            <p className="text-xs">
              Responses submitted via this link will appear here.
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col space-y-4">
            <div className="grid shrink-0 grid-cols-4 gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
              <div className="text-center">
                <p className="text-xs text-neutral-500">Opened</p>
                <p className="text-lg font-bold text-neutral-800">
                  {stats.openedCount || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500">Submitted</p>
                <p className="text-lg font-bold text-emerald-600">
                  {stats.totalSubmittedResponseCount || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500">Incomplete</p>
                <p className="text-lg font-bold text-amber-600">
                  {stats.openButNotSubmittedCount || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500">Verified (Private)</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.privateVerifiedButNotSubmittedCount || 0}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-neutral-200">
              <InfiniteDataTable
                id="share-responses-table"
                columns={columns}
                data={dataItems}
                fetchNextPage={() => {
                  if (hasNextPage) {
                    fetchNextPage();
                  }
                }}
                isFetching={isFetching || isFetchingNextPage}
                totalPages={totalPages}
                currFetchedPage={data?.pages?.length || 1}
                getRowId={(row) => row.submissionId}
                bodyClassName="h-full overflow-auto"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
