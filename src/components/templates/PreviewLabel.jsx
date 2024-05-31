import React from "react";
import { Label } from "@/components/ui/label";

//Preview Label
const PreviewLabel = ({ question, idx }) => {
  return (
    <Label
      htmlFor={question.question}
      className="text-sm md:text-md lg:text-lg text-GreyPrimary"
    >
      <span>{idx + 1}. </span>
      {question?.question}{" "}
      {question.required && <span className="text-red-500">*</span>}
    </Label>
  );
};

export default PreviewLabel;
