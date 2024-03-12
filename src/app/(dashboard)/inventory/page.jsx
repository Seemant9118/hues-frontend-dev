"use client";
import AddProduct from "@/components/AddProduct";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { Columns } from "@/components/columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import {
  Check,
  Download,
  FileEdit,
  Layers2,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const InventoryPage = () => {
  const [products, setProducts] = useState([
    {
      name: "Brand: Crocin",
      code: "#HUESGT45",
      description:
        "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.",
      category: "Business Planning",
      quantity: "44",
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setisUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const handleChange = async (file) => {
    setFiles((prev) => [...prev, file]);
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
                Upload List
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Layers2 size={14} />
                Add Product
              </Button>
            </div>
          </SubHeader>
          <DataTable columns={Columns} data={products} />
        </Wrapper>
      )}
      {isAdding && (
        <AddProduct
          onCancel={() => setIsAdding(false)}
          onSubmit={(newProduct) => {
            setIsAdding(false);
          }}
          name={"Add Product"}
          cta={"Product"}
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
                    Select a file or drag and drop here
                  </p>
                  <p className="text-grey text-xs font-normal">
                    File size no more than 10MB
                  </p>
                  <p className="text-sky-500 text-xs font-normal">
                    Supported File formats : .csv | .xls
                  </p>
                </div>
              </div>
              <Button variant="blue_outline">
                <Upload />
                Select From Local
              </Button>
            </div>
            <Button variant="outline" className="w-full">
              <Download />
              Download Sample Format
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
