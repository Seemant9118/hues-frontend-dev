'use client';

import { templateApi } from '@/api/templates_api/template_api';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  getDocument,
  updateTemplate,
} from '@/services/Template_Services/Template_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, FileSignature } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { toast } from 'sonner';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
const ViewTemplate = ({ url, id, signatureBoxPlacement, name }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isOpen] = useState(false);
  const [canClick, setCanClick] = useState(false);
  const queryClient = useQueryClient();
  const pdfCanvasRef = useRef();
  const [clickedCoordinates, setClickedCoordinates] = useState(
    signatureBoxPlacement?.data
      ? signatureBoxPlacement?.data
      : {
          1: [],
        },
  );
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    signatureBoxPlacement?.data
      ? signatureBoxPlacement?.data
      : {
          1: [],
        };
  }, [signatureBoxPlacement?.data]);
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
    queryKey: [templateApi.getS3Document.endpointKey, url],
    queryFn: () => getDocument(url),
    enabled: !!isOpen,
    select: (res) => res.data.data,
  });

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: () => {
      const enterpriseId = LocalStorageService.get('enterprise_Id');
      const userId = LocalStorageService.get('user_profile');
      return updateTemplate(
        {
          enterprise_id: enterpriseId,
          form_data: {
            data: [],
          },
          signature_box_placement: {
            data,
          },
          created_by: userId,
        },
        id,
      );
    },
    onSuccess: () => {
      toast.success('Template Updated Successfully.');
      queryClient.invalidateQueries({
        queryKey: [templateApi.getTemplates.endpointKey],
      });
      setClickedCoordinates([]);
      setIsSheetOpen(false);
    },
    onError: () => {
      toast.error('Failed to update template.');
    },
  });

  // Load PDF.js
  // useEffect(() => {
  //   pdfjsLib.getDocument("/sample.pdf").promise.then(function (pdf) {
  //     // Get the first page of the PDF
  //     pdf.getPage(1).then(function (page) {
  //       // Get the dimensions of the page
  //       var viewport = page.getViewport({ scale: 1.0 });
  //       var canvas = document.getElementById("pdfCanvas");

  //       // Set the canvas dimensions
  //       canvas.width = viewport.width;
  //       canvas.height = viewport.height;

  //       var context = canvas.getContext("2d");

  //       // Render the PDF page into the canvas
  //       var renderContext = {
  //         canvasContext: context,
  //         viewport: viewport,
  //       };
  //       page.render(renderContext);

  //       // Add click event listener to canvas
  //       canvas.addEventListener("click", function (event) {
  //         // Get click coordinates relative to canvas
  //         var rect = canvas.getBoundingClientRect();
  //         var x = event.clientX - rect.left;
  //         var y = event.clientY - rect.top;

  //         // Send coordinates to backend
  //         // Example:
  //         // fetch('/save-signature', {
  //         //     method: 'POST',
  //         //     body: JSON.stringify({ x: x, y: y }),
  //         //     headers: {
  //         //         'Content-Type': 'application/json'
  //         //     }
  //         // });
  //       });
  //     });
  //   });
  // }, [url]);
  // useEffect(() => {
  //   const fetchPDFAndGeneratePDF = async () => {
  //     try {
  //       const response = await fetch('/sample.pdf');
  //       const blob = await response.blob();

  //       // Use pdfjs-dist to get pages from the PDF
  //       const pdfPage = await getPage(blob);

  //       // Convert the PDF page to an image
  //       const imgData = pdfPage
  //         .render({
  //           canvasContext: document.createElement("canvas").getContext("2d"),
  //         })
  //         .then((canvas) => canvas.toDataURL());

  //       // Use jsPDF to create a new PDF and embed the image
  //       const doc = new jsPDF();
  //       doc.addImage(imgData, "JPEG", 10, 10, 180, 150);
  //       doc.save("example.pdf");
  //     } catch (error) {
  //       console.error("Error fetching or generating PDF:", error);
  //     }
  //   };

  //   fetchPDFAndGeneratePDF();
  // }, []);

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={() => setIsSheetOpen((prev) => !prev)}
    >
      <SheetTrigger asChild>
        <Button
          variant={'blue_outline'}
          size="sm"
          className="gap-1 p-1.5 text-xs"
        >
          <Eye size={16} />
          View
        </Button>
      </SheetTrigger>
      <SheetContent className={`min-w-[40%]`}>
        <SheetHeader className="flex-row items-center justify-between py-4">
          <SheetTitle>{name.split('.')[0]}</SheetTitle>
          <div className="flex items-center gap-2">
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
              {canClick ? 'Done' : isUpdating ? 'Updating' : 'Add Signature'}
            </Button>
          </div>
        </SheetHeader>
        {isLoading && <Loading />}
        {!isLoading && isSuccess && (
          <div className="h-full w-full overflow-auto bg-secondary">
            <div
              ref={pdfCanvasRef}
              id="pdfCanvas"
              className="relative mx-auto max-w-fit overflow-auto"
              onMouseDown={canClick ? addClickedCoordinate : () => {}}
            >
              <Document
                file={data?.publicUrl}
                onLoadSuccess={onDocumentLoadSuccess}
              >
                <Page pageNumber={pageNo} />
              </Document>
              {clickedCoordinates[pageNo] &&
                clickedCoordinates[pageNo]?.map((signature) => (
                  <div
                    key={`${pageNo}|${signature.y}|${signature.x}`}
                    className="absolute h-10 border border-black bg-white px-3 py-2 shadow-inner shadow-white"
                    style={{
                      top: signature.y,
                      left: signature.x,
                    }}
                  >
                    {/* <PenBox /> */}
                    <p className="text-stone-400">Signature</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ViewTemplate;
