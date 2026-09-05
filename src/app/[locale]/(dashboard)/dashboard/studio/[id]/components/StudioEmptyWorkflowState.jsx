'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Workflow } from 'lucide-react';

export default function StudioEmptyWorkflowState({ targetModule = 'ORDER' }) {
  return (
    <Card className="flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
        <Workflow className="h-8 w-8" />
      </div>

      <h3 className="mt-4 text-base font-bold text-gray-900 sm:text-lg">
        No Workflows Found for {targetModule}
      </h3>

      <p className="mt-1.5 max-w-md text-xs text-muted-foreground">
        There are currently no active or draft workflow definitions configured
        for module{' '}
        <strong className="font-semibold text-gray-800">{targetModule}.</strong>
      </p>
    </Card>
  );
}
