'use client';

import React from 'react';
import { Plus } from 'lucide-react';

export default function CreateNewFormCard({
  onClick,
  title = 'Create new form',
  description = 'Start building a customized dynamic form from scratch',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-52 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 p-6 text-center transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-200 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:ring-primary">
        <Plus className="h-6 w-6 text-neutral-500 transition-colors group-hover:text-primary" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-neutral-800 transition-colors group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-1 text-xs text-neutral-500">{description}</p>
    </button>
  );
}
