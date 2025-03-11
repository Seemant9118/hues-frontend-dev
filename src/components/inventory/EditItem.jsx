'use client';

import { Button } from '@/components/ui/button';
import { cn, LocalStorageService } from '@/lib/utils';
import React, { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import InputWithLabel from '../ui/InputWithLabel';

const EditItem = ({
  setIsEditing,
  goodsToEdit,
  setGoodsToEdit,
  servicesToEdit,
  setServicesToEdit,
  mutationFunc,
  queryKey,
}) => {
  const translations = useTranslations();
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const userId = LocalStorageService.get('user_profile');
  const Id = goodsToEdit ? goodsToEdit.id : servicesToEdit.id;

  const [item, setItem] = useState(
    goodsToEdit
      ? {
          enterpriseId,
          templateId: userId,
          productName: goodsToEdit.productName,
          manufacturerName: goodsToEdit.manufacturerName,
          serviceName: goodsToEdit.serviceName,
          description: goodsToEdit.description,
          hsnCode: goodsToEdit.hsnCode,
          SAC: goodsToEdit.sac,
          rate: goodsToEdit.rate,
          gstPercentage: goodsToEdit.gstPercentage,
          type: 'goods',
          quantity: goodsToEdit.quantity,
          batch: goodsToEdit.batch,
          expiry: goodsToEdit.expiry,
          weight: goodsToEdit.weight,
          length: goodsToEdit.length,
          breadth: goodsToEdit.breadth,
          height: goodsToEdit.height,
          applications: goodsToEdit.applications,
          manufacturerGstId: goodsToEdit.manufacturerGstId,
          units: goodsToEdit.units,
        }
      : {
          enterpriseId,
          templateId: userId,
          productName: '',
          manufacturerName: '',
          serviceName: servicesToEdit.serviceName,
          description: servicesToEdit.description,
          hsnCode: '',
          SAC: servicesToEdit.sac,
          rate: servicesToEdit.rate,
          gstPercentage: servicesToEdit.gstPercentage,
          type: 'servies',
          batch: '',
          expiry: servicesToEdit.expiry,
          weight: '',
          length: '',
          breadth: '',
          height: '',
          applications: servicesToEdit.applications,
          units: '',
        },
  );

  const updateMutation = useMutation({
    mutationFn: (data) => mutationFunc(data, Id),
    onSuccess: (data) => {
      if (!data.data.status) {
        this.onError();
        return;
      }
      toast.success('Edited Successfully');
      setItem({
        enterpriseId: '',
        templateId: '',
        productName: '',
        manufacturerName: '',
        serviceName: '',
        description: '',
        hsnCode: '',
        SAC: '',
        rate: '',
        gstPercentage: '',
        type: '',
        batch: '',
        expiry: '',
        weight: '',
        length: '',
        breadth: '',
        height: '',
        manufacturerGstId: '',
        applications: '',
        units: '',
      });
      goodsToEdit ? setGoodsToEdit(null) : setServicesToEdit(null);
      setIsEditing((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey,
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const onChange = (e) => {
    const { id, value } = e.target;
    setItem((values) => ({ ...values, [id]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(item);
  };

  return (
    <form
      onSubmit={handleEditSubmit}
      className={cn(
        'scrollBarStyles relative flex h-full flex-col gap-3 overflow-y-auto p-2',
      )}
    >
      <h2 className="text-2xl font-bold text-zinc-900">
        {translations('goods.components.add.title')}
      </h2>

      {/* mandatory data fields */}
      {item.type === 'goods' ? (
        // for goods
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name={translations('goods.components.add.label.productName')}
              id="productName"
              required={true}
              onChange={onChange}
              value={item.productName}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.manufactureName')}
              id="manufacturerName"
              required={true}
              onChange={onChange}
              value={item.manufacturerName}
            />
          </div>
          <InputWithLabel
            name={translations('goods.components.add.label.description')}
            id="description"
            required={true}
            onChange={onChange}
            value={item.description}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name={translations('goods.components.add.label.hsnCode')}
              id="hsnCode"
              required={true}
              onChange={onChange}
              value={item.hsnCode}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.rate')}
              id="rate"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.gst')}
              id="gstPercentage"
              required={true}
              onChange={onChange}
              value={item.gstPercentage}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.quantity')}
              id="quantity"
              required={true}
              onChange={onChange}
              value={item.quantity}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name={translations('goods.components.add.label.batch')}
              id="batch"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.batch}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.expiry')}
              id="expiry"
              // required={item.type === "goods" || item.type === "services"}
              onChange={onChange}
              value={item.expiry}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name={translations('goods.components.add.label.manufacturerGST')}
              id="manufacturerGstId"
              onChange={onChange}
              value={item.manufacturerGstId}
            />
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <InputWithLabel
              name={translations('goods.components.add.label.weight')}
              id="weight"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.weight}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.length')}
              id="length"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.length}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.breadth')}
              id="breadth"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.breadth}
            />
            <InputWithLabel
              name={translations('goods.components.add.label.height')}
              id="height"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.height}
            />
          </div>
        </>
      ) : (
        // for services
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name={translations('services.components.add.label.serviceName')}
              id="serviceName"
              required={true}
              onChange={onChange}
              value={item.serviceName}
            />
          </div>
          <InputWithLabel
            name={translations('services.components.add.label.description')}
            id="description"
            required={true}
            onChange={onChange}
            value={item.description}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name={translations('services.components.add.label.sac')}
              id="SAC"
              required={true}
              onChange={onChange}
              value={item.SAC}
            />
            <InputWithLabel
              name={translations('services.components.add.label.rate')}
              id="rate"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
            <InputWithLabel
              name={translations('services.components.add.label.gst')}
              id="gstPercentage"
              required={true}
              onChange={onChange}
              value={item.gstPercentage}
            />
            <InputWithLabel
              name={translations('services.components.add.label.expiry')}
              id="expiry"
              onChange={onChange}
              value={item.expiry}
            />
          </div>
        </>
      )}

      {/* optional data fields */}
      <InputWithLabel
        name="Application"
        id="applications"
        // required={item.type == "goods" || item.type === "services"}
        onChange={onChange}
        value={item.applications}
      />

      <div className="sticky bottom-0 z-10 flex items-end justify-end gap-4 bg-white">
        <Button
          size="sm"
          onClick={() => {
            setIsEditing((prev) => !prev);
            goodsToEdit ? setGoodsToEdit(null) : setServicesToEdit(null);
          }}
          variant={'outline'}
        >
          {translations('services.components.add.ctas.cancel')}
        </Button>
        <Button size="sm" type="submit">
          {translations('services.components.add.ctas.edit')}
        </Button>
      </div>
    </form>
  );
};

export default EditItem;
