'use client';

import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
              {isSystemStart ? 'Yes' : 'No'}
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
        </div>
      </Card>

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
              {formConfigId ? `Custom Form #${formConfigId}` : 'System Form'}
            </Badge>
          </div>

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
