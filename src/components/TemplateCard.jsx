import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquareText, Trash2 } from "lucide-react";
import ViewTemplate from "@/components/templates/ViewTemplate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTemplate } from "@/services/Template_Services/Template_Services";
import { toast } from "sonner";
import { template_api } from "@/api/templates_api/template_api";
import Loading from "./Loading";

const TemplateCard = ({
  onViewFormClick,
  onDelete,
  viewResponseClick,
  name,
  type,
  templateUrl,
  id,
  signatureBoxPlacement,
}) => {
  // const getfileExtension = type.replace(/(.*)\//g, "");
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteTemplate(id),
    onSuccess: () => {
      toast.success("Template Deleted Successfully.");
      queryClient.invalidateQueries({
        queryKey: [template_api.getTemplates.endpointKey],
      });
    },
    onError: () => {
      toast.error("Failed to delete template.");
    },
  });
  return (
    <div className="border border-neutral-500/10 rounded-md flex flex-col gap-2.5 p-4 scrollBarStyles relative">
      <div className="flex items-center justify-between gap-2">
        {/* <p className="text-neutral-300 text-sm font-bold">Template Name</p> */}
        <div className="text-[#363940] text-base font-bold flex">
          <p className="truncate">
            {templateUrl.substring(0, 10)}
            {templateUrl.length > 10 && "..."}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        {/* {getfileExtension === "pdf" ? (
          <Image src={"/pdf_png.png"} alt="Template" height={55} width={60} />
        ) : (
          <Image src={"/xlsx_png.png"} alt="Template" height={55} width={60} />
        )} */}
        <Image src={"/pdf_png.png"} alt="Template" height={55} width={60} />
        <Button
          variant="grey"
          onClick={() => viewResponseClick()}
          className="border"
        >
          <MessageSquareText size={14} />
          <p>0 Contracts</p>
        </Button>
      </div>

      <div className="grid gap-1.5 grid-cols-[1fr,_1fr,_40px]">
        <ViewTemplate
          url={templateUrl}
          id={id}
          signatureBoxPlacement={signatureBoxPlacement}
        />
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
          onClick={mutate}
          variant="ghost"
          size="icon"
          className="text-neutral-500 hover:text-black "
        >
          {isPending ? <Loading /> : <Trash2 size={12} />}
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;
