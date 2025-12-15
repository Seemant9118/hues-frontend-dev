import { AdminAPIs } from '@/api/adminApi/AdminApi';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getProductGoodsCategories } from '@/services/Admin_Services/AdminServices';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

export default function ItemOverview({
  formData,
  setFormData,
  errors,
  translation,
}) {
  /* Fetch categories */
  const { data: categories = [] } = useQuery({
    queryKey: [AdminAPIs.getProductGoodsCategories.endpointKey],
    queryFn: getProductGoodsCategories,
    select: (data) => data.data.data.data,
  });

  /* Options */
  const categoryOptions = React.useMemo(() => {
    return categories.map((c) => ({
      label: c.categoryName,
      value: String(c.id),
    }));
  }, [categories]);

  const selectedCategory = React.useMemo(() => {
    return categories.find(
      (c) => String(c.id) === String(formData?.categoryId),
    );
  }, [categories, formData?.categoryId]);

  const subCategoryOptions = React.useMemo(() => {
    if (!selectedCategory?.subCategories) return [];

    return selectedCategory.subCategories.map((sc) => ({
      label: sc.subCategoryName,
      value: String(sc.id),
    }));
  }, [selectedCategory]);

  /* Handlers */
  const handleChange = (key) => (value) => {
    const finalValue = value && value.target ? value.target.value : value;

    setFormData((prev) => ({
      ...prev,
      [key]: finalValue,
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
      subCategoryId: null, // reset sub-category
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section1.title')}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Product Name */}
        <div className="col-span-3">
          <Label>
            Product Name <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="Product Name"
            value={formData?.productName || ''}
            onChange={handleChange('productName')}
          />
          {errors?.productName && <ErrorBox msg={errors.productName} />}
        </div>

        {/* Category */}
        <div>
          <Label>
            Category <span className="text-red-600">*</span>
          </Label>
          <Select
            value={String(formData?.categoryId || '')}
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
          {errors?.categoryId && <ErrorBox msg={errors.categoryId} />}
        </div>

        {/* Sub Category */}
        <div>
          <Label>
            Sub Category <span className="text-red-600">*</span>
          </Label>
          <Select
            value={String(formData?.subCategoryId || '')}
            onValueChange={handleChange('subCategoryId')}
            disabled={!formData?.categoryId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sub category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {subCategoryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.subCategoryId && <ErrorBox msg={errors.subCategoryId} />}
        </div>

        {/* Manufacturer */}
        <div>
          <Label>
            Manufacturer&apos;s Name <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="Manufacturer's name"
            value={formData?.manufacturerName || ''}
            onChange={handleChange('manufacturerName')}
          />
          {errors?.manufacturerName && (
            <ErrorBox msg={errors.manufacturerName} />
          )}
        </div>

        {/* HSN */}
        <div>
          <Label>
            HSN Code <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="HSN Code"
            value={formData?.hsnCode || ''}
            onChange={handleChange('hsnCode')}
          />
          {errors?.hsnCode && <ErrorBox msg={errors.hsnCode} />}
        </div>

        {/* GST */}
        <div>
          <Label>
            GST (%) <span className="text-red-600">*</span>
          </Label>
          <Input
            type="number"
            placeholder="00.00%"
            value={formData?.gstPercentage || ''}
            onChange={handleChange('gstPercentage')}
          />
          {errors?.gstPercentage && <ErrorBox msg={errors.gstPercentage} />}
        </div>

        {/* SKU */}
        <div>
          <Label>SKU ID</Label>
          <Input
            placeholder="SKU ID"
            value={formData?.skuId || ''}
            onChange={handleChange('skuId')}
          />
        </div>

        {/* HUES */}
        <div>
          <Label>HUES ID</Label>
          <Input disabled placeholder="Auto-generated" />
        </div>

        {/* Description */}
        <div className="col-span-3">
          <Label>
            Description <span className="text-red-600">*</span>
          </Label>
          <Textarea
            rows={4}
            placeholder="Enter product description"
            value={formData?.description || ''}
            onChange={handleChange('description')}
          />
          {errors?.description && <ErrorBox msg={errors.description} />}
        </div>
      </div>
    </div>
  );
}
