import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import DynamicModal from '@/components/Modals/DynamicModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';

export default function TermsAndControls({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [sections, setSections] = useState([
    {
      key: 'paymentTerms',
      label: 'Payment Terms',
      description: 'Payment schedule and conditions',
      enabledByDefault: false, // manual toggle
      fields: [
        {
          type: 'textarea',
          name: 'payment_terms',
          label: 'Payment Terms',
          rows: 2,
          defaultValue: '50% advance, 50% on completion',
        },
      ],
    },
    {
      key: 'offerValidity',
      label: 'Offer Validity',
      description: 'How long the offer remains valid',
      enabledByDefault: false,
      fields: [
        {
          type: 'text',
          name: 'offer_validity',
          label: 'Offer Validity',
          defaultValue: 'Valid for 30 days from date of issue',
        },
      ],
    },
    {
      key: 'governingLaw',
      label: 'Governing Law',
      description: 'Jurisdiction governing this agreement',
      enabledByDefault: false,
      fields: [
        {
          type: 'select',
          name: 'governing_law',
          label: 'Governing Law',
          options: [
            { label: 'India', value: 'INDIA' },
            { label: 'Maharashtra, India', value: 'MAHARASHTRA_INDIA' },
            {
              label: '+ Add',
              value: 'ADD',
            },
          ],
          defaultValue: 'INDIA',
        },
      ],
    },
    {
      key: 'disputeResolution',
      label: 'Dispute Resolution',
      description: 'Method for resolving disputes',
      enabledByDefault: false,
      fields: [
        {
          type: 'select',
          name: 'dispute_resolution',
          label: 'Dispute Resolution',
          options: [
            { label: 'Negotiation', value: 'NEGOTIATION' },
            { label: 'Arbitration', value: 'ARBITRATION' },
            { label: 'Courts', value: 'COURTS' },
            {
              label: '+ Add',
              value: 'ADD',
            },
          ],
          defaultValue: 'NEGOTIATION',
        },
      ],
    },
    {
      key: 'deliveryAcceptanceReference',
      label: 'Delivery / Acceptance Reference',
      description: 'How delivery is confirmed and accepted',
      enabledByDefault: false,
      fields: [
        {
          type: 'select',
          name: 'delivery_acceptance_reference',
          label: 'Delivery / Acceptance Reference',
          options: [
            {
              label: 'Client confirmation email',
              value: 'CLIENT_CONFIRMATION_EMAIL',
            },
            {
              label: 'Signed delivery note',
              value: 'SIGNED_DELIVERY_NOTE',
            },
            {
              label: 'Platform acceptance (recorded)',
              value: 'PLATFORM_ACCEPTANCE_RECORDED',
            },
            {
              label: '+ Add',
              value: 'ADD',
            },
          ],
          defaultValue: 'CLIENT_CONFIRMATION_EMAIL',
        },
      ],
    },
  ]);
  const [addOptionField, setAddOptionField] = useState(null);
  const [newOption, setNewOption] = useState({
    label: '',
    description: '',
  });
  const [editingOption, setEditingOption] = useState(null);
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(sections.map((s) => [s.key, s.enabledByDefault])),
  );

  useEffect(() => {
    sections.forEach((section) => {
      if (!enabledSections[section.key]) return;

      section.fields.forEach((field) => {
        const current = formData?.defaultFieldsWithValues?.[field.name];

        if (!current) {
          setFormData((prev) => ({
            ...prev,
            defaultFieldsWithValues: {
              ...prev.defaultFieldsWithValues,
              [field.name]: {
                ...field,
                defaultValue: field.defaultValue ?? '',
              },
            },
          }));
        }
      });
    });
  }, [sections, enabledSections]);

  const toggleSection = (section, value) => {
    setEnabledSections((prev) => ({
      ...prev,
      [section.key]: value,
    }));

    if (!value) {
      setFormData((prev) => {
        const updated = { ...prev.defaultFieldsWithValues };

        section.fields.forEach((field) => {
          updated[field.name] = null;
        });

        return {
          ...prev,
          defaultFieldsWithValues: updated,
        };
      });
    }
  };

  const handleChange = (key, val, fieldMeta) => {
    const value = val?.target ? val.target.value : val;

    const topLevelFields = [
      'serviceName',
      'serviceCode',
      'serviceCategory',
      'serviceSubType',
    ];

    if (topLevelFields.includes(key)) {
      setFormData((prev) => ({ ...prev, [key]: value }));
      return;
    }

    if (value === 'ADD') {
      setAddOptionField(fieldMeta);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      defaultFieldsWithValues: {
        ...prev.defaultFieldsWithValues,
        [key]: {
          ...(prev.defaultFieldsWithValues[key] || {}),
          defaultValue: value,
        },
      },
    }));
  };

  const handleAddNewOption = () => {
    if (!newOption.label || !addOptionField) return;

    const value = newOption.label.toUpperCase().replace(/\s+/g, '_');

    const newItem = {
      label: newOption.label,
      value,
    };

    let updatedField;

    /* Update sections (UI options) */
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => {
          if (field.name !== addOptionField.name) return field;

          const optionsWithoutAdd = field.options.filter(
            (opt) => opt.value !== 'ADD',
          );

          updatedField = {
            ...field,
            options: [
              ...optionsWithoutAdd,
              newItem,
              { label: '+ Add', value: 'ADD' },
            ],
          };

          return updatedField;
        }),
      })),
    );

    /* Save to formData WITHOUT "+ Add" */
    const cleanOptions = updatedField.options.filter(
      (opt) => opt.value !== 'ADD',
    );

    setFormData((prev) => ({
      ...prev,
      defaultFieldsWithValues: {
        ...prev.defaultFieldsWithValues,
        [addOptionField.name]: {
          ...addOptionField,
          options: cleanOptions,
          defaultValue: value,
        },
      },
    }));

    setAddOptionField(null);
    setNewOption({ label: '', description: '' });
  };
  const handleEditOption = () => {
    if (!editingOption || !newOption.label) return;

    const newValue = newOption.label.toUpperCase().replace(/\s+/g, '_');

    let updatedField;

    /* Update UI sections */
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        fields: section.fields.map((field) => {
          if (field.name !== editingOption.field.name) return field;

          const updatedOptions = field.options.map((opt) =>
            opt.value === editingOption.option.value
              ? { label: newOption.label, value: newValue }
              : opt,
          );

          updatedField = {
            ...field,
            options: updatedOptions,
          };

          return updatedField;
        }),
      })),
    );

    /* Update formData */
    if (updatedField) {
      const cleanOptions = updatedField.options.filter(
        (opt) => opt.value !== 'ADD',
      );

      setFormData((prev) => ({
        ...prev,
        defaultFieldsWithValues: {
          ...prev.defaultFieldsWithValues,
          [editingOption.field.name]: {
            ...editingOption.field,
            options: cleanOptions,
            defaultValue:
              prev.defaultFieldsWithValues?.[editingOption.field.name]
                ?.defaultValue === editingOption.option.value
                ? newValue
                : prev.defaultFieldsWithValues?.[editingOption.field.name]
                    ?.defaultValue,
          },
        },
      }));
    }

    setEditingOption(null);
    setNewOption({ label: '', description: '' });
  };

  return (
    <div className="mt-2 flex flex-col gap-6">
      {/* --------------------------- SERVICE AGREEMENT --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.contracts.section1.title') ||
          'Service Agreement'}
      </h2>
      <div className="space-y-2">
        {sections.map((section) => (
          <FieldToggler
            key={section.key}
            section={section}
            enabled={enabledSections[section.key]}
            onToggle={(val) => toggleSection(section, val)}
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
                  onChange={handleChange}
                  error={errors[field.name]}
                  formData={formData}
                  /* Enable CRUD for select fields only */
                  enableOptionCrud={field.type === 'select'}
                  onEditOption={(option, fieldMeta) => {
                    setEditingOption({
                      option,
                      field: fieldMeta,
                    });

                    setNewOption({
                      label: option.label,
                      description: '',
                    });
                  }}
                  onDeleteOption={(option, fieldMeta) => {
                    setSections((prev) =>
                      prev.map((section) => ({
                        ...section,
                        fields: section.fields.map((f) => {
                          if (f.name !== fieldMeta.name) return f;

                          return {
                            ...f,
                            options: f.options.filter(
                              (o) => o.value !== option.value,
                            ),
                          };
                        }),
                      })),
                    );
                  }}
                />
              ))
            }
          />
        ))}
      </div>
      {/* ------------------- add/edit option modal ------------------- */}
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
                setNewOption((prev) => ({
                  ...prev,
                  label: e.target.value,
                }))
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
            {
              label: 'Save',
              onClick: () => handleEditOption(),
            },
          ]}
        >
          <div className="space-y-2">
            <Label>Name / Value</Label>

            <Input
              value={newOption.label}
              onChange={(e) =>
                setNewOption((prev) => ({
                  ...prev,
                  label: e.target.value,
                }))
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
