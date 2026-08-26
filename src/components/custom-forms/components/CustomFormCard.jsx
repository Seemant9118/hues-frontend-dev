'use client';

import React from 'react';
import { ArrowRight, FileText, Layers } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export const CustomFormCard = ({ form }) => {
  const router = useRouter();

  const handleFillForm = (e) => {
    e.stopPropagation();
    router.push(`/dashboard/custom-forms/${form.id}`);
  };

  return (
    <div
      onClick={handleFillForm}
      className="flex cursor-pointer flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <FileText size={18} />
          </div>
          <Badge className="bg-neutral-100 font-mono text-[10px] uppercase text-neutral-600 hover:bg-neutral-100">
            {form.version}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="mt-4 text-sm font-bold text-neutral-800 transition-colors group-hover:text-blue-600">
          {form.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.25rem] text-xs text-neutral-500">
          {form.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Layers size={13} />
          <span>{form.fieldsCount} Fields</span>
        </div>

        <button
          type="button"
          onClick={handleFillForm}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-all hover:gap-2 group-hover:underline"
        >
          <span>Fill Form</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default CustomFormCard;
