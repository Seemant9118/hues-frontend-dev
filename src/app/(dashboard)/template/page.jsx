"use client";
import AddItem from "@/components/AddItem";
import SubHeader from "@/components/Sub-header";
import TemplateCard from "@/components/TemplateCard";
import Wrapper from "@/components/Wrapper";
import { ResponseColumns } from "@/components/columns/ResponseColumns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Eye,
  Layers2,
  MessageSquareText,
  PackageOpen,
  Trash2,
  Upload,
  FileCog,
  FileCheck,
  FileText,
  KeySquare,
  DatabaseZap,
  ShieldCheck,
  Search,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import ViewTemplate from "./ViewTemplate";
import InputWithLabel from "@/components/InputWithLabel";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { template_api } from "@/api/templates_api/template_api";
import {
  getTemplates,
  uploadTemplate,
} from "@/services/Template_Services/Template_Services";
import { LocalStorageService } from "@/lib/utils";

export default function Home() {
  const enterpriseId = LocalStorageService.get("enterprise_Id");

  const [file, setFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [viewResponses, setViewResponses] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templateEmptyStageData = {
    heading: `~"Streamline workflows with customizable, secure, digitally-signable templates for all business
    needs."`,
    subHeading: "Features",
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
    mutationFn: (file) => uploadTemplate(file, enterpriseId),
    onSuccess: () => {
      toast.success("Template Added Successfully.");
      setFile(null);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const { isLoading, data, error } = useQuery({
    queryKey: [template_api.getTemplates.endpointKey],
    queryFn: getTemplates,
    select:(data) => data.data.data
  });


  console.log(data); // for testing

  const fileHandler = (e) => {
    const uploadedFile = e.target.files[0]; // Get the first file
    if (uploadedFile) {
      setFile(uploadedFile);

      setTemplates((prev) => [
        ...prev,
        {
          name: uploadedFile.name,
          type:
            uploadedFile.type.replace(/(.*)\//g, "") === "pdf" ? "pdf" : "xlsx",
        },
      ]);

      const formData = new FormData();
      formData.append("file",uploadedFile);

      uploadFileMutation.mutate(formData);
    }
  };

  return (
    <>
      {data?.length === 0 && !isAdding && (
        <>
          <div className="flex justify-between items-center">
            <SubHeader name="Templates" className={"justify-between w-full"}>
              <Button
                asChild
                variant={"secondary"}
                className="gap-2 text-blue-500 border border-blue-500 hover:bg-blue-500/10 cursor-pointer"
              >
                <label htmlFor="template">
                  <Upload />
                  Upload
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

      {viewForm && (
        <AddItem
          onCancel={() => setViewForm(false)}
          onSubmit={(newProduct) => {
            setTemplates((prev) => [...prev, newProduct]);
            setViewForm(false);
            toast.success("Templated Added Successfully.");
          }}
          name={"Product"}
          cta={"Template"}
        />
      )}

      {!isAdding && !viewForm && !viewResponses && data?.length !== 0 && (
        <Wrapper>
          <SubHeader name={"Templates"}>
            <div className="flex items-center justify-center gap-4">
              <div className="relative">
                <Input placeholder="Search" />
                <Search
                  className="absolute top-1/2 right-2 -translate-y-1/2 z-10 cursor-pointer bg-white"
                  size={16}
                />
              </div>
              <Button variant={"blue_outline"} asChild size="sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2">
            {templates?.map((template, idx) => (
              <TemplateCard
                viewResponseClick={() => {
                  setViewForm(false);
                  setViewResponses(true);
                  setSelectedTemplate(template);
                }}
                onDelete={() => {
                  setTemplates((prev) => {
                    const updated = [...prev];
                    updated.splice(idx, 1);
                    return updated;
                  });
                  toast.success("Templated Deleted Successfully.");
                }}
                onViewTemplateClick={() => {}}
                onViewFormClick={() => setViewForm(true)}
                {...template}
                key={idx}
              />
            ))}
          </div>
        </Wrapper>
      )}
      {viewResponses && (
        <Wrapper>
          <div className="flex items-center justify-between p-8 border rounded-sm border-[#A5ABBD26]">
            <div className="flex items-center gap-4 ">
              {selectedTemplate?.type.replace(/(.*)\//g, "") === "pdf" ? (
                <Image
                  src={"/pdf_png.png"}
                  alt="Template"
                  height={55}
                  width={60}
                />
              ) : (
                <Image
                  src={"/xlsx_png.png"}
                  alt="Template"
                  height={55}
                  width={60}
                />
              )}
              <div className="grid gap-2">
                <p className="text-grey font-bold text-sm">Template Name</p>
                <p className=" font-bold text-sm">{selectedTemplate.name}</p>
              </div>
              <Button variant="grey" className="ml-20">
                <MessageSquareText size={14} />
                <p>12 Contracts</p>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <ViewTemplate />
              <Button
                onClick={() => setViewForm(true)}
                variant={"blue_outline"}
                size="sm"
                className="text-xs gap-1 p-1.5 "
              >
                <Eye size={16} />
                View Form
              </Button>
            </div>
          </div>
          <DataTable columns={ResponseColumns} data={[]} />
          <div className="h-[1px] bg-neutral-300 mt-auto"></div>

          <div className="flex justify-end items-center gap-4 mt-auto">
            <Button onClick={() => {}} variant={"grey"} size="icon">
              <Trash2 />
            </Button>
            <Button
              variant={"outline"}
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
