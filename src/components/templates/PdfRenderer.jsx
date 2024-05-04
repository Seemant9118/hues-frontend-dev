"use client";
import { PenBox } from "lucide-react";
import React, { useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { Button } from "@/components/ui/button";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const PdfRenderer = ({ canClick }) => {
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
    setClickedCoordinates([...clickedCoordinates, { x: offsetX, y: offsetY }]);
  };
  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <>
      <div
        ref={pdfCanvasRef}
        id="pdfCanvas"
        className="max-w-fit bg-black mx-auto relative"
        onMouseDown={canClick ? addClickedCoordinate : () => {}}
      >
        <Document
          file={
            "https://trampolinebucket.s3.ap-south-1.amazonaws.com/www_ilovepdf.pdf"
          }
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={1} />
        </Document>
        {clickedCoordinates.map((signature, idx) => (
          <div
            key={idx}
            className="bg-white border border-black px-3 py-2 absolute shadow-inner shadow-white h-10"
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
    </>
  );
};

export default PdfRenderer;
