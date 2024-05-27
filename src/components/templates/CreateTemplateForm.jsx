import React, { useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Edit2, Eye } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDocument,
  getTemplate,
  updateTemplate,
} from "@/services/Template_Services/Template_Services";
import { template_api } from "@/api/templates_api/template_api";
import Builder from "../Form/Builder";

const CreateTemplateForm = ({ url, id }) => {
  const [canClick, setCanClick] = useState(false);
  const queryClient = useQueryClient();
  const pdfCanvasRef = useRef();
  const [clickedCoordinates, setClickedCoordinates] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const addClickedCoordinate = (event) => {
    // const pdfCanvas = document.getElementById("pdfCanvas");
    const rect = pdfCanvasRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    // const { offsetX, offsetY } = event.nativeEvent;
    setClickedCoordinates((prev) => ({
      ...prev,
      [pageNo]: prev[pageNo]?.length
        ? [...prev[pageNo], { x: offsetX, y: offsetY }]
        : [{ x: offsetX, y: offsetY }],
    }));
  };
  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

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
            data: signatureData || clickedCoordinates,
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
      setClickedCoordinates([]);
      setIsCreatingForm(false);
    },
    onError: (data) => {
      toast.error("Failed to update template.");
    },
  });
  useEffect(() => {
    templateInfo?.signatureBoxPlacement?.data
      ? setClickedCoordinates(templateInfo?.signatureBoxPlacement?.data)
      : setClickedCoordinates({
          1: [],
        });
  }, [templateInfo?.signatureBoxPlacement?.data]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={"blue_outline"}
          size="sm"
          className="text-xs gap-1 p-1.5 "
        >
          <Edit2 size={16} />
          Create Template Form
        </Button>
      </SheetTrigger>
      <SheetContent className={"min-w-[90%] gap-4 flex flex-col "}>
        <SheetHeader>
          <SheetTitle>{templateInfo?.templateName}</SheetTitle>
        </SheetHeader>
        <Builder url={data?.publicUrl} saveHandler={() => {}} />
      </SheetContent>
    </Sheet>
  );
};

export default CreateTemplateForm;
