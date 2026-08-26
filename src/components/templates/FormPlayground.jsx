'use client';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import AddFieldDialog from '@/components/shared/AddFieldDialog';
import ComponentLibraryDrawer from '@/components/shared/ComponentLibraryDrawer';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createCustomForm } from '@/services/Custom_Form_Services/CustomFormServices';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  Save,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function FormPlayground({
  formType = 'CUSTOM',
  backUrl = '/dashboard/studio',
}) {
  const router = useRouter();

  // State
  const [formName, setFormName] = useState(
    `${convertSnakeToTitleCase(formType)} Form`,
  );
  const [fields, setFields] = useState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Open configuration dialog for new or existing field
  const handleAddFieldFromLibrary = (fieldType) => {
    setSelectedFieldType(fieldType);
    setEditingFieldIndex(null);
    setIsAddFieldDialogOpen(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (type) {
      handleAddFieldFromLibrary(type);
    }
  };

  // Confirm field configuration from AddFieldDialog
  const handleConfirmFieldConfig = (label, extraConfig) => {
    if (editingFieldIndex !== null) {
      // Edit existing field
      setFields((prev) =>
        prev.map((f, idx) =>
          idx === editingFieldIndex
            ? {
                ...f,
                label,
                ...extraConfig,
              }
            : f,
        ),
      );
      toast.success('Field updated');
    } else {
      // Add new custom field
      const fieldKey =
        label
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]/g, '')
          .slice(0, 30) || `field_${Date.now()}`;

      const newField = {
        id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        key: fieldKey,
        label,
        type: selectedFieldType || 'TEXT',
        kind: 'CUSTOM',
        required: false,
        visible: true,
        order: fields.length + 1,
        ...extraConfig,
      };

      setFields((prev) => [...prev, newField]);
      toast.success(`Added ${label} to playground`);
    }

    setIsAddFieldDialogOpen(false);
    setSelectedFieldType(null);
    setEditingFieldIndex(null);
  };

  // Field Reordering & Actions
  const handleMoveField = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;

    const newFields = [...fields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIdx];
    newFields[targetIdx] = temp;

    // Recalculate order values
    const reordered = newFields.map((f, idx) => ({ ...f, order: idx + 1 }));
    setFields(reordered);
  };

  const handleToggleRequired = (index) => {
    setFields((prev) =>
      prev.map((f, idx) =>
        idx === index ? { ...f, required: !f.required } : f,
      ),
    );
  };

  const handleDeleteField = (index) => {
    setFields((prev) => prev.filter((_, idx) => idx !== index));
    toast.info('Field removed');
  };

  // Save handler
  const handleSaveForm = async () => {
    if (fields.length === 0) {
      toast.error('Please add at least one field to the form before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const formKey =
        formType.toLowerCase().replace(/[^a-z0-9]/g, '') ||
        formName.toLowerCase().replace(/[^a-z0-9]/g, '') ||
        `custom_form_${Date.now()}`;

      const customFields = fields.map((f, idx) => ({
        key: f.key || `field_${idx + 1}`,
        label: f.label,
        type: f.type || 'TEXT',
        placeholder: f.placeholder || `Enter ${f.label}`,
        required: !!f.required,
        validation: f.validation || null,
        helpText: f.helpText || '',
        order: (idx + 1) * 100,
        visible: f.visible !== false,
        state: 'ACTIVE',
        ...(f.options && f.options.length > 0 ? { options: f.options } : {}),
      }));

      const payload = {
        formKey,
        name: formName,
        description: `${formName} custom form`,
        usageMode: 'BOTH',
        customFields,
      };

      const res = await createCustomForm(payload);

      if (res && res.status !== false && res.status !== 'error') {
        toast.success(`Form '${formName}' saved successfully!`);
        setTimeout(() => {
          router.push(backUrl);
        }, 1000);
      } else {
        toast.error(res?.message || 'Failed to save custom form.');
      }
    } catch (err) {
      toast.error('An error occurred while saving custom form.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    if (fields.length > 0) {
      setIsConfirmExitOpen(true);
    } else {
      router.push(backUrl);
    }
  };

  const handleConfirmExit = () => {
    setIsConfirmExitOpen(false);
    router.push(backUrl);
  };

  return (
    <div className="relative flex min-h-[85vh] flex-col">
      {/* Top Header Toolbar */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
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
              Drag and drop components from the library to build your form
              layout.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLibraryOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{isLibraryOpen ? 'Hide Library' : 'Component Library'}</span>
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveForm}
            disabled={isSaving || fields.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Form'}</span>
          </Button>
        </div>
      </div>

      {/* Main Playground Content Container */}
      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Playground Canvas Zone */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex-1 rounded-xl border-2 border-dashed p-6 transition-all ${
            fields.length === 0
              ? 'flex min-h-[450px] flex-col items-center justify-center border-neutral-300 bg-neutral-50/50'
              : 'space-y-4 border-primary/30 bg-white shadow-sm'
          }`}
        >
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-neutral-800">
                Form Playground is Empty
              </h3>
              <p className="mt-1 max-w-md text-xs text-neutral-500">
                Drag and drop field components from the right sidebar library
                onto this canvas, or click below to add your first field.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => handleAddFieldFromLibrary('TEXT')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition"
              >
                <Plus size={15} />
                <span>Add Custom Field</span>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Form Fields ({fields.length})
                </span>
                <span className="text-[11px] text-neutral-400">
                  Drag & reorder fields using controls below
                </span>
              </div>

              {/* Render Field Cards in Playground */}
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    className="group relative flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    {/* Left details */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-1 text-neutral-400">
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, 'up')}
                          disabled={idx === 0}
                          className="hover:text-neutral-700 disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <span className="text-[10px] font-bold text-neutral-500">
                          #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveField(idx, 'down')}
                          disabled={idx === fields.length - 1}
                          className="hover:text-neutral-700 disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-neutral-800">
                            {field.label}
                          </h4>
                          {field.required && (
                            <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600">
                            Type: {field.type}
                          </span>
                          {field.placeholder && (
                            <span>
                              Placeholder: &quot;{field.placeholder}&quot;
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Field Control Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleRequired(idx)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                          field.required
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                        }`}
                      >
                        {field.required ? 'Required' : 'Optional'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFieldType(field.type);
                          setEditingFieldIndex(idx);
                          setIsAddFieldDialogOpen(true);
                        }}
                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 transition hover:bg-neutral-100 hover:text-primary"
                        title="Edit Field Configuration"
                      >
                        <Sliders size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteField(idx)}
                        className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete Field"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Component Library Drawer */}
        <ComponentLibraryDrawer
          isOpen={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          onAddField={handleAddFieldFromLibrary}
        />
      </div>

      {/* Add / Edit Field Dialog */}
      <AddFieldDialog
        isOpen={isAddFieldDialogOpen}
        onClose={() => {
          setIsAddFieldDialogOpen(false);
          setSelectedFieldType(null);
          setEditingFieldIndex(null);
        }}
        fieldType={selectedFieldType}
        onConfirm={handleConfirmFieldConfig}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <Dialog open={isConfirmExitOpen} onOpenChange={setIsConfirmExitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved fields in your playground. Are you sure you want
              to exit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmExitOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmExit}
            >
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
