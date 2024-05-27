import { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FormMainContainer from "./FormMainContainer";
import FormSidebar from "./FormSidebar";

const Builder = () => {
  const containerRef = useRef(null);
  const [droppedInputs, setDroppedInputs] = useState([]);
  const [formData, setFormData] = useState(null);

  const [selectedPage, setSelectedPage] = useState(null);

  const handleDropInput = (item) => {
    setDroppedInputs((prevInputs) => [...prevInputs, item]);
    containerRef.current?.scrollTo({
      top: containerRef.current?.scrollHeight,
      behavior: "smooth",
    });
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

  return (
    <DndProvider backend={HTML5Backend}>
      <main
        ref={containerRef}
        className="flex overflow-y-auto relative max-h-[90%] scrollBarStyles"
      >
        <FormSidebar />
        <FormMainContainer
          setSelectedPage={setSelectedPage}
          droppedInputs={droppedInputs}
          onDropInput={handleDropInput}
          setDroppedInputs={setDroppedInputs}
        />
      </main>
    </DndProvider>
  );
};

export default Builder;
