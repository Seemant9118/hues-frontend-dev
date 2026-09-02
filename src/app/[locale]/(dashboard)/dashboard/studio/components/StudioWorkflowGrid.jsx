'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';
import TemplateCard from '@/components/templates/TemplateCard';
import Loading from '@/components/ui/Loading';

export default function StudioWorkflowGrid({
  forms = [],
  isLoading = false,
  emptyMessage = 'No system forms found',
  activeMenu,
  setActiveMenu,
}) {
  const router = useRouter();

  const handleCardClick = (template) => {
    if (template.isCustom) {
      router.push(`/dashboard/studio/${template.id}?type=CUSTOM`);
    } else {
      router.push(`/dashboard/studio/${template.id}`);
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
        />
      ))}
    </div>
  );
}
