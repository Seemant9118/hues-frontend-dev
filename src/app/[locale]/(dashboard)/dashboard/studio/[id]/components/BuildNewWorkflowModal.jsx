'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BuildNewWorkflowModal({
  isOpen,
  onOpenChange,
  newWorkflowName,
  setNewWorkflowName,
  targetModule,
  onSubmit,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Build New Workflow
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="wf-name-input" className="text-xs font-bold">
              Workflow Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="wf-name-input"
              placeholder="e.g. Purchase Order Approval Flow"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              className="text-xs"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wf-module-input" className="text-xs font-bold">
              System Form Module (Disabled)
            </Label>
            <Input
              id="wf-module-input"
              value={targetModule}
              disabled
              className="cursor-not-allowed bg-neutral-100 font-mono text-xs font-bold text-neutral-700"
            />
            <p className="text-[11px] text-muted-foreground">
              System module is locked to <strong>{targetModule}</strong> based
              on current form context (Sales/Purchase Order ➔ ORDER, Invoice ➔
              INVOICE, Payment ➔ PAYMENT).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-bold">
              Create & Open Canvas
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
