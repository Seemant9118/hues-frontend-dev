'use client';

/* eslint-disable prettier/prettier */

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SubHeader from '@/components/ui/Sub-header';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrappers/Wrapper';

import {
  createServiceMaster,
  updateServiceMaster,
} from '@/services/Admin_Services/AdminServices';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AddServiceMaster({
  onClose,
  setIsAddingServiceMaster,
  serviceMasterToEdit,
}) {
  const [formData, setFormData] = useState({
    huesItemId: '',
    serviceName: '',
    sac: '',
    gstRate: '',
    fcm: false,
    rcm: false,
    exemptedCategory: false,
    nilRatedCategory: false,
    description: '',
  });

  const [errors, setErrors] = useState({});

  /* Populate form in Edit mode */
  useEffect(() => {
    if (!serviceMasterToEdit) return;

    setFormData({
      huesItemId: serviceMasterToEdit.huesItemId || '',
      serviceName: serviceMasterToEdit.service || '',
      sac: serviceMasterToEdit.sac || '',
      gstRate: serviceMasterToEdit.gstRate || '',
      fcm: !!serviceMasterToEdit.fcm,
      rcm: !!serviceMasterToEdit.rcm,
      exemptedCategory: !!serviceMasterToEdit.exemptedCategory,
      nilRatedCategory: !!serviceMasterToEdit.nilRatedCategory,
      description: serviceMasterToEdit.description || '',
    });
  }, [serviceMasterToEdit]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  /* 🔹 Create */
  const CreateServiceMutation = useMutation({
    mutationFn: createServiceMaster,
    onSuccess: () => {
      toast.success('Service Master Created Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  /* Update */
  const UpdateServiceMutation = useMutation({
    mutationFn: updateServiceMaster,
    onSuccess: () => {
      toast.success('Service Master Updated Successfully');
      onClose?.();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const isSubmitting =
    CreateServiceMutation.isPending || UpdateServiceMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.huesItemId.trim())
      newErrors.huesItemId = 'Hues Item ID is required';

    if (!formData.serviceName.trim())
      newErrors.serviceName = 'Service name is required';

    if (!formData.sac.trim()) newErrors.sac = 'SAC is required';

    if (!formData.gstRate) newErrors.gstRate = 'GST rate is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      huesItemId: formData.huesItemId.trim(),
      serviceName: formData.serviceName.trim(),
      sac: formData.sac.trim(),
      gstRate: Number(formData.gstRate),
      fcm: Boolean(formData.fcm),
      rcm: Boolean(formData.rcm),
      exemptedCategory: Boolean(formData.exemptedCategory),
      nilRatedCategory: Boolean(formData.nilRatedCategory),
      description: formData.description.trim() || null,
      isDeleted: false,
    };

    if (serviceMasterToEdit) {
      UpdateServiceMutation.mutate({
        data: { ...payload, id: serviceMasterToEdit?.id },
      });
      return;
    }

    CreateServiceMutation.mutate({ data: payload });
  };

  return (
    <Wrapper className="scrollBarStyles">
      {/* Header */}
      <section className="sticky top-0 z-10 bg-white py-2">
        <SubHeader
          name={
            serviceMasterToEdit
              ? 'Update Service Master'
              : 'Create Service Master'
          }
        />
      </section>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Hues Item ID */}
          <div>
            <Label>Hues Item ID</Label> <span className="text-red-500">*</span>
            <Input
              value={formData.huesItemId}
              onChange={(e) => handleChange('huesItemId', e.target.value)}
              placeholder="Enter Hues Item ID"
            />
            {errors.huesItemId && <ErrorBox msg={errors.huesItemId} />}
          </div>

          {/* Service Name */}
          <div>
            <Label>Service Name</Label> <span className="text-red-500">*</span>
            <Input
              value={formData.serviceName}
              onChange={(e) => handleChange('serviceName', e.target.value)}
              placeholder="Enter Service Name"
            />
            {errors.serviceName && <ErrorBox msg={errors.serviceName} />}
          </div>

          {/* SAC / GST */}
          <div>
            <Label>SAC</Label> <span className="text-red-500">*</span>
            <Input
              value={formData.sac}
              onChange={(e) => handleChange('sac', e.target.value)}
              placeholder="Enter SAC"
            />
            {errors.sac && <ErrorBox msg={errors.sac} />}
          </div>

          <div>
            <Label>GST Rate (%)</Label> <span className="text-red-500">*</span>
            <Input
              type="number"
              value={formData.gstRate}
              onChange={(e) => handleChange('gstRate', e.target.value)}
              placeholder="Enter GST Rate"
            />
            {errors.gstRate && <ErrorBox msg={errors.gstRate} />}
          </div>
        </div>

        {/* Flags */}
        <div className="grid grid-cols-2 gap-4">
          <CheckboxField
            label="FCM Applicable"
            checked={formData.fcm}
            onChange={(v) => handleChange('fcm', v)}
          />
          <CheckboxField
            label="RCM Applicable"
            checked={formData.rcm}
            onChange={(v) => handleChange('rcm', v)}
          />
          <CheckboxField
            label="Exempted Category"
            checked={formData.exemptedCategory}
            onChange={(v) => handleChange('exemptedCategory', v)}
          />
          <CheckboxField
            label="Nil Rated Category"
            checked={formData.nilRatedCategory}
            onChange={(v) => handleChange('nilRatedCategory', v)}
          />
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter Description"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => setIsAddingServiceMaster(false)}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : serviceMasterToEdit
                ? 'Update Service'
                : 'Create Service'}
          </Button>
        </div>
      </form>
    </Wrapper>
  );
}

/* ✅ Safe Checkbox Field */
function CheckboxField({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <Label>{label}</Label>
    </div>
  );
}
