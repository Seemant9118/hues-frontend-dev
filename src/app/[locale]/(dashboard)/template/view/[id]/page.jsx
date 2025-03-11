'use client';

import FormPreview from '@/components/templates/FormPreview';
import Loading from '@/components/ui/Loading';
import { getTemplate } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const ViewTemplatePage = ({ params }) => {
  const { data: templateInfo, isLoading } = useQuery({
    queryKey: ['Template', params?.id],
    queryFn: () => getTemplate(params?.id),
    enabled: !!params?.id,
    select: (data) => data.data.data,
  });

  if (isLoading) return <Loading />;
  return (
    <div>
      <FormPreview
        isLoading={false}
        name={templateInfo?.templateName}
        selectedForm={templateInfo?.formData}
      />
    </div>
  );
};

export default ViewTemplatePage;
