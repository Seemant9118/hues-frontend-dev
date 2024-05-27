// "use client";
// import React from "react";
// import { Button } from "@/components/ui/button.jsx";
// import Wrapper from "@/components/wrappers/Wrapper";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// const ViewTemplate = ({ params }) => {
//   const printDocument = () => {
//     const input = document.getElementById("divToPrint");
//     html2canvas(input).then((canvas) => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF();
//       pdf.addImage(imgData, "PNG", 0, 0);
//       pdf.save("Template.pdf");
//     });
//   };

//   return (
//     <Wrapper id="divToPrint" className={"absolute left-[-999999999px]"}>
//       {/* <div className="flex items-center gap-2.5">
//         <h2 className="text-zinc-900 font-bold text-2xl">Templates</h2>
//         <p className="text-neutral-300 text-xl font-bold ">/</p>
//         <p className="text-blue-500 font-bold text-sm">
//           {params?.id.replaceAll("%20", " ")}
//         </p>
//       </div> */}
//       <div className="flex flex-col gap-4 grow">
//         <div className="grid grid-cols-2 gap-5">
//           <TemplateInfo label={"Template Name"} value={"Crocin Capsule"} />
//           <TemplateInfo
//             label={"Company Name"}
//             value={"R&T Pharma Private. Limited."}
//           />
//         </div>
//         <div className="flex flex-col gap-1">
//           <p className="text-sm text-grey font-bold">Description</p>
//           <p className="text-[#363940] font-medium">
//             Lorem Ipsum is simply dummy text of the printing and typesetting
//             industry. Lorem Ipsum has been the industry&apos;s standard dummy
//             text ever since the 1500s, when an unknown printer took a galley of
//             type and scrambled it to make a type specimen book
//           </p>
//         </div>

//         <div className="grid grid-cols-3 gap-5">
//           <TemplateInfo label={"Batch Id"} value={"#5F01"} />
//           <TemplateInfo label={"Expiry"} value={"22/02/2015"} />
//           <TemplateInfo label={"Weight (gms)"} value={"4560"} />
//           <TemplateInfo label={"Length"} value={"45&apos;"} />
//           <TemplateInfo label={"Breadth (cms)"} value={"5&apos;"} />
//           <TemplateInfo label={"Height (cms)"} value={"1460"} />
//           <TemplateInfo label={"Rate"} value={"450"} />
//           <TemplateInfo label={"Units"} value={"450"} />
//           <TemplateInfo label={"HSN Code"} value={"HSN456"} />
//           <TemplateInfo label={"GST (%)"} value={"18%"} />
//           <TemplateInfo label={"GST Value"} value={"1420"} />
//           <TemplateInfo label={"Amount"} value={"56,780"} />
//         </div>
//         <div className="h-[1px] bg-neutral-300 mt-auto"></div>
//         <div className="flex justify-end items-center gap-2.5">
//           <Button variant="secondary" size="sm">
//             Close
//           </Button>
//           <Button variant="secondary" size="sm" className="bg-neutral-800/10">
//             Edit
//           </Button>
//           <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">
//             Delete
//           </Button>
//           <Button
//             onClick={printDocument}
//             size="sm"
//             className="bg-red-500 text-white hover:bg-red-600"
//           >
//             Download PDF
//           </Button>
//         </div>
//       </div>
//     </Wrapper>
//   );
// };

// export default ViewTemplate;

// function TemplateInfo({ label, value }) {
//   return (
//     <div className="flex flex-col gap-1">
//       <p className="text-sm text-grey font-bold">{label}</p>
//       <p className="text-[#363940] font-bold">{value}</p>
//     </div>
//   );
// }

"use client";
import { template_api } from "@/api/templates_api/template_api";
import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocalStorageService } from "@/lib/utils";
import {
  getDocument,
  getTemplate,
  updateTemplate,
} from "@/services/Template_Services/Template_Services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileSignature } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { toast } from "sonner";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const TemplateInfo = ({ params, searchParams }) => {
  const [canClick, setCanClick] = useState(false);
  const queryClient = useQueryClient();
  const pdfCanvasRef = useRef();
  const [clickedCoordinates, setClickedCoordinates] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

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
    queryKey: [template_api.getS3Document.endpointKey, searchParams.url],
    queryFn: () => getDocument(searchParams.url),
    enabled: !!searchParams.url,
    select: (data) => data.data.data,
  });

  const { data: templateInfo } = useQuery({
    queryKey: [template_api.getTemplate.endpointKey, params.id],
    queryFn: () => getTemplate(params.id),
    enabled: !!params.id,
    select: (data) => data.data.data,
  });

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: (data) => {
      const enterprise_id = LocalStorageService.get("enterprise_Id");
      const user_id = LocalStorageService.get("user_profile");
      console.log(enterprise_id, user_id);
      return updateTemplate(
        {
          enterprise_id: enterprise_id,
          form_data: {
            data: [],
          },
          signature_box_placement: {
            data: data,
          },
          created_by: user_id,
        },
        params.id
      );
    },
    onSuccess: (data) => {
      toast.success("Template Updated Successfully.");
      queryClient.invalidateQueries({
        queryKey: [template_api.getTemplate.endpointKey],
      });
      setClickedCoordinates([]);
    },
    onError: (data) => {
      toast.error("Failed to update template.");
    },
  });
  console.log(clickedCoordinates);
  useEffect(() => {
    templateInfo?.signatureBoxPlacement?.data
      ? setClickedCoordinates(templateInfo?.signatureBoxPlacement?.data)
      : setClickedCoordinates({
          1: [],
        });
  }, [templateInfo?.signatureBoxPlacement?.data]);
  return (
    <>
      <div className="flex items-center justify-between py-4 sticky top-0 left-0 right-0 z-50 bg-white">
        <h3>{templateInfo?.templateName}</h3>
        <div className="flex items-center gap-2 ">
          <Button
            disabled={pageNo === 1}
            onClick={() => setPageNo((prev) => (pages > prev ? prev - 1 : 1))}
          >
            Prev
          </Button>
          <Button
            disabled={pageNo === pages}
            onClick={() => setPageNo((prev) => (pages > prev ? prev + 1 : 1))}
          >
            Next
          </Button>
          <Button
            onClick={() => {
              if (canClick) {
                mutate(clickedCoordinates);
              }
              setCanClick((prev) => !prev);
            }}
            variant="blue_outline"
          >
            {isUpdating && <Loading />}
            {!canClick && <FileSignature />}
            {canClick ? "Done" : isUpdating ? "Updating" : "Add Signature"}
          </Button>
        </div>
      </div>
      <div className="w-full h-full bg-secondary ">
        <div
          ref={pdfCanvasRef}
          id="pdfCanvas"
          className="max-w-fit  mx-auto relative"
          onMouseDown={canClick ? addClickedCoordinate : () => {}}
        >
          <Document
            file={data?.publicUrl}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={pageNo} />
          </Document>
          {clickedCoordinates[pageNo] &&
            clickedCoordinates[pageNo]?.map((signature, idx) => (
              <div
                onClick={(e) => e.stopPropagation()}
                key={idx}
                className="bg-white border border-black absolute shadow-inner shadow-white h-16 w-40 flex items-center justify-center z-[100]"
                style={{
                  top: signature.y,
                  left: signature.x,
                }}
              >
                <Input
                placeHolder={"Signatory Role"}
                  className="h-full w-full  cursor-pointer z-[100]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default TemplateInfo;
