import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="mt-4 flex w-full items-start justify-between px-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        // Check if this step has any active errors
        // const hasErrors = Object.keys(errors).some(errorKey => {
        //   // This is a bit heuristic but works for our step mapping
        //   // In a real app we'd map fields to steps explicitly
        //   return true; // We'll rely on the parent to pass filtered errors if needed
        // });

        return (
          <div
            key={step.key}
            className={cn('group relative flex flex-1 flex-col items-center')}
          >
            {/* Line behind circles */}
            {index < steps.length - 1 && (
              <div className="absolute left-[calc(50%+20px)] top-4 h-[2px] w-[calc(100%-40px)] -translate-y-1/2 overflow-hidden">
                <div
                  className={cn(
                    'h-full w-full bg-border transition-all duration-500',
                    isCompleted && 'bg-primary',
                  )}
                />
              </div>
            )}

            {/* Circle + Text (always centered) */}
            <div className="z-10 flex flex-col items-center gap-2.5">
              {/* Circle */}
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-full border-2 font-bold transition-all duration-300',
                  isCompleted &&
                    'border-primary bg-primary text-white shadow-md shadow-primary/20',
                  isCurrent &&
                    'border-primary bg-background text-primary shadow-sm ring-[6px] ring-primary/10',
                  isUpcoming &&
                    'border-muted-foreground/30 bg-background text-muted-foreground/50',
                  'hover:scale-105 active:scale-95',
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 stroke-[3]" />
                ) : (
                  <span className="text-[13px]">{index + 1}</span>
                )}

                {/* Completion Dot or Error Mark could go here */}
              </button>

              {/* Label */}
              <div className="flex flex-col items-center gap-0.5 px-1 text-center">
                <span
                  className={cn(
                    'text-[11px] font-bold uppercase tracking-tight transition-colors duration-300',
                    isCompleted || isCurrent
                      ? 'text-foreground'
                      : 'text-muted-foreground/60',
                    isCurrent && 'text-primary',
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
