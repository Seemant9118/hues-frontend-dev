'use client';

import React from 'react';
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

export default function WorkflowFormFieldsRenderer({
  formFields = [],
  currentStepValues = {},
  formData = {},
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
          placeholder={`Enter form input values for step...`}
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

        return (
          <div
            key={field.id || fieldKey}
            className={field.type === 'TEXTAREA' ? 'md:col-span-2' : ''}
          >
            <Label className="text-xs font-medium">
              <span>{field.label || fieldKey}</span>
              {field.required && <span className="text-red-500">*</span>}
            </Label>

            {field.type === 'SELECT' ? (
              <Select
                value={value ? String(value) : ''}
                onValueChange={(val) =>
                  onStepValueChange?.(targetStepKey, fieldKey, val)
                }
              >
                <SelectTrigger className="mt-1 bg-white text-sm">
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
                className="mt-1 bg-white text-sm"
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) =>
                  onStepValueChange?.(targetStepKey, fieldKey, e.target.value)
                }
              />
            ) : field.type === 'NUMBER' ? (
              <Input
                type="number"
                className="mt-1 bg-white text-sm"
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) =>
                  onStepValueChange?.(
                    targetStepKey,
                    fieldKey,
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
            ) : (
              <Input
                type="text"
                className="mt-1 bg-white text-sm"
                placeholder={field.placeholder || `Enter ${field.label}`}
                value={value}
                onChange={(e) =>
                  onStepValueChange?.(targetStepKey, fieldKey, e.target.value)
                }
              />
            )}

            {field.helpText && (
              <p className="mt-1 text-sm text-muted-foreground">
                {field.helpText}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
