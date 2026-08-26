import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronRight, Home, Eye, FileText } from 'lucide-react';

const getStepIcon = (step) => {
  if (step?.icon) return step.icon;

  const key = (step?.key || '').toLowerCase();
  const iconClass = 'h-4 w-4 flex-shrink-0';

  if (key.includes('details') || key.includes('home')) {
    return <Home className={iconClass} />;
  }
  if (key.includes('preview')) {
    return <Eye className={iconClass} />;
  }

  return <FileText className={iconClass} />;
};

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  const currentStepKey = steps[currentStep]?.key;

  // Dynamically set max-width based on step count to keep it looking compact
  const getMaxWidthClass = (numSteps) => {
    if (numSteps <= 2) return 'max-w-sm sm:max-w-xl';
    if (numSteps === 3) return 'max-w-sm sm:max-w-3xl';
    if (numSteps === 4) return 'max-w-md sm:max-w-4xl';
    return 'max-w-lg sm:max-w-5xl';
  };

  const maxWidthClass = getMaxWidthClass(steps.length);

  return (
    <div
      className={cn(
        'mx-auto my-3 flex w-full justify-center px-4',
        maxWidthClass,
      )}
    >
      <Tabs
        value={currentStepKey}
        onValueChange={(val) => {
          const index = steps.findIndex((s) => s.key === val);
          if (index !== -1) {
            onStepClick?.(index);
          }
        }}
        className="w-full"
      >
        <TabsList className="flex h-auto w-full items-center justify-between gap-1 rounded-full border border-primary bg-background p-1 shadow-sm">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <React.Fragment key={step.key}>
                <TabsTrigger
                  value={step.key}
                  disabled={!onStepClick}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                    'data-[state=active]:bg-primary-foreground data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none',
                    isCurrent
                      ? 'bg-primary-foreground/50 text-primary'
                      : isCompleted
                        ? 'text-slate-700 hover:text-primary'
                        : 'pointer-events-none text-slate-400',
                  )}
                >
                  {getStepIcon(step)}
                  <span
                    className={cn(
                      'max-w-[140px] truncate sm:max-w-[200px]',
                      steps.length > 4 && !isCurrent
                        ? 'hidden'
                        : steps.length > 3 && !isCurrent
                          ? 'hidden md:inline-block'
                          : '',
                    )}
                  >
                    {step.label}
                  </span>
                </TabsTrigger>

                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
                )}
              </React.Fragment>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
}
