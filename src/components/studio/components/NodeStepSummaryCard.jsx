'use client';

import React from 'react';
import {
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NodeStepSummaryCard({
  nodeType,
  moduleName,
  isSystemStart,
  nodeContent,
  formConfigId,
  availableCustomForms,
  selectedFormName,
  nodeId,
  onUpdateNodeForm,
  onUpdateNodeDataConfig,
}) {
  return (
    <>
      <Card className="space-y-3 border bg-gray-50/50 p-4">
        <h4 className="font-bold uppercase tracking-wider text-gray-700">
          Step Configuration Summary
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Module: </span>
            <strong className="font-mono text-gray-900">{moduleName}</strong>
          </div>
          <div>
            <span className="text-muted-foreground">Is Start Node: </span>
            <strong className="text-gray-900">
              {nodeContent.start || isSystemStart ? 'Yes' : 'No'}
            </strong>
          </div>
          {nodeType === 'APPROVAL' && (
            <div>
              <span className="text-muted-foreground">Assignee Role: </span>
              <strong className="font-mono text-blue-600">
                {nodeContent.assignee?.roleCode || 'MANAGER'}
              </strong>
            </div>
          )}
          {nodeType === 'FORM' && (
            <div>
              <span className="text-muted-foreground">Form Config ID: </span>
              <strong className="font-mono text-emerald-600">
                {formConfigId ? `#${formConfigId}` : 'System Default'}
              </strong>
            </div>
          )}
          {nodeType === 'DATA_UPDATE' && (
            <div>
              <span className="text-muted-foreground">Operation: </span>
              <strong className="font-mono text-purple-600">
                {nodeContent.config?.operation || 'PERCENTAGE'}
              </strong>
            </div>
          )}
        </div>
      </Card>

      {/* Configuration Card for DATA_UPDATE nodes */}
      {nodeType === 'DATA_UPDATE' && (
        <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-200 pb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-purple-600" />
              <span className="font-bold text-purple-900">
                Data Update Internal Logic Config
              </span>
            </div>
            <Badge className="bg-purple-600 font-mono text-xs text-white">
              {nodeContent.config?.operation || 'PERCENTAGE'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-800">
                Target Field Path
              </Label>
              <Input
                className="bg-white font-mono text-xs"
                value={nodeContent.config?.target || ''}
                onChange={(e) =>
                  onUpdateNodeDataConfig?.(nodeId, {
                    ...nodeContent.config,
                    target: e.target.value,
                  })
                }
                placeholder="e.g. extraInfo.workflowRules.tdsAmount"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-800">
                Source Field Path
              </Label>
              <Input
                className="bg-white font-mono text-xs"
                value={nodeContent.config?.source || ''}
                onChange={(e) =>
                  onUpdateNodeDataConfig?.(nodeId, {
                    ...nodeContent.config,
                    source: e.target.value,
                  })
                }
                placeholder="e.g. amount"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-800">
                Operation
              </Label>
              <Select
                value={nodeContent.config?.operation || 'PERCENTAGE'}
                onValueChange={(val) =>
                  onUpdateNodeDataConfig?.(nodeId, {
                    ...nodeContent.config,
                    operation: val,
                  })
                }
              >
                <SelectTrigger className="bg-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">PERCENTAGE</SelectItem>
                  <SelectItem value="FIXED_VALUE">FIXED_VALUE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(nodeContent.config?.operation || 'PERCENTAGE') ===
            'PERCENTAGE' ? (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-800">
                  Percentage (%)
                </Label>
                <Input
                  type="number"
                  className="bg-white font-mono text-xs"
                  value={nodeContent.config?.percentage ?? 10}
                  onChange={(e) =>
                    onUpdateNodeDataConfig?.(nodeId, {
                      ...nodeContent.config,
                      percentage: Number(e.target.value),
                    })
                  }
                  placeholder="10"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-800">
                  Fixed Value
                </Label>
                <Input
                  type="number"
                  className="bg-white font-mono text-xs"
                  value={nodeContent.config?.fixedValue ?? 0}
                  onChange={(e) =>
                    onUpdateNodeDataConfig?.(nodeId, {
                      ...nodeContent.config,
                      fixedValue: Number(e.target.value),
                    })
                  }
                  placeholder="100"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Associated Form Selection Card for FORM nodes */}
      {nodeType === 'FORM' && (
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span className="font-bold text-emerald-900">
                Associated Form Selection
              </span>
            </div>
            <Badge className="bg-emerald-600 font-mono text-xs text-white">
              {formConfigId
                ? `Custom Form #${formConfigId}`
                : 'No Form Selected'}
            </Badge>
          </div>

          {!formConfigId && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900 shadow-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>Form Selection Required:</strong> Please select a custom
                form from the dropdown below before saving or validating this
                workflow.
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Select Custom Form to Associate with this Step Node:
            </Label>
            <Select
              value={String(formConfigId || 'system')}
              onValueChange={(val) => {
                const selectedForm = availableCustomForms.find(
                  (cf) => String(cf.id) === String(val),
                );
                onUpdateNodeForm?.(
                  nodeId,
                  val === 'system' ? null : val,
                  selectedForm?.name || selectedForm?.title,
                );
              }}
            >
              <SelectTrigger className="w-full border-emerald-300 bg-white text-xs font-medium shadow-sm">
                <SelectValue placeholder="Select Custom Form" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="system"
                  className="font-semibold text-amber-900"
                >
                  System Default Form ({moduleName})
                </SelectItem>
                {availableCustomForms.map((cf) => (
                  <SelectItem
                    key={cf.id}
                    value={String(cf.id)}
                    className="font-medium"
                  >
                    Custom Form: {cf.name || cf.title || `Form ID #${cf.id}`}{' '}
                    (ID: {cf.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border bg-white p-2.5 text-xs">
            <span className="text-muted-foreground">Currently Selected: </span>
            <strong className="font-semibold text-emerald-950">
              {selectedFormName}
            </strong>
          </div>
        </div>
      )}
    </>
  );
}
