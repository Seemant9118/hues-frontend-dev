"use client";
import AddProduct from "@/components/AddProduct";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [file, setFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [viewForm, setViewForm] = useState(false);
  const [viewResponses, setViewResponses] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templateEmptyStageData = {
    heading: "Elevate Your Data Management",
    desc: `Unlock efficiency and precision with Templates: a dynamic suite designed for every business
    need. From Contracts to Consent Artifacts, Onboarding Forms, Declarations, and Undertakings,
    streamline your workflow with customizable, digitally-signable templates. Ensure compliance,
    clarity, and security in every document. Elevate your data collection and document management
    to new heights—effortlessly.`,
    subHeading: "User Sections",
    subItems: [
      {
        id: 1,
        itemhead: `Customize to Perfection:`,
        item: `Tailor templates with specific placeholders for data points, ensuring
      each document perfectly aligns with your needs`,
      },
      {
        id: 2,
        itemhead: `Share Seamlessly: `,
        item: `Distribute your custom forms effortlessly to your audience, streamlining the
      data collection process`,
      },
      {
        id: 3,
        itemhead: `Secure with Signatures:`,
        item: ` Enhance document integrity by adding mandatory digital signatures,
      with options for multiple signatories`,
      },
      {
        id: 4,
        itemhead: `Save and Reuse: `,
        item: `Store templates for future use, optimizing your workflow and saving valuable
      time.`,
      },
      {
        id: 5,
        itemhead: `Ensure Compliance: `,
        item: `Rest assured that every template meets your compliance requirements,
      with every use and every signature`,
      },
    ],
  };

  const fileHandler = (e) => {
    const uploadedFile = e.target.files[0]; // Get the first file
    if (uploadedFile) {
      setFile(uploadedFile);
      setTemplates((prev) => [...prev, { name: uploadedFile.name }]);
      toast.success("Template Added Successfully.");
    }
  };
  return (
    <>
      {templates.length === 0 && !isAdding && (
        <>
          <SubHeader name="Templates" />
          <EmptyStageComponent
            heading={templateEmptyStageData.heading}
            desc={templateEmptyStageData.desc}
            subHeading={templateEmptyStageData.subHeading}
            subItems={templateEmptyStageData.subItems}
          />

          <div className="flex flex-col justify-center items-center gap-2">
            <PackageOpen className="text-neutral-500" />
            <p className="text-neutral-500">
              No Templates Uploaded Yet. Click on buttons below.
            </p>
            <Button
              asChild
              variant={"secondary"}
              className="gap-2 text-blue-500 border border-blue-500 hover:bg-blue-500/10 cursor-pointer"
            >
              <label htmlFor="template">
                <Upload />
                Add Template
              </label>
            </Button>
            <input
              onChange={fileHandler}
              id="template"
              type="file"
              className="sr-only"
            />
          </div>
        </>
      )}
      {viewForm && (
        <AddProduct
          onCancel={() => setViewForm(false)}
          onSubmit={(newProduct) => {
            setTemplates((prev) => [...prev, newProduct]);
            setViewForm(false);
            toast.success("Templated Added Successfully.");
          }}
          name={"Product Template"}
          cta={"Template"}
        />
      )}
      {!isAdding && !viewForm && !viewResponses && templates.length !== 0 && (
        <Wrapper>
          <SubHeader name={"Templates"}>
            <div className="flex items-center justify-center gap-4">
              <Button variant={"blue_outline"} asChild size="sm">
                <label htmlFor="template">
                  <Upload size={14} />
                  Upload Template
                </label>
              </Button>
              <input
                onChange={fileHandler}
                id="template"
                type="file"
                className="sr-only"
              />
              <Button
                onClick={() => setViewForm(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Layers2 size={14} />
                Add Template
              </Button>
            </div>
          </SubHeader>
          <div className="grid grid-cols-4 gap-2">
            {templates.map((template, idx) => (
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
              <Image src={"/Word_png.png"} alt="image" height={70} width={60} />
              <div className="grid gap-2">
                <p className="text-grey font-bold text-sm">Template Name</p>
                <p className=" font-bold text-sm">{selectedTemplate.name}</p>
              </div>
              <Button variant="grey" className="ml-20">
                <MessageSquareText size={14} />
                <p>12 Responses</p>
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant={"blue_outline"}
                    size="sm"
                    className="text-xs gap-1 p-1.5"
                  >
                    <Eye size={16} />
                    View Template
                  </Button>
                </DialogTrigger>
                <DialogContent></DialogContent>
              </Dialog>
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
