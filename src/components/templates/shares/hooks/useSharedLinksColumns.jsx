import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Copy, Globe, Lock, MoreHorizontal } from 'lucide-react';
import React, { useMemo } from 'react';
import ConfirmAction from '@/components/Modals/ConfirmAction';
import { revokeResourceShare } from '@/services/Resource_Share_Services/ResourceShareServices';

export const useSharedLinksColumns = ({
  handleCopyLink,
  setSelectedShareIdForResponses,
}) => {
  const columns = useMemo(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const share = row.original;
          return (
            <div className="flex items-center gap-2">
              {share.sharingType === 'PUBLIC' ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Globe size={14} />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Lock size={14} />
                </div>
              )}
              <div>
                <div className="text-[13px] font-semibold text-neutral-900">
                  {share.sharingType === 'PUBLIC'
                    ? 'Public Link'
                    : 'Private Link'}
                </div>
                <div className="font-mono text-[11px] text-neutral-500">
                  ID: {share.shareId}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status & Expiry',
        cell: ({ row }) => {
          const share = row.original;
          return (
            <div className="flex flex-col items-start gap-1.5">
              <Badge
                variant="secondary"
                className={
                  share.status === 'ACTIVE'
                    ? 'border-emerald-200/50 bg-emerald-100 text-emerald-700'
                    : 'border-red-200/50 bg-red-100 text-red-700'
                }
              >
                {share.status}
              </Badge>
              {share.expiresAt && (
                <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                  <Calendar size={12} />
                  Exp: {new Date(share.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'stats',
        header: 'Stats',
        cell: ({ row }) => {
          const share = row.original;
          return (
            <div className="flex items-center gap-4 text-xs">
              <div className="text-center">
                <div className="mb-0.5 text-neutral-500">Opened</div>
                <div className="font-semibold text-neutral-900">
                  {share.stats?.openedCount || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="mb-0.5 text-neutral-500">Submitted</div>
                <div className="font-semibold text-emerald-600">
                  {share.stats?.totalSubmittedResponseCount || 0}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => {
          const share = row.original;
          return (
            <span className="text-[12px] text-neutral-500">
              {new Date(share.createdAt).toLocaleString()}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const share = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-neutral-500"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => handleCopyLink(share.shareUrl)}
                    className="cursor-pointer gap-2"
                  >
                    <Copy size={14} /> Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      setSelectedShareIdForResponses(share.shareId)
                    }
                    className="cursor-pointer gap-2 text-blue-600 focus:bg-blue-50 focus:text-blue-700"
                  >
                    <Calendar size={14} /> View Responses
                  </DropdownMenuItem>
                  {share.status === 'ACTIVE' && (
                    <>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <ConfirmAction
                          deleteCta="Revoke Link"
                          cancelCta="Cancel"
                          infoText="Are you sure you want to revoke this share link? It will immediately become inactive."
                          id={share.shareId}
                          type="share"
                          invalidateKey="shareLinks"
                          mutationKey="revokeShare"
                          mutationFunc={async ({ id }) => {
                            const res = await revokeResourceShare(id);
                            if (res?.status === false) {
                              throw new Error(
                                res?.message || 'Failed to revoke share link.',
                              );
                            }
                            return res;
                          }}
                          successMsg="Share link revoked successfully."
                        />
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [handleCopyLink, setSelectedShareIdForResponses],
  );

  return { columns };
};
