import { Button } from "@/components/ui/button";
import { PackageOpen, Upload } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-2 h-full">
      <PackageOpen className="text-neutral-500"/>
      <p className="text-neutral-500">No Product Uploaded Yet. Click on buttons below.</p>
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
      <input id="template" type="file" className="sr-only"/>
    </div>
  );
}
