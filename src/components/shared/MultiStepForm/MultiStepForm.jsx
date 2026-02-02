import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import StepIndicator from './StepIndicator';

export default function MultiStepForm({
  steps,
  formData,
  setFormData,
  errors = {},
  setErrors,
  onSubmit,
  // onCancel,
  isSubmitting = false,

  // ✅ NEW generic prop
  breadcrumbs = [],

  // ✅ fallback breadcrumb props
  breadcrumbHome = '/',
  breadcrumbHomeText = 'Home',
  breadcrumbTitle = 'Multi-Step Form',

  finalStepActions,
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const shouldRenderBreadcrumbList = useMemo(() => {
    return Array.isArray(breadcrumbs) && breadcrumbs.length > 0;
  }, [breadcrumbs]);

  const validateCurrentStep = () => {
    const currentStepConfig = steps[currentStep];
    if (currentStepConfig.validate) {
      const stepErrors = currentStepConfig.validate(formData);
      if (Object.keys(stepErrors).length > 0) {
        setErrors?.(stepErrors);
        return false;
      }
      setErrors?.({});
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (!isLastStep) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      setErrors?.({});
    }
  };

  const handleJumpToStep = (index) => {
    if (index === currentStep) return;

    if (index < currentStep) {
      setCurrentStep(index);
      setErrors?.({});
    } else if (validateCurrentStep()) {
      setCurrentStep(index);
    }
  };

  const handleFinalSubmit = (action) => {
    if (!validateCurrentStep()) return;
    onSubmit?.(action);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="flex h-full flex-col gap-6 py-4">
      {/* ✅ Breadcrumbs */}
      {shouldRenderBreadcrumbList ? (
        <OrderBreadCrumbs possiblePagesBreadcrumbs={breadcrumbs} />
      ) : (
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Link
            href={breadcrumbHome}
            className="flex items-center gap-1 hover:text-primary"
          >
            <span>{breadcrumbHomeText}</span>
          </Link>
          <span>›</span>
          <span className="font-medium text-foreground">{breadcrumbTitle}</span>
        </div>
      )}

      {/* Step Indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={handleJumpToStep}
      />

      {/* Main Content Card */}
      <Card className="flex flex-1 flex-col overflow-hidden border shadow-sm">
        <CardContent className="scrollBarStyles flex-1 overflow-y-auto p-0">
          {/* ✅ Sticky Header */}
          <div className="sticky top-0 z-10 border-b bg-white px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">
              {steps[currentStep].title || steps[currentStep].label}
            </h2>

            {steps[currentStep].subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">
                {steps[currentStep].subtitle}
              </p>
            )}
          </div>

          {/* Step Component */}
          <div className="p-6">
            <CurrentStepComponent
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="flex items-center justify-end border-t bg-white p-4">
          <div className="flex items-center gap-2">
            <Button
              debounceTime={0}
              size="sm"
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstStep}
            >
              <ArrowLeft size={14} />
              Back
            </Button>

            {!isLastStep ? (
              <Button debounceTime={0} size="sm" onClick={handleNext}>
                Proceed
                <ArrowRight size={14} />
              </Button>
            ) : finalStepActions ? (
              finalStepActions({ handleFinalSubmit, isSubmitting })
            ) : (
              <Button
                debounceTime={0}
                size="sm"
                onClick={() => handleFinalSubmit('submit')}
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
