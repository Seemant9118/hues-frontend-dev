'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubHeader from '@/components/ui/Sub-header';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';
import ErrorBox from '@/components/ui/ErrorBox';

import { useMutation } from '@tanstack/react-query';
import {
  createCategory,
  updateCategory,
} from '@/services/Admin_Services/AdminServices';
import { toast } from 'sonner';

export default function AddCategory({
  onClose,
  setIsAddingCategory,
  categoryToEdit,
}) {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  /* Populate form in Edit mode */
  useEffect(() => {
    if (!categoryToEdit) return;

    setFormData({
      categoryName: categoryToEdit.categoryName || '',
      description: categoryToEdit.description || '',
    });
  }, [categoryToEdit]);

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
  const CreateCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success('Category Created Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  /* 🔹 Update */
  const UpdateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      toast.success('Category Updated Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const isSubmitting =
    CreateCategoryMutation.isPending || UpdateCategoryMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      categoryName: formData.categoryName.trim(),
      description: formData.description.trim() || null,
    };

    /* Edit vs Create */
    if (categoryToEdit) {
      UpdateCategoryMutation.mutate({
        id: categoryToEdit.id,
        data: payload,
      });
      return;
    }

    CreateCategoryMutation.mutate({ data: payload });
  };

  return (
    <Wrapper className="scrollBarStyles">
      {/* Header */}
      <section className="sticky top-0 z-10 bg-white py-2">
        <SubHeader
          name={categoryToEdit ? 'Update Category' : 'Create Category'}
        />
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Name */}
        <div>
          <Label>Category Name</Label>
          <Input
            placeholder="Enter category name"
            value={formData.categoryName}
            onChange={(e) => handleChange('categoryName', e.target.value)}
          />
          {errors.categoryName && <ErrorBox msg={errors.categoryName} />}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            placeholder="Enter description (optional)"
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
            onClick={() => setIsAddingCategory(false)}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : categoryToEdit
                ? 'Update Category'
                : 'Create Category'}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
}
