'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkflowVersionsList } from '@/hooks/workflows/useWorkflowBuilder';
import { CheckCircle2, GitCommit, PlayCircle } from 'lucide-react';
import moment from 'moment';

export default function WorkflowVersionHistoryDrawer({
  isOpen,
  onClose,
  definition,
  onActivateVersion,
  isActivating,
}) {
  const definitionId = definition?.id;
  const { data: versions = [], isLoading } =
    useWorkflowVersionsList(definitionId);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5 text-primary" />
            Version History
          </SheetTitle>
          <SheetDescription>
            Workflow:{' '}
            <span className="font-semibold text-gray-900">
              {definition?.name}
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!isLoading && versions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No version history available yet.
            </p>
          )}

          {!isLoading &&
            versions.map((ver) => {
              const isActive = definition?.activeVersionId === ver.id;
              const isDraft = ver.status === 'DRAFT' || ver.version === 0;

              return (
                <div
                  key={ver.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500'
                      : 'bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-900">
                        {isDraft ? 'Draft (v0)' : `v${ver.version}`}
                      </span>
                      {isActive && (
                        <Badge className="bg-emerald-600 text-white">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                          Version
                        </Badge>
                      )}
                      {!isActive && !isDraft && (
                        <Badge variant="outline">Published</Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {ver.publishedAt && (
                      <p>
                        Published:{' '}
                        {moment(ver.publishedAt).format('MMM D, YYYY h:mm A')}
                      </p>
                    )}
                    <p>Steps count: {ver.graph?.steps?.length ?? 0}</p>
                  </div>

                  {!isActive && !isDraft && (
                    <div className="mt-3 flex justify-end">
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={isActivating}
                        onClick={() =>
                          onActivateVersion({
                            id: definitionId,
                            versionId: ver.id,
                          })
                        }
                      >
                        <PlayCircle className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                        Activate for New Records
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
