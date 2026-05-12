'use client';

/* eslint-disable prettier/prettier */

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';

import { Checkbox } from '@/components/ui/checkbox';

import Loading from '@/components/ui/Loading';
import { addProductType } from '@/services/Admin_Services/AdminServices';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AddProductTypeModal({ open, onClose, onSuccess }) {
  const enterpriseId = getEnterpriseId();
  const [formData, setFormData] = useState({
    itemName: '',
    categoryName: '',
    subCategoryName: '',
    hsnCode: '',
    chapter: '1',
    gstRate: '',
    fcm: false,
    rcm: false,
    exemptedCategory: false,
    nilRatedCategory: false,
    description: '',
  });

  const [errors, setErrors] = useState({});

  // Reset form on modal open
  useEffect(() => {
    if (!open) return;

    setErrors({});
    setFormData({
      itemName: '',
      categoryName: '',
      subCategoryName: '',
      hsnCode: '',
      chapter: '1',
      gstRate: '',
      fcm: false,
      rcm: false,
      exemptedCategory: false,
      nilRatedCategory: false,
      description: '',
    });
  }, [open]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const AddProductTypeMutation = useMutation({
    mutationFn: addProductType,
    onSuccess: (res) => {
      toast.success('Product Type Created Successfully');

      const created = res?.data?.data;

      // send fallback names also
      const createdItem = {
        ...(created || {}),

        // from modal inputs (fallback for UI)
        categoryName: formData?.categoryName || '',
        subCategoryName: formData?.subCategoryName || '',
      };

      onSuccess?.(createdItem);
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.itemName.trim())
      newErrors.itemName = 'Product type name is required';

    if (!formData.categoryName.trim())
      newErrors.categoryName = 'Category is required';

    if (!formData.subCategoryName.trim())
      newErrors.subCategoryName = 'Sub categoryName is required';

    if (!formData.hsnCode.trim()) newErrors.hsnCode = 'HSN Code is required';

    if (!formData.gstRate) newErrors.gstRate = 'GST rate is required';

    if (!formData.description.trim())
      newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      itemName: formData.itemName.trim(),

      // these are now plain strings (since you asked Input fields)
      categoryName: formData.categoryName.trim(),
      subCategoryName: formData.subCategoryName.trim(),

      hsnCode: formData.hsnCode.trim() || null,
      chapter: Number(formData.chapter) || null,
      gstRate: Number(formData.gstRate),
      fcm: Boolean(formData.fcm),
      rcm: Boolean(formData.rcm),
      exemptedCategory: Boolean(formData.exemptedCategory),
      nilRatedCategory: Boolean(formData.nilRatedCategory),
      description: formData.description.trim() || null,
      isDeleted: false,
    };

    AddProductTypeMutation.mutate({ enterpriseId, data: payload });
  };

  const isSubmitting = AddProductTypeMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose?.()}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-base font-semibold">
            Create Product Type
          </DialogTitle>
        </DialogHeader>

        <Wrapper className="scrollBarStyles max-h-[80vh] px-4 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              {/* Item Name */}
              <div>
                <Label>Product Type Name</Label>{' '}
                <span className="text-red-500">*</span>
                <Input
                  placeholder="Enter product type name"
                  value={formData.itemName}
                  onChange={(e) => handleChange('itemName', e.target.value)}
                />
                {errors.itemName && <ErrorBox msg={errors.itemName} />}
              </div>

              {/* Category Input */}
              <div>
                <Label>Category</Label> <span className="text-red-500">*</span>
                <Input
                  placeholder="Enter categoryName"
                  value={formData.categoryName}
                  onChange={(e) => handleChange('categoryName', e.target.value)}
                />
                {errors.categoryName && <ErrorBox msg={errors.categoryName} />}
              </div>

              {/* Sub Category Input */}
              <div>
                <Label>Sub Category</Label>{' '}
                <span className="text-red-500">*</span>
                <Input
                  placeholder="Enter sub categoryName"
                  value={formData.subCategoryName}
                  onChange={(e) =>
                    handleChange('subCategoryName', e.target.value)
                  }
                />
                {errors.subCategoryName && (
                  <ErrorBox msg={errors.subCategoryName} />
                )}
              </div>
            </div>

            {/* HSN / Chapter / GST */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>HSN Code</Label> <span className="text-red-500">*</span>
                <Input
                  value={formData.hsnCode}
                  onChange={(e) => handleChange('hsnCode', e.target.value)}
                  placeholder="Enter HSN code"
                />
                {errors.hsnCode && <ErrorBox msg={errors.hsnCode} />}
              </div>

              <div>
                <Label>Chapter</Label>
                <Input
                  value={formData.chapter}
                  onChange={(e) => handleChange('chapter', e.target.value)}
                  placeholder="Enter Chapter"
                />
              </div>

              <div>
                <Label>GST Rate (%)</Label>{' '}
                <span className="text-red-500">*</span>
                <Input
                  type="number"
                  value={formData.gstRate}
                  onChange={(e) => handleChange('gstRate', e.target.value)}
                  placeholder="Enter GST rate"
                />
                {errors.gstRate && <ErrorBox msg={errors.gstRate} />}
              </div>
            </div>

            {/* Flags */}
            <div className="grid grid-cols-2 gap-4">
              <CheckboxField
                label="FCM Applicable"
                checked={formData.fcm}
                onChange={(v) => handleChange('fcm', v)}
              />
              <CheckboxField
                label="RCM Applicable"
                checked={formData.rcm}
                onChange={(v) => handleChange('rcm', v)}
              />
              <CheckboxField
                label="Exempted Category"
                checked={formData.exemptedCategory}
                onChange={(v) => handleChange('exemptedCategory', v)}
              />
              <CheckboxField
                label="Nil Rated Category"
                checked={formData.nilRatedCategory}
                onChange={(v) => handleChange('nilRatedCategory', v)}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label> <span className="text-red-500">*</span>
              <Textarea
                rows={4}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter Description"
              />
              {errors.description && <ErrorBox msg={errors.description} />}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>

              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loading /> : 'Create Product Type'}
              </Button>
            </div>
          </form>
        </Wrapper>
      </DialogContent>
    </Dialog>
  );
}

/* Reusable Checkbox Field */
function CheckboxField({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <Label>{label}</Label>
    </div>
  );
}
