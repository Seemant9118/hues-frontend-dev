'use client';

import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import React from 'react';

export default function CustomWorkflowPageHeader({
  moduleTitle = 'Custom Workflow',
  onRefresh,
  onCreate,
  isRefreshing = false,
  isFetching = false,
}) {
  return (
    <SubHeader
      name={moduleTitle}
      className="sticky top-0 z-10 flex items-center justify-between bg-white"
    >
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={isFetching || isRefreshing}
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
          onClick={onCreate}
          className="inline-flex items-center gap-1.5"
        >
          <Plus size={15} />
          <span>Create {moduleTitle}</span>
        </Button>
      </div>
    </SubHeader>
  );
}
