import { AdminAPIs } from '@/api/adminApi/AdminApi';
import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
import DynamicModal from '@/components/Modals/DynamicModal';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getServicesMasterTypes } from '@/services/Admin_Services/AdminServices';
import { useQuery } from '@tanstack/react-query';

import React, { useEffect, useState } from 'react';

export default function Overview({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [sections, setSections] = useState([
    {
      key: 'deliveryMode',
      label: 'Delivery Mode',
      description: 'Training delivery method',
      enabledByDefault: false,
      fields: [
        {
          type: 'select',
          name: 'delivery_mode',
          label: 'Delivery Mode',
          options: [
            { label: 'On-site', value: 'ONSITE' },
            { label: 'Remote', value: 'REMOTE' },
            { label: 'Hybrid', value: 'HYBRID' },
            { label: '+ Add', value: 'ADD' },
          ],
          defaultValue: 'ONSITE',
        },
      ],
    },
    {
      key: 'unitOfMeasure',
      label: 'Unit of Measure',
      description: 'How training is billed',
      enabledByDefault: false,
      fields: [
        {
          type: 'select',
          name: 'unit',
          label: 'Unit',
          options: [
            { label: 'Per Session', value: 'PER_SESSION' },
            { label: 'Per Day', value: 'PER_DAY' },
            { label: 'Per Participant', value: 'PER_PARTICIPANT' },
            { label: 'Per Program', value: 'PER_PROGRAM' },
            { label: '+ Add', value: 'ADD' },
          ],
          defaultValue: 'PER_SESSION',
        },
      ],
    },
    {
      key: 'trainingTopic',
      label: 'Training Topic',
      description: 'Subject areas covered',
      enabledByDefault: false,
      fields: [
        {
          type: 'select',
          name: 'training_topics',
          label: 'Training Topic',
          options: [
            { label: 'Leadership', value: 'LEADERSHIP' },
            { label: 'Sales', value: 'SALES' },
            { label: 'Communication', value: 'COMMUNICATION' },
            { label: 'Technical Skills', value: 'TECHNICAL_SKILLS' },
            { label: 'Compliance', value: 'COMPLIANCE' },
            { label: 'Safety', value: 'SAFETY' },
            { label: 'Soft Skills', value: 'SOFT_SKILLS' },
            { label: '+ Add', value: 'ADD' },
          ],
          defaultValue: 'LEADERSHIP',
        },
      ],
    },
    {
      key: 'maxParticipants',
      label: 'Max Participants per Batch',
      description: 'Capacity constraint per session',
      enabledByDefault: false,
      fields: [
        {
          type: 'number',
          name: 'max_participants',
          label: 'Max Participants',
          defaultValue: 25,
        },
      ],
    },
    {
      key: 'defaultDuration',
      label: 'Default Duration (Hours)',
      description: 'Standard session duration',
      enabledByDefault: false,
      fields: [
        {
          type: 'number',
          name: 'default_duration_hours',
          label: 'Default Duration (Hours)',
          defaultValue: 4,
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

  const { data: servicesMasterTypes } = useQuery({
    queryKey: [AdminAPIs.getServicesMasterTypes.endpointKey],
    queryFn: getServicesMasterTypes,
    select: (data) => data.data.data.data,
  });

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
      'serviceCategoryId',
      'serviceSubTypeId',
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
    <div className="flex flex-col gap-4">
      {/* ------------------- basic fields ------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section1.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Service Name <span className="text-red-600">*</span>
          </Label>

          <Input
            placeholder="Service name"
            value={formData?.serviceName}
            onChange={(e) => handleChange('serviceName', e)}
          />

          {errors?.serviceName && <ErrorBox msg={errors?.serviceName} />}
        </div>

        <div>
          <Label>
            Service Code (SKU ID) <span className="text-red-600">*</span>
          </Label>

          <Input
            placeholder="Service code"
            value={formData?.serviceCode}
            onChange={(e) => handleChange('serviceCode', e)}
          />

          {errors?.serviceCode && <ErrorBox msg={errors?.serviceCode} />}
        </div>
      </div>

      {/* ------------------- category ------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section2.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Service Category <span className="text-red-600">*</span>
          </Label>

          <Select
            value={formData?.serviceCategoryId?.toString()}
            onValueChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                serviceCategoryId: Number(v),
                serviceSubTypeId: '', // reset subtype
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {servicesMasterTypes?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.serviceTypeName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {errors?.serviceCategoryId && (
            <ErrorBox msg={errors?.serviceCategoryId} />
          )}
        </div>

        <div>
          <Label>
            Service Sub type <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.serviceSubTypeId?.toString()}
            onValueChange={(v) => handleChange('serviceSubTypeId', Number(v))}
            disabled={!formData?.serviceCategoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subtype" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {servicesMasterTypes
                  ?.find((c) => c.id === Number(formData?.serviceCategoryId))
                  ?.subCategories?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.serviceSubTypeName}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.serviceSubTypeId && (
            <ErrorBox msg={errors?.serviceSubTypeId} />
          )}
        </div>
      </div>

      {/* ------------------- dynamic sections ------------------- */}
      <h2 className="text-sm font-bold text-primary">
        Default value (pre-selected during offer creation)
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
