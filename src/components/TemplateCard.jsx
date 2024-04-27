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
  type,
}) => {

  const getfileExtension = type.replace(/(.*)\//g, "");

  return (
    <div className="border border-neutral-500/10 rounded-md flex flex-col gap-2.5 p-4 scrollBarStyles relative">
      <div className="flex items-center justify-between gap-2">
        {/* <p className="text-neutral-300 text-sm font-bold">Template Name</p> */}
        <div className="text-[#363940] text-base font-bold flex">
          <p className="truncate">
            {name.substring(0, 10)}
            {name.length > 10 && "..."}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        {getfileExtension === "pdf" ? (
          <Image src={"/pdf_png.png"} alt="Template" height={55} width={60} />
        ) : (
          <Image src={"/xlsx_png.png"} alt="Template" height={55} width={60} />
        )}
        <Button
          variant="grey"
          onClick={() => viewResponseClick()}
          className="border"
        >
          <MessageSquareText size={14} />
          <p>12 Contracts</p>
        </Button>
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
          Form
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
