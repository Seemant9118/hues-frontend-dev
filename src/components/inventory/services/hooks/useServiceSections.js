import { useEffect, useMemo, useState } from 'react';

/**
 * Shared hook for all service layout steps (Pricing, Operations, etc.).
 */
export function useServiceSections({
  stepKey,
  configFields,
  formData,
  setFormData,
}) {
  // Derive sections from API config
  const apiSections = useMemo(() => {
    if (!configFields?.[stepKey]) return null;

    return configFields[stepKey].map((section) => ({
      ...section,
      enabledByDefault: section.enabledByDefault ?? false,
      fields: section.fields.map((field) => {
        const { options, ...restField } = field;

        let updatedOptions = options;

        if (field.type === 'select') {
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

        return {
          ...restField,
          options: updatedOptions,
        };
      }),
    }));
  }, [configFields, stepKey]);

  const [sections, setSections] = useState([]);
  const [addOptionField, setAddOptionField] = useState(null);
  const [newOption, setNewOption] = useState({ label: '', description: '' });
  const [editingOption, setEditingOption] = useState(null);
  const [enabledSections, setEnabledSections] = useState({});

  // Sync sections from API config
  useEffect(() => {
    if (!apiSections) return;

    const dfv = formData?.defaultFieldsWithValues;

    const merged = apiSections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        const savedField = dfv?.[field.name];

        if (savedField && savedField.options && field.options) {
          const savedOptions = savedField.options.filter(
            (o) => o.value !== 'ADD',
          );
          const hasAdd = field.options.some((o) => o.value === 'ADD');

          return {
            ...field,
            options: hasAdd
              ? [...savedOptions, { label: '+ Add', value: 'ADD' }]
              : savedOptions,
          };
        }

        return field;
      }),
    }));

    setSections(merged);

    setEnabledSections(
      Object.fromEntries(
        merged.map((s) => {
          const hasValue = s.fields?.some((f) => {
            const val = dfv?.[f.name];
            return val !== undefined && val !== null && val !== '';
          });
          return [s.key, hasValue || s.enabledByDefault];
        }),
      ),
    );
  }, [apiSections]);

  // Sync enabled field values into formData
  useEffect(() => {
    if (sections.length === 0) return;

    sections.forEach((section) => {
      if (!enabledSections[section.key]) return;

      section.fields.forEach((field) => {
        const current = formData?.defaultFieldsWithValues?.[field.name];
        const { ...cleanField } = field;

        if (!current) {
          setFormData((prev) => ({
            ...prev,
            defaultFieldsWithValues: {
              ...prev.defaultFieldsWithValues,
              [field.name]: {
                ...cleanField,
                defaultValue: field.defaultValue ?? '',
              },
            },
          }));
        } else if (!current.type) {
          setFormData((prev) => ({
            ...prev,
            defaultFieldsWithValues: {
              ...prev.defaultFieldsWithValues,
              [field.name]: {
                ...cleanField,
                ...current,
                defaultValue: current.defaultValue ?? field.defaultValue ?? '',
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

        return { ...prev, defaultFieldsWithValues: updated };
      });
    }
  };

  const handleChange = (key, val, fieldMeta) => {
    const value = val?.target ? val.target.value : val;

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
    const newItem = { label: newOption.label, value };

    let updatedField;

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

    const cleanOptions = updatedField.options.filter(
      (opt) => opt.value !== 'ADD',
    );

    const { ...cleanField } = addOptionField;

    setFormData((prev) => ({
      ...prev,
      defaultFieldsWithValues: {
        ...prev.defaultFieldsWithValues,
        [addOptionField.name]: {
          ...cleanField,
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
      const cleanOptions = updatedField.options.filter(
        (opt) => opt.value !== 'ADD',
      );

      const { ...cleanField } = editingOption.field;

      setFormData((prev) => ({
        ...prev,
        defaultFieldsWithValues: {
          ...prev.defaultFieldsWithValues,
          [editingOption.field.name]: {
            ...cleanField,
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

    setFormData((prev) => {
      const currentField = prev.defaultFieldsWithValues?.[fieldMeta.name];
      if (!currentField?.options) return prev;

      const updatedOptions = currentField.options.filter(
        (o) => o.value !== option.value,
      );

      return {
        ...prev,
        defaultFieldsWithValues: {
          ...prev.defaultFieldsWithValues,
          [fieldMeta.name]: {
            ...currentField,
            options: updatedOptions,
            defaultValue:
              currentField.defaultValue === option.value
                ? ''
                : currentField.defaultValue,
          },
        },
      };
    });
  };

  return {
    sections,
    setSections,
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
  };
}
