import { goodsApi } from '@/api/inventories/goods/goods';
import { saveDraftToSession } from '@/appUtils/helperFunctions';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import {
  CreateProductGoods,
  UpdateProductGoods,
} from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import Wrapper from '../wrappers/Wrapper';
import MultiStepForm from './multi-step-form/MultiStepForm';
import { stepsGoodsConfig } from './multi-step-form/goods-form-configs/stepsConfig';

const AddGoods = ({ setIsCreatingGoods, goodsToEdit }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const draftData = SessionStorageService.get(`${enterpriseId}_GoodsData`);
  const translation = useTranslations('components.addGoods');
  const queryClient = useQueryClient();
  const hasRestoredDraftRef = useRef(false);
  const [goods, setGoods] = useState({
    productName: '',
    manufacturerName: '',
    description: '',
    hsnCode: '',
    costPrice: '',
    salesPrice: '',
    mrp: '',
    gstPercentage: '',
    enterpriseId,
    skuId: '',
    categoryId: null,
    subCategoryId: null,
    attributes: [],

    offers: [
      {
        offerType: '',
        minimumQuantity: null,
        bonusQuantity: null,
        offerStartDate: null,
        offerEndDate: null,
      },
    ],

    seo: {
      seoTitle: null,
      seoKeywords: null,
      seoMetaDescription: null,
    },

    // ⚠️ files NEVER come from draft
    files: {
      images: [],
      videos: [],
    },
  });
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    if (!draftData || hasRestoredDraftRef.current) return;

    setGoods((prev) => ({
      ...prev,
      ...draftData,

      // ARRAY → ARRAY (no object spread)
      offers:
        Array.isArray(draftData.offers) && draftData.offers.length
          ? draftData.offers
          : prev.offers,

      seo: {
        ...prev.seo,
        ...(draftData.seo || {}),
      },

      attributes: draftData.attributes || [],

      files: {
        images: [],
        videos: [],
      },
    }));

    hasRestoredDraftRef.current = true;
  }, []);

  // Prefill when editing an existing service
  useEffect(() => {
    if (!goodsToEdit) return;

    setGoods((prev) => ({
      ...prev,
      ...goodsToEdit,

      // ARRAY → ARRAY
      offers:
        Array.isArray(goodsToEdit.offers) && goodsToEdit.offers.length
          ? goodsToEdit.offers
          : prev.offers,

      seo: {
        ...prev.seo,
        ...(goodsToEdit.seo || {}),
      },

      attributes: goodsToEdit.attributes
        ? JSON.parse(goodsToEdit.attributes)
        : [],

      files: {
        images: [],
        videos: [],
      },
    }));
  }, [goodsToEdit]);

  const addGoodsMutation = useMutation({
    mutationFn: CreateProductGoods,
    onSuccess: () => {
      toast.success('Goods Added Successfully');
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getAllProductGoods.endpointKey],
      });
      setIsCreatingGoods(false);
      SessionStorageService.remove(`${enterpriseId}_GoodsData`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const updateGoodsMutation = useMutation({
    mutationFn: UpdateProductGoods,
    onSuccess: () => {
      toast.success('Goods Updated Successfully');
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getAllProductGoods.endpointKey],
      });
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getProductGoods.endpointKey],
      });
      setIsCreatingGoods(false);
      SessionStorageService.remove(`${enterpriseId}_GoodsData`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const buildFormData = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      // Files (images + videos under same key)
      if (key === 'files') {
        value?.images?.forEach((file) => {
          formData.append('files', file);
        });

        value?.videos?.forEach((file) => {
          formData.append('files', file);
        });

        return;
      }

      // Arrays & Objects → JSON string
      if (typeof value === 'object' && value !== null) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      // Primitives
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    return formData;
  };

  const handleSubmit = async (type = 'save') => {
    const payload = buildFormData(goods);

    if (type === 'save') {
      saveDraftToSession({
        key: `${enterpriseId}_GoodsData`,
        data: goods,
      });
      setIsCreatingGoods(false);
      toast.success('Goods saved as draft');
      return;
    }

    if (goodsToEdit) {
      updateGoodsMutation.mutate({
        id: goodsToEdit.id,
        data: payload,
      });
      return;
    }

    addGoodsMutation.mutate(payload);
  };

  return (
    <Wrapper className="h-full">
      {/* HEADER */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <h2 className="text-xl font-bold text-zinc-900">
          {translation('title')}
        </h2>
      </section>

      {/* Main Form */}
      <MultiStepForm
        isGoods={true}
        isEditing={!!goodsToEdit}
        id={enterpriseId}
        config={stepsGoodsConfig}
        formData={goods}
        setFormData={setGoods}
        errors={errors}
        setErrors={setErrors}
        onFinalSubmit={handleSubmit}
        isSubmitting={
          addGoodsMutation?.isPending || updateGoodsMutation?.isPending
        }
        onCancel={() => setIsCreatingGoods(false)}
        translation={translation}
      />
    </Wrapper>
  );
};

export default AddGoods;
