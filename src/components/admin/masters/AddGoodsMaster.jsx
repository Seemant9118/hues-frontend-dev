'use client';

/* eslint-disable prettier/prettier */

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubHeader from '@/components/ui/Sub-header';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';
import ErrorBox from '@/components/ui/ErrorBox';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createGoodsMaster,
  getProductGoodsCategories,
  updateGoodsMaster,
} from '@/services/Admin_Services/AdminServices';
import { toast } from 'sonner';
import { AdminAPIs } from '@/api/adminApi/AdminApi';
import Loading from '@/components/ui/Loading';

export default function AddGoodsMaster({
  onClose,
  setIsAddingGoodsMaster,
  goodsMasterToEdit,
}) {
  const [formData, setFormData] = useState({
    huesItemId: goodsMasterToEdit?.huesItemId || '',
    itemName: goodsMasterToEdit?.item || '',
    categoryId: goodsMasterToEdit?.categoryId
      ? String(goodsMasterToEdit.categoryId)
      : '',
    subCategoryId: goodsMasterToEdit?.subCategoryId
      ? String(goodsMasterToEdit.subCategoryId)
      : '',
    hsnCode: goodsMasterToEdit?.hsnCode || '',
    chapter: goodsMasterToEdit?.chapter || '',
    gstRate: goodsMasterToEdit?.gstRate || '',
    fcm: !!goodsMasterToEdit?.fcm,
    rcm: !!goodsMasterToEdit?.rcm,
    exemptedCategory: !!goodsMasterToEdit?.exemptedCategory,
    nilRatedCategory: !!goodsMasterToEdit?.nilRatedCategory,
    description: goodsMasterToEdit?.description || '',
  });

  const [errors, setErrors] = useState({});

  /* Fetch categories */
  const { data: categories = [] } = useQuery({
    queryKey: [AdminAPIs.getProductGoodsCategories.endpointKey],
    queryFn: getProductGoodsCategories,
    select: (data) => data.data.data.data,
  });

  const selectedCategory = React.useMemo(() => {
    return categories.find((c) => String(c.id) === String(formData.categoryId));
  }, [categories, formData.categoryId]);

  const subCategoryOptions = React.useMemo(() => {
    return selectedCategory?.subCategories || [];
  }, [selectedCategory]);

  React.useEffect(() => {
    if (!goodsMasterToEdit || !categories.length) return;

    setFormData((prev) => ({
      ...prev,
      categoryId: String(goodsMasterToEdit.categoryId),
      subCategoryId: String(goodsMasterToEdit.subCategoryId),
    }));
  }, [goodsMasterToEdit, categories]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const CreateGoodsMutation = useMutation({
    mutationFn: createGoodsMaster,
    onSuccess: () => {
      toast.success('Goods Master Created Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const UpdateGoodsMutation = useMutation({
    mutationFn: updateGoodsMaster,
    onSuccess: () => {
      toast.success('Goods Master updated Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.huesItemId.trim())
      newErrors.huesItemId = 'Hues Item ID is required';

    if (!formData.itemName.trim()) newErrors.itemName = 'Item name is required';

    if (!formData.categoryId) newErrors.categoryId = 'Category is required';

    if (!formData.subCategoryId)
      newErrors.subCategoryId = 'Sub category is required';

    if (!formData.gstRate) newErrors.gstRate = 'GST rate is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      huesItemId: formData.huesItemId.trim(),
      itemName: formData.itemName.trim(),
      categoryId: Number(formData.categoryId),
      subCategoryId: Number(formData.subCategoryId),
      hsnCode: formData.hsnCode.trim() || null,
      chapter: Number(formData.chapter) || null,
      gstRate: Number(formData.gstRate),
      fcm: Boolean(formData.fcm),
      rcm: Boolean(formData.rcm),
      exemptedCategory: Boolean(formData.exemptedCategory),
      nilRatedCategory: Boolean(formData.nilRatedCategory),
      description: formData.description.trim() || null,
    };

    if (goodsMasterToEdit) {
      UpdateGoodsMutation.mutate({
        data: { ...payload, id: goodsMasterToEdit.id },
      });
      return;
    }

    CreateGoodsMutation.mutate({ data: payload });
  };

  const isSubmitting =
    CreateGoodsMutation.isPending || UpdateGoodsMutation.isPending;

  return (
    <Wrapper className="scrollBarStyles">
      {/* Header */}
      <section className="sticky top-0 z-10 bg-white py-2">
        <SubHeader
          name={
            goodsMasterToEdit ? 'Update Goods Master' : 'Create Goods Master'
          }
        />
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hues Item ID */}
        <div>
          <Label>Hues Item ID</Label>
          <Input
            placeholder="Enter hues item id"
            value={formData.huesItemId}
            onChange={(e) => handleChange('huesItemId', e.target.value)}
          />
          {errors.huesItemId && <ErrorBox msg={errors.huesItemId} />}
        </div>

        {/* Item Name */}
        <div>
          <Label>Item Name</Label>
          <Input
            placeholder="Enter item name"
            value={formData.itemName}
            onChange={(e) => handleChange('itemName', e.target.value)}
          />
          {errors.itemName && <ErrorBox msg={errors.itemName} />}
        </div>

        {/* Category */}
        <div>
          <Label>Category</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(val) => {
              const selectedCategory = categories.find(
                (c) => String(c.id) === String(val),
              );

              setFormData((prev) => ({
                ...prev,
                categoryId: val,
                subCategoryId: '', // ✅ reset sub category
                description:
                  prev.description || selectedCategory?.description || '',
              }));

              setErrors((prev) => ({
                ...prev,
                categoryId: '',
                subCategoryId: '',
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <ErrorBox msg={errors.categoryId} />}
        </div>

        {/* Sub Category */}
        <div>
          <Label>Sub Category</Label>
          <Select
            value={formData.subCategoryId}
            onValueChange={(val) => {
              const selectedSubCategory = selectedCategory?.subCategories?.find(
                (sc) => String(sc.id) === String(val),
              );

              setFormData((prev) => ({
                ...prev,
                subCategoryId: val,
                description:
                  prev.description ||
                  selectedSubCategory?.description ||
                  prev.description,
              }));

              setErrors((prev) => ({
                ...prev,
                subCategoryId: '',
              }));
            }}
            disabled={!subCategoryOptions.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select sub category" />
            </SelectTrigger>
            <SelectContent>
              {subCategoryOptions.map((sub) => (
                <SelectItem key={sub.id} value={String(sub.id)}>
                  {sub.subCategoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subCategoryId && <ErrorBox msg={errors.subCategoryId} />}
        </div>

        {/* HSN / Chapter / GST */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>HSN Code</Label>
            <Input
              value={formData.hsnCode}
              onChange={(e) => handleChange('hsnCode', e.target.value)}
            />
          </div>

          <div>
            <Label>Chapter</Label>
            <Input
              value={formData.chapter}
              onChange={(e) => handleChange('chapter', e.target.value)}
            />
          </div>

          <div>
            <Label>GST Rate (%)</Label>
            <Input
              type="number"
              value={formData.gstRate}
              onChange={(e) => handleChange('gstRate', e.target.value)}
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
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setIsAddingGoodsMaster(false)}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loading />
            ) : goodsMasterToEdit ? (
              'Update Goods'
            ) : (
              'Create Goods'
            )}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
}

/* ✅ Reusable Checkbox Field */
function CheckboxField({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <Label>{label}</Label>
    </div>
  );
}
