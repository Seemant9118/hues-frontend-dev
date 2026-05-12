import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import DynamicModal from '@/components/Modals/DynamicModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import React from 'react';
import { useServiceSections } from '../hooks/useServiceSections';

export default function DynamicServiceStep({
  stepKey,
  // sectionTitle,
  // translationKey,
  configFields,
  isConfigLoading,
  formData,
  setFormData,
  errors,
  setErrors,
  staticSections,
  // translation,
}) {
  const {
    sections,
    // enabledSections,
    // toggleSection,
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
  } = useServiceSections({
    stepKey,
    configFields,
    formData,
    setFormData,
  });

  const hasStaticSections =
    Array.isArray(staticSections) && staticSections.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {hasStaticSections && (
        <div className="flex flex-col gap-4">
          {staticSections.map((section) => (
            <div
              key={section.key}
              className={cn(
                'flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all',
                section.fullWidth ? 'col-span-full' : 'col-span-1',
              )}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-[15px] font-bold text-foreground">
                    {section.label}
                  </h3>
                </div>
                {section.required && (
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                    Required Section
                  </span>
                )}
              </div>
              {section.content}
            </div>
          ))}
        </div>
      )}

      {isConfigLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-muted/50"
            />
          ))}
        </div>
      )}

      {!isConfigLoading && sections.length === 0 && !hasStaticSections && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            No configurable fields available for this step.
          </p>
        </div>
      )}

      {!isConfigLoading && sections.length > 0 && (
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
                    {/* <div className="h-2 w-2 rounded-full bg-primary" /> */}
                    <h3 className="font-sans text-[15px] font-bold text-foreground">
                      {section.label}
                    </h3>
                  </div>
                  {section.fields.some((f) => f.required) && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
                      Required Section
                    </span>
                  )}
                </div>

                {/* Grid for Fields within this Section */}
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
                          field={{
                            ...field,
                            disabled: field.disabled,
                          }}
                          value={
                            formData?.defaultFieldsWithValues?.[field.name]
                              ?.defaultValue
                          }
                          onChange={(name, val, fieldMeta) => {
                            handleChange(name, val, fieldMeta);
                            if (errors?.[name]) {
                              setErrors?.((prev) => ({
                                ...prev,
                                [name]: undefined,
                              }));
                            }
                          }}
                          error={errors?.[field.name]}
                          formData={formData}
                          enableOptionCrud={field.type === 'select'}
                          onEditOption={(option, fieldMeta) => {
                            setEditingOption({ option, field: fieldMeta });
                            setNewOption({
                              label: option.label,
                              description: option.description || '',
                            });
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
        </div>
      )}

      {/* ------------------- add option modal ------------------- */}
      {addOptionField && (
        <DynamicModal
          isOpen
          title={`Add ${addOptionField.label}`}
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

      {/* ------------------- edit option modal ------------------- */}
      {editingOption && (
        <DynamicModal
          isOpen
          title={`Edit ${editingOption.field.label}`}
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
