"use client";
import AddProduct from "@/components/AddProduct";
import SubHeader from "@/components/Sub-header";
import TemplateCard from "@/components/TemplateCard";
import Wrapper from "@/components/Wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers2, PackageOpen, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [templates, setTemplates] = useState([]);

  return (
    <>
      {templates.length === 0 && !isAdding && (
        <div className="flex flex-col justify-center items-center gap-2 h-full">
          <PackageOpen className="text-neutral-500" />
          <p className="text-neutral-500">
            No Product Uploaded Yet. Click on buttons below.
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
            onChange={(e) => {
              setFile(true);
              setIsAdding(true);
            }}
            id="template"
            type="file"
            className="sr-only"
          />
        </div>
      )}
      {isAdding && (
        <AddProduct
          onCancel={() => setIsAdding(false)}
          onSubmit={(newProduct) => {
            setTemplates((prev) => [...prev, newProduct]);
            setIsAdding(false);
          }}
          name={"Product Template"}
        />
      )}
      {!isAdding && templates.length !== 0 && (
        <Wrapper>
          <SubHeader name={"Templates"}>
            <div className="flex items-center justify-center gap-4">
              <Button variant={"blue_outline"} size="sm">
                <Upload size={14} />
                Upload Template
              </Button>
              <Button variant={"blue_outline"} size="sm">
                <Layers2 size={14} />
                Add Template
              </Button>
            </div>
          </SubHeader>
          <div className="grid grid-cols-4 gap-2">
            {templates.map((template) => (
              <TemplateCard {...template} />
            ))}
          </div>
        </Wrapper>
      )}
    </>
  );
}
