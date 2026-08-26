'use client';

import { getWorkflowStatusBadge } from '@/components/studio/utils/workflowBadges';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit3, Eye, Plus } from 'lucide-react';
import React from 'react';

export default function StudioActionHeaderControls({
  selectedDefinitionId,
  onSelectDefinition,
  isDefinitionsLoading,
  definitions,
  onOpenNewWorkflowModal,
  isEditMode,
  setIsEditMode,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-neutral-600">
        All Workflows :
      </span>
      <Select
        value={selectedDefinitionId || ''}
        onValueChange={onSelectDefinition}
        disabled={isDefinitionsLoading}
      >
        <SelectTrigger className="w-64 bg-white text-xs shadow-sm">
          <SelectValue
            placeholder={
              isDefinitionsLoading
                ? 'Loading workflows...'
                : 'Select Workflow Version'
            }
          />
        </SelectTrigger>
        <SelectContent>
          {definitions.map((def) => (
            <SelectItem key={def.id} value={def.id}>
              <div className="flex w-full items-center justify-between gap-2">
                <span className="truncate">{def.name}</span>
                {getWorkflowStatusBadge(def)}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        size="sm"
        variant="outline"
        onClick={onOpenNewWorkflowModal}
        className="gap-1.5 border-primary/40 bg-white text-xs font-semibold text-primary shadow-sm hover:bg-primary/5"
      >
        <Plus className="h-4 w-4" />
        Build New Workflow
      </Button>

      <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white p-1.5 px-3 shadow-sm">
        {isEditMode ? (
          <Edit3 className="h-3.5 w-3.5 text-blue-600" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-neutral-500" />
        )}
        <Label
          htmlFor="edit-mode-toggle-fc"
          className="cursor-pointer text-xs font-semibold text-neutral-700"
        >
          Editable Mode
        </Label>
        <Switch
          id="edit-mode-toggle-fc"
          checked={isEditMode}
          onCheckedChange={setIsEditMode}
        />
      </div>
    </div>
  );
}
