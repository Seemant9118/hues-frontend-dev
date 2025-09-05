'use client';

import { Button } from '@/components/ui/button';
import { cn, LocalStorageService } from '@/lib/utils';
import React, { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import InputWithLabel from '../ui/InputWithLabel';
import Loading from '../ui/Loading';
import InputWithSelect from '../ui/InputWithSelect';

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
          unitId: goodsToEdit?.unitId || '',
          batch: goodsToEdit.batch,
          expiry: goodsToEdit.expiry,
          weight: goodsToEdit.weight,
          weightUnitId: goodsToEdit?.weightUnitId || '',
          length: goodsToEdit.length,
          lengthUnitId: goodsToEdit?.lengthUnitId || '',
          breadth: goodsToEdit.breadth,
          breadthUnitId: goodsToEdit?.breadthUnitId || '',
          height: goodsToEdit.height,
          heightUnitId: goodsToEdit?.heightUnitId || '',
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
          applications: servicesToEdit.applications,
          units: '',
        },
  );

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

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
      <h2 className="text-xl font-bold text-zinc-900">
        {translations('goods.components.add.title2')}
      </h2>

      {/* ITEM OVERVIEW */}
      <div className="flex flex-col gap-3 rounded-md">
        <h2 className="text-sm font-bold text-primary">ITEM OVERVIEW</h2>
        <div className="grid grid-cols-3 grid-rows-2 items-center gap-4">
          {/* product Name / Service Name */}
          {item.type === 'goods' ? (
            <div className="flex flex-col">
              <InputWithLabel
                className="max-w-xs"
                name={translations('goods.components.add.label.productName')}
                id="productName"
                required={true}
                onChange={onChange}
                value={item.productName}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <InputWithLabel
                name={translations('services.components.add.label.serviceName')}
                id="serviceName"
                required={true}
                onChange={onChange}
                value={item.serviceName}
              />
            </div>
          )}

          {/* hsnCode/SAC */}
          {item.type === 'goods' ? (
            <div className="flex flex-col">
              <InputWithLabel
                name={translations('goods.components.add.label.hsnCode')}
                id="hsnCode"
                required={true}
                onChange={onChange}
                value={item.hsnCode}
              />
            </div>
          ) : (
            <div className="flex flex-col">
              <InputWithLabel
                name={translations('services.components.add.label.sac')}
                id="SAC"
                required={true}
                onChange={onChange}
                value={item.SAC}
              />
            </div>
          )}

          {/* Batch */}
          {item.type === 'goods' && (
            <InputWithLabel
              name={translations('goods.components.add.label.batch')}
              id="batch"
              onChange={onChange}
              value={item.batch}
            />
          )}
          {/* Expiry */}
          <div className="grid w-full items-center gap-1.5">
            <InputWithLabel
              name={translations('goods.components.add.label.expiry')}
              id="expiry"
              onChange={onChange}
              value={item.expiry}
            />
          </div>
          {/* application */}
          <InputWithLabel
            name={translations('goods.components.add.label.application')}
            id="applications"
            onChange={onChange}
            value={item.applications}
          />
        </div>
        {/* description */}
        <div className="flex w-full flex-col">
          <InputWithLabel
            name={translations('goods.components.add.label.description')}
            id="description"
            required={true}
            onChange={onChange}
            value={item.description}
          />
        </div>
      </div>

      {/* PRICING */}
      <div className="flex flex-col gap-3 rounded-md">
        <h2 className="text-sm font-bold text-primary">PRICING</h2>

        <div className="grid grid-cols-3 grid-rows-1 items-center gap-4">
          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.rate')}
              id="rate"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
          </div>
          {item.type === 'goods' && (
            <div className="flex flex-col">
              <InputWithSelect
                id="quantity"
                name={translations('goods.components.add.label.quantity')}
                required={true}
                value={item.quantity}
                onValueChange={onChange}
                unit={item?.unitId} // unitId from state
                onUnitChange={(val) => {
                  setItem((prev) => {
                    const updated = { ...prev, unitId: Number(val) }; // store ID
                    return updated;
                  });
                }}
                units={units?.quantity} // pass the full object list
                placeholder="Enter quantity"
                unitPlaceholder="Select unit"
              />
            </div>
          )}
          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.gst')}
              id="gstPercentage"
              required={true}
              onChange={onChange}
              value={item.gstPercentage}
            />
          </div>
        </div>
      </div>

      {/* ADDITIONAL INFORMATION */}
      {item.type === 'goods' && (
        <div className="flex flex-col gap-3 rounded-md">
          <h2 className="text-sm font-bold text-primary">
            ADDITIONAL INFORMATION
          </h2>

          <div className="grid grid-cols-3 grid-rows-1 items-center gap-4">
            <div className="flex flex-col">
              <InputWithLabel
                name={translations(
                  'goods.components.add.label.manufactureName',
                )}
                id="manufacturerName"
                required={true}
                onChange={onChange}
                value={item.manufacturerName}
              />
            </div>

            <InputWithLabel
              name={translations('goods.components.add.label.manufacturerGST')}
              id="manufacturerGstId"
              onChange={onChange}
              value={item.manufacturerGstId}
            />

            <InputWithSelect
              id="weight"
              name={translations('goods.components.add.label.weight')}
              value={item.weight}
              onValueChange={onChange}
              unit={item.weightUnitId} // auto-selected from state
              onUnitChange={(val) => {
                setItem((prev) => {
                  const updated = { ...prev, weightUnitId: Number(val) }; // ensure ID
                  return updated;
                });
              }}
              units={units?.mass} // pass full object list like [{id: 1, name: 'kg'}]
              placeholder="Enter weight"
              unitPlaceholder="Select unit"
            />

            <InputWithSelect
              id="height"
              name={translations('goods.components.add.label.height')}
              value={item.height}
              onValueChange={onChange}
              unit={item.heightUnitId}
              onUnitChange={(val) => {
                setItem((prev) => {
                  const updated = { ...prev, heightUnitId: Number(val) };
                  return updated;
                });
              }}
              units={units?.length}
              placeholder="Enter height"
              unitPlaceholder="Select unit"
            />

            <InputWithSelect
              id="length"
              name={translations('goods.components.add.label.length')}
              value={item.length}
              onValueChange={onChange}
              unit={item.lengthUnitId}
              onUnitChange={(val) => {
                setItem((prev) => {
                  const updated = { ...prev, lengthUnitId: Number(val) };
                  return updated;
                });
              }}
              units={units?.length}
              placeholder="Enter length"
              unitPlaceholder="Select unit"
            />

            <InputWithSelect
              id="breadth"
              name={translations('goods.components.add.label.breadth')}
              value={item.breadth}
              onValueChange={onChange}
              unit={item.breadthUnitId}
              onUnitChange={(val) => {
                setItem((prev) => {
                  const updated = { ...prev, breadthUnitId: Number(val) };
                  return updated;
                });
              }}
              units={units?.volume}
              placeholder="Enter breadth"
              unitPlaceholder="Select unit"
            />
          </div>
        </div>
      )}

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
        <Button size="sm" type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <Loading size={14} />
          ) : (
            translations('services.components.add.ctas.edit')
          )}
        </Button>
      </div>
    </form>
  );
};

export default EditItem;
