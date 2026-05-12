'use client';

import { orderApi } from '@/api/order_api/order_api';
import ViewPdf from '@/components/pdf/ViewPdf';
import Loading from '@/components/ui/Loading';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { previewOrderDocument } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ErrorBox from '@/components/ui/ErrorBox';

const PreviewFinalPage = ({ formData = {}, setFormData, errors = {} }) => {
  const [tabs, setTabs] = useState('key-commercial-terms');

  // Use appliedPayload to prevent API calls on every keystroke
  const [appliedPayload, setAppliedPayload] = useState(() => {
    return { ...formData };
  });

  const onTabChange = (value) => {
    setTabs(value);
  };

  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleApplyChanges = () => {
    setAppliedPayload({ ...formData });
  };

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [orderApi.previewOrderDocument.endpointKey, appliedPayload],
    queryFn: () => previewOrderDocument(appliedPayload),
    enabled: Object.keys(appliedPayload).length > 0,
  });

  const invoicePreview = data?.data?.data?.invoicePreview
    ? `data:application/pdf;base64,${data?.data?.data?.invoicePreview}`
    : '';

  const agreementPreview = data?.data?.data?.serviceAgreementPreview
    ? `data:application/pdf;base64,${data?.data?.data?.serviceAgreementPreview}`
    : '';

  return (
    <div className="flex h-full w-full gap-3 overflow-hidden">
      {/* Left Sidebar */}
      <div className="flex w-1/3 flex-col gap-3 px-1">
        {/* Payment Terms */}
        <div className="space-y-2">
          <Label>
            Payment Terms <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="e.g., 50% advance, 50% on completion"
            rows={3}
            value={formData.paymentTerms || ''}
            onChange={(e) => updateFormData({ paymentTerms: e.target.value })}
          />
          {errors.paymentTerms && <ErrorBox msg={errors.paymentTerms} />}
          <p className="text-xs text-muted-foreground">
            Specify exact payment schedule and conditions
          </p>
        </div>

        {/* Offer Validity */}
        <div className="space-y-2">
          <Label>
            Offer Validity <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="e.g., Valid for 30 days from date of issue"
            rows={3}
            value={formData.offerValidity || ''}
            onChange={(e) => updateFormData({ offerValidity: e.target.value })}
          />
          {errors.offerValidity && <ErrorBox msg={errors.offerValidity} />}
          <p className="text-xs text-muted-foreground">
            How long this offer remains valid
          </p>
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

      {/* Right Sidebar - Preview Tabs */}
      <div className="flex h-full w-2/3 flex-col overflow-hidden border bg-[#F4F4F4]">
        {isLoading && !invoicePreview && !agreementPreview ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loading />
          </div>
        ) : isError ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-red-500">
            {error?.response?.data?.message || 'Something went wrong'}
          </div>
        ) : !invoicePreview && !agreementPreview ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            Preview not available yet.
          </div>
        ) : (
          <Tabs
            value={tabs}
            onValueChange={onTabChange}
            className="flex h-full w-full flex-col overflow-hidden"
          >
            <TabsList className="m-2 w-fit border">
              <TabsTrigger value="key-commercial-terms">
                Key Commercial Terms
              </TabsTrigger>
              <TabsTrigger value="serviceAgreement">
                Draft Agreement
              </TabsTrigger>
            </TabsList>

            <div className="w-full flex-1 overflow-hidden">
              <TabsContent
                value="key-commercial-terms"
                className="h-full w-full"
              >
                <div className="h-full w-full">
                  <ViewPdf url={invoicePreview} isPDF />
                </div>
              </TabsContent>

              <TabsContent value="serviceAgreement" className="h-full w-full">
                <div className="h-full w-full">
                  <ViewPdf url={agreementPreview} isPDF />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default PreviewFinalPage;
