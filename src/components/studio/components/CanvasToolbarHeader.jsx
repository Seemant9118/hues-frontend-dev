'use client';

import { Button } from '@/components/ui/button';
import { Archive, GitBranch, Save, Send, ShieldCheck, X } from 'lucide-react';
import React from 'react';
import { getWorkflowStatusBadge } from '../utils/workflowBadges';

export { getWorkflowStatusBadge };

export default function CanvasToolbarHeader({
  isEditMode,
  isCreatingNewFlow,
  newWorkflowName,
  selectedWorkflowDef,
  targetModule,
  nodesCount,
  edgesCount,
  selectedDefinitionId,
  isArchiving,
  onArchiveWorkflow,
  isValidating,
  hasUnconnectedNodes,
  onValidateGraph,
  isSavingDraft,
  isValidated,
  onSaveDraft,
  isPublishing,
  isDraftSaved,
  hasUnsavedChanges,
  onPublishGraph,
  onCancelNewWorkflow,
}) {
  return (
    <div className="z-20 flex flex-wrap items-center justify-between gap-2 rounded-t-xl border-b bg-white px-4 py-2.5">
      {/* Selected Workflow Title & Status Badge */}
      <div className="flex items-center gap-3">
        <GitBranch className="h-4 w-4 text-primary" />
        <div>
          <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-800">
            {isCreatingNewFlow
              ? newWorkflowName
                ? `${newWorkflowName} (New Draft)`
                : 'New Workflow (New Draft)'
              : selectedWorkflowDef?.name || `Workflow (${targetModule})`}
            {getWorkflowStatusBadge(
              isCreatingNewFlow
                ? { status: 'DRAFT', active: false }
                : selectedWorkflowDef,
            )}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Module:{' '}
            <span className="font-mono font-bold text-neutral-700">
              {targetModule}
            </span>{' '}
            | {nodesCount} Flow Nodes | {edgesCount} Interconnections
          </p>
        </div>
      </div>

      {/* Action CTAs (All 3 buttons disabled when isEditMode === false) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Cancel Building Button (Shown when building new flow) */}
        {isCreatingNewFlow && (
          <Button
            size="sm"
            variant="outline"
            onClick={onCancelNewWorkflow}
            className="gap-1 border-red-300 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100"
            title="Cancel building new workflow"
          >
            <X className="h-3.5 w-3.5" />
            Cancel Building
          </Button>
        )}

        {/* Archive Workflow Button */}
        {selectedDefinitionId && !isCreatingNewFlow && (
          <Button
            size="sm"
            variant="outline"
            onClick={onArchiveWorkflow}
            disabled={
              isEditMode ||
              isArchiving ||
              selectedWorkflowDef?.status === 'ARCHIVED'
            }
            className="border-amber-300 bg-amber-50 text-xs font-semibold text-amber-800 hover:bg-amber-100"
            title={
              !isEditMode
                ? "Enable 'Editable Mode' to archive workflow"
                : 'Archive this workflow definition'
            }
          >
            <Archive className="mr-1.5 h-3.5 w-3.5" />
            {isArchiving ? 'Archiving...' : 'Archive Workflow'}
          </Button>
        )}

        {/* CTA 1: Validate Workflow */}
        <Button
          size="sm"
          variant="outline"
          onClick={onValidateGraph}
          disabled={!isEditMode || isValidating || hasUnconnectedNodes}
          title={
            !isEditMode
              ? "Enable 'Editable Mode' to validate workflow"
              : 'Validate workflow topology'
          }
          className="border-neutral-300 text-xs font-semibold text-neutral-700"
        >
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
          {isValidating ? 'Validating...' : 'Validate Workflow'}
        </Button>

        {/* CTA 2: Save Draft */}
        <Button
          size="sm"
          variant="outline"
          onClick={onSaveDraft}
          disabled={!isEditMode || isSavingDraft || !isValidated}
          title={
            !isEditMode
              ? "Enable 'Editable Mode' to save draft"
              : !isValidated
                ? 'Validate workflow first before saving draft'
                : 'Save draft changes'
          }
          className={`text-xs font-semibold ${
            isEditMode && isValidated
              ? 'border-emerald-400 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100'
              : ''
          }`}
        >
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {isSavingDraft ? 'Saving...' : 'Save Draft'}
        </Button>

        {/* CTA 3: Publish & Activate */}
        <Button
          size="sm"
          onClick={onPublishGraph}
          disabled={
            !isEditMode ||
            isPublishing ||
            !isValidated ||
            !isDraftSaved ||
            hasUnsavedChanges
          }
          title={
            !isEditMode
              ? "Enable 'Editable Mode' to publish & activate workflow"
              : !isDraftSaved || hasUnsavedChanges
                ? 'Please click "Save Draft" first before publishing'
                : 'Publish and activate this workflow'
          }
          className="text-xs"
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {isPublishing ? 'Publishing...' : 'Publish & Activate'}
        </Button>
      </div>
    </div>
  );
}
