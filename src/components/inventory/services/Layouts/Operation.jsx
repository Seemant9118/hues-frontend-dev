/* eslint-disable react/no-array-index-key */
import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

export const formSectionsForOperations = [
  /* ================= Roles Required ================= */
  {
    key: 'rolesRequired',
    label: 'Roles Required',
    description: 'Team needed for delivery',
    enabledByDefault: false, // user manually toggles
    fields: [
      {
        type: 'select',
        name: 'roles_required',
        label: 'Roles Required',
        options: [
          { label: 'Trainer', value: 'TRAINER' },
          { label: 'Senior Trainer', value: 'SENIOR_TRAINER' },
          { label: 'Facilitator', value: 'FACILITATOR' },
          { label: 'Coordinator', value: 'COORDINATOR' },
          { label: 'SME', value: 'SME' },
        ],
        defaultValue: 'TRAINER', // default selected
      },
    ],
  },

  /* ================= Materials Provided ================= */
  {
    key: 'materialsProvided',
    label: 'Materials Provided',
    description: 'Training materials included',
    enabledByDefault: false,
    fields: [
      {
        type: 'select',
        name: 'materials_provided',
        label: 'Materials Provided',
        options: [
          { label: 'Handouts', value: 'HANDOUTS' },
          { label: 'Workbooks', value: 'WORKBOOKS' },
          { label: 'Presentation Slides', value: 'PRESENTATION_SLIDES' },
          { label: 'Case Studies', value: 'CASE_STUDIES' },
          { label: 'Certificates', value: 'CERTIFICATES' },
        ],
        defaultValue: 'HANDOUTS',
        // ❌ no default → user selects
      },
    ],
  },

  /* ================= Equipment Needed ================= */
  {
    key: 'equipmentNeeded',
    label: 'Equipment Needed',
    description: 'Equipment requirements',
    enabledByDefault: false,
    fields: [
      {
        type: 'select',
        name: 'equipment_needed',
        label: 'Equipment Needed',
        options: [
          { label: 'Projector', value: 'PROJECTOR' },
          { label: 'Whiteboard', value: 'WHITEBOARD' },
          { label: 'Audio System', value: 'AUDIO_SYSTEM' },
          { label: 'Video Conferencing', value: 'VIDEO_CONFERENCING' },
          { label: 'Training Props', value: 'TRAINING_PROPS' },
        ],
        defaultValue: 'PROJECTOR',
      },
    ],
  },

  /* ================= Requires Execution Record ================= */
  {
    key: 'requiresExecutionRecord',
    label: 'Requires Execution Record',
    description: 'Attendance and feedback capture required',
    enabledByDefault: false,
    fields: [
      {
        type: 'radio',
        name: 'requires_execution_record',
        label: 'Requires Execution Record',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        defaultValue: true,
      },
    ],
  },
];

export default function Operations({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForOperations.map((s) => [s.key, s.enabledByDefault]),
    ),
  );

  useEffect(() => {
    formSectionsForOperations.forEach((section) => {
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
  }, [enabledSections, formSectionsForOperations]);

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
    <div className="flex flex-col gap-6">
      {/* ---------------------- RESOURCE REQUIREMENTS ---------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.operations.section1.title') ||
          'Resource Requirements'}
      </h2>

      <div className="space-y-2">
        {formSectionsForOperations.map((section) => (
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
}
