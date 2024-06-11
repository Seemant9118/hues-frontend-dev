import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { UploadIcon } from 'lucide-react';
import React from 'react';
import { FileUploader } from 'react-drag-drop-files';
import PreviewLabel from './PreviewLabel';
import RichTextEditor from './RichTextEditor';
// import SectionPreview from "./SectionPreview";
// import TableStructurePreview from "./TableStructurePreview";
// import fileUploadIcon from '../../../assets/StudentPreview/uploadFileIcon.svg';
// import tempImage from "../../../assets/tempImg.jpg";

const QuestionsPreview = ({
  questions,
  isEdit,
  answerHandler,
  multiSelectHandler,
  // sectionAnswerHandler,
  // sectionMultiSelectHandler,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {questions?.map((question, idx) => {
        if (question.type === 'text' && question.name === 'Long text') {
          return (
            <div className="flex w-full flex-col gap-2.5" key={question._id}>
              <PreviewLabel question={question} idx={idx} />
              <div className="max-w-full py-4 lg:max-w-[70%]">
                <RichTextEditor
                  disabled={!isEdit}
                  value={question?.answer}
                  onSubmit={(value) => answerHandler(value, idx)}
                  preview={true}
                />
              </div>
            </div>
          );
        }
        if (
          question.type === 'text' ||
          question.type === 'number' ||
          question.type === 'date' ||
          question.type === 'time'
        ) {
          return (
            <div className="flex max-w-xl flex-col gap-2" key={question._id}>
              <PreviewLabel question={question} idx={idx} />
              <div className="">
                <Input
                  disabled={!isEdit}
                  value={question?.answer}
                  onChange={(e) => answerHandler(e.target.value, idx)}
                  className={cn('disabled:opacity-75')}
                  id={question.question}
                  type={question.type}
                />
              </div>
            </div>
          );
        }
        if (question.type === 'select' && question.name === 'Multi Select') {
          return (
            <div className="flex w-full flex-col gap-2" key={question._id}>
              <PreviewLabel question={question} idx={idx} />
              <div
                className={cn(
                  'flex w-full max-w-xl flex-col gap-5 rounded-[10px] px-3',
                  question.align === 'horizontal' ? 'flex-row' : 'flex-col',
                )}
              >
                {question?.options?.map((option, optionIdx) => (
                  <div className={cn('flex items-center gap-2')} key={option}>
                    <p>{++optionIdx}.</p>
                    <Checkbox
                      disabled={!isEdit}
                      checked={
                        question.answer && question?.answer?.includes(option)
                      }
                      onCheckedChange={(value) =>
                        multiSelectHandler(option, idx, value)
                      }
                      value={option}
                      id={option}
                    />
                    <Label className="cursor-pointer" htmlFor={option}>
                      {option}
                    </Label>
                  </div>
                ))}
                {question.others && (
                  <div
                    className={cn('flex max-w-fit items-center gap-2')}
                    key={question._id}
                  >
                    <p>{question.options.length + 1}.</p>
                    <Checkbox
                      disabled={!isEdit}
                      checked={
                        question.answer && question?.answer?.includes('others')
                      }
                      onCheckedChange={(value) =>
                        multiSelectHandler('others', idx, value)
                      }
                      value={'others'}
                      id={`${question.question}others`}
                    />
                    <Label
                      className="cursor-pointer"
                      htmlFor={`${question.question}others`}
                    >
                      Others
                    </Label>
                  </div>
                )}
              </div>
            </div>
          );
        }
        if (question.type === 'select') {
          return (
            <div className="flex w-full flex-col gap-2" key={question._id}>
              <PreviewLabel question={question} idx={idx} />
              <RadioGroup
                disabled={!isEdit}
                defaultValue={question?.answer}
                onValueChange={(value) => answerHandler(value, idx)}
                className={cn(
                  'flex max-w-xl flex-col gap-2.5 bg-[#fff] px-3',
                  question.align === 'horizontal' ? 'flex-row' : 'flex-col',
                )}
              >
                {question?.options?.map((option, optionIdx) => (
                  <div
                    className={cn('flex max-w-fit items-center space-x-2')}
                    key={option}
                  >
                    <p>{++optionIdx}.</p>
                    <RadioGroupItem value={option} id={option} />
                    <Label className="cursor-pointer" htmlFor={option}>
                      {option}
                    </Label>
                  </div>
                ))}
                {question.others && (
                  <div
                    className={cn('flex max-w-fit items-center space-x-2')}
                    key={question._id}
                  >
                    <p>{question.options.length + 1}.</p>
                    <RadioGroupItem
                      value={'others'}
                      id={`${question.question}others`}
                    />
                    <Label
                      className="cursor-pointer"
                      htmlFor={`${question.question}others`}
                    >
                      Others
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          );
        }
        if (question.type === 'file') {
          return (
            <div
              className="flex w-full flex-col gap-2.5 rounded-[10px]"
              key={question._id}
            >
              <PreviewLabel question={question} idx={idx} />

              <FileUploader
                multiple
                handleChange={() => {}}
                name="file"
                types={question.formats}
              >
                <div className="flex h-[200px] w-full border-spacing-3 cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed border-gray-500 p-2.5">
                  {/* <Image
                    src={''}
                    alt="upload-icon"
                    width={30}
                    height={30}
                    className="h-10 w-10"
                  /> */}
                  <UploadIcon size={30} />
                  <p className="font-normal leading-[18px]">
                    <span className="px-1 text-sm font-medium text-zinc-800 underline">
                      Click to upload
                    </span>{' '}
                    or drag & drop
                  </p>
                </div>
              </FileUploader>
            </div>
          );
        }

        // if (question.type === "dropdown") {
        //   return (
        //     <div className="flex flex-col gap-2 w-full " key={question._id}>
        //       <PreviewLabel question={question} idx={idx} />
        //       <Select
        //         disabled={!isEdit}
        //         value={question.answer}
        //         onValueChange={(value) => answerHandler(value, idx)}
        //       >
        //         <SelectTrigger className="max-w-xl  rounded-[10px] ">
        //           <SelectValue
        //             placeholder={
        //               question?.options?.length !== 0
        //                 ? question?.options[0]
        //                 : ""
        //             }
        //           />
        //         </SelectTrigger>
        //         <SelectContent>
        //           {question.options.map((option, idx) => (
        //             <SelectItem key={question._id} value={option}>
        //               {option}
        //             </SelectItem>
        //           ))}
        //           {question.others && (
        //             <SelectItem value={"others"}>Others</SelectItem>
        //           )}
        //         </SelectContent>
        //       </Select>
        //     </div>
        //   );
        // }
        // if (question.type === "structure" && question.name === "Section") {
        //   return (
        //     <SectionPreview
        //       key={question._id}
        //       selectedForm={selectedForm}
        //       question={question}
        //       isConsultantPreview={isConsultantPreview}
        //       idx={idx}
        //       isEdit={isEdit}
        //       sectionAnswerHandler={sectionAnswerHandler}
        //       sectionMultiSelectHandler={sectionMultiSelectHandler}
        //     />
        //   );
        // }
        if (question.type === 'structure' && question.name === 'Text') {
          return (
            <div
              className="flex w-full flex-col gap-2 rounded-[10px]"
              key={question._id}
            >
              <div dangerouslySetInnerHTML={{ __html: question.text }} />
            </div>
          );
        }
        // if (question.type === "structure" && question.name === "Media") {
        //   return (
        //     <div
        //       className="flex flex-col gap-2 w-full rounded-[10px] "
        //       key={question._id}
        //     >
        //       <Image src={tempImage} width={200} height={200} alt="image" />
        //     </div>
        //   );
        // }
        // if (question.type === "input" && question.name === "Tables") {
        //   return (
        //     <div className="flex flex-col gap-2.5 w-full" key={question._id}>
        //       <TableStructurePreview question={question} isEdit={isEdit} />
        //     </div>
        //   );
        // }

        return null;
      })}
    </div>
  );
};

export default QuestionsPreview;
