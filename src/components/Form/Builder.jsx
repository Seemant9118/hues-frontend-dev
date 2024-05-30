import { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FormMainContainer from "./FormMainContainer";
import FormSidebar from "./FormSidebar";
import { Button } from "@/components/ui/button";
import { Document, Page } from "react-pdf";

const Builder = ({ saveHandler, url }) => {
  const containerRef = useRef(null);
  const [droppedInputs, setDroppedInputs] = useState([]);
  const [formData, setFormData] = useState(null);
  const pdfCanvasRef = useRef(null);
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);
  const handleDropInput = (item) => {
    setDroppedInputs((prevInputs) => [...prevInputs, item]);
  };

  useEffect(() => {
    setFormData({
      data: [
        {
          name: "Default Page",
          questions: [],
        },
      ],
    });
    setSelectedPage({
      name: "Default Page",
      questions: [],
    });
  }, []);

  useEffect(() => {
    if (selectedPage && selectedPage?.questions) {
      setDroppedInputs(selectedPage.questions);
    }
  }, [selectedPage?.questions, selectedPage?.name]);

  useEffect(() => {
    if (droppedInputs.length !== 0) {
      setSelectedPage((prev) => ({ ...prev, questions: droppedInputs }));
      containerRef.current?.scrollTo({
        top: containerRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [droppedInputs]);

  const saveFormHandler = async () => {
    const idx = formData?.data?.findIndex(
      (value) => value.name === selectedPage.name
    );
    const newArray = [...formData?.data];
    newArray[idx] = selectedPage;

    saveHandler({ signatureData: null, formData: newArray });
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  return (
    <>
      <div className="flex items-center justify-end py-4 sticky top-0 left-0 right-0 z-50 bg-white ">
        <Button variant="blue_outline" onClick={saveFormHandler}>
          Save
        </Button>
      </div>
      <DndProvider backend={HTML5Backend}>
        <main
          ref={containerRef}
          className="flex overflow-y-auto relative max-h-[90%] scrollBarStyles"
        >
          <FormSidebar />
          <div
            ref={pdfCanvasRef}
            id="pdfCanvas"
            className="max-w-fit  mx-auto relative overflow-auto scrollBarStyles sticky top-0"
          >
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <Page pageNumber={pageNo} />
            </Document>
          </div>
          <FormMainContainer
            setSelectedPage={setSelectedPage}
            droppedInputs={droppedInputs}
            onDropInput={handleDropInput}
            setDroppedInputs={setDroppedInputs}
          />
        </main>
      </DndProvider>
    </>
  );
};

export default Builder;
