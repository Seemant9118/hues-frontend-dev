"use client";
import AddItem from "@/components/inventory/AddItem";
import EmptyStageComponent from "@/components/ui/EmptyStageComponent";
import SubHeader from "@/components/ui/Sub-header";
import Wrapper from "@/components/wrappers/Wrapper";
import { Columns } from "@/components/columns/columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import {
  Check,
  Download,
  Trash2,
  Upload,
  UploadCloud,
  CircleFadingPlus,
  FileCheck,
  FileText,
  KeySquare,
  DatabaseZap,
} from "lucide-react";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setisUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const handleChange = async (file) => {
    setFiles((prev) => [...prev, file]);
  };

  const InventoryEmptyStageData = {
    heading: `~"Revolutionize stock management with secure, editable, and shareable product listings for
    perfect cataloging."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Quickly upload and fine-tune detailed product information in bulk.`,
      },
      {
        id: 2,
        icon: <FileText size={14} />,
        subItemtitle: `Effortlessly add items for fresh, accurate inventory.`,
      },
      {
        id: 3,
        icon: <KeySquare size={14} />,
        subItemtitle: `Authenticate inventory with digital signatures for integrity and compliance.`,
      },
      {
        id: 4,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Share digitally signed inventory easily in PDF format.`,
      },
    ],
  };

  return (
    <>
      {!isAdding && !isUploading && (
        <Wrapper>
          <SubHeader name={"Inventory"}>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setisUploading(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Upload size={14} />
                Upload
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <CircleFadingPlus size={14} />
                Add
              </Button>
            </div>
          </SubHeader>
          {products.length === 0 ? (
            <EmptyStageComponent
              heading={InventoryEmptyStageData.heading}
              desc={InventoryEmptyStageData.desc}
              subHeading={InventoryEmptyStageData.subHeading}
              subItems={InventoryEmptyStageData.subItems}
            />
          ) : (
            <DataTable columns={Columns} data={products} />
          )}
        </Wrapper>
      )}
      {isAdding && (
        <AddItem
          onCancel={() => setIsAdding(false)}
          onSubmit={(newProduct) => {
            setIsAdding(false);
            setProducts((products) => [...products, newProduct]);
          }}
          name={"Add Item"}
          cta={"Item"}
        />
      )}
      {isUploading && (
        <Wrapper className={"justify-start items-center"}>
          <FileUploader
            handleChange={handleChange}
            name="file"
            types={["xls", "csv"]}
          >
            <div className="min-w-[700px] grow px-5 py-10 mb-2 flex gap-3 justify-between items-center rounded border-2 border-sky-300 border-dashed border-spacing-3 cursor-pointer">
              <div className="flex items-center gap-4">
                <UploadCloud className="text-sky-500" size={40} />
                <div className="flex flex-col gap-1 ">
                  <p className=" text-darkText font-medium text-xs">
                    Drag & Drop or Select a File (Max 10MB,
                    <span className="text-sky-500 font-bold">
                      {" "}
                      .csv/.xls Formats
                    </span>{" "}
                    )
                  </p>
                  <p className="text-sky-500 text-xs font-normal">
                    Note - Trade Enabled for eSigned Inventories Only.
                  </p>
                  {/* <p className="text-sky-500 text-xs font-normal">
                    Supported File formats : .csv | .xls
                  </p> */}
                </div>
              </div>
              <Button variant="blue_outline">
                <Upload />
                Select
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              <Download />
              Sample
            </Button>
          </FileUploader>
          {files.map((file, idx) => (
            <div
              key={idx}
              className="p-4 border-neutral-300 border rounded-sm flex items-center justify-between gap-4 min-w-[700px]"
            >
              <div className="flex items-center gap-4">
                <p className="text-xs font-medium leading-[18px]">
                  {file.name}
                </p>
                <div className="w-1 h-1 rounded-full bg-neutral-400"></div>
                <a
                  href="#"
                  className="text-blue-500 underline underline-offset-2 text-xs leading-4"
                >
                  Preview
                </a>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                    <Check size={10} />
                  </div>
                  <p className="text-xs font-medium text-green-500 leading-5">
                    Upload Successfully!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFiles((prev) => {
                    const updated = [...prev];
                    updated.splice(idx, 1);
                    return updated;
                  });
                }}
              >
                <Trash2 className="text-grey" size={14} />
              </button>
            </div>
          ))}
          <div className="h-[1px] w-full bg-neutral-300 mt-auto"></div>

          <div className="flex justify-end self-end ">
            <Button onClick={() => setisUploading(false)}>Done</Button>
          </div>
        </Wrapper>
      )}
    </>
  );
};

export default InventoryPage;
