import React from 'react';
import { Link } from '@/i18n/routing';
import { ChevronLeft, Check, Edit2, Save, EyeOff, Send } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import TemplateTypeModal from '@/components/Modals/TemplateTypeModal';

export default function TemplateBuilderHeader({
  templateId,
  templateName,
  setTemplateName,
  isEditingName,
  setIsEditingName,
  status,
  version,
  templateType,
  setTemplateType,
  lastSavedMsg,
  isTypeModalOpen,
  setIsTypeModalOpen,
  isSaving,
  saveText,
  publishText,
  handleSave,
  unpublishMutation,
}) {
  return (
    <>
      <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/templates/agreements"
              className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setIsEditingName(false)
                      }
                      className="rounded-md border border-blue-400 px-2 py-0.5 text-base font-bold text-neutral-800 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="group flex items-center gap-2">
                    <h1 className="text-lg font-bold text-neutral-800">
                      {templateName}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="rounded p-1 text-neutral-400 opacity-0 transition-all hover:bg-neutral-100 hover:text-neutral-700 group-hover:opacity-100"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                <span
                  className={`py-0.2 rounded border px-1.5 text-[10px] font-semibold uppercase ${
                    status.toLowerCase() === 'draft'
                      ? 'border-amber-200 bg-amber-50 text-amber-600'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {status}
                </span>
                <span>•</span>
                <span>{version}</span>
                <span>•</span>
                <button
                  onClick={() => setIsTypeModalOpen(true)}
                  className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-blue-600 transition hover:bg-blue-100"
                  title="Click to change template type"
                >
                  {templateType}
                </button>
                <span>•</span>
                <span>Last saved: {lastSavedMsg}</span>
              </div>
            </div>
          </div>
          <TabsList className="bg-neutral-100/80 p-1">
            <TabsTrigger value="builder" className="text-xs">
              Template Builder
            </TabsTrigger>
            <TabsTrigger
              value="share"
              disabled={!templateId || status.toLowerCase() === 'draft'}
              className="text-xs"
            >
              Share Agreement
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave('Draft')}
            disabled={isSaving}
          >
            <Save size={14} className="mr-1.5" /> {saveText}
          </Button>
          {status === 'Published' ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => unpublishMutation.mutate(templateId)}
              disabled={isSaving}
            >
              <EyeOff size={14} className="mr-1.5" />{' '}
              {unpublishMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => handleSave('Published')}
              disabled={isSaving}
            >
              <Send size={14} className="mr-1.5" /> {publishText}
            </Button>
          )}
        </div>
      </header>
      <TemplateTypeModal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        onSelect={(type) => {
          setTemplateType(type);
          setIsTypeModalOpen(false);
          // Toast will be managed in parent or directly inside modal if configured, but we can rely on parent state update.
          // Note: the original code had toast.success here, we will handle that in the parent's onSelect.
        }}
        selectedType={templateType}
        title="Change Template Type"
        description="Select a new type for this template"
      />
    </>
  );
}
