/* eslint-disable react/no-array-index-key */

'use client';

import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DynamicModal = ({
  isOpen,
  onClose,
  title,
  description,
  buttons = [],
  showCloseOnOutsideClick = true,
}) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (showCloseOnOutsideClick) onClose?.(open);
      }}
    >
      <DialogContent className="flex max-w-md flex-col gap-6 p-6">
        {/* Title */}
        {title && (
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        )}

        {/* Description / Message */}
        {description && (
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        )}

        {/* Buttons */}
        {buttons.length > 0 && (
          <div className="flex justify-end gap-3 pt-2">
            {buttons.map((btn, index) => (
              <Button
                key={index}
                variant={btn.variant || 'default'}
                className={btn.className || ''}
                onClick={() => btn.onClick?.()}
                size="sm"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DynamicModal;
