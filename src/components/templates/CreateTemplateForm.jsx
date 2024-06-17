import { templateApi } from '@/api/templates_api/template_api';
import { LocalStorageService } from '@/lib/utils';
import {
  getDocument,
  getTemplate,
  updateTemplate,
} from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pen } from 'lucide-react';
import { toast } from 'sonner';
import Builder from '../Form/Builder';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

const CreateTemplateForm = ({ url, id }) => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, url],
    queryFn: () => getDocument(url),
    enabled: !!url,
    select: () => data.data.data,
  });

  const { data: templateInfo } = useQuery({
    queryKey: [templateApi.getTemplate.endpointKey, id],
    queryFn: () => getTemplate(id),
    enabled: !!id,
    select: () => data.data.data,
  });

  const { mutate } = useMutation({
    mutationFn: ({ signatureData, formData }) => {
      const enterpriseId = LocalStorageService.get('enterprise_Id');
      const userId = LocalStorageService.get('user_profile');
      return updateTemplate(
        {
          enterprise_id: enterpriseId,
          form_data: {
            data: formData || templateInfo?.formData?.data,
          },
          signature_box_placement: {
            data: signatureData || templateInfo?.signatureBoxPlacement.data,
          },
          created_by: userId,
        },
        id,
      );
    },
    onSuccess: () => {
      toast.success('Template Updated Successfully.');
      queryClient.invalidateQueries({
        queryKey: [templateApi.getTemplate.endpointKey],
      });
      // setClickedCoordinates([]);
      // setIsCreatingForm(false);
    },
    onError: () => {
      toast.error('Failed to update template.');
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant={'blue_outline'}
          size="sm"
          className="gap-1 p-1.5 text-xs"
        >
          <Pen size={16} />
          Create Template Form
        </Button>
      </SheetTrigger>
      <SheetContent className="flex min-w-[90%] flex-col gap-4">
        <SheetHeader>
          <SheetTitle>{templateInfo?.templateName}</SheetTitle>
        </SheetHeader>
        <Builder url={data?.publicUrl} saveHandler={mutate} />
      </SheetContent>
    </Sheet>
  );
};

export default CreateTemplateForm;
