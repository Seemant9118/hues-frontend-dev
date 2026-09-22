'use client';

import {
  convertSnakeToTitleCase,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
import { useDeveloperMode } from '@/context/DeveloperModeContext';
import {
  getFormConfig,
  saveFormConfig,
  resetFormConfig,
} from '@/services/Form_Config_Services/FormConfigServices';
import {
  getCustomForm,
  saveCustomForm,
  resetCustomForm,
} from '@/services/Custom_Form_Services/CustomFormServices';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReactSelect from 'react-select';
import {
  Asterisk,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  PlusCircle,
  RotateCcw,
  Save,
  Trash2,
  Wrench,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AddFieldDialog from './AddFieldDialog';
import ComponentLibraryDrawer from './ComponentLibraryDrawer';

export default function DynamicFormRenderer({
  module,
  fields,
  setFields,
  formData,
  onChange,
  disabled = false,
  errors = {},
  renderCustomField,
  filterFn,
  allowAddField = true,
  showSaveControls = true,
  gridCols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  baseVersion,
  etag,
  originalCustomFields = [],
  originalSystemFields = [],
  onSaveSuccess,
  isConfigurable = false,
  isCustom = false,
  customFormMeta = {},
}) {
  const { isDeveloperMode } = useDeveloperMode();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [editingFieldKey, setEditingFieldKey] = useState(null);
  const [editLabelText, setEditLabelText] = useState('');
  const [addFieldType, setAddFieldType] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const canEdit = isDeveloperMode && isConfigurable;

  // HTML5 Drag & Drop handlers for dropping components from library
  const handleDragOver = (e) => {
    if (!canEdit || !allowAddField) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOver) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e) => {
    if (!canEdit || !allowAddField) return;
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e) => {
    if (!canEdit || !allowAddField) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const droppedType = e.dataTransfer.getData('text/plain');
    if (droppedType) {
      setAddFieldType(droppedType);
    }
  };

  // Filter fields to render: in Dev Mode (Configurable), render ALL fields so they can be unhidden/edited.
  // In normal mode or non-configurable creation forms, only render fields that are marked visible.
  let fieldsToRender = canEdit
    ? [...fields].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [...fields]
        .filter((f) => f.visible)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (filterFn) {
    fieldsToRender = fieldsToRender.filter(filterFn);
  }

  // Handle reordering
  const moveField = (idx, direction) => {
    const currentField = fieldsToRender[idx];
    const targetField = fieldsToRender[idx + direction];
    if (!currentField || !targetField) return;

    const updated = fields.map((f) => {
      if (f.key === currentField.key) {
        return { ...f, order: targetField.order };
      }
      if (f.key === targetField.key) {
        return { ...f, order: currentField.order };
      }
      return f;
    });

    setFields(updated);
  };

  // Handle field deletion (custom fields) or hiding (system fields)
  const handleRemoveField = (fieldKey) => {
    const matched = fields.find((f) => f.key === fieldKey);
    if (!matched) return;

    if (matched.kind === 'SYSTEM') {
      // System fields cannot be deleted, but they can be hidden
      const updated = fields.map((f) => {
        if (f.key === fieldKey) {
          return { ...f, visible: false };
        }
        return f;
      });
      setFields(updated);
      toast.info(`System field '${matched.label}' hidden`);
    } else {
      // Custom fields can be deleted
      const updated = fields.filter((f) => f.key !== fieldKey);
      setFields(updated);
      toast.success(`Custom field '${matched.label}' removed`);
    }
  };

  // Handle Field Property Editing
  const handleStartRename = (field) => {
    setEditingFieldKey(field.key);
    setEditLabelText(field.label);
  };

  const handleSaveRename = (fieldKey) => {
    const updated = fields.map((f) => {
      if (f.key === fieldKey) {
        return { ...f, label: editLabelText };
      }
      return f;
    });
    setFields(updated);
    setEditingFieldKey(null);
  };

  const toggleRequired = (fieldKey) => {
    const updated = fields.map((f) => {
      if (f.key === fieldKey) {
        return { ...f, required: !f.required };
      }
      return f;
    });
    setFields(updated);
  };

  const toggleVisibility = (fieldKey) => {
    const updated = fields.map((f) => {
      if (f.key === fieldKey) {
        return { ...f, visible: !f.visible };
      }
      return f;
    });
    setFields(updated);
  };

  // Handle Adding New Custom Fields
  const handleAddField = (type) => {
    setIsLibraryOpen(false);
    setAddFieldType(type);
  };

  const handleConfirmAddField = (label, extraConfig = {}) => {
    const rawType =
      typeof addFieldType === 'object' ? addFieldType?.type : addFieldType;
    const typeStr = (rawType || 'TEXT').toUpperCase();

    const camelLabel = label
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (m) => m.toLowerCase())
      .replace(/[^a-zA-Z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const key = camelLabel
      ? `${camelLabel}${randomSuffix}`
      : `field${randomSuffix}`;

    const maxOrder = fields.reduce((max, f) => Math.max(max, f.order || 0), 0);

    const newCustomField = {
      key,
      label,
      type: typeStr,
      inputMode: 'USER',
      required: false,
      visible: true,
      order: maxOrder + 10,
      kind: 'CUSTOM',
      capabilities: {
        canRenameLabel: true,
        canHide: true,
        canReorder: true,
        canChangeRequired: true,
      },
      ...extraConfig,
    };

    setFields((prev) => [...prev, newCustomField]);
    setAddFieldType(null);
    toast.success(`Custom field '${label}' added`);
  };

  // Handle Saving Configuration to backend API
  const handleSaveConfiguration = async () => {
    try {
      const res = isCustom
        ? await saveCustomForm(
            module,
            fields,
            etag,
            customFormMeta,
            originalCustomFields,
          )
        : await saveFormConfig(
            module,
            fields,
            baseVersion,
            etag,
            originalCustomFields,
            originalSystemFields,
          );

      if (res.status) {
        toast.success(`Form layout for ${module} saved successfully!`);
        if (onSaveSuccess) onSaveSuccess();
      } else {
        toast.error(res.message || 'Failed to save configuration');
      }
    } catch (err) {
      toast.error('An error occurred while saving form configuration');
    }
  };

  // Revert layout to defaults
  const handleRevertConfiguration = async () => {
    if (isCustom) {
      await resetCustomForm(module, etag);
      const data = await getCustomForm(module);
      if (data?.fields || data?.customFields) {
        setFields(data.fields || data.customFields || []);
      }
    } else {
      await resetFormConfig(module, etag);
      const data = await getFormConfig(module);
      if (data?.fields) {
        setFields(data.fields);
      }
    }
    toast.info('Form configuration reverted to default');
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-xl transition-all ${
        canEdit
          ? `border-2 border-dashed ${
              isDraggingOver
                ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/20'
                : 'border-blue-400 bg-blue-50/20'
            } p-5`
          : 'p-0'
      }`}
    >
      {/* Dev Mode Editable Boundary Badge in Studio/Forms Details */}
      {canEdit && (
        <div className="absolute -top-3.5 left-4 z-10 flex select-none items-center gap-2 rounded-full bg-blue-500 px-3 py-1 text-[10px] font-bold text-white shadow-md">
          <Wrench className="h-3 w-3" />
          <span>
            Editable Form Boundary ({convertSnakeToTitleCase(module)})
          </span>
        </div>
      )}

      {/* Floating Library Button */}
      {canEdit && allowAddField && (
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="absolute -top-3.5 right-4 z-10 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-md transition-colors hover:bg-emerald-600"
        >
          <PlusCircle className="h-3 w-3" />
          <span>Add Fields</span>
        </button>
      )}

      {/* Drop Zone Visual Banner */}
      {isDraggingOver && (
        <div className="mb-4 flex animate-pulse items-center justify-center rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-100/70 p-4 text-xs font-bold text-emerald-800 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4 text-emerald-600" />
          <span>
            Drop field here to add to {convertSnakeToTitleCase(module)}
          </span>
        </div>
      )}

      {/* Fields Grid */}
      <div className={`grid items-start gap-5 ${gridCols}`}>
        {fieldsToRender.map((field, idx) => {
          // If a custom render function is provided, use it first
          const renderedField = renderCustomField
            ? renderCustomField(field)
            : null;

          return (
            <div
              key={field.key}
              className={`group relative flex flex-col justify-start rounded-lg p-2.5 transition-all ${
                canEdit
                  ? 'border border-dashed border-blue-200 bg-white hover:border-blue-400 hover:shadow-sm'
                  : ''
              } ${!field.visible && canEdit ? 'border-slate-300 bg-slate-50 opacity-40' : ''}`}
            >
              {/* Field Label */}
              <div className="mb-1.5 flex min-h-[1.25rem] items-center justify-between">
                <label className="flex items-center gap-0.5 text-[12px] font-bold text-slate-500">
                  {field.label}
                  {field.required && (
                    <Asterisk className="inline h-3 w-3 text-red-500" />
                  )}
                  {!field.visible && canEdit && (
                    <span className="ml-1.5 text-[9px] font-normal text-slate-400">
                      (Hidden)
                    </span>
                  )}
                </label>
              </div>

              {/* Input Render Block */}
              {renderedField ? (
                <div className="w-full">{renderedField}</div>
              ) : (
                <div className="w-full">
                  {/* Default fallback inputs depending on field type */}
                  {field.type === 'SELECT' ? (
                    <ReactSelect
                      isDisabled={
                        disabled || (!canEdit && field.inputMode === 'COMPUTED')
                      }
                      placeholder={
                        field.placeholder ||
                        field.validation?.placeholder ||
                        'Select option...'
                      }
                      options={field.options || field.validation?.options || []}
                      className="text-sm font-medium"
                      classNamePrefix="select"
                      styles={getStylesForSelectComponent()}
                      value={
                        (field.options || field.validation?.options || []).find(
                          (option) =>
                            option.value === (formData[field.key] || ''),
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        onChange(
                          field.key,
                          selectedOption ? selectedOption.value : '',
                        )
                      }
                    />
                  ) : field.type === 'RADIO' ? (
                    <div className="flex flex-col gap-2 pt-1">
                      {(field.options || field.validation?.options || []).map(
                        (opt, i) => (
                          <label
                            key={opt.value ?? i}
                            className="flex items-center gap-2 text-sm text-neutral-600"
                          >
                            <input
                              type="radio"
                              name={field.key}
                              value={opt.value}
                              checked={formData[field.key] === opt.value}
                              onChange={(e) =>
                                onChange(field.key, e.target.value)
                              }
                              disabled={
                                disabled ||
                                (!canEdit && field.inputMode === 'COMPUTED')
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            {opt.label}
                          </label>
                        ),
                      )}
                      {(field.options || field.validation?.options || [])
                        .length === 0 && (
                        <span className="text-xs italic text-neutral-400">
                          No options configured
                        </span>
                      )}
                    </div>
                  ) : field.type === 'CHECKBOX' ? (
                    <div className="flex flex-col gap-2 pt-1">
                      {(field.options || field.validation?.options || [])
                        .length > 0 ? (
                        (field.options || field.validation?.options || []).map(
                          (opt, i) => {
                            const values = Array.isArray(formData[field.key])
                              ? formData[field.key]
                              : formData[field.key]
                                ? [formData[field.key]]
                                : [];
                            const isChecked = values.includes(opt.value);
                            return (
                              <label
                                key={opt.value ?? i}
                                className="flex items-center gap-2 text-sm text-neutral-600"
                              >
                                <input
                                  type="checkbox"
                                  name={`${field.key}_${i}`}
                                  value={opt.value}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const newValues = e.target.checked
                                      ? [...values, opt.value]
                                      : values.filter((v) => v !== opt.value);
                                    onChange(field.key, newValues);
                                  }}
                                  disabled={
                                    disabled ||
                                    (!canEdit && field.inputMode === 'COMPUTED')
                                  }
                                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                />
                                {opt.label}
                              </label>
                            );
                          },
                        )
                      ) : (
                        <label className="flex items-center gap-2 text-sm text-neutral-600">
                          <input
                            type="checkbox"
                            checked={!!formData[field.key]}
                            onChange={(e) =>
                              onChange(field.key, e.target.checked)
                            }
                            disabled={
                              disabled ||
                              (!canEdit && field.inputMode === 'COMPUTED')
                            }
                            className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs text-neutral-500">
                            Enable
                          </span>
                        </label>
                      )}
                    </div>
                  ) : field.type === 'TEXTAREA' ? (
                    <Textarea
                      placeholder={
                        field.placeholder ||
                        field.validation?.placeholder ||
                        `Enter ${field.label}...`
                      }
                      disabled={
                        disabled || (!canEdit && field.inputMode === 'COMPUTED')
                      }
                      value={formData[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      className="min-h-[80px]"
                    />
                  ) : field.type === 'DATE' ? (
                    <Input
                      type="date"
                      disabled={
                        disabled || (!canEdit && field.inputMode === 'COMPUTED')
                      }
                      value={formData[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                    />
                  ) : field.type === 'FILE' ? (
                    <Input
                      type="file"
                      accept={
                        field.allowedTypes || field.validation?.allowedTypes
                      }
                      disabled={
                        disabled || (!canEdit && field.inputMode === 'COMPUTED')
                      }
                      onChange={(e) => onChange(field.key, e.target.files)}
                    />
                  ) : (
                    <Input
                      type={
                        field.type === 'NUMBER' ||
                        field.type === 'CURRENCY' ||
                        field.type === 'DECIMAL'
                          ? 'number'
                          : 'text'
                      }
                      min={field.validation?.min}
                      max={field.validation?.max}
                      placeholder={
                        field.placeholder ||
                        field.validation?.placeholder ||
                        `Enter ${field.label}...`
                      }
                      disabled={
                        disabled || (!canEdit && field.inputMode === 'COMPUTED')
                      }
                      value={formData[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              )}

              {/* Render Error */}
              {errors[field.key] && (
                <span className="mt-1 text-[10px] font-semibold text-red-500">
                  {errors[field.key]}
                </span>
              )}

              {/* Hover Edit Overlay (Developer Mode + Configurable Only) */}
              {canEdit && (
                <div className="absolute inset-0 flex flex-col justify-center rounded-lg border border-blue-400 bg-blue-50/90 p-3 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                  {editingFieldKey === field.key ? (
                    <div className="flex flex-col gap-1.5">
                      <input
                        type="text"
                        value={editLabelText}
                        onChange={(e) => setEditLabelText(e.target.value)}
                        className="h-7 rounded border px-2 text-xs focus:outline-blue-500"
                        placeholder="Label text"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingFieldKey(null)}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveRename(field.key)}
                          className="rounded bg-blue-500 px-2 py-1 text-[9px] font-bold text-white hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-[10px] font-bold tracking-wider text-slate-500">
                          {field.key} ({field.type})
                        </span>
                        <div className="flex items-center gap-1.5">
                          {/* Reordering Controls */}
                          {(field.kind === 'CUSTOM' ||
                            field.capabilities?.canReorder !== false) && (
                            <>
                              <button
                                onClick={() => moveField(idx, -1)}
                                disabled={idx === 0}
                                className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                                title="Move Up"
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => moveField(idx, 1)}
                                disabled={idx === fieldsToRender.length - 1}
                                className="rounded p-1 text-slate-500 hover:bg-slate-200 disabled:opacity-30"
                                title="Move Down"
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {(field.kind === 'CUSTOM' ||
                          field.capabilities?.canRenameLabel !== false) && (
                          <button
                            onClick={() => handleStartRename(field)}
                            className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[9px] font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit3 className="h-3 w-3" />
                            Rename
                          </button>
                        )}

                        {(field.kind === 'CUSTOM' ||
                          field.capabilities?.canChangeRequired !== false) && (
                          <button
                            onClick={() => toggleRequired(field.key)}
                            className={`flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-semibold transition-colors hover:bg-blue-50 ${
                              field.required
                                ? 'border-blue-300 bg-blue-100 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:text-blue-600'
                            }`}
                          >
                            <Asterisk className="h-3 w-3" />
                            {field.required ? 'Required' : 'Optional'}
                          </button>
                        )}

                        {(field.kind === 'CUSTOM' ||
                          field.capabilities?.canHide !== false) && (
                          <button
                            onClick={() => toggleVisibility(field.key)}
                            className={`flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-semibold transition-colors hover:bg-blue-50 ${
                              !field.visible
                                ? 'border-amber-300 bg-amber-100 text-amber-800'
                                : 'border-slate-200 bg-white text-slate-600 hover:text-blue-600'
                            }`}
                          >
                            {!field.visible ? (
                              <>
                                <Eye className="h-3 w-3" /> Show
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" /> Hide
                              </>
                            )}
                          </button>
                        )}

                        {field.kind === 'CUSTOM' && (
                          <button
                            onClick={() => handleRemoveField(field.key)}
                            className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Editor Save/Cancel CTAs */}
      {canEdit && showSaveControls && (
        <div className="mt-6 flex justify-end gap-3 rounded-lg border-t border-dashed border-slate-200 bg-white/50 p-2.5 pt-4">
          <button
            onClick={handleRevertConfiguration}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50 active:bg-slate-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSaveConfiguration}
            className="flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow transition-all hover:bg-blue-600 active:bg-blue-700"
          >
            <Save className="h-3.5 w-3.5" />
            Save Form Layout
          </button>
        </div>
      )}

      {/* Drawer */}
      <ComponentLibraryDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddField={handleAddField}
      />

      {/* Dialog for entering new field name */}
      <AddFieldDialog
        isOpen={!!addFieldType}
        onClose={() => setAddFieldType(null)}
        fieldType={addFieldType}
        onConfirm={handleConfirmAddField}
      />
    </div>
  );
}
