'use client';

import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function PlaygroundHeader({
  formName,
  setFormName,
  formType,
  onCancel,
  isLibraryOpen,
  setIsLibraryOpen,
  onSave,
  isSaving,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 transition hover:bg-neutral-100"
          title="Back / Cancel"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="-ml-1 rounded border-b border-transparent px-1 text-base font-bold text-neutral-800 hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {formType}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Drag and drop components from the library to build your form layout.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsLibraryOpen((prev) => !prev)}
          className="gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>{isLibraryOpen ? 'Hide Library' : 'Component Library'}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={onSave}
          className="gap-1.5"
        >
          <Save size={14} />
          <span>{isSaving ? 'Saving...' : 'Save Custom Form'}</span>
        </Button>
      </div>
    </div>
  );
}
