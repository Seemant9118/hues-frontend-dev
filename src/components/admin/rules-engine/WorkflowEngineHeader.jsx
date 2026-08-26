'use client';

import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function WorkflowEngineHeader({
  isEditorOpen,
  onCreateWorkflow,
}) {
  const possibleBreadcrumbs = [
    {
      id: 1,
      name: 'Workflow Engine',
      path: '/dashboard/work-flow-engine/',
      show: true,
    },
    {
      id: 2,
      name: 'Workflow Canvas Editor',
      path: '/dashboard/work-flow-engine/create',
      show: isEditorOpen,
    },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b bg-white pb-3 pt-4">
      <div className="flex items-center gap-4">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={possibleBreadcrumbs} />
      </div>

      {!isEditorOpen && (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onCreateWorkflow}>
            <Plus size={16} />
            New Workflow Definition
          </Button>
        </div>
      )}
    </div>
  );
}
