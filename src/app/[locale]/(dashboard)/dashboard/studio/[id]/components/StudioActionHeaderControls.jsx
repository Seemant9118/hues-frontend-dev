'use client';

import React from 'react';
import { Edit3, Eye, ShieldCheck } from 'lucide-react';
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

export default function StudioActionHeaderControls({
  selectedVersionId,
  onSelectVersion,
  activeVersionId = null,
  isVersionsLoading = false,
  versions = [],
  onActivateVersion,
  isActivatingVersion = false,
  isEditMode,
  setIsEditMode,
}) {
  const selectedVersionObj = versions.find(
    (v) => String(v.id) === String(selectedVersionId),
  );
  const isSelectedActive =
    selectedVersionObj &&
    (String(selectedVersionObj.id) === String(activeVersionId) ||
      selectedVersionObj.status === 'ACTIVE' ||
      selectedVersionObj.active === true);

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2 px-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-neutral-600">
          All versions :
        </span>
        <Select
          value={selectedVersionId ? String(selectedVersionId) : ''}
          onValueChange={onSelectVersion}
          disabled={isVersionsLoading || versions.length === 0}
        >
          <SelectTrigger className="w-56 bg-white font-mono text-xs shadow-sm">
            <SelectValue
              placeholder={
                isVersionsLoading
                  ? 'Loading versions...'
                  : versions.length === 0
                    ? 'No versions found'
                    : 'Select Version'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {versions.map((ver) => (
              <SelectItem key={ver.id} value={String(ver.id)}>
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="font-mono text-xs font-semibold">
                    {ver.status === 'DRAFT' || ver.version === 0
                      ? `Draft (v${ver.version})`
                      : `Version v${ver.version}`}
                  </span>
                  {getWorkflowStatusBadge(ver, activeVersionId)}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {/* Activate Version Action (shown if selected version is not active) */}
        {!isSelectedActive && selectedVersionObj && onActivateVersion && (
          <Button
            size="sm"
            variant="outline"
            disabled={isActivatingVersion}
            onClick={() => onActivateVersion(selectedVersionObj.id)}
            className="gap-1.5 border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            {isActivatingVersion ? 'Activating...' : 'Activate Version'}
          </Button>
        )}

        {/* Editable Mode Toggle */}
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
    </div>
  );
}
