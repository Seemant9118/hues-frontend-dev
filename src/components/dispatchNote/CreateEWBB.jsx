'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { saveDraftToSession } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { updateEWBPartB } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import OrderBreadCrumbs from '../orders/OrderBreadCrumbs';
import Overview from '../ui/Overview';
import Wrapper from '../wrappers/Wrapper';
import MultiStepForm from './multiStepForm/MultiStepForm';
import { stepsConfigB } from './multiStepForm/stepsConfig';

export default function CreateEWBB({
  dispatchNoteId,
  overviewData,
  overviewLabels,
  customRender,
  customLabelRender,
  dispatchOrdersBreadCrumbs,
  setIsCreatingEWB,
  dispatchDetails,
}) {
  const queryClient = useQueryClient();
  const draftData = SessionStorageService.get(`${dispatchNoteId}_EWBB`);
  const [form, setForm] = useState(() => ({
    transMode: '',
    transporterId: '',
    transporterName: '',
    transDistance: '',
    transDocNo: '',
    transDocDate: '',
    vehicleNo: '',
    vehicleType: '',
    remarks: '',
  }));
  const [errors, setErrors] = useState({});

  // Auto-populate from mock invoice on mount
  useEffect(() => {
    setForm((s) => ({
      ...s,
      transMode: draftData?.transMode || '',
      transporterId: draftData?.transporterId || '',
      transporterName: draftData?.transporterName || '',
      transDistance: draftData?.transDistance || '',
      transDocNo: draftData?.transDocNo || '',
      transDocDate: draftData?.transDocDate || '',
      vehicleNo: draftData?.vehicleNo || '',
      vehicleType: draftData?.vehicleType || '',
      remarks: draftData?.remarks || '',
    }));
  }, [dispatchDetails]);

  const validate = () => {
    const e = {};
    // Trans mode specific
    if (form.transMode !== '1' && !form.transDocNo) {
      e.transDocNo = 'Transport document number required for selected mode';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const updateEWBPartBMutation = useMutation({
    mutationFn: updateEWBPartB,
    onSuccess: () => {
      toast.success('EWB Part B updated successfully');
      setIsCreatingEWB(false);
      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDispatchNote.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Failed to update EWB Part B');
    },
  });

  const handleSubmit = async (type = 'save') => {
    if (!validate()) return;

    // Build payload
    const payload = { ...form };

    // api call for - save draft
    if (type === 'save') {
      toast.success('EWB Part B saved successfully');
      saveDraftToSession({ key: `${dispatchNoteId}_EWBB`, data: payload });
      setIsCreatingEWB(false);
      return;
    }
    // api call for - generate
    updateEWBPartBMutation.mutate({ data: payload });
  };

  return (
    <Wrapper className="h-full">
      {/* HEADER */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs
          possiblePagesBreadcrumbs={dispatchOrdersBreadCrumbs}
        />
      </section>

      {/* Collapsable overview */}
      <Overview
        collapsible={true}
        data={overviewData}
        labelMap={overviewLabels}
        customRender={customRender}
        customLabelRender={customLabelRender}
      />

      {/* Main Form */}
      <MultiStepForm
        config={stepsConfigB}
        formData={form}
        setFormData={setForm}
        errors={errors}
        setErrors={setErrors}
        onFinalSubmit={handleSubmit}
        isSubmitting={updateEWBPartBMutation.isPending}
        onCancel={() => setIsCreatingEWB(false)}
      />
    </Wrapper>
  );
}
