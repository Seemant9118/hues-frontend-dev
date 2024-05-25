import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FormSidebar from "./FormSidebar";
import { useRouter } from "next/navigation";
import FormMainContainer from "./FormMainContainer";

const Builder = () => {
  const router = useRouter();

  const [droppedInputs, setDroppedInputs] = useState([]);
  const [formData, setFormData] = useState(null);

  const [selectedPage, setSelectedPage] = useState(null);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="relative grid grid-cols-[200px_1fr] overflow-y-auto">
        <FormSidebar />
        {/* <section className="px-4 py-2 "> */}
        <FormMainContainer
          setSelectedPage={setSelectedPage}
          droppedInputs={droppedInputs}
          onDropInput={handleDropInput}
          setDroppedInputs={setDroppedInputs}
        />
        {/* </section> */}
      </main>
    </DndProvider>
  );
};

export default Builder;
