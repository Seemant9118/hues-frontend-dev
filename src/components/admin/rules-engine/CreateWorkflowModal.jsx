'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ErrorBox from '@/components/ui/ErrorBox';
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
import { useEffect, useState } from 'react';

export default function CreateWorkflowModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  modules = [],
  defaultModule = 'ORDER',
  disableUserToSelectModule = false,
}) {
  const [formData, setFormData] = useState({
    module: defaultModule || 'ORDER',
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && defaultModule) {
      setFormData((prev) => ({ ...prev, module: defaultModule }));
    }
  }, [defaultModule, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
    }
    if (!formData.module) {
      newErrors.module = 'Module selection is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      module: formData.module,
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[485px]">
        <DialogHeader>
          <DialogTitle>Create Workflow Definition</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>
              Module <span className="text-red-500">*</span>
            </Label>
            <Select
              disabled={disableUserToSelectModule}
              value={formData.module}
              onValueChange={(val) => handleChange('module', val)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.length > 0 ? (
                  modules.map((m) => (
                    <SelectItem key={m.key} value={m.key}>
                      {m.label} ({m.key})
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="ORDER">Order (ORDER)</SelectItem>
                    <SelectItem value="INVOICE">Invoice (INVOICE)</SelectItem>
                    <SelectItem value="PAYMENT">Payment (PAYMENT)</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {errors.module && <ErrorBox msg={errors.module} />}
          </div>

          <div>
            <Label>
              Workflow Name <span className="text-red-500">*</span>
            </Label>
            <Input
              className="mt-1"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Sales Order Approval & Checklist Flow"
            />
            {errors.name && <ErrorBox msg={errors.name} />}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              className="mt-1"
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional summary of this workflow process..."
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create & Open Canvas'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
