import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";

const TemplateCard = () => {
  return (
    <div className="border border-neutral-500/10 rounded-md flex flex-col gap-2.5 p-4 scrollBarStyles">
      <Image src={"/Word_png.png"} alt="Template" height={60} width={65} />
      <div className="">
        <p className="text-neutral-300 text-sm font-bold">Template Name</p>
        <p className="text-[#363940] text-base font-bold">Crocin Capsule</p>
      </div>
      <div className="grid gap-1.5 grid-cols-[1fr,_1fr,_40px]">
        <Button
          variant={"blue_outline"}
          size="sm"
          className="text-xs gap-1 p-1.5"
        >
          <Eye size={16} />
          View Template
        </Button>
        <Button
          variant={"blue_outline"}
          size="sm"
          className="text-xs gap-1 p-1.5 "
        >
          <Eye size={16} />
          View Form
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-neutral-500 hover:text-black "
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;
