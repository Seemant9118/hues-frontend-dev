import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { goodsApi } from '@/api/inventories/goods/goods';
import {
  capitalize,
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
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
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import {
  getGoodsType,
  getProductGoodsCategories,
} from '@/services/Admin_Services/AdminServices';
import {
  CreateProductGoods,
  UpdateProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { CustomMenuList } from '../multi-step-form/components/AddProductCustomMenuList ';
import AddProductTypeModal from '../multi-step-form/components/AddProductTypeModal';

const AddProductType = ({ setIsCreatingGoods, goodsToEdit }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const queryClient = useQueryClient();
  const hasRestoredDraftRef = useRef(false);

  const [formData, setFormData] = useState({
    goodsTypeId: null,
    productTypeLabel: '',
    goodsType: null,

    description: '',
    hsnCode: '',
    gstPercentage: '',
    huesItemId: '',

    categoryId: null,
    subCategoryId: null,
    categoryName: '',
    subCategoryName: '',

    enterpriseId,
  });

  const [errors, setErrors] = useState(null);
  const [isAddProductTypeOpen, setIsAddProductTypeOpen] = useState(false);

  // temporary state to apply subCategory only after categories are available
  const [pendingCategoryIds, setPendingCategoryIds] = useState({
    categoryId: null,
    subCategoryId: null,
  });
  const draftData = SessionStorageService.get(
    `${enterpriseId}_ItemMasterDraft`,
  );

  /* ------------------ RESTORE DRAFT ------------------ */
  useEffect(() => {
    if (goodsToEdit) return;
    if (!draftData || hasRestoredDraftRef.current) return;

    setFormData((prev) => ({
      ...prev,
      ...draftData,
    }));

    hasRestoredDraftRef.current = true;
  }, [draftData, goodsToEdit]);

  /* ------------------ EDIT MODE PREFILL ------------------ */
  useEffect(() => {
    if (!goodsToEdit) return;

    setFormData((prev) => ({
      ...prev,
      ...goodsToEdit,
      goodsType: goodsToEdit?.goodsType || null,
    }));
  }, [goodsToEdit]);

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

  // IMPORTANT: apply pending subCategory only after category exists
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

    // clear field error on change
    setErrors((prev) => {
      if (!prev) return prev;
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.goodsTypeId) {
      newErrors.goodsTypeId = 'Product Type is required';
    }

    if (!data.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!data.subCategoryId) {
      newErrors.subCategoryId = 'Sub Category is required';
    }

    if (!data.hsnCode || !data.hsnCode.trim()) {
      newErrors.hsnCode = 'HSN Code is required';
    }

    if (!data.description || !data.description.trim()) {
      newErrors.description = 'Description is required';
    }

    return newErrors;
  };

  /* ------------------ MUTATIONS ------------------ */
  const addMutation = useMutation({
    mutationFn: CreateProductGoods,
    onSuccess: () => {
      toast.success('Item Master created successfully');
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getAllProductGoods.endpointKey],
      });
      SessionStorageService.remove(`${enterpriseId}_ItemMasterDraft`);
      setIsCreatingGoods(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  const updateMutation = useMutation({
    mutationFn: UpdateProductGoods,
    onSuccess: () => {
      toast.success('Item Master updated successfully');
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getAllProductGoods.endpointKey],
      });
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getProductGoods.endpointKey],
      });
      SessionStorageService.remove(`${enterpriseId}_ItemMasterDraft`);
      setIsCreatingGoods(false);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    },
  });

  /* ------------------ SUBMIT HANDLER ------------------ */
  const handleSubmit = (type = 'submit') => {
    if (type === 'save') {
      saveDraftToSession({
        key: `${enterpriseId}_ItemMasterDraft`,
        data: formData,
      });
      toast.success('Draft saved');
      setIsCreatingGoods(false);
      return;
    }

    // RUN VALIDATION FIRST
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    // STOP if errors exist
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    // BUILD PAYLOAD
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        payload.append(key, String(value));
      }
    });

    // ADD / UPDATE
    if (goodsToEdit) {
      updateMutation.mutate({
        id: goodsToEdit.id,
        data: payload,
      });
      return;
    }

    addMutation.mutate(payload);
  };

  return (
    <Wrapper className="flex min-h-screen flex-col">
      <SubHeader name={goodsToEdit ? 'Edit Item Type' : 'Add Item Type'} />

      {/* ---------------- CONTENT (SCROLLABLE) ---------------- */}
      <section className="mt-4 flex-1 overflow-y-auto px-2">
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
                  setErrors(null);
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
          {/* <div>
          <Label>
            Product Name <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="Product Name"
            value={formData?.productName || ''}
            onChange={handleChange('productName')}
          />
          {errors?.productName && <ErrorBox msg={errors.productName} />}
        </div> */}

          {/* SKU */}
          {/* <div>
          <Label>SKU ID</Label> <span className="text-red-600">*</span>
          <Input
            placeholder="SKU ID"
            value={formData?.skuId || ''}
            onChange={handleChange('skuId')}
          />
          {errors?.skuId && <ErrorBox msg={errors.skuId} />}
        </div> */}

          {/* Manufacturer */}
          {/* <div>
          <Label>Manufacturer&apos;s Name</Label>
          <Input
            placeholder="Manufacturer's name"
            value={formData?.manufacturerName || ''}
            onChange={handleChange('manufacturerName')}
          />
        </div> */}

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
          {/* <div>
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
        </div> */}

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
      </section>

      {/* ---------------- FOOTER (ALWAYS BOTTOM) ---------------- */}
      <section className="shrink-0 border-t bg-white/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex w-full justify-end gap-2">
          <Button
            debounceTime={0}
            size="sm"
            variant="outline"
            onClick={() => setIsCreatingGoods(false)}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSubmit('save')}
          >
            Save Draft
          </Button>

          <Button
            size="sm"
            disabled={addMutation.isPending || updateMutation.isPending}
            onClick={() => handleSubmit('submit')}
          >
            {goodsToEdit ? 'Update' : 'Create'}
          </Button>
        </div>
      </section>
    </Wrapper>
  );
};

export default AddProductType;
