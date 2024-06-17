import React from 'react';
import { Label } from '@/components/ui/label';

// Preview Label
const PreviewLabel = ({ question, idx }) => {
  return (
    <Label
      htmlFor={question.question}
      className="md:text-md text-GreyPrimary text-sm lg:text-lg"
    >
      <span>{idx + 1}. </span>
      {question?.question}{' '}
      {question.required && <span className="text-red-500">*</span>}
    </Label>
  );
};

export default PreviewLabel;
