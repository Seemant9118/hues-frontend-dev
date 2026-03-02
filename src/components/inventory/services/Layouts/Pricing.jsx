import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

const formSectionsForPricing = [
  /* ================= Base Price ================= */
  {
    key: 'basePrice',
    label: 'Base Price (INR)',
    description: 'Price per session/day',
    enabledByDefault: false, // 🔹 user manually toggles
    fields: [
      {
        type: 'number',
        name: 'base_price',
        label: 'Base Price (INR)',
        defaultValue: 25000,
      },
    ],
  },

  /* ================= Pricing Model ================= */
  {
    key: 'pricingModel',
    label: 'Pricing Model',
    description: 'Pricing structure',
    enabledByDefault: false,
    fields: [
      {
        type: 'select',
        name: 'pricing_model',
        label: 'Pricing Model',
        options: [
          { label: 'Fixed', value: 'FIXED' },
          { label: 'Per Participant', value: 'PER_PARTICIPANT' },
          { label: 'Tiered', value: 'TIERED' },
        ],
        defaultValue: 'FIXED',
      },
    ],
  },

  /* ================= Per Participant Rate ================= */
  {
    key: 'perParticipantRate',
    label: 'Per Participant Rate (if applicable)',
    description: 'Additional rate per participant',
    enabledByDefault: false,
    fields: [
      {
        type: 'number',
        name: 'per_participant_rate',
        label: 'Per Participant Rate',
        defaultValue: 1500,
      },
    ],
  },

  /* ================= GST ================= */
  {
    key: 'gst',
    label: 'GST (%)',
    description: 'Applicable GST',
    enabledByDefault: false,
    fields: [
      {
        type: 'select',
        name: 'gst_percentage',
        label: 'GST (%)',
        options: [
          { label: '18%', value: 18 },
          { label: '0%', value: 0 },
        ],
        defaultValue: 18,
      },
    ],
  },

  /* ================= SAC Code ================= */
  {
    key: 'sacCode',
    label: 'SAC Code',
    description: 'SAC for training services',
    enabledByDefault: false,
    fields: [
      {
        type: 'text',
        name: 'sac_code',
        label: 'SAC Code',
        defaultValue: '999293',
      },
    ],
  },
];
export default function Pricing({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForPricing.map((s) => [s.key, s.enabledByDefault]),
    ),
  );

  useEffect(() => {
    formSectionsForPricing.forEach((section) => {
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
  }, [enabledSections, formSectionsForPricing]);

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
    <div className="flex flex-col gap-6">
      {/* ------------- BASE PRICING ------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.pricing.section1.title') || 'Base Pricing'}
      </h2>

      <div className="space-y-2">
        {formSectionsForPricing.map((section) => (
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
