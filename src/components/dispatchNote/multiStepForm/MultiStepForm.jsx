import { saveDraftToSession } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

export default function MultiStepForm({
  dispatchNoteId,
  config,
  formData,
  setFormData,
  errors,
  setErrors,
  onFinalSubmit,
  isSubmitting,
  onCancel,
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = config.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const validateCurrentStep = () => {
    const currentStepConfig = config[currentStep];
    if (currentStepConfig.validate) {
      const stepErrors = currentStepConfig.validate(formData);
      if (Object.keys(stepErrors).length > 0) {
        if (setErrors) setErrors(stepErrors);
        return false;
      }
      if (setErrors) setErrors({});
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
      saveDraftToSession({ key: `${dispatchNoteId}_EWBA`, data: formData });
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (index) => {
    if (index === currentStep) return;

    if (index < currentStep) {
      // Always allow going back
      setCurrentStep(index);
    } else if (validateCurrentStep()) {
      // Allow forward jump only if current step is valid
      setCurrentStep(index);
    }
  };

  const CurrentStepComponent = config[currentStep].component;

  return (
    <Card className="flex h-full flex-1 flex-col gap-4 border-0 p-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex flex-col gap-2">
          {config[currentStep].title}
          <span className="text-sm font-normal text-muted-foreground">
            ( Step {currentStep + 1} of {totalSteps} )
          </span>
        </CardTitle>
        {/* Stepper Indicator */}
        <div className="mt-4 flex w-full gap-2">
          {config.map((step, index) => (
            <div
              key={step.key}
              onClick={() => handleJumpToStep(index)}
              className={cn(
                'h-2 flex-1 cursor-pointer rounded-full transition-colors',
                index <= currentStep
                  ? 'bg-primary hover:bg-gray-300'
                  : 'bg-muted',
                index > currentStep && 'hover:bg-gray-300',
              )}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <CurrentStepComponent
          formData={formData}
          setFormData={setFormData}
          errors={errors}
        />
      </CardContent>
      <CardFooter className="sticky bottom-0 flex w-full justify-end gap-2 border-t bg-white/70 p-2 backdrop-blur-sm">
        <Button debounceTime={0} size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex-1" />
        <Button
          debounceTime={0}
          size="sm"
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        {!isLastStep ? (
          <Button debounceTime={0} size="sm" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <>
            <Button
              debounceTime={0}
              size="sm"
              variant="blue_outline"
              onClick={() => onFinalSubmit('save')}
              disabled={isSubmitting}
            >
              Save Draft
            </Button>
            <Button
              debounceTime={0}
              size="sm"
              onClick={() => onFinalSubmit('generate')}
              disabled={isSubmitting}
            >
              Generate E-Waybill
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
