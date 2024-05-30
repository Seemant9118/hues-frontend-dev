"use client";
import Loading from "@/components/Loading";
import FormPreview from "@/components/templates/FormPreview";
import { getTemplate } from "@/services/Template_Services/Template_Services";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const page = ({ params }) => {
  console.log(params?.id);
  const {
    data: templateInfo,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ["Template", params?.id],
    queryFn: () => getTemplate(params?.id),
    enabled: !!params?.id,
    select: (data) => data.data.data,
  });

  console.log(templateInfo);
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

export default page;
