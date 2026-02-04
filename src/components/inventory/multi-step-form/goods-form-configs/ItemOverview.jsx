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
import React, { useEffect, useMemo, useState } from 'react';
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

  // ✅ temporary state to apply subCategory only after categories are available
  const [pendingCategoryIds, setPendingCategoryIds] = useState({
    categoryId: null,
    subCategoryId: null,
  });

  // api call for search & get
  const loadProductTypeOptions = async (inputValue) => {
    if (!inputValue || inputValue.trim().length < 3) return [];

    try {
      const res = await getGoodsType({ searchString: inputValue });
      const list = res?.data?.data?.data || [];

      return list.map((item) => ({
        label: `${capitalize(item.item)}`,
        value: item.id,
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
  const selectedProductTypeOption = useMemo(() => {
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
  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({
      label: c.categoryName,
      value: String(c.id),
    }));
  }, [categories]);

  const selectedCategory = useMemo(() => {
    return categories.find(
      (c) => String(c.id) === String(formData?.categoryId),
    );
  }, [categories, formData?.categoryId]);

  const subCategoryOptions = useMemo(() => {
    if (!selectedCategory?.subCategories) return [];

    return selectedCategory.subCategories.map((sc) => ({
      label: sc.subCategoryName,
      value: String(sc.id),
    }));
  }, [selectedCategory]);

  // ✅ IMPORTANT: apply pending subCategory only after category exists
  useEffect(() => {
    if (!pendingCategoryIds?.categoryId) return;
    if (!categories?.length) return;

    const catExists = categories.find(
      (c) => String(c.id) === String(pendingCategoryIds.categoryId),
    );

    if (!catExists) return;

    setFormData((prev) => ({
      ...prev,
      categoryId: pendingCategoryIds.categoryId,
      subCategoryId: pendingCategoryIds.subCategoryId,
    }));

    // clear pending after applying
    setPendingCategoryIds({ categoryId: null, subCategoryId: null });
  }, [pendingCategoryIds, categories, setFormData]);

  /* Handlers */
  const handleChange = (key) => (value) => {
    const finalValue = value && value.target ? value.target.value : value;

    setFormData((prev) => ({
      ...prev,
      [key]: finalValue,
    }));
  };

  // const handleCategoryChange = (value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     categoryId: value,
  //     subCategoryId: null,
  //   }));
  // };

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
              placeholder="Enter Product Type"
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

                    // clear goodsType object too
                    goodsType: null,

                    hsnCode: '',
                    gstPercentage: '',
                    categoryId: null,
                    subCategoryId: null,
                    huesItemId: '',
                    description: '',

                    categoryName: '',
                    subCategoryName: '',
                  }));

                  setPendingCategoryIds({
                    categoryId: null,
                    subCategoryId: null,
                  });

                  return;
                }

                // else: set selected values
                setFormData((prev) => ({
                  ...prev,
                  goodsTypeId: selectedOption.value,
                  productTypeLabel: selectedOption.label,

                  hsnCode: selectedOption.meta?.hsnCode || '',
                  gstPercentage: selectedOption.meta?.gstRate || '',
                  categoryId: selectedOption.meta?.categoryId || null,
                  subCategoryId: selectedOption.meta?.subCategoryId || null,
                  huesItemId: selectedOption.meta?.huesItemId || '',
                  description: selectedOption.meta?.description || '',

                  categoryName: selectedOption.meta?.categoryName || '',
                  subCategoryName: selectedOption.meta?.subCategoryName || '',
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
          <Label>SKU ID</Label> <span className="text-red-600">*</span>
          <Input
            placeholder="SKU ID"
            value={formData?.skuId || ''}
            onChange={handleChange('skuId')}
          />
          {errors?.skuId && <ErrorBox msg={errors.skuId} />}
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
          <Select disabled value={String(formData?.categoryId || '')}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  formData?.categoryName
                    ? formData.categoryName
                    : 'Select category'
                }
              />
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
          <Select disabled value={String(formData?.subCategoryId || '')}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  formData?.subCategoryName
                    ? formData.subCategoryName
                    : 'Select sub category'
                }
              />
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
            value={formData?.huesItemId || ''}
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

        {/* Modal */}
        <AddProductTypeModal
          open={isAddProductTypeOpen}
          onClose={() => setIsAddProductTypeOpen(false)}
          onSuccess={(createdItem) => {
            if (!createdItem) return;

            // set everything except dependent category/subCategory first
            setFormData((prev) => ({
              ...prev,
              goodsTypeId: createdItem?.id || null,
              productTypeLabel:
                createdItem?.itemName || createdItem?.item || '',

              hsnCode: createdItem?.hsnCode || '',
              gstPercentage: createdItem?.gstRate || '',
              huesItemId: createdItem?.huesItemId || '',
              description: createdItem?.description || '',

              // store labels also (for UI fallback)
              categoryName: createdItem?.categoryName || '',
              subCategoryName: createdItem?.subCategoryName || '',
            }));

            // apply category/subCategory after categories arrive
            setPendingCategoryIds({
              categoryId: createdItem?.categoryId || null,
              subCategoryId: createdItem?.subCategoryId || null,
            });
          }}
        />
      </div>
    </div>
  );
}
