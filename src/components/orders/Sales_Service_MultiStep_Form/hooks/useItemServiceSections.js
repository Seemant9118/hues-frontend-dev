import { useEffect, useMemo, useState } from 'react';
import { capitalize } from '@/appUtils/helperFunctions';

/**
 * Per-item variant of useServiceSections.
 * Reads / writes from item.serviceConfig (a flat map of fieldName → fieldObject)
 * instead of formData.defaultFieldsWithValues.
 *
 * @param {object} serviceConfig  – item.serviceConfig from the order line item
 * @param {function} onConfigChange – (updater: (prev) => newServiceConfig) callback
 */
export function useItemServiceSections({ serviceConfig, onConfigChange }) {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Derive grouped sections from the flat serviceConfig schema
  // ─────────────────────────────────────────────────────────────────────────
  const configFields = useMemo(() => {
    if (!serviceConfig || Object.keys(serviceConfig).length === 0) return null;

    const allFields = Object.entries(serviceConfig).map(([key, fieldObj]) => ({
      ...fieldObj,
      name: key,
      label: fieldObj.label ? capitalize(fieldObj.label) : capitalize(key),
      required: fieldObj.isRequired || fieldObj.required || false,
      options: fieldObj.options?.map((opt) => ({
        ...opt,
        label: opt.label ? capitalize(opt.label) : opt.label,
      })),
    }));

    // ── Step / group mapping (mirrors CreateService.jsx stepMapping) ──────
    const stepMapping = {
      overview: [],
      pricing: [
        'pricing_model',
        'unit_of_measure',
        'base_price',
        'gst_rate_percent',
        'sac_hsn_code',
        'quantity',
        'discount',
        'gst_percentage',
      ],
      operations: ['delivery_mode', 'default_duration_minutes'],
      SLAAndWarranty: ['sla_response_hours', 'sla_completion_hours'],
      description: [
        'whats_included',
        'whats_not_included',
        'input_requirements',
      ],
      addOns: ['add_on_service_codes', 'bundle_codes'],
      termsAndControls: [
        'requires_internal_approval',
        'requires_client_signoff',
        'is_active',
      ],
      contracts: [
        'contract_template_id',
        'required_consents',
        'execution_form_template_id',
        'requires_execution_record',
        'execution_source',
      ],
    };

    // Fields not covered by any step go into a catch-all "general" section
    const assignedNames = new Set(Object.values(stepMapping).flat());
    const unassigned = allFields.filter((f) => !assignedNames.has(f.name));

    const groupLabelMap = {
      pricing: [
        {
          key: 'base_pricing',
          label: 'Pricing',
          names: [
            'pricing_model',
            'unit_of_measure',
            'base_price',
            'quantity',
            'discount',
          ],
        },
        {
          key: 'tax_details',
          label: 'Tax Details',
          names: ['gst_rate_percent', 'sac_hsn_code', 'gst_percentage'],
        },
      ],
      operations: [{ key: 'ops_config', label: 'Operations', names: null }],
      SLAAndWarranty: [
        { key: 'sla_config', label: 'SLA Details', names: null },
      ],
      description: [
        { key: 'desc_groups', label: 'Service Contents', names: null },
      ],
      addOns: [{ key: 'addons_groups', label: 'Add-ons', names: null }],
      termsAndControls: [
        { key: 'terms_config', label: 'Terms & Controls', names: null },
      ],
      contracts: [
        { key: 'contracts_config', label: 'Contracts & Consents', names: null },
      ],
    };

    const transformed = {};

    Object.keys(stepMapping).forEach((stepKey) => {
      if (stepKey === 'overview') return; // skip – handled by top-level form

      const fieldNames = stepMapping[stepKey];
      const stepFields = allFields.filter((f) => fieldNames.includes(f.name));
      if (stepFields.length === 0) return;

      const groupDefs = groupLabelMap[stepKey] || [];
      const groups = groupDefs
        .map((gd) => {
          const fields = gd.names
            ? stepFields.filter((f) => gd.names.includes(f.name))
            : stepFields;
          if (fields.length === 0) return null;
          return {
            key: gd.key,
            label: gd.label,
            enabledByDefault: true,
            isRequired: fields.some((f) => f.required),
            fields,
          };
        })
        .filter(Boolean);

      if (groups.length > 0) transformed[stepKey] = groups;
    });

    // Catch-all for unassigned fields
    if (unassigned.length > 0) {
      transformed.general = [
        {
          key: 'general_config',
          label: 'Configuration',
          enabledByDefault: true,
          isRequired: unassigned.some((f) => f.required),
          fields: unassigned,
        },
      ];
    }

    return transformed;
  }, [serviceConfig]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Build a flat merged sections list (all steps combined) for the item UI
  // ─────────────────────────────────────────────────────────────────────────
  const allSections = useMemo(() => {
    if (!configFields) return [];
    return Object.values(configFields).flat();
  }, [configFields]);

  const [sections, setSections] = useState([]);
  const [addOptionField, setAddOptionField] = useState(null);
  const [newOption, setNewOption] = useState({ label: '', description: '' });
  const [editingOption, setEditingOption] = useState(null);

  // Initialise / sync sections from serviceConfig schema
  useEffect(() => {
    if (allSections.length === 0) return;

    const merged = allSections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        const { options, ...restField } = field;
        const saved = serviceConfig?.[field.name];

        let updatedOptions = options;

        if (field.type === 'select' || field.type === 'multi-select') {
          // Merge saved options first
          if (saved?.options) {
            const savedOpts = saved.options.filter((o) => o.value !== 'ADD');
            const hasAdd = updatedOptions?.some((o) => o.value === 'ADD');

            updatedOptions = hasAdd
              ? [...savedOpts, { label: '+ Add', value: 'ADD' }]
              : savedOpts;
          } else {
            if (!updatedOptions || updatedOptions.length === 0) {
              updatedOptions = [{ label: 'NIL', value: 'NIL' }];
            }

            if (!updatedOptions.some((o) => o.value === 'ADD')) {
              updatedOptions = [
                ...updatedOptions,
                { label: '+ Add', value: 'ADD' },
              ];
            }
          }
        }

        return {
          ...restField,
          options: updatedOptions,
        };
      }),
    }));

    setSections(merged);
  }, [allSections]);

  // 3. Handlers (read/write item.serviceConfig)
  /** Get the current value for a field from serviceConfig */
  const getValue = (name) => serviceConfig?.[name]?.defaultValue;

  const handleChange = (key, val, fieldMeta) => {
    const value = val?.target ? val.target.value : val;

    if (value === 'ADD') {
      setAddOptionField(fieldMeta);
      return;
    }

    onConfigChange((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        defaultValue: value,
      },
    }));
  };

  const handleAddNewOption = () => {
    if (!newOption.label || !addOptionField) return;

    const value = newOption.label.toUpperCase().replace(/\s+/g, '_');
    const newItem = { label: newOption.label, value };

    let updatedField;
    setSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        fields: section.fields.map((field) => {
          if (field.name !== addOptionField.name) return field;
          const optsWithoutAdd = field.options.filter((o) => o.value !== 'ADD');
          updatedField = {
            ...field,
            options: [
              ...optsWithoutAdd,
              newItem,
              { label: '+ Add', value: 'ADD' },
            ],
          };
          return updatedField;
        }),
      })),
    );

    onConfigChange((prev) => {
      const cleanOptions = [
        ...(prev[addOptionField.name]?.options || []).filter(
          (o) => o.value !== 'ADD',
        ),
        newItem,
      ];
      return {
        ...prev,
        [addOptionField.name]: {
          ...(prev[addOptionField.name] || {}),
          options: cleanOptions,
          defaultValue: value,
        },
      };
    });

    setAddOptionField(null);
    setNewOption({ label: '', description: '' });
  };

  const handleEditOption = () => {
    if (!editingOption || !newOption.label) return;

    const newValue = newOption.label.toUpperCase().replace(/\s+/g, '_');
    let updatedField;

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
          updatedField = { ...field, options: updatedOptions };
          return updatedField;
        }),
      })),
    );

    if (updatedField) {
      onConfigChange((prev) => {
        const current = prev[editingOption.field.name] || {};
        const cleanOptions = updatedField.options.filter(
          (o) => o.value !== 'ADD',
        );
        return {
          ...prev,
          [editingOption.field.name]: {
            ...current,
            options: cleanOptions,
            defaultValue:
              current.defaultValue === editingOption.option.value
                ? newValue
                : current.defaultValue,
          },
        };
      });
    }

    setEditingOption(null);
    setNewOption({ label: '', description: '' });
  };

  const handleDeleteOption = (option, fieldMeta) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        fields: section.fields.map((f) => {
          if (f.name !== fieldMeta.name) return f;
          return {
            ...f,
            options: f.options.filter((o) => o.value !== option.value),
          };
        }),
      })),
    );

    onConfigChange((prev) => {
      const current = prev[fieldMeta.name];
      if (!current?.options) return prev;
      return {
        ...prev,
        [fieldMeta.name]: {
          ...current,
          options: current.options.filter((o) => o.value !== option.value),
          defaultValue:
            current.defaultValue === option.value ? '' : current.defaultValue,
        },
      };
    });
  };

  return {
    sections,
    getValue,
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
  };
}
