import React from 'react';
import { Badge } from '@/components/ui/badge';

export function getWorkflowStatusBadge(def, activeVersionId = null) {
  const isCurrentlyActive =
    activeVersionId && String(def?.id) === String(activeVersionId);
  const status = (
    isCurrentlyActive
      ? 'ACTIVE'
      : def?.active
        ? 'ACTIVE'
        : def?.status || 'DRAFT'
  ).toUpperCase();

  switch (def?.status) {
    case 'ACTIVE':
      return (
        <Badge
          variant="outline"
          className="border-emerald-300 bg-emerald-50 font-mono text-[10px] font-bold uppercase text-emerald-700"
        >
          Active
        </Badge>
      );
    case 'PUBLISHED':
      return (
        <Badge
          variant="outline"
          className="border-blue-300 bg-blue-50 font-mono text-[10px] font-bold uppercase text-blue-700"
        >
          Published
        </Badge>
      );
    case 'DRAFT':
      return (
        <Badge
          variant="outline"
          className="border-amber-300 bg-amber-50 font-mono text-[10px] font-bold uppercase text-amber-700"
        >
          Draft
        </Badge>
      );
    case 'ARCHIVED':
      return (
        <Badge
          variant="outline"
          className="border-neutral-300 bg-neutral-100 font-mono text-[10px] font-bold uppercase text-neutral-700"
        >
          Archived
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="font-mono text-[10px]">
          {status}
        </Badge>
      );
  }
}
