import React from "react";
import RichTextEditor from "./RichTextEditor";
import PreviewLabel from "./PreviewLabel";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { FileUploader } from "react-drag-drop-files";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import SectionPreview from "./SectionPreview";
// import TableStructurePreview from "./TableStructurePreview";
// import fileUploadIcon from "../../../assets/StudentPreview/uploadFileIcon.svg";
// import tempImage from "../../../assets/tempImg.jpg";

const QuestionsPreview = ({
  questions,
  isEdit,
  answerHandler,
  multiSelectHandler,
  sectionAnswerHandler,
  sectionMultiSelectHandler,
}) => {
  return (
    <div className=" flex flex-col gap-5">
      {questions?.map((question, idx) => {
        if (question.type === "text" && question.name === "Long text") {
          return (
            <div className="flex flex-col gap-2.5 w-full" key={idx}>
              <PreviewLabel question={question} idx={idx} />
              <div className="py-4 max-w-full lg:max-w-[70%] ">
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
          question.type === "text" ||
          question.type === "number" ||
          question.type === "date" ||
          question.type === "time"
        ) {
          return (
            <div className="flex flex-col gap-2 max-w-xl" key={idx}>
              <PreviewLabel question={question} idx={idx} />
              <div className="">
                <Input
                  disabled={!Boolean(isEdit)}
                  value={question?.answer}
                  onChange={(e) => answerHandler(e.target.value, idx)}
                  className={cn(
                    " disabled:opacity-75"
                  )}
                  id={question.question}
                  type={question.type}
                />
              </div>
            </div>
          );
        }
        if (question.type === "select" && question.name === "Multi Select") {
          return (
            <div className="flex flex-col gap-2 w-full" key={idx}>
              <PreviewLabel question={question} idx={idx} />
              <div
                className={cn(
                  "flex flex-col gap-5 px-3  max-w-xl rounded-[10px] w-full ",
                  question.align === "horizontal" ? "flex-row" : "flex-col"
                )}
              >
                {question?.options?.map((option, optionIdx) => (
                  <div
                    className={cn(
                      "flex items-center gap-2 "
                    )}
                    key={optionIdx}
                  >
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
                    className={cn(
                      "flex gap-2 items-center max-w-fit"
                    )}
                    key={idx}
                  >
                    <p>{question.options.length + 1}.</p>
                    <Checkbox
                      disabled={!isEdit}
                      checked={
                        question.answer && question?.answer?.includes("others")
                      }
                      onCheckedChange={(value) =>
                        multiSelectHandler("others", idx, value)
                      }
                      value={"others"}
                      id={question.question + "others"}
                    />
                    <Label
                      className="cursor-pointer"
                      htmlFor={question.question + "others"}
                    >
                      Others
                    </Label>
                  </div>
                )}
              </div>
            </div>
          );
        }
        if (question.type === "select") {
          return (
            <div
              className="flex flex-col gap-2 w-full"
              key={idx}
            >
              <PreviewLabel question={question} idx={idx} />
              <RadioGroup
                disabled={!isEdit}
                defaultValue={question?.answer}
                onValueChange={(value) => answerHandler(value, idx)}
                className={cn(
                  "flex flex-col gap-2.5 px-3 bg-[#fff] max-w-xl",
                  question.align === "horizontal" ? "flex-row" : "flex-col"
                )}
              >
                {question?.options?.map((option, optionIdx) => (
                  <div
                    className={cn(
                      "flex items-center space-x-2 max-w-fit  "
                    )}
                    key={optionIdx}
                  >
                    <p>{++optionIdx}.</p>
                    <RadioGroupItem
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
                    className={cn("flex items-center space-x-2 max-w-fit")}
                    key={idx}
                  >
                    <p>{question.options.length + 1}.</p>
                    <RadioGroupItem
                      value={"others"}
                      id={question.question + "others"}
                    />
                    <Label
                      className="cursor-pointer"
                      htmlFor={question.question + "others"}
                    >
                      Others
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          );
        }
        if (question.type === "file") {
          return (
            <div
              className="flex flex-col gap-2.5 w-full rounded-[10px]"
              key={idx}
            >
              <PreviewLabel question={question} idx={idx} />

              <FileUploader
                multiple
                handleChange={() => {}}
                name="file"
                types={question.formats}
              >
                <div className="w-full h-[200px] p-2.5 flex flex-col justify-center items-center gap-2 rounded border-2 border-gray-500 border-dashed border-spacing-3 cursor-pointer ">
                  <Image
                    src={fileUploadIcon}
                    alt="upload-icon"
                    width={30}
                    height={30}
                    className="w-10 h-10"
                  />
                  <p className="leading-[18px] font-normal">
                    <span className="text-zinc-800 font-medium underline text-sm px-1 ">
                      Click to upload
                    </span>{" "}
                    or drag & drop
                  </p>
                </div>
              </FileUploader>
            </div>
          );
        }

        // if (question.type === "dropdown") {
        //   return (
        //     <div className="flex flex-col gap-2 w-full " key={idx}>
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
        //             <SelectItem key={idx} value={option}>
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
        //       key={idx}
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
        if (question.type === "structure" && question.name === "Text") {
          return (
            <div
              className="flex flex-col gap-2 w-full rounded-[10px] "
              key={idx}
            >
              <div dangerouslySetInnerHTML={{ __html: question.text }} />
            </div>
          );
        }
        // if (question.type === "structure" && question.name === "Media") {
        //   return (
        //     <div
        //       className="flex flex-col gap-2 w-full rounded-[10px] "
        //       key={idx}
        //     >
        //       <Image src={tempImage} width={200} height={200} alt="image" />
        //     </div>
        //   );
        // }
        // if (question.type === "input" && question.name === "Tables") {
        //   return (
        //     <div className="flex flex-col gap-2.5 w-full" key={idx}>
        //       <TableStructurePreview question={question} isEdit={isEdit} />
        //     </div>
        //   );
        // }
      })}
    </div>
  );
};

export default QuestionsPreview;
