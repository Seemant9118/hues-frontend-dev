/* eslint-disable react/no-array-index-key */
import { cn } from '@/lib/utils';

export default function ProgressDots({ totalSteps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'h-2 w-2 rounded-full transition-all',
            index <= currentStep ? 'bg-primary' : 'bg-gray-300',
            index === currentStep && 'w-8', // Current step is elongated
          )}
        />
      ))}
    </div>
  );
}
