import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Eye, Pen } from "lucide-react";
import Builder from "../Form/Builder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { template_api } from "@/api/templates_api/template_api";
import {
  getDocument,
  getTemplate,
  updateTemplate,
} from "@/services/Template_Services/Template_Services";
import { LocalStorageService } from "@/lib/utils";
import { toast } from "sonner";

const CreateTemplateForm = ({ url, id }) => {
  const queryClient = useQueryClient();

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: [template_api.getS3Document.endpointKey, url],
    queryFn: () => getDocument(url),
    enabled: !!url,
    select: (data) => data.data.data,
  });

  const { data: templateInfo } = useQuery({
    queryKey: [template_api.getTemplate.endpointKey, id],
    queryFn: () => getTemplate(id),
    enabled: !!id,
    select: (data) => data.data.data,
  });

    const { mutate, isPending: isUpdating } = useMutation({
      mutationFn: ({ signatureData, formData }) => {
        const enterprise_id = LocalStorageService.get("enterprise_Id");
        const user_id = LocalStorageService.get("user_profile");
        return updateTemplate(
          {
            enterprise_id: enterprise_id,
            form_data: {
              data: formData || templateInfo?.formData?.data,
            },
            signature_box_placement: {
              data: signatureData || templateInfo?.signatureBoxPlacement.data,
            },
            created_by: user_id,
          },
          id
        );
      },
      onSuccess: (data) => {
        toast.success("Template Updated Successfully.");
        queryClient.invalidateQueries({
          queryKey: [template_api.getTemplate.endpointKey],
        });
        // setClickedCoordinates([]);
        // setIsCreatingForm(false);
      },
      onError: (data) => {
        toast.error("Failed to update template.");
      },
    });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={"blue_outline"}
          size="sm"
          className="text-xs gap-1 p-1.5"
        >
          <Pen size={16} />
          Create Template Form
        </Button>
      </SheetTrigger>
      <SheetContent className="min-w-[90%] flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle>{templateInfo?.templateName}</SheetTitle>
        </SheetHeader>
        <Builder url={data?.publicUrl} saveHandler={mutate} />
      </SheetContent>
    </Sheet>
  );
};

export default CreateTemplateForm;
