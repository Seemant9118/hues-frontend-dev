'use client';

import { FileText, Send } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

export default function SharedFormView({
  formDefinition,
  formValues,
  fieldErrors,
  handleFieldValueChange,
  handleSubmitForm,
  isSubmitting,
}) {
  const fields = formDefinition?.fields || [];

  return (
    <div className="min-h-screen bg-neutral-50/80 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Form Header Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                {formDefinition?.name || 'Custom Form'}
              </h1>
              {formDefinition?.description && (
                <p className="mt-1 text-xs text-neutral-500">
                  {formDefinition.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Body Form */}
        <form onSubmit={handleSubmitForm} className="mt-6 space-y-4">
          <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            {fields.length === 0 ? (
              <p className="py-8 text-center text-xs text-neutral-400">
                No active fields found in this form.
              </p>
            ) : (
              fields.map((field) => {
                const val = formValues[field.key] ?? '';
                const err = fieldErrors[field.key];
                const isRequired = !!field.required;

                return (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-neutral-700">
                      {field.label || field.key}{' '}
                      {isRequired && <span className="text-red-500">*</span>}
                    </label>

                    {/* Field Type Specific Controls */}
                    {field.type === 'TEXTAREA' ? (
                      <textarea
                        rows={3}
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.label || field.key}`
                        }
                        value={val}
                        required={isRequired}
                        onChange={(e) =>
                          handleFieldValueChange(field.key, e.target.value)
                        }
                        className="w-full rounded-lg border border-neutral-300 p-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    ) : field.type === 'SELECT' && field.options?.length > 0 ? (
                      <select
                        value={val}
                        required={isRequired}
                        onChange={(e) =>
                          handleFieldValueChange(field.key, e.target.value)
                        }
                        className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      >
                        <option value="">
                          {field.placeholder || '-- Select an option --'}
                        </option>
                        {field.options.map((opt) => {
                          const label =
                            typeof opt === 'object'
                              ? opt.label || opt.name
                              : opt;
                          const value =
                            typeof opt === 'object' ? opt.value || opt.id : opt;
                          return (
                            <option key={String(value || label)} value={value}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    ) : field.type === 'RADIO' ? (
                      <div className="flex flex-col gap-2 pt-1">
                        {(field.options || field.validation?.options || []).map(
                          (opt, i) => {
                            const optVal = opt.value ?? opt;
                            const optLabel = opt.label ?? opt;
                            return (
                              <label
                                key={optVal ?? i}
                                className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600"
                              >
                                <input
                                  type="radio"
                                  name={field.key}
                                  value={optVal}
                                  checked={val === optVal}
                                  required={isRequired && !val}
                                  onChange={(e) =>
                                    handleFieldValueChange(
                                      field.key,
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
                      <div className="flex flex-col gap-2 pt-1">
                        {(field.options || field.validation?.options || [])
                          .length > 0 ? (
                          (
                            field.options ||
                            field.validation?.options ||
                            []
                          ).map((opt, i) => {
                            const optVal = opt.value ?? opt;
                            const optLabel = opt.label ?? opt;
                            const values = Array.isArray(val)
                              ? val
                              : val
                                ? [val]
                                : [];
                            const isChecked = values.includes(optVal);
                            return (
                              <label
                                key={optVal ?? i}
                                className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600"
                              >
                                <input
                                  type="checkbox"
                                  name={`${field.key}_${i}`}
                                  value={optVal}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const newValues = e.target.checked
                                      ? [...values, optVal]
                                      : values.filter((v) => v !== optVal);
                                    handleFieldValueChange(
                                      field.key,
                                      newValues,
                                    );
                                  }}
                                  className="h-4 w-4 rounded text-primary focus:ring-primary/30"
                                />
                                {optLabel}
                              </label>
                            );
                          })
                        ) : (
                          <label className="inline-flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!val}
                              required={isRequired && !val}
                              onChange={(e) =>
                                handleFieldValueChange(
                                  field.key,
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary/30"
                            />
                            <span className="text-xs text-neutral-600">
                              {field.placeholder || 'Yes, I agree / confirm'}
                            </span>
                          </label>
                        )}
                      </div>
                    ) : field.type === 'FILE' ? (
                      <input
                        type="file"
                        accept={
                          field.allowedTypes || field.validation?.allowedTypes
                        }
                        required={isRequired && !val}
                        onChange={(e) =>
                          handleFieldValueChange(field.key, e.target.files)
                        }
                        className="w-full text-xs text-neutral-800 file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary hover:file:bg-primary/20"
                      />
                    ) : (
                      <input
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
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.label || field.key}`
                        }
                        value={val}
                        required={isRequired}
                        onChange={(e) =>
                          handleFieldValueChange(
                            field.key,
                            (field.type === 'NUMBER' ||
                              field.type === 'DECIMAL' ||
                              field.type === 'CURRENCY') &&
                              e.target.value !== ''
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                        className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    )}

                    {/* Field Help Text */}
                    {field.helpText && (
                      <p className="text-[11px] text-neutral-400">
                        {field.helpText}
                      </p>
                    )}

                    {/* Validation Error */}
                    {err && (
                      <p className="text-[11px] font-medium text-red-500">
                        {err}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Form Action Controls */}
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="text-xs text-neutral-400">
              Please double-check answers before submitting.
            </span>

            <Button
              type="submit"
              disabled={isSubmitting || fields.length === 0}
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Form</span>
                  <Send size={13} />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
