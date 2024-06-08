'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { servicesApi } from '@/api/inventories/services/services';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocalStorageService, cn } from '@/lib/utils';
import { CreateProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { CreateProductServices } from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';
import DatePickers from '../ui/DatePickers';
import InputWithLabel from '../ui/InputWithLabel';
import ErrorBox from '../ui/ErrorBox';
import EmptyStageComponent from '../ui/EmptyStageComponent';

const AddItem = ({ name, onCancel, cta }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const userId = LocalStorageService.get('user_profile');
  const pathname = usePathname();
  const isGoods = pathname.includes('goods');

  const [errorMsg, setErrorMsg] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [item, setItem] = useState({
    enterpriseId,
    templateId: userId,
    productName: '',
    manufacturerName: '',
    serviceName: '',
    description: '',
    hsnCode: '',
    SAC: '',
    rate: '',
    gstPercentage: '',
    quantity: '',
    amount: '',
    type: isGoods ? 'goods' : 'services',
    batch: '',
    expiry: '',
    weight: '',
    length: '',
    breadth: '',
    height: '',
    applications: '',
    units: '',
  });

  // set date into expiry field of item
  useEffect(() => {
    setItem((prevUserData) => ({
      ...prevUserData,
      expiry: selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : '', // Update dynamically
    }));
  }, [selectedDate]);

  // clear errorMsg if item type changes
  useEffect(() => {
    setErrorMsg({});
    setItem({
      enterpriseId,
      templateId: userId,
      productName: '',
      manufacturerName: '',
      serviceName: '',
      description: '',
      hsnCode: '',
      SAC: '',
      rate: '',
      gstPercentage: '',
      quantity: '',
      amount: '',
      type: item.type,
      batch: '',
      expiry: '',
      weight: '',
      length: '',
      breadth: '',
      height: '',
      applications: '',
      units: '',
    });
  }, [item.type]);

  const validation = (itemData) => {
    const error = {};

    // productName
    if (itemData.productName === '') {
      error.productName = '*Required Product Name';
    }
    // manufacturerName
    if (itemData.manufacturerName === '') {
      error.manufacturerName = '*Required Manufacturer Name';
    }
    //  serviceName
    if (itemData.serviceName === '') {
      error.serviceName = '*Required Service Name';
    }
    // description
    if (itemData.description === '') {
      error.description = '*Required Description';
    }
    // HSN
    if (itemData.hsnCode === '') {
      error.hsnCode = '*Required HSN Code';
    }
    // SAC
    if (itemData.SAC === '') {
      error.SAC = '*Required SAC';
    }
    // rate
    if (itemData.rate === '') {
      error.rate = '*Required Rate';
    }
    // gst_percentage
    if (itemData.gstPercentage === '') {
      error.gstPercentage = '*Required GST (%)';
    }
    // quantity
    if (itemData.quantity === '') {
      error.quantity = '*Required Quantity';
    }
    // amount
    if (itemData.amount === '') {
      error.amount = '*Required Amount';
    }
    return error;
  };

  const mutationGoods = useMutation({
    mutationFn: CreateProductGoods,
    onSuccess: () => {
      toast.success('Product Goods Added Successfully');
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getAllProductGoods.endpointKey],
      });
      onCancel();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong!');
    },
  });

  const mutationServices = useMutation({
    mutationFn: CreateProductServices,
    onSuccess: () => {
      toast.success('Product Services Added Successfully');
      queryClient.invalidateQueries({
        queryKey: [servicesApi.getAllProductServices.endpointKey],
      });
      onCancel();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const onChange = (e) => {
    const { id, value } = e.target;

    // validation input value
    if (
      id === 'quantity' ||
      id === 'rate' ||
      id === 'gstPercentage' ||
      id === 'weight' ||
      id === 'height' ||
      id === 'length' ||
      id === 'breadth'
    ) {
      if (!Number.isNaN(value)) {
        setItem((values) => ({ ...values, [id]: value }));
      }
      return;
    }

    setItem((values) => ({ ...values, [id]: value }));
  };

  const handleSubmitGoods = (e) => {
    e.preventDefault();

    // Extract goods data
    const { serviceName, SAC, type, units, ...goodsData } = item;
    const isError = validation(goodsData);

    // If no validation errors, mutate goods
    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      mutationGoods.mutate(goodsData);
      return;
    }
    setErrorMsg(isError);
  };
  const handleSubmitServices = (e) => {
    e.preventDefault();
    // Extract services data
    const {
      productName,
      manufacturerName,
      hsnCode,
      type,
      units,
      batch,
      weight,
      length,
      breadth,
      height,
      quantity,
      ...servicesData
    } = item;
    const isError = validation(servicesData);

    // If no validation errors, mutate service
    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      mutationServices.mutate(servicesData);
      return;
    }
    setErrorMsg(isError);
  };

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Item" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        item.type === 'goods' ? handleSubmitGoods : handleSubmitServices
      }
      className={cn(
        'scrollBarStyles flex h-full grow flex-col gap-4 overflow-y-auto p-2',
      )}
    >
      <h2 className="text-2xl font-bold text-zinc-900">{name}</h2>

      <div className="grid grid-cols-2 gap-2.5">
        {cta === 'Item' && (
          <div className="flex flex-col gap-4">
            <div>
              <Label className="flex-shrink-0">Type</Label>{' '}
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
      </div>

      {/* mandatory data fields */}
      {item.type === 'goods' ? (
        // for goods
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="Product Name"
                id="productName"
                required={true}
                onChange={onChange}
                value={item.productName}
              />
              {errorMsg?.productName && (
                <ErrorBox msg={errorMsg.productName} />
              )}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Manufacturer's Name"
                id="manufacturerName"
                required={true}
                onChange={onChange}
                value={item.manufacturerName}
              />
              {errorMsg?.manufacturerName && (
                <ErrorBox msg={errorMsg.manufacturerName} />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Description"
              id="description"
              required={true}
              onChange={onChange}
              value={item.description}
            />
            {errorMsg?.description && <ErrorBox msg={errorMsg.description} />}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="HSN Code"
                id="hsnCode"
                required={true}
                onChange={onChange}
                value={item.hsnCode}
              />
              {errorMsg?.hsnCode && <ErrorBox msg={errorMsg.hsnCode} />}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Rate"
                id="rate"
                required={true}
                onChange={onChange}
                value={item.rate}
              />
              {errorMsg?.rate && <ErrorBox msg={errorMsg.rate} />}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="GST (%)"
                id="gstPercentage"
                required={true}
                onChange={onChange}
                value={item.gstPercentage}
              />
              {errorMsg?.gstPercentage && (
                <ErrorBox msg={errorMsg.gstPercentage} />
              )}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Quantity"
                id="quantity"
                required={true}
                onChange={onChange}
                value={item.quantity}
              />
              {errorMsg?.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Amount"
              id="amount"
              required={true}
              onChange={onChange}
              value={item.amount}
            />
            {errorMsg?.amount && <ErrorBox msg={errorMsg.amount} />}
          </div>

          {/* optional data fields */}
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="Batch"
              id="batch"
              onChange={onChange}
              value={item.batch}
            />
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="expiry"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Expiry
              </Label>
              <div className="relative flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <InputWithLabel
              name="Weight (kg)"
              id="weight"
              onChange={onChange}
              value={item.weight}
            />
            <InputWithLabel
              name="Length (cm)"
              id="length"
              onChange={onChange}
              value={item.length}
            />
            <InputWithLabel
              name="Breadth (cm)"
              id="breadth"
              onChange={onChange}
              value={item.breadth}
            />
            <InputWithLabel
              name="Height (cm)"
              id="height"
              onChange={onChange}
              value={item.height}
            />
          </div>
          <InputWithLabel
            name="Application"
            id="applications"
            onChange={onChange}
            value={item.applications}
          />
        </>
      ) : (
        // for services
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="Service Name"
                id="serviceName"
                required={true}
                onChange={onChange}
                value={item.serviceName}
              />
              {errorMsg?.serviceName && (
                <ErrorBox msg={errorMsg.serviceName} />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Description"
              id="description"
              required={true}
              onChange={onChange}
              value={item.description}
            />
            {errorMsg?.description && <ErrorBox msg={errorMsg.description} />}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="SAC"
                id="SAC"
                required={true}
                onChange={onChange}
                value={item.SAC}
              />
              {errorMsg?.SAC && <ErrorBox msg={errorMsg.SAC} />}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Rate"
                id="rate"
                required={true}
                onChange={onChange}
                value={item.rate}
              />
              {errorMsg?.rate && <ErrorBox msg={errorMsg.rate} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="GST (%)"
                id="gstPercentage"
                required={true}
                onChange={onChange}
                value={item.gstPercentage}
              />
              {errorMsg?.gstPercentage && (
                <ErrorBox msg={errorMsg.gstPercentage} />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="expiry"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                Expiry
              </Label>

              <div className="relative flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top"
                />
                <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Amount"
              id="amount"
              required={true}
              onChange={onChange}
              value={item.amount}
            />
            {errorMsg?.amount && <ErrorBox msg={errorMsg.amount} />}
          </div>
          <InputWithLabel
            name="Application"
            id="applications"
            // required={item.type == "goods" || item.type === "services"}
            onChange={onChange}
            value={item.applications}
          />
        </>
      )}

      <div className="mt-auto h-[1px] bg-neutral-300"></div>

      <div className="flex items-center justify-end gap-4">
        <Button
          onClick={() => {
            onCancel();
          }}
          variant={'outline'}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={cta === 'Template'}>
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddItem;
