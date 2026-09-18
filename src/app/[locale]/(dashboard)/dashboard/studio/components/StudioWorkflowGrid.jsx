'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import TemplateCard from '@/components/templates/TemplateCard';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';

export default function StudioWorkflowGrid({
  forms = [],
  isLoading = false,
  emptyMessage = 'No system forms found',
  activeMenu,
  setActiveMenu,
  isCustomTab = false,
  onCreateNew,
}) {
  const router = useRouter();

  const handleCardClick = (template) => {
    if (template.isCustom || isCustomTab) {
      router.push(`/dashboard/studio/custom-workflows/${template.id}`);
    } else {
      router.push(`/dashboard/studio/system-workflows/${template.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loading />
      </div>
    );
  }

  if (forms.length === 0) {
    if (isCustomTab) {
      return (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-800">
            {emptyMessage}
          </h3>
          <p className="mt-2 max-w-sm text-xs text-neutral-500">
            Start building custom workflows with dynamic custom form nodes from
            scratch.
          </p>
          {onCreateNew && (
            <Button onClick={onCreateNew} size="sm">
              <Plus size={14} />
              Create a custom-workflow
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center text-xs text-neutral-500">
        <FileText className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
        <p className="font-semibold">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {forms.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => handleCardClick(template)}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onView={() => handleCardClick(template)}
          viewLabel="Open Workflow"
        />
      ))}
    </div>
  );
}
