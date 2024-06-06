'use client';

import { Button } from '@/components/ui/button';
import { cn, LocalStorageService } from '@/lib/utils';
import React, { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const userId = LocalStorageService.get('user_profile');
  const Id = goodsToEdit ? goodsToEdit.id : servicesToEdit.id;

  const [item, setItem] = useState(
    goodsToEdit
      ? {
          enterprise_id: enterpriseId,
          template_id: userId,
          product_name: goodsToEdit.productName,
          manufacturer_name: goodsToEdit.manufacturerName,
          service_name: goodsToEdit.serviceName,
          description: goodsToEdit.description,
          hsn_code: goodsToEdit.hsnCode,
          SAC: goodsToEdit.sac,
          rate: goodsToEdit.rate,
          gst_percentage: goodsToEdit.gstPercentage,
          amount: goodsToEdit.amount,
          type: 'goods',
          quantity: goodsToEdit.quantity,
          batch: goodsToEdit.batch,
          expiry: goodsToEdit.expiry,
          weight: goodsToEdit.weight,
          length: goodsToEdit.length,
          breadth: goodsToEdit.breadth,
          height: goodsToEdit.height,
          applications: goodsToEdit.applications,
          units: goodsToEdit.units,
        }
      : {
          enterprise_id: enterpriseId,
          template_id: userId,
          product_name: '',
          manufacturer_name: '',
          service_name: servicesToEdit.serviceName,
          description: servicesToEdit.description,
          hsn_code: '',
          SAC: servicesToEdit.sac,
          rate: servicesToEdit.rate,
          gst_percentage: servicesToEdit.gstPercentage,
          amount: servicesToEdit.amount,
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
        enterprise_id: '',
        template_id: '',
        product_name: '',
        manufacturer_name: '',
        service_name: '',
        description: '',
        hsn_code: '',
        SAC: '',
        rate: '',
        gst_percentage: '',
        amount: '',
        type: '',
        batch: '',
        expiry: '',
        weight: '',
        length: '',
        breadth: '',
        height: '',
        applications: '',
        units: '',
      });
      goodsToEdit ? setGoodsToEdit(null) : setServicesToEdit(null);
      setIsEditing((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey,
      });
    },
    onError: () => {
      toast.error('Something went wrong');
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
        'scrollBarStyles flex h-full grow flex-col gap-4 overflow-y-auto p-2',
      )}
    >
      <h2 className="text-2xl font-bold text-zinc-900">Edit Item</h2>

      {/* <div className="grid grid-cols-2 gap-2.5">
        {cta === "Item" && !goodsToEdit && (
          <div className="flex flex-col gap-4 ">
            <div>
              <Label className="flex-shrink-0">Type</Label>{" "}
              <span className="text-red-600">*</span>
            </div>

            <Select
              required
              value={item.type}
              onValueChange={(value) =>
                setItem((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="max-w-xs gap-5">
                <SelectValue placeholder="Select Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goods">Goods</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div> */}

      {/* mandatory data fields */}
      {item.type === 'goods' ? (
        // for goods
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="Product Name (Brand)"
              id="product_name"
              required={true}
              onChange={onChange}
              value={item.product_name}
            />
            <InputWithLabel
              name="Manufacturer's Name"
              id="manufacturer_name"
              required={true}
              onChange={onChange}
              value={item.manufacturer_name}
            />
          </div>
          <InputWithLabel
            name="Description"
            id="description"
            required={true}
            onChange={onChange}
            value={item.description}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="HSN Code"
              id="hsn_code"
              required={true}
              onChange={onChange}
              value={item.hsn_code}
            />
            <InputWithLabel
              name="Rate"
              id="rate"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
            <InputWithLabel
              name="GST (%)"
              id="gst_percentage"
              required={true}
              onChange={onChange}
              value={item.gst_percentage}
            />
            <InputWithLabel
              name="Quantity"
              id="quantity"
              required={true}
              onChange={onChange}
              value={item.quantity}
            />
          </div>
          <InputWithLabel
            name="Amount"
            id="amount"
            required={true}
            onChange={onChange}
            value={item.amount}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="Batch"
              id="batch"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.batch}
            />
            <InputWithLabel
              name="Expiry"
              id="expiry"
              // required={item.type === "goods" || item.type === "services"}
              onChange={onChange}
              value={item.expiry}
            />
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <InputWithLabel
              name="Weight (kg)"
              id="weight"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.weight}
            />
            <InputWithLabel
              name="Length (cm)"
              id="length"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.length}
            />
            <InputWithLabel
              name="Breadth (cm)"
              id="breadth"
              // required={item.type == "goods"}
              onChange={onChange}
              value={item.breadth}
            />
            <InputWithLabel
              name="Height (cm)"
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
              name="Service Name (Brand)"
              id="service_name"
              required={true}
              onChange={onChange}
              value={item.service_name}
            />
          </div>
          <InputWithLabel
            name="Description"
            id="description"
            required={true}
            onChange={onChange}
            value={item.description}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="SAC"
              id="SAC"
              required={true}
              onChange={onChange}
              value={item.SAC}
            />
            <InputWithLabel
              name="Rate"
              id="rate"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
            <InputWithLabel
              name="GST (%)"
              id="gst_percentage"
              required={true}
              onChange={onChange}
              value={item.gst_percentage}
            />
            <InputWithLabel
              name="Expiry"
              id="expiry"
              onChange={onChange}
              value={item.expiry}
            />
          </div>
          <InputWithLabel
            name="Amount"
            id="amount"
            required={true}
            onChange={onChange}
            value={item.amount}
          />
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

      <div className="mt-auto h-[1px] bg-neutral-300"></div>

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            setIsEditing((prev) => !prev);
            goodsToEdit ? setGoodsToEdit(null) : setServicesToEdit(null);
          }}
          variant={'outline'}
        >
          Cancel
        </Button>
        <Button type="submit">Edit</Button>
      </div>
    </form>
  );
};

export default EditItem;
