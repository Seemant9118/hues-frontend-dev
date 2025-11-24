'use client';

import moment from 'moment';
import React, { useEffect, useState } from 'react';
import OrderBreadCrumbs from '../orders/OrderBreadCrumbs';
import Overview from '../ui/Overview';
import Wrapper from '../wrappers/Wrapper';
import MultiStepForm from './multiStepForm/MultiStepForm';
import { stepsConfigA } from './multiStepForm/stepsConfig';

export default function CreateEWBA({
  overviewData,
  overviewLabels,
  customRender,
  customLabelRender,
  dispatchOrdersBreadCrumbs,
  setIsCreatingEWB,
  dispatchDetails,
}) {
  const [form, setForm] = useState(() => ({
    supplyType: '',
    subSupplyType: '',
    subSupplyDesc: '',
    docType: '',
    docNo: '',
    docDate: '',
    fromGstin: '',
    fromPincode: '',
    fromStateCode: '',
    fromTrdName: '',
    actFromStateCode: '',
    toGstin: '',
    toPincode: '',
    toStateCode: '',
    toTrdName: '',
    actToStateCode: '',
    transactionType: '', // ?
    fromAddr1: '',
    fromAddr2: '',
    fromPlace: '',
    toAddr1: '',
    toAddr2: '',
    toPlace: '',
    dispatchFromGSTIN: '',
    dispatchFromTradeName: '',
    shipToGSTIN: '',
    shipToTradeName: '',
    itemList: [],
    totInvValue: 0,
    totalValue: 0,
    cgstValue: '',
    sgstValue: '',
    igstValue: '',
    cessValue: '',
    cessNonAdvolValue: '',
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
      docType: 'INV', // default INV
      docNo: dispatchDetails?.invoice?.referenceNumber?.replace(
        /^INV[-/]?/,
        '',
      ),
      docDate: moment(dispatchDetails?.createdAt)?.format('YYYY-MM-DD'),
      fromGstin: dispatchDetails?.sellerDetails?.gst,
      fromPincode: dispatchDetails?.billingFromAddress?.pincode,
      fromStateCode: dispatchDetails?.billingFromAddress?.stateCode,
      fromTrdName: dispatchDetails?.sellerDetails?.tradeName,
      actFromStateCode: dispatchDetails?.dispatchFromAddress?.stateCode,
      toGstin: dispatchDetails?.buyerDetails?.gst || 'URP',
      toPincode: dispatchDetails?.shippingAddress?.pincode,
      toStateCode: dispatchDetails?.billingAddress?.stateCode,
      toTrdName: dispatchDetails?.buyerDetails?.tradeName,
      actToStateCode: dispatchDetails?.dispatchAddress?.stateCode,
      transactionType: '',
      fromAddr1: '', // doubt
      fromAddr2: '', // doubt
      fromPlace: '', // doubt
      toAddr1: '', // doubt
      toAddr2: '', // doubt
      toPlace: '', // doubt
      dispatchFromGSTIN: '', // doubt
      dispatchFromTradeName: '', // doubt
      shipToGSTIN: '', // doubt
      shipToTradeName: '', // doubt
      itemList: dispatchDetails?.items,
      totInvValue:
        Number(dispatchDetails?.totalAmount) +
        Number(dispatchDetails?.totalGstAmount),
      totalValue: Number(dispatchDetails?.totalAmount),
      cgstValue: dispatchDetails?.cgst,
      sgstValue: dispatchDetails?.sgst,
      igstValue: dispatchDetails?.igst,
      cessValue: dispatchDetails?.cess,
      cessNonAdvolValue: '', // doubt
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
    if (!form.supplyType) e.supplyType = 'Select supply type';
    if (!form.subSupplyType) e.subSupplyType = 'Select sub supply type';
    if (form?.subSupplyType === '8' && !form?.subSupplyDesc)
      e.subSupplyDesc = `Sub Supply Description is required for 'Others'.`;
    if (!form.docType) e.docType = 'Select document type';
    if (!form.docNo) e.docNo = 'Document number is required';
    if (!form.docDate) e.docDate = 'Document date is required';
    else {
      const docDate = new Date(form.docDate);
      const today = new Date();
      if (docDate > today) e.docDate = 'Document date cannot be in future';
      const diffDays = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
      if (diffDays > 180) e.docDate = 'Document date should be within 180 days';
    }

    if (!form.fromGstin) e.fromGstin = 'From GSTIN required';
    if (!form.toGstin) e.toGstin = 'To GSTIN required';
    if (!form.itemList || form.itemList.length === 0)
      e.itemList = 'At least one item required';

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

    // Example duplicate docNo check - replace with real API call
    if (form.docNo === 'DUPLICATE') {
      setErrors({
        docNo: 'Duplicate e-way bill exists for this document number',
      });
      setSubmitting(false);
      return;
    }

    // Build payload
    const payload = { ...form };
    // eslint-disable-next-line no-console
    console.log('E-Waybill payload ->', payload);

    setSubmitting(false);
    // eslint-disable-next-line no-alert
    alert(
      type === 'save' ? 'Saved as draft (mock)' : 'Generated E-Way bill (mock)',
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
        config={stepsConfigA}
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
