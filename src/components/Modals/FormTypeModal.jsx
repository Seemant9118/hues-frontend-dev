'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, Tag } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_TYPES = [
  'SERVICE',
  'TERMS',
  'VENDOR',
  'CUSTOMER',
  'MEMBERS',
  'INVOICE',
  'CUSTOM',
];

export default function FormTypeModal({
  isOpen,
  onClose,
  onContinue,
  title = 'Create New Form',
  description = 'Enter the form type or module name to start building your dynamic form layout.',
}) {
  const [formType, setFormType] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormType('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    const trimmed = formType.trim();
    if (!trimmed) {
      toast.error('Please enter a Form Type');
      return;
    }

    // Format type (e.g. replace spaces with underscore and convert to upper snake case for module key)
    const formattedType = trimmed.replace(/\s+/g, '_').toUpperCase();
    onContinue(formattedType);
  };

  const handleSelectPreset = (preset) => {
    setFormType(preset);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
        <DialogHeader className="gap-1 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle className="mt-2 text-lg font-bold text-neutral-800">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Text Input for Form Type */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">
              Enter Form Type / Module Name{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="e.g. SERVICE, INVOICE, CUSTOM_FORM..."
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="h-10 w-full rounded-lg border-neutral-300 bg-white pr-9 text-sm font-medium text-neutral-800 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                autoFocus
              />
              <Tag className="absolute right-3 top-2.5 h-4 w-4 text-neutral-400" />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-[10px] font-semibold text-neutral-400">
              Suggested Types:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TYPES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                    formType.toUpperCase() === preset
                      ? 'border-primary bg-primary/10 font-bold text-primary shadow-sm'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              size="sm"
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5 px-5 text-xs font-semibold text-white shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
