import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="flex w-full items-start justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={step.key} className="flex flex-1 items-center">
            {/* Step Circle and Label */}
            <div className="flex flex-col items-center gap-2">
              {/* Circle with number/checkmark */}
              <button
                onClick={() => onStepClick?.(index)}
                disabled={!onStepClick}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-all',
                  isCompleted &&
                    'border-primary bg-primary text-white hover:bg-primary/90',
                  isCurrent &&
                    'border-primary bg-white text-primary ring-4 ring-primary/10',
                  isUpcoming && 'border-gray-300 bg-white text-gray-400',
                  onStepClick && 'cursor-pointer',
                  !onStepClick && 'cursor-default',
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="flex flex-col items-center gap-0.5 text-center">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    (isCompleted || isCurrent) && 'text-gray-900',
                    isUpcoming && 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {/* Connecting Line (not shown for last step) */}
            {index < steps.length - 1 && (
              <div className="mt-5 flex-1 px-2">
                <div
                  className={cn(
                    'h-0.5 w-full transition-all',
                    index < currentStep ? 'bg-primary' : 'bg-gray-300',
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
