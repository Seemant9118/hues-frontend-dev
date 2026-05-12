'use client';

import { orderApi } from '@/api/order_api/order_api';
import ViewPdf from '@/components/pdf/ViewPdf';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { previewOrderDocument } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';

const FinalPreview = ({ formData, setFormData }) => {
  const [appliedPayload, setAppliedPayload] = useState(() => {
    const parsedAmount =
      formData.orderItems?.reduce(
        (acc, curr) => acc + (Number(curr.totalAmount) || 0),
        0,
      ) || 0;
    const parsedGst =
      formData.orderItems?.reduce(
        (acc, curr) => acc + (Number(curr.totalGstAmount) || 0),
        0,
      ) || 0;

    return {
      ...formData,
      amount: Number(parsedAmount.toFixed(2)),
      gstAmount: Number(parsedGst.toFixed(2)),
    };
  });

  const handleApplyChanges = () => {
    const parsedAmount =
      formData.orderItems?.reduce(
        (acc, curr) => acc + (Number(curr.totalAmount) || 0),
        0,
      ) || 0;
    const parsedGst =
      formData.orderItems?.reduce(
        (acc, curr) => acc + (Number(curr.totalGstAmount) || 0),
        0,
      ) || 0;

    setAppliedPayload({
      ...formData,
      amount: Number(parsedAmount.toFixed(2)),
      gstAmount: Number(parsedGst.toFixed(2)),
    });
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [orderApi.previewOrderDocument.endpointKey, appliedPayload],
    queryFn: () => previewOrderDocument(appliedPayload),
    enabled: Object.keys(appliedPayload).length > 0,
  });

  const invoicePreview = data?.data?.data?.invoicePreview
    ? `data:application/pdf;base64,${data?.data?.data?.invoicePreview}`
    : '';

  return (
    <div className="flex h-full w-full gap-3 overflow-hidden">
      {/* Left side inputs */}
      <div className="flex w-1/3 flex-col gap-4 rounded-md px-1">
        <h3 className="text-lg font-semibold">Additional Details</h3>
        <div className="flex flex-col gap-2">
          <Label>Payment Terms</Label>
          <Textarea
            value={formData.paymentTerms || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                paymentTerms: e.target.value,
              }))
            }
            placeholder="e.g., 50% advance, 50% on completion"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Offer Validity</Label>
          <Textarea
            value={formData.offerValidity || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                offerValidity: e.target.value,
              }))
            }
            placeholder="e.g., Valid for 30 days from date of issue"
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Offer Terms</Label>
          <Textarea
            value={formData.offerTerms || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                offerTerms: e.target.value,
              }))
            }
            placeholder="Enter offer terms and conditions..."
            rows={2}
          />
        </div>
        <div className="flex items-center pt-2">
          <Button
            size="sm"
            onClick={handleApplyChanges}
            disabled={isFetching || isLoading}
            className="w-full"
          >
            {isFetching || isLoading ? 'Applying changes...' : 'Apply Changes'}
          </Button>
        </div>
      </div>

      {/* Right side PDF Preview */}
      <div className="h-full w-2/3 border bg-[#F4F4F4]">
        <ViewPdf url={invoicePreview} isPDF />
      </div>
    </div>
  );
};

export default FinalPreview;
