'use client';

import React from 'react';

import { Clock, LayoutGrid } from 'lucide-react';

export default function StudioTabHeaderControls() {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-end gap-3 border-b border-neutral-200 pb-3">
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5 font-medium text-neutral-500">
          <LayoutGrid size={16} />
          <span>Grid View</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>Sorted by last modified</span>
        </div>
      </div>
    </div>
  );
}
