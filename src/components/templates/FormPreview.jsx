'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import QuestionsPreview from './QuestionsPreview';

// main Form Preview
const FormPreview = ({
  name,
  isLoading,
  formSaveHandler,
  selectedForm,
  isCompleted = false,
}) => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  // const [isEdit, setIsEdit] = useState(false);
  const isEdit = !isCompleted;
  useEffect(() => {
    setSelectedPage(selectedForm?.data[0]);
  }, [selectedForm]);

  const pages = selectedForm?.data;

  const answerHandler = (answer, index) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      const updatedQuestion = {
        ...questions[index],
        answer,
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
        answer,
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
    checked,
  ) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      const updatedQuestion = { ...questions[sectionIdx][type][index] };
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
            (a) => a !== answer,
          );
        prev.questions[sectionIdx][type][index] = updatedQuestion;
      }
      return { ...prev };
    });
  };
  const multiSelectHandler = (answer, index, checked) => {
    setSelectedPage((prev) => {
      const questions = [...prev.questions];
      const updatedQuestion = { ...questions[index] };
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
    <div className="relative flex grow flex-col gap-5">
      <div className="sticky top-0 flex items-center justify-between bg-white px-2 pt-3">
        <h2 className="text-base font-semibold leading-[16px] text-zinc-800">
          {name}
        </h2>
        {isEdit && (
          <Button onClick={saveHandler} className="ml-auto max-w-fit">
            Save
          </Button>
        )}
      </div>
      <div className="sticky top-[50px] z-[500000] flex gap-2 bg-white">
        {pages?.map((page, idx) => (
          <div
            className={cn(
              'flex cursor-pointer items-center gap-2 px-8 py-4',
              selectedPage?.name === page.name && 'border-b-2 border-b-sky-500',
            )}
            key={idx}
            onClick={() => {
              setSelectedPage(page);
              setPageNo(idx);
            }}
          >
            <p className={cn('text-md font-semibold')}>{page.name}</p>
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
