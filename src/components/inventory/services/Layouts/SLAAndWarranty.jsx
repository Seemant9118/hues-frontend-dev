import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

const formSectionsForPolicies = [
  /* ================= Standard SLA ================= */
  {
    key: 'standardSLA',
    label: 'Standard SLA',
    description: 'Delivery commitment',
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'text',
        name: 'standard_sla',
        label: 'Standard SLA',
        defaultValue: 'Training delivered as per scheduled date and time',
      },
    ],
  },

  /* ================= Cancellation Policy ================= */
  {
    key: 'cancellationPolicy',
    label: 'Cancellation Policy',
    description: 'Cancellation terms',
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'textarea',
        name: 'cancellation_policy',
        label: 'Cancellation Policy',
        rows: 2,
        defaultValue:
          '48 hours notice required for rescheduling without charges',
      },
    ],
  },
];

export default function SLAAndWarranty({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForPolicies.map((s) => {
        const hasValue = s.fields?.some((f) => {
          const val = formData.defaultFieldsWithValues?.[f.name];
          return val !== undefined && val !== null && val !== '';
        });
        return [s.key, hasValue || s.enabledByDefault];
      }),
    ),
  );

  useEffect(() => {
    formSectionsForPolicies.forEach((section) => {
      if (!enabledSections[section.key]) return;

      section.fields.forEach((field) => {
        const currentData = formData.defaultFieldsWithValues[field.name];
        if (!currentData || currentData.defaultValue === undefined) {
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
  }, [enabledSections, formSectionsForPolicies]);

  const toggleSection = (section, value) => {
    setEnabledSections((prev) => ({
      ...prev,
      [section.key]: value,
    }));

    if (!value) {
      setFormData((prev) => {
        const updatedDefaultFields = { ...prev.defaultFieldsWithValues };
        section.fields.forEach((field) => {
          updatedDefaultFields[field.name] = null;
        });
        return {
          ...prev,
          defaultFieldsWithValues: updatedDefaultFields,
        };
      });
    }
  };

  const handleChange = (key, e) => {
    const value = e?.target ? e.target.value : e;
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

  return (
    <div className="lex flex-col gap-6">
      {/* --------------------------- SERVICE LEVEL AGREEMENT --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.sla.section1.title') ||
          'Service Level Agreement'}
      </h2>

      <div className="space-y-2">
        {formSectionsForPolicies.map((section) => (
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
                    formData.defaultFieldsWithValues[field.name]
                      ?.defaultValue ??
                    formData.defaultFieldsWithValues[field.name] ??
                    ''
                  }
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
