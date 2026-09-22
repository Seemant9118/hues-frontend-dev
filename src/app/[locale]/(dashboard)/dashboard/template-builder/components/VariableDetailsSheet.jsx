import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

export default function VariableDetailsSheet({
  isOpen,
  onOpenChange,
  selectedVariable,
}) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[400px] overflow-y-auto sm:w-[540px]"
      >
        <SheetHeader className="mb-6 border-b pb-4">
          <SheetTitle className="text-xl font-bold">
            Variable Details
          </SheetTitle>
          <SheetDescription>
            Details about the variable{' '}
            <span className="font-semibold text-blue-600">
              {'{'}
              {'{'}
              {selectedVariable?.label}
              {'}'}
              {'}'}
            </span>
          </SheetDescription>
        </SheetHeader>

        {selectedVariable && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Description
              </span>
              <p className="text-sm text-neutral-800">
                {selectedVariable.description || 'No description available'}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Category
              </span>
              <p className="text-sm text-neutral-800">
                {selectedVariable.category}
              </p>
            </div>

            {selectedVariable.source && (
              <div className="flex flex-col gap-2 rounded-md border bg-neutral-50 p-4">
                <span className="text-sm font-semibold text-neutral-700">
                  Source Information
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-500">Label</span>
                    <span className="text-sm font-medium">
                      {selectedVariable.source.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-neutral-500">Field</span>
                    <span className="text-sm font-medium">
                      {selectedVariable.source.field}
                    </span>
                  </div>
                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs text-neutral-500">Timing</span>
                    <span className="text-sm font-medium">
                      {selectedVariable.source.timing}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedVariable.availableFor &&
              selectedVariable.availableFor.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                    Available For
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariable.availableFor.map((af) => (
                      <span
                        key={af}
                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {af}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {selectedVariable.unavailableReason && (
              <div className="mt-2 flex flex-col gap-1 rounded-md border border-orange-200 bg-orange-50 p-3">
                <span className="text-sm font-semibold text-orange-700">
                  Not Available
                </span>
                <p className="text-sm text-orange-800">
                  {selectedVariable.unavailableReason}
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
