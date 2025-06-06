import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';

import { Document, Page } from 'react-pdf';
import ResizableInput from '../ui/ResizableInput';
import FormBuilderInput from './FormBuilderInput';
// import MediaStructure from "./structures/MediaStructure";
// import SectionStructure from "./structures/SectionStructure";
// import TableStructure from "./structures/TableStructure";
// import TextStructure from "./structures/TextStructure";

const FormMainContainer = ({
  droppedInputs,
  onDropInput,
  setDroppedInputs,
  // setSelectedPage,
  url,
}) => {
  const [showOptions, setShowOptions] = useState(false);
  // const [pageNo, setPageNo] = useState(1);
  // const [pages, setPages] = useState(1);
  const [focussedInput, setFocussedInput] = useState(null);
  const pdfCanvasRef = useRef(null);

  const [, ref] = useDrop({
    accept: 'INPUT',
    drop: (item, monitor) => {
      const delta = monitor.getSourceClientOffset();
      const canvasRect = pdfCanvasRef.current.getBoundingClientRect();
      const coords = [
        {
          id: uuidv4(),
          x: delta.x - canvasRect.left,
          y: delta.y - canvasRect.top,
        },
      ];

      const newItem = {
        ...item,
        coords,
        width: 100, // Default width
        height: 30, // Default height
        _id: uuidv4(),
      };
      onDropInput(newItem);
    },
  });

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
      const [name, type] = value.split('?');

      updated[idx].name = name;
      updated[idx].type = type;
      ``;
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

  // const onDocumentLoadSuccess = ({ numPages }) => {
  // setPages(numPages);
  // };

  const handleResizeStop = (size, id) => {
    setDroppedInputs((prevInputs) =>
      prevInputs.map((input, idx) =>
        `${input.id}|${idx}` === id ? { ...input, ...size } : input,
      ),
    );
  };

  const handleDragStop = (delta, id, coordinateIndex) => {
    // console.log(delta, id, coordinateIndex, inputIndex);
    setDroppedInputs((prevInputs) =>
      prevInputs.map((input, idx) => {
        if (`${input.id}|${idx}` === id) {
          const newCoordinates = [...input.coords];
          newCoordinates[coordinateIndex] = {
            x: input.coords[coordinateIndex].x + delta.x,
            y: input.coords[coordinateIndex].y + delta.y,
          };
          return {
            ...input,
            coords: newCoordinates,
          };
        } else {
          return input;
        }
      }),
    );
  };

  const onInputCopy = (inputIndex, coordinate) => {
    // console.log(inputIndex, coordinate);
    const newInputs = [...droppedInputs];
    newInputs[inputIndex].coords.push(coordinate);
    setDroppedInputs(newInputs);
  };
  const onInputRemove = (inputIndex, coordinateIndex) => {
    if (droppedInputs[inputIndex].coords.length === 1) {
      deleteHandler(inputIndex);
    } else {
      const newInputs = [...droppedInputs];
      // console.log('this');
      newInputs[inputIndex].coords.splice(coordinateIndex, 1);
      setDroppedInputs(newInputs);
      setFocussedInput(null);
    }
  };
  return (
    <>
      <div
        ref={ref}
        className="scrollBarStyles sticky top-0 mx-auto max-w-fit overflow-auto"
      >
        <div ref={pdfCanvasRef} id="pdfCanvas relative">
          <Document
            file={url}
            // onLoadSuccess={onDocumentLoadSuccess}
          >
            <Page pageNumber={1} />
          </Document>
          {droppedInputs?.map((input, index) =>
            input.coords.map((coordinate, coordinateIndex) => (
              <ContextMenu key={coordinate.id}>
                <ContextMenuTrigger onClick={() => setFocussedInput(index)}>
                  <ResizableInput
                    onDragStop={handleDragStop}
                    index={index}
                    isFocussed={focussedInput === index}
                    coordinateIndex={coordinateIndex}
                    input={input}
                    coordinate={coordinate}
                    onResizeStop={handleResizeStop}
                  />
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => {
                      onInputCopy(index, coordinate);
                    }}
                  >
                    Copy
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => {
                      onInputRemove(index, coordinateIndex);
                    }}
                  >
                    Remove
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )),
          )}
        </div>
      </div>
      <div
        // ref={ref}
        className="flex min-h-[400px] grow flex-col gap-4 px-4 pb-28 pt-2"
      >
        {droppedInputs.length !== 0 &&
          droppedInputs?.map((input, idx) => {
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
                key={input._id}
                input={input}
                idx={idx}
                setDroppedInputs={setDroppedInputs}
                droppedInputs={droppedInputs}
                // for add Options
                showOptions={showOptions}
                setShowOptions={setShowOptions}
                // question state and state handler props
                deleteHandler={deleteHandler}
                upAndDownHandler={upAndDownHandler}
                inputHandler={inputHandler}
                selectHandler={selectHandler}
                isFocussed={focussedInput === idx}
              />
            );
            // }
          })}
        {droppedInputs.length === 0 && (
          <div className="my-auto grid gap-2 p-5 text-center">
            <p>
              This document was generated automatically. Since no input was
              added, please follow the steps below:
            </p>
            <ol>
              <li>Step 1: Drag and place the field required on the pdf.</li>
              {/* <li>Please add the necessary input to proceed with generating the detailed content.</li> */}
            </ol>
          </div>
        )}
      </div>
    </>
  );
};

export default FormMainContainer;
