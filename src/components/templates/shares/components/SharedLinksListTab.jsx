'use client';

import { Button } from '@/components/ui/button';
import InfiniteDataTable from '@/components/table/infinite-data-table';
import { usePermission } from '@/hooks/usePermissions';
import { Link as LinkIcon, Plus, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AgreementShareModal from '@/components/Modals/AgreementShareModal';
import { useShareLinksList } from '../hooks/useShareLinksList';
import { useSharedLinksColumns } from '../hooks/useSharedLinksColumns';
import FormShareModal from './FormShareModal';
import ShareResponsesModal from './ShareResponsesModal';

export default function SharedLinksListTab({
  resourceType,
  resourceId,
  customForm,
  agreement,
}) {
  const { hasPermission } = usePermission();
  const canManageShares =
    hasPermission('permission:resource-share-manage') || true;

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedShareIdForResponses, setSelectedShareIdForResponses] =
    useState(null);

  const { data, isLoading, isError, error, refetch } = useShareLinksList(
    resourceType,
    resourceId,
  );

  const handleCopyLink = (shareUrl) => {
    if (!shareUrl) {
      toast.error('Share link is not available.');
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const { columns } = useSharedLinksColumns({
    handleCopyLink,
    setSelectedShareIdForResponses,
  });

  if (!canManageShares) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-neutral-800">
          Sharing Permission Required
        </h3>
        <p className="mt-1 max-w-sm text-xs text-neutral-500">
          You do not have permission to manage share links for this resource.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-sm font-bold text-neutral-800">Shared Links</h2>
          <p className="text-xs text-neutral-500">
            Manage links used to share this resource.
          </p>
        </div>
        <Button
          onClick={() => setIsShareModalOpen(true)}
          size="sm"
          className="gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          Create New Share Link
        </Button>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-red-600">
            {error?.message || 'Failed to load share links.'}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <LinkIcon className="mb-4 h-10 w-10 text-neutral-300" />
            <h3 className="text-sm font-bold text-neutral-800">
              No share links found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-neutral-500">
              You haven&apos;t created any share links for this resource yet.
              Create one to start sharing.
            </p>
            <Button
              onClick={() => setIsShareModalOpen(true)}
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
            >
              <Plus size={14} />
              Create Link
            </Button>
          </div>
        ) : (
          <InfiniteDataTable
            id="shared-links-table"
            columns={columns}
            data={data.data}
            fetchNextPage={() => {}}
            isFetching={isLoading}
            totalPages={1}
            currFetchedPage={1}
            getRowId={(row) => row.shareId}
            bodyClassName="max-h-[500px]"
          />
        )}
      </div>

      {resourceType === 'CUSTOM_FORM' && (
        <FormShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          customForm={customForm}
          onSuccess={() => {
            setIsShareModalOpen(false);
            refetch();
          }}
        />
      )}

      {resourceType === 'AGREEMENT' && (
        <AgreementShareModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            refetch();
          }}
          agreement={agreement}
        />
      )}

      {selectedShareIdForResponses && (
        <ShareResponsesModal
          isOpen={!!selectedShareIdForResponses}
          onClose={() => setSelectedShareIdForResponses(null)}
          shareId={selectedShareIdForResponses}
        />
      )}
    </div>
  );
}
