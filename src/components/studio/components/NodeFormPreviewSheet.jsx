'use client';

import React from 'react';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function NodeFormPreviewSheet({
  isOpen,
  onClose,
  getIcon,
  selectedFormName,
  nodeName,
  activeFields = [],
  formConfigId,
}) {
  return (
    <Sheet open={isOpen} onOpenChange={(openState) => !openState && onClose()}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 bg-white p-6 shadow-2xl sm:max-w-3xl"
      >
        {/* Fixed Sheet Header */}
        <SheetHeader className="shrink-0 border-b pb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <SheetTitle className="truncate text-base font-bold text-gray-900">
              Read-Only Form Preview: {selectedFormName}
            </SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            View-only form layout preview for step node{' '}
            <strong>{nodeName}</strong>.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Preview Body */}
        <div className="scrollBarStyles min-h-0 flex-1 space-y-4 overflow-y-auto py-3 pr-1">
          <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-xs font-bold text-gray-800">
                Form Fields View ({activeFields.length} Fields)
              </h4>
              <Badge variant="outline" className="font-mono text-[10px]">
                {formConfigId
                  ? `Custom Form #${formConfigId}`
                  : 'System Default Form'}
              </Badge>
            </div>

            {/* View-Only Container Disables Input Events */}
            {activeFields.length > 0 ? (
              <fieldset
                disabled
                className="pointer-events-none select-none space-y-4 opacity-90"
              >
                <DynamicFormRenderer
                  fields={activeFields}
                  formData={{}}
                  setFormData={() => {}}
                  onChange={() => {}}
                  disabled={true}
                  allowAddField={false}
                  showSaveControls={false}
                  isConfigurable={false}
                />
              </fieldset>
            ) : (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <p className="font-medium">
                  No form fields configured for this step.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Sheet Footer */}
        <div className="mt-auto flex shrink-0 items-center justify-end border-t bg-white pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Close Side Pane
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
