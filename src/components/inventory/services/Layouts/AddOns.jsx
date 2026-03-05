import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

const formSectionsForAddOnsAndBundles = [
  /* ================= Add-on Service Codes ================= */
  {
    key: 'addOnServiceCodes',
    label: 'Add-on Service Codes',
    description: "Select applicable add-on services. Select 'Nil' if none.",
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'select',
        name: 'addon_service_codes',
        label: 'Add-on Service Codes',
        options: [
          { label: 'SV-TRN-COACHING', value: 'SV-TRN-COACHING' },
          { label: 'SV-TRN-WORKSHOP', value: 'SV-TRN-WORKSHOP' },
          { label: 'SV-TRN-CERT', value: 'SV-TRN-CERT' },
          { label: 'Nil', value: 'NIL' },
        ],
        defaultValue: 'NIL',
      },
    ],
  },

  /* ================= Bundle Codes ================= */
  {
    key: 'bundleCodes',
    label: 'Bundle Codes',
    description: "Select applicable bundles. Select 'Nil' if none.",
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'select',
        name: 'bundle_codes',
        label: 'Bundle Codes',
        options: [
          { label: 'BDL-TRN-BASIC', value: 'BDL-TRN-BASIC' },
          { label: 'BDL-TRN-PREMIUM', value: 'BDL-TRN-PREMIUM' },
          { label: 'BDL-TRN-ANNUAL', value: 'BDL-TRN-ANNUAL' },
          { label: 'Nil', value: 'NIL' },
        ],
        defaultValue: 'NIL',
      },
    ],
  },
];
const AddOns = ({ formData, setFormData, translation, errors }) => {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForAddOnsAndBundles.map((s) => [s.key, s.enabledByDefault]),
    ),
  );

  useEffect(() => {
    formSectionsForAddOnsAndBundles.forEach((section) => {
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
  }, [enabledSections, formSectionsForAddOnsAndBundles]);

  const toggleSection = (key, value) => {
    setEnabledSections((prev) => ({
      ...prev,
      [key]: value,
    }));
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
    <div className="mt-4 flex flex-col gap-6">
      {/* ------------- BASE PRICING ------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.addOns.section1.title') ||
          'Add-on Services'}
      </h2>

      <div className="space-y-2">
        {formSectionsForAddOnsAndBundles.map((section) => (
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
};

export default AddOns;
