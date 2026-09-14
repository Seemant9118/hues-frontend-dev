'use client';

import { Button } from '@/components/ui/button';
import { Network, Plus } from 'lucide-react';
import React from 'react';

export default function CustomWorkflowEmptyState({
  moduleName = 'Workflow',
  title,
  description,
  onCreate,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Network className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-gray-900">
        {title || `No ${moduleName} Instances Found`}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
        {description ||
          `No execution responses have been created for this workflow yet. Click below to create the first one.`}
      </p>
      {onCreate && (
        <Button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2"
          size="sm"
        >
          <Plus size={15} />
          <span>Create {moduleName}</span>
        </Button>
      )}
    </div>
  );
}
