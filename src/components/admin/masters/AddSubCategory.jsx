'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubHeader from '@/components/ui/Sub-header';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  createSubCategory,
  updateSubCategory,
  getProductGoodsCategories,
} from '@/services/Admin_Services/AdminServices';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AdminAPIs } from '@/api/adminApi/AdminApi';

export default function AddSubCategory({
  isAddingSubCategory,
  onClose,
  setIsAddingSubCategory,
  subCategoryToEdit,
}) {
  const [formData, setFormData] = useState({
    categoryId: '',
    subCategoryName: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  /* 🔹 Fetch categories */
  const { data: categories = [] } = useQuery({
    queryKey: [AdminAPIs.getProductGoodsCategories.endpointKey],
    queryFn: getProductGoodsCategories,
    select: (data) => data.data.data.data,
    enabled: isAddingSubCategory,
  });

  /* 🔹 FIX: Sync edit data AFTER categories load */
  useEffect(() => {
    if (!subCategoryToEdit || !categories.length) return;

    setFormData({
      categoryId: String(subCategoryToEdit.categoryId),
      subCategoryName: subCategoryToEdit.subCategoryName || '',
      description: subCategoryToEdit.description || '',
    });
  }, [subCategoryToEdit, categories]);

  /* 🔹 Category options */
  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      label: c.categoryName,
      value: String(c.id),
    }));
  }, [categories]);

  /* RESET subCategoryName + description ONLY when user changes category */
  const handleCategoryChange = (value) => {
    setFormData(() => ({
      categoryId: value,
      subCategoryName: '',
      description: '',
    }));

    if (errors.categoryId) {
      setErrors((prev) => ({ ...prev, categoryId: '' }));
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  /* 🔹 Create */
  const CreateSubCategoryMutation = useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      toast.success('Sub Category Created Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  /* 🔹 Update */
  const UpdateSubCategoryMutation = useMutation({
    mutationFn: updateSubCategory,
    onSuccess: () => {
      toast.success('Sub Category Updated Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const isSubmitting =
    CreateSubCategoryMutation.isPending || UpdateSubCategoryMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.subCategoryName.trim()) {
      newErrors.subCategoryName = 'Sub category name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      categoryId: Number(formData.categoryId),
      subCategoryName: formData.subCategoryName.trim(),
      description: formData.description.trim() || null,
    };

    if (subCategoryToEdit) {
      UpdateSubCategoryMutation.mutate({
        id: subCategoryToEdit.id,
        data: payload,
      });
      return;
    }

    CreateSubCategoryMutation.mutate({ data: payload });
  };

  return (
    <Wrapper className="scrollBarStyles">
      {/* Header */}
      <section className="sticky top-0 z-10 bg-white py-2">
        <SubHeader
          name={
            subCategoryToEdit ? 'Update Sub Category' : 'Create Sub Category'
          }
        />
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <Label>Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categoryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.categoryId && <ErrorBox msg={errors.categoryId} />}
        </div>

        {/* Sub Category Name */}
        <div>
          <Label>Sub Category Name</Label>
          <Input
            value={formData.subCategoryName}
            onChange={(e) => handleChange('subCategoryName', e.target.value)}
          />
          {errors.subCategoryName && <ErrorBox msg={errors.subCategoryName} />}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => setIsAddingSubCategory(false)}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : subCategoryToEdit
                ? 'Update Sub Category'
                : 'Create Sub Category'}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
}
