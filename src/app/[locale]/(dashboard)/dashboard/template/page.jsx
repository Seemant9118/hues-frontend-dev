'use client';

import { templateApi } from '@/api/templates_api/template_api';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { ResponseColumns } from '@/components/columns/ResponseColumns';
import { DataTable } from '@/components/table/data-table';
import TemplateCard from '@/components/templates/TemplateCard';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getTemplates,
  uploadTemplate,
} from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  DatabaseZap,
  Eye,
  FileCheck,
  FileText,
  KeySquare,
  MessageSquareText,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const enterpriseId = getEnterpriseId();
  const queryClient = useQueryClient();

  const [viewForm, setViewForm] = useState(false);
  const [viewResponses, setViewResponses] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templateEmptyStageData = {
    heading: `~"Streamline workflows with customizable, secure, digitally-signable templates for all business
    needs."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Tailor documents with customizable placeholders for perfect alignment.`,
      },
      {
        id: 2,
        icon: <FileText size={14} />,
        subItemtitle: `Effortlessly distribute custom forms for streamlined data collection.`,
      },
      {
        id: 3,
        icon: <KeySquare size={14} />,
        subItemtitle: `Ensure document integrity with mandatory digital signatures.`,
      },
      {
        id: 4,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Optimize workflow by storing templates for future use.`,
      },
      {
        id: 5,
        icon: <ShieldCheck size={14} />,
        subItemtitle: `Guarantee compliance with every template use and signature. `,
      },
    ],
  };

  const uploadFileMutation = useMutation({
    mutationFn: (uploadedFile) => uploadTemplate(uploadedFile, enterpriseId),
    onSuccess: () => {
      toast.success('Template Added Successfully.');
      queryClient.invalidateQueries([templateApi.getTemplates.endpointKey]);
    },
    onError: () => {
      toast.error('Something went wrong');
    },
  });

  const { data, isSuccess } = useQuery({
    queryKey: [templateApi.getTemplates.endpointKey],
    queryFn: () => getTemplates(enterpriseId),
    select: (res) => res.data.data,
    enabled: !!enterpriseId,
  });

  const fileHandler = (e) => {
    const uploadedFile = e.target.files[0]; // Get the first file
    if (uploadedFile) {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      uploadFileMutation.mutate(formData);
    }
  };

  return (
    <>
      {(!data || data?.length === 0) && (
        <>
          <div className="flex items-center justify-between">
            <SubHeader name="Templates" className={'w-full justify-between'}>
              <Button
                asChild
                variant={'secondary'}
                className="cursor-pointer gap-2 border border-blue-500 text-blue-500 hover:bg-blue-500/10"
              >
                <label htmlFor="template">
                  <Plus size={20} />
                  Create
                </label>
              </Button>
            </SubHeader>

            <input
              onChange={fileHandler}
              id="template"
              type="file"
              className="sr-only"
            />
          </div>

          <EmptyStageComponent
            heading={templateEmptyStageData.heading}
            desc={templateEmptyStageData.desc}
            subHeading={templateEmptyStageData.subHeading}
            subItems={templateEmptyStageData.subItems}
          />
        </>
      )}
      {/* 
      {viewForm && (
        <AddItem
          onCancel={() => setViewForm(false)}
          onSubmit={(newProduct) => {
            setTemplates((prev) => [...prev, newProduct]);
            setViewForm(false);
            toast.success('Templated Added Successfully.');
          }}
          name={'Product'}
          cta={'Template'}
        />
      )} */}

      {data && !viewForm && !viewResponses && data?.length !== 0 && (
        <Wrapper>
          <SubHeader name={'Templates'}>
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <Input placeholder="Search" />
                <Search
                  className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer bg-white"
                  size={16}
                />
              </div>
              <Button variant={'blue_outline'} asChild size="sm">
                <label htmlFor="template">
                  <Upload size={14} />
                  Upload
                </label>
              </Button>
              <input
                onChange={fileHandler}
                id="template"
                type="file"
                className="sr-only"
              />
              {/* <Button
                onClick={() => setViewForm(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Layers2 size={14} />
                Add Template
              </Button> */}
            </div>
          </SubHeader>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {isSuccess &&
              data?.map((template) => (
                <TemplateCard
                  viewResponseClick={() => {
                    setViewForm(false);
                    setViewResponses(true);
                    setSelectedTemplate(template);
                  }}
                  // onDelete={() => {
                  //   setTemplates((prev) => {
                  //     const updated = [...prev];
                  //     updated.splice(idx, 1);
                  //     return updated;
                  //   });
                  //   toast.success('Templated Deleted Successfully.');
                  // }}
                  onViewTemplateClick={() => {}}
                  onViewFormClick={() => setViewForm(true)}
                  {...template}
                  key={template.id}
                />
              ))}
          </div>
        </Wrapper>
      )}
      {viewResponses && (
        <Wrapper>
          <div className="flex items-center justify-between rounded-sm border border-[#A5ABBD26] p-8">
            <div className="flex items-center gap-4">
              {/* {selectedTemplate?.type.replace(/(.*)\//g, "") === "pdf" ? ( */}
              <Image
                src={'/pdf_png.png'}
                alt="Template"
                height={55}
                width={60}
              />
              {/* // ) : (
              //   <Image
              //     src={"/xlsx_png.png"}
              //     alt="Template"
              //     height={55}
              //     width={60}
              //   />
              // )} */}
              <div className="grid gap-2">
                <p className="text-sm font-bold text-grey">Template Name</p>
                <p className="text-sm font-bold">{selectedTemplate.name}</p>
              </div>
              <Button variant="grey" className="ml-20">
                <MessageSquareText size={14} />
                <p>0 Contracts</p>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setViewForm(true)}
                disabled={true}
                variant={'blue_outline'}
                size="sm"
                className="gap-1 p-1.5 text-xs"
              >
                <Eye size={16} />
                View Form
              </Button>
            </div>
          </div>
          <DataTable columns={ResponseColumns} data={[]} />
          <div className="mt-auto h-[1px] bg-neutral-300"></div>

          <div className="flex items-center justify-end gap-4">
            <Button onClick={() => {}} variant={'grey'} size="icon">
              <Trash2 />
            </Button>
            <Button
              variant={'outline'}
              className=""
              onClick={() => {
                setViewResponses(false);
              }}
            >
              Close
            </Button>
          </div>
        </Wrapper>
      )}
    </>
  );
}
