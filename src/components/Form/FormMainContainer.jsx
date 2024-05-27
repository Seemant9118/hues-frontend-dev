import { useEffect, useState } from "react";
import { useDrop } from "react-dnd";

import FormBuilderInput from "./FormBuilderInput";
// import MediaStructure from "./structures/MediaStructure";
// import SectionStructure from "./structures/SectionStructure";
// import TableStructure from "./structures/TableStructure";
// import TextStructure from "./structures/TextStructure";

const FormMainContainer = ({
  droppedInputs,
  onDropInput,
  setDroppedInputs,
  setSelectedPage,
}) => {
  const [, ref] = useDrop({
    accept: "INPUT",
    drop: (item) => onDropInput(item),
  });

  const [showOptions, setShowOptions] = useState(false);

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

  return (
    <div
      ref={ref}
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
  );
};

export default FormMainContainer;
