'use client';

import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import DynamicModal from '@/components/Modals/DynamicModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import React from 'react';
import { useItemServiceSections } from '../hooks/useItemServiceSections';

/**
 * Config-driven, section-grouped form for a single service line item.
 *
 * Props:
 *  - item          : the order line item object (must have item.serviceConfig)
 *  - onConfigChange: (updater: prev => newConfig) callback to update item.serviceConfig
 *  - errors        : error map for this item's serviceConfig fields
 */
export default function ServiceItemDynamicStep({
  item,
  onConfigChange,
  errors = {},
}) {
  const {
    sections,
    getValue,
    handleChange,
    addOptionField,
    setAddOptionField,
    newOption,
    setNewOption,
    editingOption,
    setEditingOption,
    handleAddNewOption,
    handleEditOption,
    handleDeleteOption,
  } = useItemServiceSections({
    serviceConfig: item.serviceConfig,
    onConfigChange,
  });

  if (!item.serviceConfig || Object.keys(item.serviceConfig).length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No configurable fields available for this service.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => {
        const isGroupFullWidth =
          section.fields.length > 2 ||
          section.fields.some((f) => f.type === 'textarea');

        return (
          <div
            key={section.key}
            className={cn(
              'flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all',
              isGroupFullWidth ? 'col-span-full' : 'col-span-1',
            )}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-[15px] font-bold text-foreground">
                  {section.label}
                </h3>
              </div>
              {section.fields.some((f) => f.required) && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Required
                </span>
              )}
            </div>

            {/* Fields Grid */}
            <div
              className={cn(
                'grid gap-x-6 gap-y-4 pt-2',
                section.fields.length === 1
                  ? 'grid-cols-1'
                  : 'grid-cols-1 md:grid-cols-2',
              )}
            >
              {section.fields.map((field) => {
                const isFullWidthField =
                  field.type === 'textarea' ||
                  field.name.includes('whats') ||
                  field.name.includes('requirement');

                return (
                  <div
                    key={field.name}
                    className={cn(isFullWidthField && 'md:col-span-full')}
                  >
                    <FieldRenderer
                      variant="inline"
                      field={field}
                      value={getValue(field.name)}
                      onChange={(name, val, fieldMeta) =>
                        handleChange(name, val, fieldMeta)
                      }
                      error={errors?.[field.name]}
                      enableOptionCrud={
                        field.type === 'select' || field.type === 'multi-select'
                      }
                      onEditOption={(option, fieldMeta) => {
                        setEditingOption({ option, field: fieldMeta });
                        setNewOption({ label: option.label, description: '' });
                      }}
                      onDeleteOption={handleDeleteOption}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Add Option Modal ─────────────────────────────────────────────── */}
      {addOptionField && (
        <DynamicModal
          isOpen
          title={`Add Option – ${addOptionField.label}`}
          onClose={() => setAddOptionField(null)}
          buttons={[
            {
              label: 'Cancel',
              variant: 'outline',
              onClick: () => setAddOptionField(null),
            },
            { label: 'Add', onClick: handleAddNewOption },
          ]}
        >
          <div className="space-y-2">
            <Label>Name / Value</Label>
            <Input
              value={newOption.label}
              onChange={(e) =>
                setNewOption((prev) => ({ ...prev, label: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={newOption.description}
              onChange={(e) =>
                setNewOption((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </DynamicModal>
      )}

      {/* ── Edit Option Modal ────────────────────────────────────────────── */}
      {editingOption && (
        <DynamicModal
          isOpen
          title={`Edit Option – ${editingOption.field.label}`}
          onClose={() => {
            setEditingOption(null);
            setNewOption({ label: '', description: '' });
          }}
          buttons={[
            {
              label: 'Cancel',
              variant: 'outline',
              onClick: () => {
                setEditingOption(null);
                setNewOption({ label: '', description: '' });
              },
            },
            { label: 'Save', onClick: () => handleEditOption() },
          ]}
        >
          <div className="space-y-2">
            <Label>Name / Value</Label>
            <Input
              value={newOption.label}
              onChange={(e) =>
                setNewOption((prev) => ({ ...prev, label: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={newOption.description}
              onChange={(e) =>
                setNewOption((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
        </DynamicModal>
      )}
    </div>
  );
}
