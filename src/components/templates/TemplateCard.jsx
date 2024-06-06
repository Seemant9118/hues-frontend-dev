import ViewTemplate from '@/components/templates/ViewTemplate';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';
import Image from 'next/image';
import CreateTemplateForm from './CreateTemplateForm';

const TemplateCard = ({
  // onViewFormClick,
  // onDelete,
  viewResponseClick,
  // name,
  // type,
  templateUrl,
  templateName,
  id,
  signatureBoxPlacement,
}) => {
  // const getfileExtension = type.replace(/(.*)\//g, "");
  // const queryClient = useQueryClient();
  // const { mutate, isPending } = useMutation({
  //   mutationFn: () => deleteTemplate(id),
  //   onSuccess: () => {
  //     toast.success('Template Deleted Successfully.');
  //     queryClient.invalidateQueries({
  //       queryKey: [templateApi.getTemplates.endpointKey],
  //     });
  //   },
  //   onError: () => {
  //     toast.error('Failed to delete template.');
  //   },
  // });
  return (
    <div className="scrollBarStyles relative flex flex-col gap-2.5 rounded-md border border-neutral-500/10 p-4">
      <div className="flex items-center justify-between gap-2">
        {/* <p className="text-neutral-300 text-sm font-bold">Template Name</p> */}
        <div className="flex text-base font-bold text-[#363940]">
          <p className="truncate">
            {templateName.substring(0, 10)}
            {templateName.length > 10 && '...'}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        {/* {getfileExtension === "pdf" ? (
          <Image src={"/pdf_png.png"} alt="Template" height={55} width={60} />
        ) : (
          <Image src={"/xlsx_png.png"} alt="Template" height={55} width={60} />
        )} */}
        <Image src={'/pdf_png.png'} alt="Template" height={55} width={60} />
        <Button
          variant="grey"
          onClick={() => viewResponseClick()}
          className="border"
        >
          <MessageSquareText size={14} />
          <p>0 Contracts</p>
        </Button>
      </div>

      <div
        // className="grid gap-1.5 grid-cols-[1fr,_1fr,_40px]"
        className="flex items-center justify-between"
      >
        {/* <Button
          asChild
          variant={"blue_outline"}
          size="sm"
          className="text-xs gap-1 p-1.5"
        >
          <Link href={`/template/${id}?url=${templateUrl}`}>
            <Eye size={16} />
            View
          </Link>
        </Button> */}
        <ViewTemplate
          name={templateName}
          url={templateUrl}
          id={id}
          signatureBoxPlacement={signatureBoxPlacement}
        />
        <CreateTemplateForm url={templateUrl} id={id} />
        <Button
          // onClick={mutate}
          disabled={true}
          variant="ghost"
          size="icon"
          className="text-neutral-500 hover:text-black"
        >
          {/* {isPending ? <Loading /> : <Trash2 size={12} />} */}
        </Button>
      </div>
    </div>
  );
};

export default TemplateCard;
