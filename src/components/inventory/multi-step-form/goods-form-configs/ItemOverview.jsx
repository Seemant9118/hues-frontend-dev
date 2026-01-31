import { AdminAPIs } from '@/api/adminApi/AdminApi';
import {
  capitalize,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
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
import {
  getGoodsType,
  getProductGoodsCategories,
} from '@/services/Admin_Services/AdminServices';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import { CustomMenuList } from '../components/AddProductCustomMenuList ';
import AddProductTypeModal from '../components/AddProductTypeModal';

export default function ItemOverview({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [isAddProductTypeOpen, setIsAddProductTypeOpen] = useState(false);

  // api call for search & get
  const loadProductTypeOptions = async (inputValue) => {
    // No API call for empty / short input
    if (!inputValue || inputValue.trim().length < 3) {
      return [];
    }

    try {
      const res = await getGoodsType({ searchString: inputValue });

      // Correct list extraction
      const list = res?.data?.data?.data || [];

      // Map to react-select format
      return list.map((item) => ({
        label: `${capitalize(item.item)}`,
        value: item.id,

        // optional: keep full object for later use
        meta: {
          huesItemId: item.huesItemId,
          gstRate: item.gstRate,
          hsnCode: item.hsnCode,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          categoryName: item.category?.categoryName,
          subCategoryName: item.subCategory?.subCategoryName,
          description: item.description,
        },
      }));
    } catch (error) {
      toast.error('Failed to fetch product types');
      return [];
    }
  };
  // selectedOptions - good type
  const selectedProductTypeOption = React.useMemo(() => {
    if (!formData?.goodsTypeId) return null;

    return {
      label: formData.productTypeLabel,
      value: formData.goodsTypeId,
    };
  }, [formData?.goodsTypeId, formData?.productTypeLabel]);

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
        {/* Product Type */}
        <div>
          <Label>
            Product Type <span className="text-red-600">*</span>
          </Label>
          {formData?.goodsType?.item ? (
            <Input
              disabled
              placeholder="Enter  Product Type"
              value={formData?.goodsType?.item}
            />
          ) : (
            <AsyncSelect
              cacheOptions
              defaultOptions={false}
              loadOptions={loadProductTypeOptions}
              placeholder="Search Product Type"
              styles={getStylesForSelectComponent()}
              className="text-sm"
              classNamePrefix="select"
              value={selectedProductTypeOption}
              filterOption={null}
              noOptionsMessage={() => 'Type at least 3 characters'}
              components={{ MenuList: CustomMenuList }}
              isClearable
              onAddNewProductType={() => setIsAddProductTypeOpen(true)}
              onChange={(selectedOption) => {
                // if user clears the select
                if (!selectedOption) {
                  setFormData((prev) => ({
                    ...prev,
                    goodsTypeId: null,
                    productTypeLabel: '',

                    // remove prefilled data
                    hsnCode: '',
                    gstPercentage: '',
                    categoryId: null,
                    subCategoryId: null,
                    huesItemId: null,
                    description: '',
                  }));
                  return;
                }

                setFormData((prev) => ({
                  ...prev,
                  goodsTypeId: selectedOption.value,
                  productTypeLabel: selectedOption.label,

                  // auto-fill new data
                  hsnCode: selectedOption.meta?.hsnCode || '',
                  gstPercentage: selectedOption.meta?.gstRate || '',
                  categoryId: selectedOption.meta?.categoryId || null,
                  subCategoryId: selectedOption.meta?.subCategoryId || null,
                  huesItemId: selectedOption.meta?.huesItemId || null,
                  description: selectedOption.meta?.description || '',
                }));
              }}
            />
          )}

          {errors?.goodsTypeId && <ErrorBox msg={errors.goodsTypeId} />}
        </div>

        {/* Product Name */}
        <div>
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

        {/* SKU */}
        <div>
          <Label>SKU ID</Label>
          <Input
            placeholder="SKU ID"
            value={formData?.skuId || ''}
            onChange={handleChange('skuId')}
          />
        </div>

        {/* Manufacturer */}
        <div>
          <Label>Manufacturer&apos;s Name</Label>
          <Input
            placeholder="Manufacturer's name"
            value={formData?.manufacturerName || ''}
            onChange={handleChange('manufacturerName')}
          />
        </div>

        {/* Category */}
        <div>
          <Label>
            Category <span className="text-red-600">*</span>
          </Label>
          <Select
            disabled
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
            disabled
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

        {/* HUES */}
        <div>
          <Label>HUES ID</Label>
          <Input
            disabled
            placeholder="Auto-generated"
            value={formData?.huesItemId || formData?.goodsType?.huesItemId}
          />
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

        <AddProductTypeModal
          open={isAddProductTypeOpen}
          onClose={() => setIsAddProductTypeOpen(false)}
        />
      </div>
    </div>
  );
}
