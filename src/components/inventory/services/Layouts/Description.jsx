import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

const formSectionsForContent = [
  /* ================= Short Description ================= */
  {
    key: 'shortDescription',
    label: 'Short Description',
    description: 'Brief description',
    enabledByDefault: false, // manual toggle
    fields: [
      {
        type: 'text',
        name: 'short_description',
        label: 'Short Description',
        defaultValue: 'Customized corporate training programs',
      },
    ],
  },

  /* ================= Long Description ================= */
  {
    key: 'longDescription',
    label: 'Long Description',
    description: 'Detailed service description — required for Offer Creation',
    enabledByDefault: false, // manual toggle
    fields: [
      {
        type: 'textarea',
        name: 'long_description',
        label: 'Long Description',
        rows: 2,
        defaultValue:
          'Customized corporate training programs covering leadership, sales, communication, technical skills, compliance, and safety.',
      },
    ],
  },

  /* ================= What’s Included ================= */
  {
    key: 'whatsIncluded',
    label: "What's Included",
    description: "Select all applicable deliverables. Select 'Nil' if none.",
    enabledByDefault: false,
    fields: [
      {
        type: 'select',
        name: 'whats_included',
        label: "What's Included",
        options: [
          {
            label: 'Pre-training assessment',
            value: 'PRE_TRAINING_ASSESSMENT',
          },
          { label: 'Customized content', value: 'CUSTOMIZED_CONTENT' },
          { label: 'Training delivery', value: 'TRAINING_DELIVERY' },
          { label: 'Materials', value: 'MATERIALS' },
          { label: 'Certificates', value: 'CERTIFICATES' },
          { label: 'Post-training feedback', value: 'POST_TRAINING_FEEDBACK' },
          { label: 'Nil', value: 'NIL' },
        ],
        defaultValue: [
          'PRE_TRAINING_ASSESSMENT',
          'CUSTOMIZED_CONTENT',
          'TRAINING_DELIVERY',
          'MATERIALS',
          'CERTIFICATES',
          'POST_TRAINING_FEEDBACK',
        ], // matches screenshot
      },
    ],
  },

  /* ================= What’s Not Included ================= */
  {
    key: 'whatsNotIncluded',
    label: "What's Not Included",
    description: "Select all applicable exclusions. Select 'Nil' if none.",
    enabledByDefault: false,
    fields: [
      {
        type: 'select',
        name: 'whats_not_included',
        label: "What's Not Included",
        options: [
          { label: 'Venue arrangements', value: 'VENUE_ARRANGEMENTS' },
          { label: 'Participant travel', value: 'PARTICIPANT_TRAVEL' },
          { label: 'Refreshments', value: 'REFRESHMENTS' },
          { label: 'Post-training coaching', value: 'POST_TRAINING_COACHING' },
          { label: 'Nil', value: 'NIL' },
        ],
        defaultValue: [
          'VENUE_ARRANGEMENTS',
          'PARTICIPANT_TRAVEL',
          'REFRESHMENTS',
          'POST_TRAINING_COACHING',
        ], // Nil remains optional
      },
    ],
  },
];

export default function Description({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForContent.map((s) => [s.key, s.enabledByDefault]),
    ),
  );

  useEffect(() => {
    formSectionsForContent.forEach((section) => {
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
  }, [enabledSections, formSectionsForContent]);

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
      {/* --------------------------- SERVICE DESCRIPTION --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.description.section1.title') ||
          'Service Description'}
      </h2>
      <div className="space-y-2">
        {formSectionsForContent.map((section) => (
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
