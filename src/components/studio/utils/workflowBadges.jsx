import { Badge } from '@/components/ui/badge';
import React from 'react';

export function getWorkflowStatusBadge(def) {
  const status = (
    def?.active ? 'ACTIVE' : def?.status || 'DRAFT'
  ).toUpperCase();

  switch (status) {
    case 'ACTIVE':
    case 'PUBLISHED':
      return (
        <Badge
          variant="outline"
          className="border-emerald-300 bg-emerald-50 font-mono text-[10px] font-bold uppercase text-emerald-700"
        >
          Active
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
          className="border-amber-800 bg-amber-950 font-mono text-[10px] font-bold uppercase text-amber-100"
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
