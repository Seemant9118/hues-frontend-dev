import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquareText, Trash2 } from "lucide-react";
import Link from "next/link";
import ViewTemplate from "@/app/(dashboard)/template/ViewTemplate";

const TemplateCard = ({
  onViewFormClick,
  onDelete,
  viewResponseClick,
  name,
}) => {
  return (
    <div className="border border-neutral-500/10 rounded-md flex flex-col gap-2.5 p-4 scrollBarStyles relative">
      <Button
        variant="grey"
        onClick={() => viewResponseClick()}
        className="absolute top-3 right-3"
      >
        <MessageSquareText size={14} />
        <p>12 Responses</p>
      </Button>
      <Image src={"/Word_png.png"} alt="Template" height={60} width={65} />
      <div className="">
        <p className="text-neutral-300 text-sm font-bold">Template Name</p>
        <p className="text-[#363940] text-base font-bold">{name}</p>
      </div>
      <div className="grid gap-1.5 grid-cols-[1fr,_1fr,_40px]">
        <ViewTemplate />
        <Button
          onClick={onViewFormClick}
          variant={"blue_outline"}
          size="sm"
          className="text-xs gap-1 p-1.5 "
        >
          <Eye size={16} />
          View Form
        </Button>
        <Button
          onClick={onDelete}
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
