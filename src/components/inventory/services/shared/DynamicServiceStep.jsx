import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import DynamicModal from '@/components/Modals/DynamicModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useServiceSections } from '../hooks/useServiceSections';

/**
 * Reusable step component for API-driven service configuration steps.
 *
 * Props:
 * - stepKey: e.g. "pricing", "operations"
 * - sectionTitle: the heading text for the step
 * - translationKey: i18n key for the section title fallback
 * - configFields, isConfigLoading: from the parent (CreateService → MultiStepForm)
 * - formData, setFormData, errors, translation: standard form props
 */
export default function DynamicServiceStep({
  stepKey,
  sectionTitle,
  translationKey,
  configFields,
  isConfigLoading,
  formData,
  setFormData,
  errors,
  setErrors,
  translation,
}) {
  const {
    sections,
    enabledSections,
    toggleSection,
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

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-bold text-primary">
        {(translationKey && translation(translationKey)) || sectionTitle}
      </h2>

      {isConfigLoading && (
        <p className="text-sm text-muted-foreground">Loading fields...</p>
      )}

      {!isConfigLoading && sections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No configurable fields available for this step.
        </p>
      )}

      {sections.length > 0 && (
        <div className="space-y-2">
          {sections.map((section) => (
            <FieldToggler
              key={section.key}
              section={section}
              enabled={enabledSections[section.key]}
              error={errors?.[section.fields[0]?.name]}
              onToggle={(val) => {
                toggleSection(section, val);
                if (errors?.[section.fields[0]?.name]) {
                  setErrors?.((prev) => ({
                    ...prev,
                    [section.fields[0]?.name]: undefined,
                  }));
                }
              }}
              renderFields={(fields, isDisabled) =>
                fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={{
                      ...field,
                      disabled: isDisabled || field.disabled,
                    }}
                    value={
                      formData?.defaultFieldsWithValues?.[field.name]
                        ?.defaultValue
                    }
                    onChange={(name, val, fieldMeta) => {
                      handleChange(name, val, fieldMeta);
                      if (errors?.[name]) {
                        setErrors?.((prev) => ({ ...prev, [name]: undefined }));
                      }
                    }}
                    error={errors?.[field.name]}
                    formData={formData}
                    enableOptionCrud={field.type === 'select'}
                    onEditOption={(option, fieldMeta) => {
                      setEditingOption({ option, field: fieldMeta });
                      setNewOption({ label: option.label, description: '' });
                    }}
                    onDeleteOption={handleDeleteOption}
                  />
                ))
              }
            />
          ))}
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
