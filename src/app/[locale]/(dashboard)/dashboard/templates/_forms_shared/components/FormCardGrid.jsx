'use client';

import { FileText, Plus } from 'lucide-react';
import React from 'react';

import TemplateCard from '@/components/templates/TemplateCard';

export default function FormCardGrid({
  formsList = [],
  emptyLabel = 'No forms found',
  isCustomTab = false,
  activeMenu,
  setActiveMenu,
  onCardClick,
  onEdit,
  onDelete,
  onShare,
  onOpenCreateModal,
}) {
  if (formsList.length === 0 && !isCustomTab) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-neutral-800">
          {emptyLabel}
        </h3>
        <p className="mt-2 max-w-sm text-xs text-neutral-500">
          No system forms configured yet.
        </p>
      </div>
    );
  }

  if (formsList.length === 0 && isCustomTab) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileText className="h-8 w-8" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-neutral-800">
          {emptyLabel}
        </h3>
        <p className="mt-2 max-w-sm text-xs text-neutral-500">
          Start building a dynamic custom form layout from scratch.
        </p>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="mt-6 inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-primary"
        >
          <Plus size={14} />
          Create a new custom form
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {/* Dynamic Form Cards */}
      {formsList.map((form) => (
        <TemplateCard
          key={form.id}
          template={form}
          onClick={() => onCardClick(form)}
          onEdit={(id, e) => onEdit(form, e)}
          onShare={form.isCustom ? (id, e) => onShare(form, e) : undefined}
          onDelete={form.isCustom ? onDelete : undefined}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          editLabel="Edit Form"
          shareLabel="Share Form"
          deleteLabel="Delete Form"
        />
      ))}
    </div>
  );
}
