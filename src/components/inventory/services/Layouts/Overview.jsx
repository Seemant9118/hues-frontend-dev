import { AdminAPIs } from '@/api/adminApi/AdminApi';
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
import { getServicesMasterTypes } from '@/services/Admin_Services/AdminServices';
import { useQuery } from '@tanstack/react-query';

import React from 'react';

export default function Overview({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const { data: servicesMasterTypes } = useQuery({
    queryKey: [AdminAPIs.getServicesMasterTypes.endpointKey],
    queryFn: getServicesMasterTypes,
    select: (data) => data.data.data.data,
  });

  const handleChange = (key, val) => {
    const value = val?.target ? val.target.value : val;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ------------------- basic fields ------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section1.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Service Name <span className="text-red-600">*</span>
          </Label>

          <Input
            placeholder="Service name"
            value={formData?.serviceName}
            onChange={(e) => handleChange('serviceName', e)}
          />

          {errors?.serviceName && <ErrorBox msg={errors?.serviceName} />}
        </div>

        <div>
          <Label>
            Service Code (SKU ID) <span className="text-red-600">*</span>
          </Label>

          <Input
            placeholder="Service code"
            value={formData?.serviceCode}
            onChange={(e) => handleChange('serviceCode', e)}
          />

          {errors?.serviceCode && <ErrorBox msg={errors?.serviceCode} />}
        </div>
      </div>

      {/* ------------------- category ------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section2.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Service Category <span className="text-red-600">*</span>
          </Label>

          <Select
            value={formData?.serviceCategoryId?.toString()}
            onValueChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                serviceCategoryId: Number(v),
                serviceSubTypeId: '', // reset subtype
                defaultFieldsWithValues: {}, // reset fields on category change
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {servicesMasterTypes?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.serviceTypeName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {errors?.serviceCategoryId && (
            <ErrorBox msg={errors?.serviceCategoryId} />
          )}
        </div>

        <div>
          <Label>
            Service Sub type <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.serviceSubTypeId?.toString()}
            onValueChange={(v) => {
              setFormData((prev) => ({
                ...prev,
                serviceSubTypeId: Number(v),
                defaultFieldsWithValues: {}, // reset fields on subtype change
              }));
            }}
            disabled={!formData?.serviceCategoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subtype" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {servicesMasterTypes
                  ?.find((c) => c.id === Number(formData?.serviceCategoryId))
                  ?.subCategories?.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.serviceSubTypeName}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.serviceSubTypeId && (
            <ErrorBox msg={errors?.serviceSubTypeId} />
          )}
        </div>
      </div>
    </div>
  );
}
