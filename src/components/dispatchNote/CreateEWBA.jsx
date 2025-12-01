'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import {
  saveDraftToSession,
  splitAddressAccordingToEWayBill,
} from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { generateEWB } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import OrderBreadCrumbs from '../orders/OrderBreadCrumbs';
import Overview from '../ui/Overview';
import Wrapper from '../wrappers/Wrapper';
import MultiStepForm from './multiStepForm/MultiStepForm';
import { stepsConfigA } from './multiStepForm/stepsConfig';

export default function CreateEWBA({
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
  const draftData = SessionStorageService.get(`${dispatchNoteId}_EWBA`);
  const [form, setForm] = useState(() => ({
    // supply
    supplyType: '',
    subSupplyType: '',
    subSupplyDesc: '',
    docType: '',
    docNo: '',
    docDate: '',
    transactionType: '',
    // consigner
    fromGstin: '',
    fromPincode: '',
    fromStateCode: '',
    fromStateCodeName: '',
    fromTrdName: '',
    actFromStateCode: '',
    actFromStateCodeName: '',
    fromAddr1: '',
    fromAddr2: '',
    fromPlace: '',
    fromPlaceName: '',
    dispatchFromGSTIN: '',
    dispatchFromTradeName: '',
    // consignee
    toGstin: '',
    toPincode: '',
    toStateCode: '',
    toStateCodeName: '',
    toTrdName: '',
    actToStateCode: '',
    actToStateCodeName: '',
    toAddr1: '',
    toAddr2: '',
    toPlace: '',
    toPlaceName: '',
    shipToGSTIN: '',
    shipToTradeName: '',
    // items
    itemList: [],
    totInvValue: 0,
    totalValue: 0,
    cgstValue: '',
    sgstValue: '',
    igstValue: '',
    cessValue: '',
    cessNonAdvolValue: '',
    // transport
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

  useEffect(() => {
    if (!dispatchDetails) return;

    // FORMAT ITEM LIST
    const formattedItems =
      dispatchDetails?.items?.map((item) => {
        const product = item?.invoiceItem?.orderItemId?.productDetails;

        return {
          hsnCode: Number(product?.hsnCode) || null,
          taxableAmount: Number(item?.amount || 0),
          productName: product?.productName || '',
          productDesc: product?.description || '',
          quantity: item?.dispatchedQuantity || 0,
          // Adjust unit based on your logic (unitId/weightUnitId)
          qtyUnit:
            String(product?.weightUnitId) ||
            String(product?.unitId) ||
            String(item?.invoiceItem?.unitId) ||
            '',
          sgstRate: Number(item?.sgstAmount) || 0,
          cgstRate: Number(item?.cgstAmount) || 0,
          igstRate: Number(item?.igstAmount) || 0,
          cessRate: Number(item?.cessAmount) || 0,
          cessNonAdvol: Number(item?.cessNonAdvol) || 0,
        };
      }) || [];

    // address splitting - from & to
    const fromAddress = splitAddressAccordingToEWayBill(
      dispatchDetails?.billingFromAddress?.address,
    );
    const toAddress = splitAddressAccordingToEWayBill(
      dispatchDetails?.shippingAddress?.address,
    );

    // MAP DISPATCH DETAILS
    const mapped = {
      // supply
      supplyType: 'O',
      docNo: dispatchDetails?.invoice?.referenceNumber?.replace(
        /^INV[-/]?/,
        '',
      ),
      docDate: moment(dispatchDetails?.createdAt)?.format('DD/MM/YYYY'), // doubt: is dispatch note createdAt or invoice createdAt
      transactionType: dispatchDetails?.transactionType?.code,

      // consignor
      fromGstin: dispatchDetails?.sellerDetails?.gst,
      fromPincode: Number(dispatchDetails?.billingFromAddress?.pincode) || '',
      fromStateCode:
        Number(dispatchDetails?.billingFromAddress?.stateCode) || '',
      fromStateCodeName: dispatchDetails?.billingFromAddress?.stateName || '', // to show frontend only
      fromTrdName:
        dispatchDetails?.sellerDetails?.tradeName ||
        dispatchDetails?.sellerDetails?.name,
      actFromStateCode:
        Number(dispatchDetails?.dispatchFromAddress?.stateCode) || '',
      actFromStateCodeName:
        dispatchDetails?.dispatchFromAddress?.stateName || '', // to show frontend only
      fromAddr1: fromAddress?.addr1 || '',
      fromAddr2: fromAddress?.addr2 || '',
      fromPlace: dispatchDetails?.billingFromAddress?.pincode,
      fromPlaceName: dispatchDetails?.billingFromAddress?.district || '', // to show frontend only
      dispatchFromGSTIN: dispatchDetails?.sellerDetails?.gst,
      dispatchFromTradeName:
        dispatchDetails?.sellerDetails?.tradeName ||
        dispatchDetails?.sellerDetails?.name,

      // consignee
      toGstin: dispatchDetails?.buyerGst || 'URD',
      toPincode: Number(dispatchDetails?.billingAddress?.pincode) || '',
      toStateCode: Number(dispatchDetails?.billingAddress?.stateCode) || '',
      toStateCodeName: dispatchDetails?.billingAddress?.stateName || '', // to show frontend only
      toTrdName: dispatchDetails?.buyerTradeName || dispatchDetails?.buyerName,
      actToStateCode: Number(dispatchDetails?.shippingAddress?.stateCode) || '',
      actToStateCodeName: dispatchDetails?.shippingAddress?.stateName || '', // to show frontend only
      toAddr1: toAddress?.addr1 || '',
      toAddr2: toAddress?.addr2 || '',
      toPlace: dispatchDetails?.shippingAddress?.pincode,
      toPlaceName: dispatchDetails?.shippingAddress?.district || '', // to show frontend only
      shipToGSTIN: dispatchDetails?.buyerGst || 'URD',
      shipToTradeName:
        dispatchDetails?.buyerTradeName || dispatchDetails?.buyerName,

      // UPDATED ITEM LIST
      itemList: formattedItems,
      totInvValue:
        Number(dispatchDetails?.totalAmount) +
        Number(dispatchDetails?.totalGstAmount),
      totalValue: Number(dispatchDetails?.totalAmount) || 0,
      cgstValue: Number(dispatchDetails?.totalCgstAmount) || 0,
      sgstValue: Number(dispatchDetails?.totalSgstAmount) || 0,
      igstValue: Number(dispatchDetails?.totalIgstAmount) || 0,
      cessValue: Number(dispatchDetails?.cessAmount) || 0,
      cessNonAdvolValue: Number(dispatchDetails?.cessNonAdvolValue) || 0,

      // transport
      transMode: '',
      transporterId: '',
      transporterName: '',
      transDistance: '',
      transDocNo: '',
      transDocDate: '',
      vehicleNo: '',
      vehicleType: '',
      remarks: '',
    };

    // Merge with draftData
    setForm((prev) => {
      const merged = {};

      Object.keys(prev).forEach((key) => {
        merged[key] =
          draftData?.[key] !== undefined
            ? draftData[key]
            : mapped[key] !== undefined
              ? mapped[key]
              : '';
      });

      return merged;
    });
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
      // const diffDays = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
      // if (diffDays > 180) e.docDate = 'Document date should be within 180 days';
    }

    if (!form.fromGstin) e.fromGstin = 'From GSTIN required';
    if (!form.toGstin) e.toGstin = 'To GSTIN required';
    if (!form.itemList || form.itemList.length === 0)
      e.itemList = 'At least one item required';

    // Trans mode specific
    // if (form.transMode !== '1' && !form.transDocNo) {
    //   e.transDocNo = 'Transport document number required for selected mode';
    // }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generateEWBPartAMutation = useMutation({
    mutationFn: generateEWB,
    onSuccess: () => {
      toast.success('EWB Part A generated successfully');
      setIsCreatingEWB(false);
      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDispatchNote.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || 'Failed to generate EWB Part A',
      );
    },
  });

  const handleSubmit = async (type = 'save') => {
    if (!validate()) return;

    // Build payload
    const payload = { ...form };

    // api call for - save draft
    if (type === 'save') {
      toast.success('EWB Part A saved successfully');
      saveDraftToSession({ key: `${dispatchNoteId}_EWBA`, data: payload });
      setIsCreatingEWB(false);
      return;
    }
    // api call for - generate
    generateEWBPartAMutation.mutate({ dispatchNoteId, data: payload });
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
        dispatchNoteId={dispatchNoteId}
        config={stepsConfigA}
        formData={form}
        setFormData={setForm}
        errors={errors}
        setErrors={setErrors}
        onFinalSubmit={handleSubmit}
        isSubmitting={generateEWBPartAMutation?.isPending}
        onCancel={() => setIsCreatingEWB(false)}
      />
    </Wrapper>
  );
}
