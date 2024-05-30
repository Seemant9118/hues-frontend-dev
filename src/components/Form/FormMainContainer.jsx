import { useEffect, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";

import FormBuilderInput from "./FormBuilderInput";
import { Document, Page } from "react-pdf";
import { Input } from "../ui/input";
import ResizableInput from "../ui/ResizableInput";
// import MediaStructure from "./structures/MediaStructure";
// import SectionStructure from "./structures/SectionStructure";
// import TableStructure from "./structures/TableStructure";
// import TextStructure from "./structures/TextStructure";

const FormMainContainer = ({
  droppedInputs,
  onDropInput,
  setDroppedInputs,
  setSelectedPage,
  url,
}) => {
  const [, ref] = useDrop({
    accept: "INPUT",
    drop: (item, monitor) => {
      const delta = monitor.getSourceClientOffset();
      const canvasRect = pdfCanvasRef.current.getBoundingClientRect();
      const coords = {
        x: delta.x - canvasRect.left,
        y: delta.y - canvasRect.top,
      };

      const newItem = {
        ...item,
        coords,
        width: 100, // Default width
        height: 30, // Default height
      };
      onDropInput(newItem);
    },
  });

  const [showOptions, setShowOptions] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pages, setPages] = useState(1);
  const pdfCanvasRef = useRef(null);

  const deleteHandler = (idx) => {
    setDroppedInputs((prev) => {
      const updated = [...prev];
      updated.splice(idx, 1);
      return updated;
    });
  };

  const selectHandler = (value, idx) => {
    // if (value === "")
    setDroppedInputs((prev) => {
      const updated = [...prev];
      const values = value.split("?");

      updated[idx].name = values[0];
      updated[idx].type = values[1];
      return updated;
    });
  };

  const inputHandler = (idx, questionText) => {
    setDroppedInputs((prev) => {
      const updated = [...prev];
      updated[idx].question = questionText;
      return updated;
    });
  };

  const upAndDownHandler = (index1, index2) => {
    setDroppedInputs((prev) => {
      const updated = [...prev];
      [updated[index1], updated[index2]] = [updated[index2], updated[index1]];
      return updated;
    });
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setPages(numPages);
  };

  const handleResizeStop = (size, id) => {
    setDroppedInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === id ? { ...input, ...size } : input
      )
    );
  };

  const handleDragStop = (delta, id) => {
    setDroppedInputs((prevInputs) =>
      prevInputs.map((input) =>
        input.id === id
          ? {
              ...input,
              coords: {
                x: input.coords.x + delta.x,
                y: input.coords.y + delta.y,
              },
            }
          : input
      )
    );
  };
  return (
    <>
      <div
        ref={ref}
        className="max-w-fit  mx-auto  overflow-auto scrollBarStyles sticky top-0"
      >
        <div ref={pdfCanvasRef} id="pdfCanvas relative">
          <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNo} />
          </Document>
          {droppedInputs?.map((input, index) => (
            <ResizableInput
              key={index}
              onDragStop={handleDragStop}
              index={index}
              input={input}
              onResizeStop={handleResizeStop}
            />
          ))}
        </div>
      </div>
      <div
        // ref={ref}
        className="min-h-[400px] flex flex-col gap-4 pb-28 px-4 pt-2 grow"
      >
        {droppedInputs?.map((input, idx) => {
          // if (input.type === "structure" && input.name === "Text") {
          //   return (
          //     <TextStructure
          //       idx={idx}
          //       input={input}
          //       deleteHandler={deleteHandler}
          //       setDroppedInputs={setDroppedInputs}
          //       key={idx + Date.now()}
          //       droppedInputs={droppedInputs}
          //     />
          //   );
          // } else if (input.type === "structure" && input.name === "Notes") {
          //   return (
          //     <FormInputs
          //       key={idx + Date.now()}
          //       input={input}
          //       idx={idx}
          //       setDroppedInputs={setDroppedInputs}
          //       droppedInputs={droppedInputs}
          //       //for add Options
          //       showOptions={showOptions}
          //       setShowOptions={setShowOptions}
          //       //question state and state handler props
          //       deleteHandler={deleteHandler}
          //       upAndDownHandler={upAndDownHandler}
          //       inputHandler={inputHandler}
          //       selectHandler={selectHandler}
          //     />
          //   );
          // } else if (input.type === "input" && input.name === "Tables") {
          //   return (
          //     <TableStructure
          //       idx={idx}
          //       deleteHandler={deleteHandler}
          //       setDroppedInputs={setDroppedInputs}
          //       key={idx + Date.now()}
          //       input={input}
          //       // droppedInputs={droppedInputs}
          //     />
          //   );
          // } else if (input.type === "structure" && input.name === "Media") {
          //   return (
          //     <MediaStructure
          //       idx={idx}
          //       deleteHandler={deleteHandler}
          //       setDroppedInputs={setDroppedInputs}
          //       key={idx + Date.now()}
          //       droppedInputs={droppedInputs}
          //     />
          //   );
          // } else if (input.type === "structure" && input.name === "Section") {
          //   return (
          //     <SectionStructure
          //       idx={idx}
          //       input={input}
          //       deleteHandler={deleteHandler}
          //       upAndDownHandler={upAndDownHandler}
          //       setDroppedInputs={setDroppedInputs}
          //       key={idx + Date.now()}
          //       droppedInputs={droppedInputs}
          //       //for add Options
          //       showOptions={showOptions}
          //       setShowOptions={setShowOptions}
          //     />
          //   );
          // } else {
          return (
            <FormBuilderInput
              key={idx}
              input={input}
              idx={idx}
              setDroppedInputs={setDroppedInputs}
              droppedInputs={droppedInputs}
              //for add Options
              showOptions={showOptions}
              setShowOptions={setShowOptions}
              //question state and state handler props
              deleteHandler={deleteHandler}
              upAndDownHandler={upAndDownHandler}
              inputHandler={inputHandler}
              selectHandler={selectHandler}
            />
          );
          // }
        })}
      </div>
    </>
  );
};

export default FormMainContainer;
