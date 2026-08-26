'use client';

import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { GitGraph } from 'lucide-react';

export default function RulesEngineHeader({ isEditorOpen, onCreateRule }) {
  const possibleBreadcrumbs = [
    {
      id: 1,
      name: 'Rules Engine',
      path: '/dashboard/admin/rules-engine/',
      show: true,
    },
    {
      id: 2,
      name: 'Create Rule Engine',
      path: '/dashboard/admin/rules-engine/create',
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
          <Button size="sm" onClick={onCreateRule}>
            <GitGraph size={16} />
            Create Rule Engine
          </Button>
        </div>
      )}
    </div>
  );
}
