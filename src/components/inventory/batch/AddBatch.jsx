'use client';

import {
  capitalize,
  debounce,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Wrapper from '@/components/wrappers/Wrapper';
import { GetSearchedProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import {
  CreateProductBatch,
  UpdateProductBatch,
} from '@/services/Inventories_Services/Goods_Inventories/ProductBatch_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { batchApi } from '@/api/inventories/goods/batch';
import { MoveLeft } from 'lucide-react';
import SubHeader from '@/components/ui/Sub-header';

const AddBatch = ({ setIsAdding, setIsEditing, batchToEdit, initialSku }) => {
  const translations = useTranslations('batch.addBatch');
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    skuId: '',
    batchNo: '',
    expiryDate: '',
    manufactureDate: '',
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (batchToEdit) {
      setFormData({
        skuId: batchToEdit.skuId || '',
        batchNo: batchToEdit.batchNo || '',
        expiryDate: batchToEdit.expiryDate
          ? batchToEdit.expiryDate.split('T')[0]
          : '',
        manufactureDate: batchToEdit.manufactureDate
          ? batchToEdit.manufactureDate.split('T')[0]
          : '',
        isActive: batchToEdit.isActive ?? true,
      });
    } else if (initialSku) {
      setFormData((prev) => ({
        ...prev,
        skuId: initialSku.skuId || '',
      }));
    }
  }, [batchToEdit, initialSku]);

  const debouncedLoadSkuOptions = useCallback(
    debounce((inputValue, callback) => {
      if (!inputValue || inputValue.trim().length < 3) {
        callback([]);
        return;
      }
      GetSearchedProductGoods({
        page: 1,
        limit: 20,
        data: { searchString: inputValue },
      })
        .then((res) => {
          const list = res?.data?.data?.data || [];
          callback(
            list.map((item) => ({
              label: `${capitalize(item.productName)} (${item.skuId})`,
              value: item.skuId,
            })),
          );
        })
        .catch(() => callback([]));
    }, 400),
    [],
  );

  const loadSkuOptions = (inputValue, callback) => {
    debouncedLoadSkuOptions(inputValue, callback);
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.skuId) newErrors.skuId = 'SKU ID is required';
    if (!formData.batchNo?.trim())
      newErrors.batchNo = 'Batch Number is required';
    if (!formData.manufactureDate)
      newErrors.manufactureDate = 'Mfg Date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: CreateProductBatch,
    onSuccess: () => {
      toast.success(translations('messages.createSuccess'));
      queryClient.invalidateQueries({
        queryKey: [batchApi.listBatches.endpointKey],
      });
      setIsAdding(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to create batch');
    },
  });

  const updateMutation = useMutation({
    mutationFn: UpdateProductBatch,
    onSuccess: () => {
      toast.success(translations('messages.updateSuccess'));
      queryClient.invalidateQueries({
        queryKey: [batchApi.listBatches.endpointKey],
      });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update batch');
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;

    if (batchToEdit) {
      updateMutation.mutate({
        publicId: batchToEdit.publicId,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (batchToEdit) setIsEditing(false);
    else setIsAdding(false);
  };

  return (
    <Wrapper className="flex h-full flex-col bg-white">
      <section className="sticky top-0 z-10 flex items-end gap-2 bg-white py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8 rounded-full"
        >
          <MoveLeft size={20} />
        </Button>
        <SubHeader
          name={batchToEdit ? translations('title2') : translations('title1')}
        />
      </section>

      <div className="min-h-[calc(100vh-150px)] space-y-6 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* SKU Selection */}
          <div className="space-y-2">
            <Label>
              {translations('label.skuId')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <AsyncSelect
              cacheOptions
              defaultOptions={false}
              loadOptions={loadSkuOptions}
              placeholder="Search SKU... (Enter at least 3 characters)"
              styles={getStylesForSelectComponent()}
              className="text-sm"
              value={
                formData.skuId
                  ? {
                      label:
                        initialSku && formData.skuId === initialSku.skuId
                          ? `${capitalize(initialSku.productName)} (${
                              initialSku.skuId
                            })`
                          : formData.skuId,
                      value: formData.skuId,
                    }
                  : null
              }
              onChange={(opt) => handleChange('skuId', opt?.value || '')}
              isDisabled={!!batchToEdit}
            />
            {errors.skuId && <ErrorBox msg={errors.skuId} />}
          </div>

          {/* Batch Number */}
          <div className="space-y-2">
            <Label>
              {translations('label.batchNo')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter Batch Number"
              value={formData.batchNo}
              onChange={(e) => handleChange('batchNo', e.target.value)}
            />
            {errors.batchNo && <ErrorBox msg={errors.batchNo} />}
          </div>

          {/* Manufacture Date */}
          <div className="space-y-2">
            <Label>
              {translations('label.manufactureDate')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.manufactureDate}
              onChange={(e) => handleChange('manufactureDate', e.target.value)}
            />
            {errors.manufactureDate && (
              <ErrorBox msg={errors.manufactureDate} />
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>
              {translations('label.expiryDate')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
            />
            {errors.expiryDate && <ErrorBox msg={errors.expiryDate} />}
          </div>

          {/* Is Active */}
          <div className="flex items-center space-x-2 pt-8">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(val) => handleChange('isActive', val)}
            />
            <Label htmlFor="isActive">{translations('label.isActive')}</Label>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full justify-end gap-2 border-t bg-white/70 p-2 backdrop-blur-sm">
        <Button size="sm" variant="outline" onClick={handleBack}>
          {translations('ctas.cancel')}
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {batchToEdit
            ? translations('ctas.update')
            : translations('ctas.create')}
        </Button>
      </div>
    </Wrapper>
  );
};

export default AddBatch;
