"use client";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import Loading from "@/components/ui/Loading";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import QuestionsPreview from "./QuestionsPreview";

//main Form Preview
const FormPreview = ({
  name,
  isLoading,
  formSaveHandler,
  selectedForm,
  is_completed = false,
}) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  // const [isEdit, setIsEdit] = useState(false);
  const isEdit = !is_completed;
  useEffect(() => {
    setSelectedPage(selectedForm?.data[0]);
  }, [selectedForm]);

  const pages = selectedForm?.data;

  const answerHandler = (answer, index) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      const updatedQuestion = {
        ...questions[index],
        answer: answer,
      };
      prev.questions[index] = updatedQuestion;
      return { ...prev };
    });
  };
  const sectionAnswerHandler = (answer, index, sectionIdx, type) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      const updatedQuestion = {
        ...questions[sectionIdx][type][index],
        answer: answer,
      };
      prev.questions[sectionIdx][type][index] = updatedQuestion;
      return { ...prev };
    });
  };

  const sectionMultiSelectHandler = (
    answer,
    index,
    sectionIdx,
    type,
    checked
  ) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      let updatedQuestion = { ...questions[sectionIdx][type][index] };
      if (checked) {
        if (updatedQuestion.answer) {
          updatedQuestion.answer = [...updatedQuestion.answer, answer];
          prev.questions[sectionIdx][type][index] = updatedQuestion;
        } else {
          updatedQuestion.answer = [answer];
          prev.questions[sectionIdx][type][index] = updatedQuestion;
        }
      } else {
        updatedQuestion.answer =
          questions[sectionIdx][type][index] &&
          questions[sectionIdx][type][index].answer?.filter(
            (a) => a !== answer
          );
        prev.questions[sectionIdx][type][index] = updatedQuestion;
      }
      return { ...prev };
    });
  };
  const multiSelectHandler = (answer, index, checked) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      let updatedQuestion = { ...questions[index] };
      if (checked) {
        if (updatedQuestion.answer) {
          updatedQuestion.answer = [...updatedQuestion.answer, answer];
          prev.questions[index] = updatedQuestion;
        } else {
          updatedQuestion.answer = [answer];
          prev.questions[index] = updatedQuestion;
        }
      } else {
        updatedQuestion.answer =
          questions[index] &&
          questions[index].answer?.filter((a) => a !== answer);
        prev.questions[index] = updatedQuestion;
      }
      return { ...prev };
    });
  };

  const saveHandler = () => {
    formSaveHandler(selectedPage, pageNo);
    // setIsEdit(false);
  };

  if (isLoading) return <Loading />;
  if (!selectedForm) return null;
  return (
    <div className=" flex flex-col gap-5 grow relative">
      <div className="flex items-center justify-between pt-3 px-2 sticky top-0 bg-white">
        <h2 className="text-zinc-800 text-base font-semibold leading-[16px]">
          {name}
        </h2>
        {isEdit && (
          <Button onClick={saveHandler} className="max-w-fit ml-auto">
            Save
          </Button>
        )}
      </div>
      <div className="flex gap-2 sticky top-[50px] bg-white z-[500000]">
        {pages?.map((page, idx) => (
          <div
            className={cn(
              "flex gap-2 items-center px-8 py-4 cursor-pointer",
              selectedPage?.name === page.name && "border-b-sky-500 border-b-2"
            )}
            key={idx}
            onClick={() => {
              setSelectedPage(page);
              setPageNo(idx);
            }}
          >
            <p className={cn("text-md font-semibold ")}>{page.name}</p>
          </div>
        ))}
      </div>
      {selectedPage && (
        <QuestionsPreview
          questions={selectedPage?.questions}
          isEdit={isEdit}
          answerHandler={answerHandler}
          sectionAnswerHandler={sectionAnswerHandler}
          multiSelectHandler={multiSelectHandler}
          sectionMultiSelectHandler={sectionMultiSelectHandler}
        />
      )}
    </div>
  );
};

export default FormPreview;
