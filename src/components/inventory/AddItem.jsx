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
import { LocalStorageService, SessionStorageService, cn } from '@/lib/utils';
import { CreateProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { CreateProductServices } from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';

import { usePathname, useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DatePickers from '../ui/DatePickers';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithLabel from '../ui/InputWithLabel';
import Loading from '../ui/Loading';

const AddItem = ({ onCancel, cta }) => {
  const translations = useTranslations();

  const redirectURL = LocalStorageService.get('redirectFromCatalogue');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const userId = LocalStorageService.get('user_profile');
  const itemDraft = SessionStorageService.get('itemDraft');

  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isGoods = pathname.includes('goods');

  const [errorMsg, setErrorMsg] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [item, setItem] = useState({
    enterpriseId,
    templateId: userId,
    productName: itemDraft?.productName || '',
    manufacturerName: itemDraft?.manufacturerName || '',
    serviceName: itemDraft?.serviceName || '',
    description: itemDraft?.description || '',
    hsnCode: itemDraft?.hsnCode || '',
    SAC: itemDraft?.SAC || '',
    rate: itemDraft?.rate || '',
    gstPercentage: itemDraft?.gstPercentage || '',
    quantity: itemDraft?.quantity || '',
    type: itemDraft?.type || (isGoods ? 'goods' : 'services'),
    batch: itemDraft?.batch || '',
    expiry: itemDraft?.expiry || '',
    weight: itemDraft?.weight || '',
    length: itemDraft?.length || '',
    breadth: itemDraft?.breadth || '',
    height: itemDraft?.height || '',
    applications: itemDraft?.applications || '',
    manufacturerGstId: itemDraft?.manufacturerGstId || '',
    units: itemDraft?.units || '',
  });

  // save draft to session storage
  function saveDraftToSession({ key, data }) {
    SessionStorageService.set(key, data);
  }

  // set date into expiry field of item
  useEffect(() => {
    setItem((prevUserData) => ({
      ...prevUserData,
      expiry: selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : '', // Update dynamically
    }));
    saveDraftToSession({
      key: 'itemDraft',
      data: {
        ...item,
        expiry: selectedDate ? moment(selectedDate).format('DD/MM/YYYY') : '',
      },
    });
  }, [selectedDate]);

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
    return error;
  };

  const communicationInventory = (res, lang) => {
    const message = {
      successMessage: '',
      errorMessage: '',
    };

    // Handle case if success
    if (res.data.status === true) {
      switch (res.data.message) {
        // If Goods added successfully
        case 'INVENTORY_GOODS_ADDED_SUCCESS':
          switch (lang) {
            case 'en-IN':
              message.successMessage = 'Goods Added Successfully';
              break;
            case 'hindi':
              message.successMessage = 'सामान सफलतापूर्वक जोड़ा गया';
              break;
            // Add more cases for other languages as needed
            default:
              message.successMessage = 'Good Added Successfully';
          }
          break;
        default:
          message.successMessage = 'Added Successfully';
      }
    }

    return message;
  };

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
        saveDraftToSession({
          key: 'itemDraft',
          data: { ...item, [id]: value },
        });
      }
      return;
    }

    setItem((values) => ({ ...values, [id]: value }));
    saveDraftToSession({
      key: 'itemDraft',
      data: { ...item, [id]: value },
    });
  };

  // goods mutation
  const mutationGoods = useMutation({
    mutationFn: CreateProductGoods,
    onSuccess: (res) => {
      const message = communicationInventory(res, 'en-IN');
      toast.success(message.successMessage || 'Added Successfully');
      SessionStorageService.remove('itemDraft');
      queryClient.invalidateQueries({
        queryKey: [goodsApi.getAllProductGoods.endpointKey],
      });
      if (redirectURL) {
        LocalStorageService.remove('redirectFromCatalogue'); // Clear the redirect URL
        router.push(`/${redirectURL}`);
      } else {
        onCancel();
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong!');
    },
  });

  // services mutations
  const mutationServices = useMutation({
    mutationFn: CreateProductServices,
    onSuccess: () => {
      toast.success('Services Added Successfully');
      SessionStorageService.remove('itemDraft');
      queryClient.invalidateQueries({
        queryKey: [servicesApi.getAllProductServices.endpointKey],
      });
      if (redirectURL) {
        LocalStorageService.remove('redirectFromCatalogue'); // Clear the redirect URL
        router.push(`/${redirectURL}`);
      } else {
        onCancel();
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // combined mutation

  const handleSubmitGoods = (e) => {
    e.preventDefault();

    // Extract goods data
    const { serviceName, SAC, type, units, ...goodsData } = item;
    const isError = validation(goodsData);

    // If no validation errors, mutate goods
    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      // combined added in goods as well as catalogue
      if (redirectURL) {
        mutationGoods.mutate({ ...goodsData, context: 'CATALOGUE' });
      } else {
        mutationGoods.mutate(goodsData);
      }
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
      // combined added in service as well as catalogue
      if (redirectURL) {
        mutationServices.mutate({ ...servicesData, context: 'CATALOGUE' });
      } else {
        mutationServices.mutate(servicesData);
      }
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
        'scrollBarStyles relative flex h-full flex-col gap-2 overflow-y-auto p-2',
      )}
    >
      <h2 className="text-xl font-bold text-zinc-900">
        {translations('goods.components.add.title1')}
      </h2>

      {/* ITEM OVERVIEW */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-primary">ITEM OVERVIEW</h2>
        <div className="grid grid-cols-3 grid-rows-2 items-center gap-4">
          {/* Item type */}
          {cta === 'Item' && (
            <div className="flex flex-col gap-0.5">
              <div>
                <Label className="flex-shrink-0">
                  {translations('goods.components.add.label.type')}
                </Label>{' '}
                <span className="text-red-600">*</span>
              </div>

              <Select
                required
                value={item.type}
                onValueChange={(value) => {
                  setErrorMsg({});
                  setSelectedDate(null); // Reset selected date when type changes
                  const updatedItem = {
                    ...item,
                    type: value,
                    productName: '',
                    manufacturerName: '',
                    serviceName: '',
                    description: '',
                    hsnCode: '',
                    SAC: '',
                    rate: '',
                    gstPercentage: '',
                    quantity: '',
                    batch: '',
                    expiry: '',
                    weight: '',
                    length: '',
                    breadth: '',
                    height: '',
                    productDimension: '',
                    applications: '',
                    units: '',
                  };
                  setItem(updatedItem);

                  saveDraftToSession({
                    key: 'itemDraft',
                    data: updatedItem,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goods">Goods</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
              {errorMsg?.productName && <ErrorBox msg={errorMsg.productName} />}
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
              {errorMsg?.serviceName && <ErrorBox msg={errorMsg.serviceName} />}
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
              {errorMsg?.hsnCode && <ErrorBox msg={errorMsg.hsnCode} />}
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
              {errorMsg?.SAC && <ErrorBox msg={errorMsg.SAC} />}
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
            <Label
              htmlFor="expiry"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              {translations('goods.components.add.label.expiry')}
            </Label>
            <div className="relative flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <DatePickers
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="dd/MM/yyyy"
                popperPlacement="right"
              />
              <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
            </div>
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
          {errorMsg?.description && <ErrorBox msg={errorMsg.description} />}
        </div>
      </div>

      {/* PRICING */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-primary">PRICING</h2>

        <div className="grid grid-cols-3 grid-rows-1 items-center gap-4">
          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.rate')}
              id="rate"
              type="number"
              required={true}
              onChange={onChange}
              value={item.rate}
            />
            {errorMsg?.rate && <ErrorBox msg={errorMsg.rate} />}
          </div>
          {item.type === 'goods' && (
            <div className="flex flex-col">
              <InputWithLabel
                type="number"
                name={translations('goods.components.add.label.quantity')}
                id="quantity"
                required={true}
                onChange={onChange}
                value={item.quantity}
              />
              {errorMsg?.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>
          )}
          <div className="flex flex-col">
            <InputWithLabel
              name={translations('goods.components.add.label.gst')}
              id="gstPercentage"
              type="number"
              required={true}
              onChange={onChange}
              value={item.gstPercentage}
            />
            {errorMsg?.gstPercentage && (
              <ErrorBox msg={errorMsg.gstPercentage} />
            )}
          </div>
        </div>
      </div>

      {/* ADDITIONAL INFORMATION */}
      {item.type === 'goods' && (
        <div className="flex flex-col gap-3">
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
              {errorMsg?.manufacturerName && (
                <ErrorBox msg={errorMsg.manufacturerName} />
              )}
            </div>

            <InputWithLabel
              name={translations('goods.components.add.label.manufacturerGST')}
              id="manufacturerGstId"
              onChange={onChange}
              value={item.manufacturerGstId}
            />

            <InputWithLabel
              name={translations('goods.components.add.label.weight')}
              id="weight"
              type="number"
              onChange={onChange}
              value={item.weight}
            />

            <InputWithLabel
              name={translations('goods.components.add.label.length')}
              id="length"
              type="number"
              onChange={onChange}
              value={item.length}
            />

            <InputWithLabel
              name={translations('goods.components.add.label.breadth')}
              id="breadth"
              type="number"
              onChange={onChange}
              value={item.breadth}
            />

            <InputWithLabel
              name={translations('goods.components.add.label.height')}
              id="height"
              type="number"
              onChange={onChange}
              value={item.height}
            />
          </div>
        </div>
      )}

      <div className="sticky bottom-0 z-10 flex justify-end gap-2 bg-white">
        <Button
          size="sm"
          onClick={() => {
            if (redirectURL) {
              LocalStorageService.remove('redirectFromCatalogue'); // Clear the redirect URL
              router.push(`/${redirectURL}?action=update`);
            } else {
              LocalStorageService.remove('redirectFromCatalogue'); // Clear the redirect URL
              onCancel();
            }
          }}
          variant={'outline'}
        >
          {translations('services.components.add.ctas.discard')}
        </Button>
        <Button
          size="sm"
          type="submit"
          disabled={
            cta === 'Template' ||
            mutationGoods.isPending ||
            mutationServices.isPending
          }
        >
          {mutationGoods.isPending || mutationServices.isPending ? (
            <Loading size={14} />
          ) : (
            translations('services.components.add.ctas.create')
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddItem;
