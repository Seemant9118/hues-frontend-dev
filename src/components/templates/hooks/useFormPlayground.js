'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import { createCustomForm } from '@/services/Custom_Form_Services/CustomFormServices';

export function useFormPlayground(
  formType = 'CUSTOM',
  backUrl = '/dashboard/studio',
) {
  const router = useRouter();

  const [formName, setFormName] = useState(
    () => `${convertSnakeToTitleCase(formType)} Form`,
  );
  const [fields, setFields] = useState([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isAddFieldDialogOpen, setIsAddFieldDialogOpen] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmExitOpen, setIsConfirmExitOpen] = useState(false);

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

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

  const handleEditField = (index) => {
    const field = fields[index];
    if (!field) return;
    setEditingFieldIndex(index);
    setSelectedFieldType(field.type);
    setIsAddFieldDialogOpen(true);
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
        const createdId = res?.data?.id || res?.data?.formId || res?.id;
        setTimeout(() => {
          if (createdId) {
            router.push(
              `/dashboard/templates/custom-forms/${createdId}?tab=share`,
            );
          } else {
            router.push(backUrl);
          }
        }, 800);
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

  return {
    formName,
    setFormName,
    fields,
    setFields,
    isLibraryOpen,
    setIsLibraryOpen,
    isAddFieldDialogOpen,
    setIsAddFieldDialogOpen,
    selectedFieldType,
    editingFieldIndex,
    isSaving,
    isConfirmExitOpen,
    setIsConfirmExitOpen,
    handleDragOver,
    handleDrop,
    handleAddFieldFromLibrary,
    handleConfirmFieldConfig,
    handleMoveField,
    handleToggleRequired,
    handleDeleteField,
    handleEditField,
    handleSaveForm,
    handleCancel,
    handleConfirmExit,
  };
}
