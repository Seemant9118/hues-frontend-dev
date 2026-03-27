'use client';

import { orderApi } from '@/api/order_api/order_api';
import ViewPdf from '@/components/pdf/ViewPdf';
import Loading from '@/components/ui/Loading';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { previewOrderDocument } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

const PreviewFinalPage = ({ formData = {} }) => {
  const [tabs, setTabs] = useState('key-commercial-terms');

  const onTabChange = (value) => {
    setTabs(value);
  };

  const previewPayload = useMemo(() => {
    return { ...formData };
  }, [formData]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [orderApi.previewOrderDocument.endpointKey, previewPayload],
    queryFn: () => previewOrderDocument(previewPayload),
    enabled: Object.keys(previewPayload).length > 0,
  });

  // Extract BOTH PDFs once
  const invoicePreview = data?.data?.data?.invoicePreview
    ? `data:application/pdf;base64,${data?.data?.data?.invoicePreview}`
    : '';

  const agreementPreview = data?.data?.data?.serviceAgreementPreview
    ? `data:application/pdf;base64,${data?.data?.data?.serviceAgreementPreview}`
    : '';

  if (isLoading && !invoicePreview && !agreementPreview) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-red-500">
        {error?.response?.data?.message || 'Something went wrong'}
      </div>
    );
  }

  if (!invoicePreview && !agreementPreview) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Preview not available yet.
      </div>
    );
  }

  return (
    <Tabs
      value={tabs}
      onValueChange={onTabChange}
      className="flex h-full w-full flex-col overflow-hidden bg-[#F4F4F4]"
    >
      {/* Header */}
      <TabsList className="m-2 w-fit border">
        <TabsTrigger value="key-commercial-terms">
          Key Commercial Terms
        </TabsTrigger>
        <TabsTrigger value="serviceAgreement">Draft Agreement</TabsTrigger>
      </TabsList>

      {/* Content Wrapper */}
      <div className="w-full flex-1 overflow-hidden">
        <TabsContent value="key-commercial-terms" className="h-full w-full">
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
  );
};

export default PreviewFinalPage;
