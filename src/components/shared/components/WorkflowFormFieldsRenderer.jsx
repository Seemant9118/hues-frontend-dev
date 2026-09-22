import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import React from 'react';

export default function WorkflowFormFieldsRenderer({
  formFields = [],
  currentStepValues = {},
  formData = {},
  errors = {},
  targetStepKey = '',
  onStepValueChange,
}) {
  const visibleFields = formFields.filter(
    (f) => f.visible !== false && f.state !== 'ARCHIVED',
  );

  if (visibleFields.length === 0) {
    return (
      <div>
        <Label>Form Submission Values / Notes</Label>
        <Textarea
          rows={3}
          className="mt-1"
          placeholder="Enter form input values for step..."
          value={currentStepValues.formNotes || ''}
          onChange={(e) =>
            onStepValueChange?.(targetStepKey, 'formNotes', e.target.value)
          }
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
      {visibleFields.map((field) => {
        const { key: fieldKey, mappingKey } = field;

        const value =
          currentStepValues[fieldKey] ??
          (mappingKey ? currentStepValues[mappingKey] : undefined) ??
          formData?.[fieldKey] ??
          (mappingKey ? formData?.[mappingKey] : undefined) ??
          formData?.customFields?.[fieldKey] ??
          (mappingKey ? formData?.customFields?.[mappingKey] : undefined) ??
          '';

        const isFieldRequired = Boolean(
          field.required === true ||
          field.required === 'true' ||
          field.isRequired === true ||
          field.isRequired === 'true' ||
          field.validation?.required === true,
        );

        const errorMessage =
          errors?.[fieldKey] ||
          (mappingKey ? errors?.[mappingKey] : null) ||
          errors?.[`${targetStepKey}.${fieldKey}`] ||
          errors?.[`${targetStepKey}_${fieldKey}`];

        return (
          <div
            key={field.id || fieldKey}
            className={field.type === 'TEXTAREA' ? 'md:col-span-2' : ''}
          >
            <Label className="flex items-center text-xs font-medium">
              <span>{field.label || fieldKey}</span>
              {isFieldRequired && (
                <span className="ml-1 font-bold text-red-500">*</span>
              )}
            </Label>

            {field.type === 'SELECT' ? (
              <Select
                value={value ? String(value) : ''}
                onValueChange={(val) =>
                  onStepValueChange?.(targetStepKey, fieldKey, val)
                }
              >
                <SelectTrigger
                  className={cn(
                    'mt-1 bg-white text-sm',
                    errorMessage && 'border-red-500 ring-1 ring-red-500',
                  )}
                >
                  <SelectValue
                    placeholder={field.placeholder || `Select ${field.label}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem
                      key={opt.value || opt.label}
                      value={String(opt.value)}
                    >
                      {opt.label || opt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'TEXTAREA' ? (
              <Textarea
                rows={3}
                className={cn(
                  'mt-1 bg-white text-sm',
                  errorMessage && 'border-red-500 ring-1 ring-red-500',
                )}
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) =>
                  onStepValueChange?.(targetStepKey, fieldKey, e.target.value)
                }
              />
            ) : field.type === 'RADIO' ? (
              <div className="mt-1 flex flex-col gap-2">
                {(field.options || field.validation?.options || []).map(
                  (opt, i) => {
                    const optVal = opt.value ?? opt;
                    const optLabel = opt.label ?? opt;
                    return (
                      <label
                        key={optVal ?? i}
                        className="flex items-center gap-2 text-sm text-neutral-600"
                      >
                        <input
                          type="radio"
                          name={fieldKey}
                          value={optVal}
                          checked={value === optVal}
                          onChange={(e) =>
                            onStepValueChange?.(
                              targetStepKey,
                              fieldKey,
                              e.target.value,
                            )
                          }
                          className="h-4 w-4 text-primary focus:ring-primary/30"
                        />
                        {optLabel}
                      </label>
                    );
                  },
                )}
              </div>
            ) : field.type === 'CHECKBOX' ? (
              <div className="mt-1 flex flex-col gap-2">
                {(field.options || field.validation?.options || []).length >
                0 ? (
                  (field.options || field.validation?.options || []).map(
                    (opt, i) => {
                      const optVal = opt.value ?? opt;
                      const optLabel = opt.label ?? opt;
                      const values = Array.isArray(value)
                        ? value
                        : value
                          ? [value]
                          : [];
                      const isChecked = values.includes(optVal);
                      return (
                        <label
                          key={optVal ?? i}
                          className="flex items-center gap-2 text-sm text-neutral-600"
                        >
                          <input
                            type="checkbox"
                            name={`${fieldKey}_${i}`}
                            value={optVal}
                            checked={isChecked}
                            onChange={(e) => {
                              const newValues = e.target.checked
                                ? [...values, optVal]
                                : values.filter((v) => v !== optVal);
                              onStepValueChange?.(
                                targetStepKey,
                                fieldKey,
                                newValues,
                              );
                            }}
                            className="h-4 w-4 rounded text-primary focus:ring-primary/30"
                          />
                          {optLabel}
                        </label>
                      );
                    },
                  )
                ) : (
                  <label className="flex items-center gap-2 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      checked={!!value}
                      onChange={(e) =>
                        onStepValueChange?.(
                          targetStepKey,
                          fieldKey,
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 rounded text-primary focus:ring-primary/30"
                    />
                    <span className="text-xs text-neutral-500">
                      {field.placeholder || 'Enable'}
                    </span>
                  </label>
                )}
              </div>
            ) : field.type === 'FILE' ? (
              <Input
                type="file"
                accept={field.allowedTypes || field.validation?.allowedTypes}
                className={cn(
                  'mt-1 bg-white text-sm',
                  errorMessage && 'border-red-500 ring-1 ring-red-500',
                )}
                onChange={(e) =>
                  onStepValueChange?.(targetStepKey, fieldKey, e.target.files)
                }
              />
            ) : (
              <Input
                type={
                  field.type === 'NUMBER' ||
                  field.type === 'CURRENCY' ||
                  field.type === 'DECIMAL'
                    ? 'number'
                    : field.type === 'DATE'
                      ? 'date'
                      : field.type === 'EMAIL'
                        ? 'email'
                        : 'text'
                }
                className={cn(
                  'mt-1 bg-white text-sm',
                  errorMessage && 'border-red-500 ring-1 ring-red-500',
                )}
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) =>
                  onStepValueChange?.(
                    targetStepKey,
                    fieldKey,
                    (field.type === 'NUMBER' ||
                      field.type === 'DECIMAL' ||
                      field.type === 'CURRENCY') &&
                      e.target.value !== ''
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}

            {errorMessage ? (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errorMessage}
              </p>
            ) : field.helpText ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {field.helpText}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
