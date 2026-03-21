import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';

export default function MultiStepForm({
  steps,
  formData,
  setFormData,
  errors = {},
  setErrors,
  onSubmit,
  onCancel,
  isSubmitting = false,

  // ✅ NEW generic prop
  breadcrumbs = [],

  // ✅ fallback breadcrumb props
  breadcrumbHome = '/',
  breadcrumbHomeText = 'Home',
  breadcrumbTitle = 'Multi-Step Form',
  translation,

  configFields,
  isConfigLoading,

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
    let stepErrors = {};
    let hasStepError = false;

    if (currentStepConfig.validate) {
      const explicitErrors = currentStepConfig.validate(formData);
      if (Object.keys(explicitErrors).length > 0) {
        stepErrors = { ...stepErrors, ...explicitErrors };
        hasStepError = true;
      }
    }

    // Validate dynamic steps based on configuration
    if (configFields && currentStepConfig.key !== 'overview') {
      const stepKey = currentStepConfig.key;
      const stepSections = configFields[stepKey];
      if (stepSections) {
        stepSections.forEach((section) => {
          section.fields.forEach((field) => {
            if (field.isRequired || field.required) {
              const fieldState = formData.defaultFieldsWithValues?.[field.name];
              const value = fieldState?.defaultValue;
              const isEnabled = !!fieldState;

              if (
                !isEnabled ||
                value === '' ||
                value === null ||
                value === undefined ||
                value?.length === 0
              ) {
                stepErrors[field.name] =
                  `${field.label || field.name} is required`;
                hasStepError = true;
              }
            }
          });
        });
      }
    }

    if (hasStepError) {
      setErrors?.(stepErrors);
      toast.error('Please fill all required fields before proceeding');
      return false;
    }

    setErrors?.({});
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
    <div className="flex h-[calc(100vh-0px)] flex-col gap-2 py-2">
      {/* Breadcrumbs */}
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
        errors={errors}
      />

      {/* Main Content Card */}
      <div className="flex w-full flex-1 flex-col overflow-hidden border-t bg-white">
        <div className="scrollBarStyles flex-1 overflow-y-auto">
          {/* Step Component */}
          <div className="flex h-full flex-col px-4 py-6">
            <div className="flex-1">
              <CurrentStepComponent
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                translation={translation}
                configFields={configFields}
                isConfigLoading={isConfigLoading}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-white p-4 shadow-md">
          <div>
            {onCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                Cancel
              </Button>
            )}
          </div>

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
        </div>
      </div>
    </div>
  );
}
