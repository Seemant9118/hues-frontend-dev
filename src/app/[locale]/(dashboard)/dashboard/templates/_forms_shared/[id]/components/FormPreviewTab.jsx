'use client';

import {
  FileText,
  Package,
  RotateCcw,
  Save,
  Sliders,
  Wrench,
} from 'lucide-react';
import React from 'react';

import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { ITEM_FIELD_KEYS } from '../hooks/useFormDetailsConfig';

export default function FormPreviewTab({
  isDeveloperMode,
  setDeveloperMode,
  config,
  moduleId,
  titleName,
  isCustomForm,
  fields,
  setFields,
  formData,
  handleFieldChange,
  headerFields,
  itemFields,
  customFields,
  initialSystemFields,
  initialCustomFields,
  isSaving,
  handleSaveFormLayout,
  handleResetDefaults,
  refetch,
}) {
  const isCustom = isCustomForm || !!config?.isCustom;
  const currentModule = config?.module || moduleId;

  return (
    <div className="space-y-4">
      {/* Developer Mode Banner */}
      {isDeveloperMode ? (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>
              <strong>Developer Mode Active:</strong> Edit labels, field
              visibility, constraint requirements, reorder elements, or add
              custom fields below section by section.
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800">
          <span>
            To customize section layout boundaries or add custom fields,
            activate <strong>Developer Mode</strong>.
          </span>
          <button
            type="button"
            onClick={() => setDeveloperMode(true)}
            className="rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-bold text-white shadow hover:bg-amber-700"
          >
            Enable Dev Mode
          </button>
        </div>
      )}

      {/* Section 1: General & Header Details */}
      {headerFields.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <FileText className="h-4 w-4 text-primary" />
              General & Header Information
            </h4>
            <span className="text-xs text-neutral-400">
              {headerFields.length}{' '}
              {headerFields.length === 1 ? 'field' : 'fields'}
            </span>
          </div>
          <DynamicFormRenderer
            module={currentModule}
            fields={fields}
            setFields={setFields}
            formData={formData}
            onChange={handleFieldChange}
            filterFn={(f) =>
              f.kind === 'SYSTEM' && !ITEM_FIELD_KEYS.includes(f.key)
            }
            allowAddField={false}
            showSaveControls={false}
            isConfigurable={true}
            isCustom={isCustom}
            customFormMeta={config}
            baseVersion={config?.baseVersion}
            etag={config?.etag}
            originalCustomFields={initialCustomFields}
            originalSystemFields={initialSystemFields}
            onSaveSuccess={() => refetch()}
          />
        </div>
      )}

      {/* Section 2: Line Item & Calculation Details */}
      {itemFields.length > 0 && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
            <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <Package className="h-4 w-4 text-primary" />
              Line Item & Calculation Information
            </h4>
            <span className="text-xs text-neutral-400">
              {itemFields.length} {itemFields.length === 1 ? 'field' : 'fields'}
            </span>
          </div>
          <DynamicFormRenderer
            module={currentModule}
            fields={fields}
            setFields={setFields}
            formData={formData}
            onChange={handleFieldChange}
            filterFn={(f) =>
              f.kind === 'SYSTEM' && ITEM_FIELD_KEYS.includes(f.key)
            }
            allowAddField={false}
            showSaveControls={false}
            isConfigurable={true}
            isCustom={isCustom}
            customFormMeta={config}
            baseVersion={config?.baseVersion}
            etag={config?.etag}
            originalCustomFields={initialCustomFields}
            originalSystemFields={initialSystemFields}
            onSaveSuccess={() => refetch()}
          />
        </div>
      )}

      {/* Section 3: Custom & Additional Fields */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-3">
          <h4 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
            <Sliders className="h-4 w-4 text-primary" />
            Custom & Additional Fields
          </h4>
          <span className="text-xs text-neutral-400">
            {customFields.length}{' '}
            {customFields.length === 1 ? 'field' : 'fields'}
          </span>
        </div>
        <DynamicFormRenderer
          module={currentModule}
          fields={fields}
          setFields={setFields}
          formData={formData}
          onChange={handleFieldChange}
          filterFn={(f) =>
            f.kind === 'CUSTOM' || isCustomForm || !!config?.isCustom
          }
          allowAddField={true}
          showSaveControls={false}
          isConfigurable={true}
          isCustom={isCustom}
          customFormMeta={config}
          baseVersion={config?.baseVersion}
          etag={config?.etag}
          originalCustomFields={initialCustomFields}
          originalSystemFields={initialSystemFields}
          onSaveSuccess={() => refetch()}
        />
      </div>

      {/* Unified Single Save Form Layout CTA Bar */}
      {isDeveloperMode && (
        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-blue-200 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Wrench className="h-4 w-4 shrink-0 text-blue-600" />
            <span>
              Saving will update system field overrides and custom fields for
              the entire form ({titleName}).
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSaveFormLayout}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save Form Layout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
