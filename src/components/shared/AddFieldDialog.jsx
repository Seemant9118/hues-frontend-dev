'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AddFieldDialog({
  isOpen,
  onClose,
  fieldType,
  onConfirm,
}) {
  const [label, setLabel] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [optionsText, setOptionsText] = useState('');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [allowedTypes, setAllowedTypes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLabel('');
      setPlaceholder('');
      setOptionsText('');
      setMinVal('');
      setMaxVal('');
      setAllowedTypes('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      toast.error('Field label cannot be empty');
      return;
    }

    const extraConfig = {};

    if (placeholder.trim()) {
      extraConfig.placeholder = placeholder.trim();
    }

    if (
      fieldType === 'SELECT' ||
      fieldType === 'RADIO' ||
      fieldType === 'CHECKBOX'
    ) {
      const parsedOptions = optionsText
        .split(/[,\n]/)
        .map((opt) => opt.trim())
        .filter(Boolean)
        .map((opt) => ({ value: opt, label: opt }));

      if (parsedOptions.length === 0) {
        toast.error('Please enter at least one option for this field');
        return;
      }
      extraConfig.options = parsedOptions;
    }

    if (fieldType === 'NUMBER' || fieldType === 'DECIMAL') {
      const validation = {};
      if (minVal !== '') {
        validation.min = Number(minVal);
      }
      if (maxVal !== '') {
        validation.max = Number(maxVal);
      }
      if (Object.keys(validation).length > 0) {
        extraConfig.validation = validation;
      }
    }

    if (fieldType === 'FILE') {
      if (allowedTypes.trim()) {
        extraConfig.allowedTypes = allowedTypes.trim();
        extraConfig.validation = {
          allowedTypes: allowedTypes.trim(),
        };
      }
    }

    onConfirm(trimmedLabel, extraConfig);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-neutral-100 bg-white p-6 shadow-lg">
        <DialogHeader className="gap-1 text-left">
          <DialogTitle className="text-lg font-bold text-neutral-800">
            Add New Field
          </DialogTitle>
          <DialogDescription className="text-neutral-450 text-xs font-medium">
            Configure properties for the new {(fieldType || '').toLowerCase()}{' '}
            field.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-4">
          {/* Field Label */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Field Label <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Special Instructions"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>

          {/* Placeholder */}
          {(fieldType === 'TEXT' ||
            fieldType === 'NUMBER' ||
            fieldType === 'DECIMAL' ||
            fieldType === 'CURRENCY' ||
            fieldType === 'SELECT') && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Placeholder
              </label>
              <Input
                type="text"
                placeholder={`e.g. Enter ${label || 'value'}...`}
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
              />
            </div>
          )}

          {/* Options for SELECT, RADIO, CHECKBOX */}
          {(fieldType === 'SELECT' ||
            fieldType === 'RADIO' ||
            fieldType === 'CHECKBOX') && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Options <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Enter options (one per line or comma-separated, e.g. Option 1, Option 2)"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="min-h-[100px] w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
              />
              <span className="text-[9px] text-neutral-400">
                Each line or comma-separated item will become an option.
              </span>
            </div>
          )}

          {/* Min & Max Values */}
          {(fieldType === 'NUMBER' || fieldType === 'DECIMAL') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Min Value
                </label>
                <Input
                  type="number"
                  step={fieldType === 'DECIMAL' ? 'any' : '1'}
                  placeholder="No minimum"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirm();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Max Value
                </label>
                <Input
                  type="number"
                  step={fieldType === 'DECIMAL' ? 'any' : '1'}
                  placeholder="No maximum"
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                  className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirm();
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Allowed File Types */}
          {fieldType === 'FILE' && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Allowed File Types / Extensions
              </label>
              <Input
                type="text"
                placeholder="e.g. .pdf,.png,.jpg,.jpeg (comma-separated)"
                value={allowedTypes}
                onChange={(e) => setAllowedTypes(e.target.value)}
                className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirm();
                  }
                }}
              />
              <span className="text-[9px] text-neutral-400">
                Leave empty to allow all file types.
              </span>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3 border-t border-dashed border-slate-100 pt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="inline-flex h-9 items-center justify-center rounded-[6px] border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirm();
              }}
              className="inline-flex h-9 items-center justify-center rounded-[6px] bg-blue-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
            >
              Add Field
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
