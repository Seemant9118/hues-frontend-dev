import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import React, { useEffect, useState } from 'react';

const formSectionsForCommercialsAndLegal = [
  /* ================= Payment Terms ================= */
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

  /* ================= Offer Validity ================= */
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

  /* ================= Governing Law ================= */
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
        ],
        defaultValue: 'INDIA',
      },
    ],
  },

  /* ================= Dispute Resolution ================= */
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
        ],
        defaultValue: 'NEGOTIATION',
      },
    ],
  },

  /* ================= Delivery / Acceptance Reference ================= */
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
        ],
        defaultValue: 'CLIENT_CONFIRMATION_EMAIL',
      },
    ],
  },
];

export default function TermsAndControls({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(
      formSectionsForCommercialsAndLegal.map((s) => [
        s.key,
        s.enabledByDefault,
      ]),
    ),
  );

  useEffect(() => {
    formSectionsForCommercialsAndLegal.forEach((section) => {
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
  }, [enabledSections, formSectionsForCommercialsAndLegal]);

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
    <div className="mt-2 flex flex-col gap-6">
      {/* --------------------------- SERVICE AGREEMENT --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.contracts.section1.title') ||
          'Service Agreement'}
      </h2>

      <div className="space-y-2">
        {formSectionsForCommercialsAndLegal.map((section) => (
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
