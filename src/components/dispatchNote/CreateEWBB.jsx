'use client';

import React, { useEffect, useState } from 'react';
import OrderBreadCrumbs from '../orders/OrderBreadCrumbs';
import Overview from '../ui/Overview';
import Wrapper from '../wrappers/Wrapper';
import MultiStepForm from './multiStepForm/MultiStepForm';
import { stepsConfigB } from './multiStepForm/stepsConfig';

export default function CreateEWBB({
  overviewData,
  overviewLabels,
  customRender,
  customLabelRender,
  dispatchOrdersBreadCrumbs,
  setIsCreatingEWB,
  dispatchDetails,
}) {
  const [form, setForm] = useState(() => ({
    transMode: '',
    transporterId: '',
    transporterName: '',
    transDistance: '',
    transDocNo: '',
    transDocDate: '',
    vehicleNo: '',
    vehicleType: '',
    remarks: '', // option
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-populate from mock invoice on mount
  useEffect(() => {
    setForm((s) => ({
      ...s,
      transMode: '', // doubt
      transporterId: '', // doubt
      transporterName: '', // doubt
      transDistance: '', // doubt
      transDocNo: '', // doubt
      transDocDate: '', // doubt
      vehicleNo: '', // doubt
      vehicleType: '', // doubt
      remarks: '', // option
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

  const handleSubmit = async (type = 'save') => {
    if (!validate()) return;
    setSubmitting(true);
    // Mock API call
    await new Promise((r) => {
      setTimeout(r, 600);
    });

    // Build payload
    const payload = { ...form };
    // eslint-disable-next-line no-console
    console.log('E-Waybill B payload ->', payload);

    setSubmitting(false);
    // eslint-disable-next-line no-alert
    alert(
      type === 'save'
        ? 'Saved as draft (mock)'
        : 'Generated E-Way bill B (mock)',
    );
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
        isSubmitting={submitting}
        onCancel={() => setIsCreatingEWB(false)}
      />
    </Wrapper>
  );
}
