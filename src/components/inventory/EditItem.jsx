'use client';

import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import { cn, LocalStorageService } from '@/lib/utils';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import DatePickers from '../ui/DatePickers';
import InputWithLabel from '../ui/InputWithLabel';
import InputWithSelect from '../ui/InputWithSelect';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';

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
  const enterpriseId = getEnterpriseId();
  const userId = LocalStorageService.get('user_profile');
  const Id = goodsToEdit ? goodsToEdit?.id : servicesToEdit?.id;

  const [item, setItem] = useState(
    goodsToEdit
      ? {
          enterpriseId,
          templateId: userId,
          productName: goodsToEdit?.productName,
          manufacturerName: goodsToEdit?.manufacturerName,
          serviceName: goodsToEdit?.serviceName,
          description: goodsToEdit?.description,
          hsnCode: goodsToEdit?.hsnCode,
          SAC: goodsToEdit?.sac,
          skuId: goodsToEdit?.skuId,
          // rate: goodsToEdit.rate,
          costPrice: goodsToEdit?.costPrice || '',
          salesPrice: goodsToEdit?.salesPrice || '',
          mrp: goodsToEdit?.mrp || '',
          gstPercentage: goodsToEdit?.gstPercentage,
          type: 'goods',
          // quantity: goodsToEdit.quantity,
          unitId: goodsToEdit?.unitId || '',
          // batch: goodsToEdit.batch,
          expiry: goodsToEdit?.expiry,
          weight: goodsToEdit?.weight,
          weightUnitId: goodsToEdit?.weightUnitId || '',
          length: goodsToEdit?.length,
          lengthUnitId: goodsToEdit?.lengthUnitId || '',
          breadth: goodsToEdit?.breadth,
          breadthUnitId: goodsToEdit?.breadthUnitId || '',
          height: goodsToEdit?.height,
          heightUnitId: goodsToEdit?.heightUnitId || '',
          // applications: goodsToEdit.applications,
          manufacturerGstId: goodsToEdit?.manufacturerGstId,
          units: goodsToEdit?.units,
        }
      : {
          enterpriseId,
          templateId: userId,
          productName: '',
          manufacturerName: '',
          serviceName: servicesToEdit?.serviceName,
          description: servicesToEdit?.description,
          hsnCode: '',
          SAC: servicesToEdit?.sac,
          skuId: servicesToEdit?.skuId,
          // rate: servicesToEdit.rate,
          costPrice: servicesToEdit?.costPrice || '',
          salesPrice: servicesToEdit?.salesPrice || '',
          mrp: servicesToEdit?.mrp || '',
          gstPercentage: servicesToEdit?.gstPercentage,
          type: 'servies',
          // batch: '',
          expiry: servicesToEdit?.expiry,
          applications: servicesToEdit?.applications,
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
        skuId: '',
        // rate: '',
        costPrice: '',
        salesPrice: '',
        mrp: '',
        gstPercentage: '',
        type: '',
        // batch: '',
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

    const numericFields = [
      'quantity',
      'salesPrice',
      'costPrice',
      'mrp',
      'gstPercentage',
      'weight',
      'height',
      'length',
      'breadth',
    ];

    if (numericFields.includes(id)) {
      // Allow empty, partial numbers, and decimals while typing
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setItem((prev) => ({ ...prev, [id]: value }));
      }
      return;
    }

    // Handle text fields
    setItem((prev) => ({ ...prev, [id]: value }));
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

          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.gst')}
              id="gstPercentage"
              required={true}
              onChange={onChange}
              value={item.gstPercentage}
            />
          </div>
          {/* Expiry */}
          <div className="grid w-full items-center gap-1.5">
            <Label
              htmlFor="expiry"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('goods.components.add.label.expiry')}
            </Label>

            <div className="relative flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <DatePickers
                selected={
                  item?.expiry
                    ? moment(item.expiry, 'DD/MM/YYYY').toDate()
                    : null
                }
                onChange={(date) => {
                  const formattedDate = date
                    ? moment(date).format('DD/MM/YYYY')
                    : '';
                  onChange({
                    target: {
                      id: 'expiry', // <-- use id (not name)
                      value: formattedDate,
                    },
                  });
                }}
                dateFormat="dd/MM/yyyy"
                popperPlacement="bottom-end"
                isExpiryField={true}
              />
              <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>

          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.skuId')}
              placeholder={translations('goods.components.add.label.skuId')}
              id="skuId"
              onChange={onChange}
              value={item.skuId}
            />
          </div>

          {/* Batch */}
          {/* {item.type === 'goods' && (
            <InputWithLabel
              name={translations('goods.components.add.label.batch')}
              id="batch"
              placeholder={translations('goods.components.add.label.batch')}
              onChange={onChange}
              value={item.batch}
            />
          )} */}
          {/* application */}
          {/* <InputWithLabel
            name={translations('goods.components.add.label.application')}
            id="applications"
            onChange={onChange}
            value={item.applications}
          /> */}
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
          {/* <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.rate')}
              id="rate"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
          </div> */}
          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.costPrice')}
              id="costPrice"
              placeholder="0.00"
              required={true}
              onChange={onChange}
              value={item.costPrice}
            />
          </div>

          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.salesPrice')}
              id="salesPrice"
              placeholder="0.00"
              required={true}
              onChange={onChange}
              value={item.salesPrice}
            />
          </div>

          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.mrp')}
              id="mrp"
              placeholder="0.00"
              required={true}
              onChange={onChange}
              value={item.mrp}
            />
          </div>
          {/* {item.type === 'goods' && (
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
                unitPlaceholder="Select unit"
              />
            </div>
          )} */}
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
              units={units?.length}
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
