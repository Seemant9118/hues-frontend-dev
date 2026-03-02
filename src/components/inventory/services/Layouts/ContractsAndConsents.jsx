import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

const formSectionsForAgreementsAndConsents = [
  /* ================= Contract Template ================= */
  {
    key: 'contractTemplate',
    label: 'Contract Template',
    description: 'Agreement template',
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'select',
        name: 'contract_template',
        label: 'Contract Template',
        options: [
          { label: 'Training Agreement', value: 'TRAINING_AGREEMENT' },
          { label: 'Workshop Agreement', value: 'WORKSHOP_AGREEMENT' },
          { label: 'Program Agreement', value: 'PROGRAM_AGREEMENT' },
        ],
        defaultValue: 'TRAINING_AGREEMENT', // ⭐ default
      },
    ],
  },

  /* ================= Required Consents ================= */
  {
    key: 'requiredConsents',
    label: 'Required Consents',
    description: 'Required consents',
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'multi-select',
        name: 'required_consents',
        label: 'Required Consents',
        options: [
          { label: 'Recording Consent', value: 'RECORDING_CONSENT' },
          { label: 'Photo Consent', value: 'PHOTO_CONSENT' },
          {
            label: 'Feedback Usage Consent',
            value: 'FEEDBACK_USAGE_CONSENT',
          },
        ],
        defaultValue: [
          'RECORDING_CONSENT',
          'PHOTO_CONSENT',
          'FEEDBACK_USAGE_CONSENT',
        ], // matches screenshot
      },
    ],
  },
];

export default function ContractsAndConsents({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForAgreementsAndConsents.map((s) => [
        s.key,
        s.enabledByDefault,
      ]),
    ),
  );

  useEffect(() => {
    formSectionsForAgreementsAndConsents.forEach((section) => {
      if (!enabledSections[section.key]) return;

      section.fields.forEach((field) => {
        if (formData[field.name] == null && field.defaultValue !== undefined) {
          setFormData((prev) => ({
            ...prev,
            [field.name]: field.defaultValue,
          }));
        }
      });
    });
  }, [enabledSections, formSectionsForAgreementsAndConsents]);

  const toggleSection = (key, value) => {
    setEnabledSections((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mt-2 flex flex-col gap-6">
      {/* --------------------------- SERVICE AGREEMENT --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.contracts.section1.title') ||
          'Service Agreement'}
      </h2>

      <div className="space-y-2">
        {formSectionsForAgreementsAndConsents.map((section) => (
          <FieldToggler
            key={section.key}
            section={section}
            enabled={enabledSections[section.key]}
            onToggle={(val) => toggleSection(section.key, val)}
            renderFields={(fields, isDisabled) =>
              fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={{
                    ...field,
                    disabled: isDisabled || field.disabled,
                  }}
                  value={formData[field.name]}
                  onChange={handleChange}
                  error={errors[field.name]}
                  formData={formData}
                />
              ))
            }
          />
        ))}
      </div>
    </div>
  );
}
