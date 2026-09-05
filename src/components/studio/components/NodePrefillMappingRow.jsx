'use client';

import React from 'react';
import { ArrowRight, Calculator, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { checkIsNumeric } from '@/components/studio/hooks/useNodePrefillMappings';

export default function NodePrefillMappingRow({
  mapping,
  index,
  sourceOptions = [],
  activeFields = [],
  onSourceChange,
  onTargetChange,
  onRemoveRow,
  onEnableCondition,
  onRemoveCondition,
  onPercentageChange,
}) {
  const currentSourcePath = mapping.sourcePath || '';
  const currentTargetKey = mapping.targetFieldKey || '';

  const sourceOpt = sourceOptions.find(
    (opt) => opt.sourcePath === currentSourcePath,
  );
  const targetField = activeFields.find(
    (f) => (f.mappingKey || f.key) === currentTargetKey,
  );

  const isSourceInOptions = Boolean(sourceOpt);
  const isTargetInActive = Boolean(targetField);

  const isNumericSource = checkIsNumeric(
    sourceOpt?.fieldKey || currentSourcePath,
    sourceOpt?.fieldType,
    sourceOpt?.fieldLabel,
  );
  const isNumericTarget = checkIsNumeric(
    targetField?.key || currentTargetKey,
    targetField?.type,
    targetField?.label,
  );

  const isNumericRow = isNumericSource || isNumericTarget;
  const hasCondition = mapping.operation === 'PERCENTAGE';
  const rowKey = `${currentSourcePath}_${currentTargetKey}_${index}`;

  return (
    <div
      key={rowKey}
      className="shadow-xs flex min-w-0 flex-col gap-2 overflow-hidden rounded-lg border border-neutral-200 bg-white p-3"
    >
      {/* Top Row: Source Field -> Target Field -> Delete Button */}
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Source Path Section */}
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-[11px] font-semibold text-neutral-700">
            Source Field Path (
            <span className="font-mono text-emerald-700">sourcePath</span>)
          </Label>

          {sourceOptions.length > 0 ? (
            <div className="min-w-0 space-y-1">
              <Select
                value={isSourceInOptions ? currentSourcePath : '__CUSTOM__'}
                onValueChange={(val) => {
                  if (val !== '__CUSTOM__') {
                    onSourceChange(index, val);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-full min-w-0 max-w-full overflow-hidden truncate bg-neutral-50 font-mono text-xs">
                  <SelectValue placeholder="Select Source Field..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {sourceOptions.map((opt) => (
                    <SelectItem
                      key={opt.sourcePath}
                      value={opt.sourcePath}
                      className="text-xs"
                    >
                      <span className="font-semibold text-neutral-900">
                        {opt.nodeLabel}
                      </span>{' '}
                      <span className="text-neutral-500">
                        ({opt.fieldLabel})
                      </span>
                      <div className="font-mono text-[10px] text-emerald-700">
                        {opt.sourcePath}
                      </div>
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="__CUSTOM__"
                    className="text-xs italic text-neutral-500"
                  >
                    + Custom Path (Manual)
                  </SelectItem>
                </SelectContent>
              </Select>

              {(!isSourceInOptions || currentSourcePath === '') && (
                <Input
                  className="h-8 font-mono text-xs"
                  placeholder="forms.SYSTEM_FORM.values.amount"
                  value={currentSourcePath}
                  onChange={(e) => onSourceChange(index, e.target.value)}
                />
              )}
            </div>
          ) : (
            <Input
              className="h-8 font-mono text-xs"
              placeholder="forms.SYSTEM_FORM.values.amount"
              value={currentSourcePath}
              onChange={(e) => onSourceChange(index, e.target.value)}
            />
          )}
        </div>

        {/* Connection Arrow */}
        <div className="flex shrink-0 items-center justify-center pt-3 sm:pt-4">
          <ArrowRight className="h-4 w-4 text-emerald-600" />
        </div>

        {/* Target Field Key Section */}
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-[11px] font-semibold text-neutral-700">
            Target Field Key (
            <span className="font-mono text-emerald-700">targetFieldKey</span>)
          </Label>

          {activeFields.length > 0 ? (
            <div className="min-w-0 space-y-1">
              <Select
                value={isTargetInActive ? currentTargetKey : '__CUSTOM__'}
                onValueChange={(val) => {
                  if (val !== '__CUSTOM__') {
                    onTargetChange(index, val);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-full min-w-0 max-w-full overflow-hidden truncate bg-neutral-50 font-mono text-xs">
                  <SelectValue placeholder="Select Target Field..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {activeFields.map((field) => {
                    const targetKey = field.mappingKey || field.key;
                    return (
                      <SelectItem
                        key={targetKey}
                        value={targetKey}
                        className="text-xs"
                      >
                        <span className="font-semibold text-neutral-900">
                          {field.label || field.key}
                        </span>{' '}
                        <span className="font-mono text-[10px] text-neutral-500">
                          ({targetKey})
                        </span>
                      </SelectItem>
                    );
                  })}
                  <SelectItem
                    value="__CUSTOM__"
                    className="text-xs italic text-neutral-500"
                  >
                    + Custom Key (Manual)
                  </SelectItem>
                </SelectContent>
              </Select>

              {(!isTargetInActive || currentTargetKey === '') && (
                <Input
                  className="h-8 font-mono text-xs"
                  placeholder="e.g. requestedAmount"
                  value={currentTargetKey}
                  onChange={(e) => onTargetChange(index, e.target.value)}
                />
              )}
            </div>
          ) : (
            <Input
              className="h-8 font-mono text-xs"
              placeholder="e.g. requestedAmount"
              value={currentTargetKey}
              onChange={(e) => onTargetChange(index, e.target.value)}
            />
          )}
        </div>

        {/* Remove Row Button */}
        <div className="flex shrink-0 items-center pt-3 sm:pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-neutral-400 hover:bg-red-50 hover:text-red-600"
            onClick={() => onRemoveRow(index)}
            title="Remove mapping"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CTA Button to add calculation condition */}
      {!hasCondition && isNumericRow && (
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 border-amber-300 bg-amber-50 text-[11px] font-medium text-amber-900 hover:bg-amber-100 hover:text-amber-950"
            onClick={() => onEnableCondition(index)}
          >
            <Calculator className="mr-1 h-3.5 w-3.5 text-amber-600" />+
            Percentage Calculation (%)
          </Button>
        </div>
      )}

      {/* Conditional Calculation Configuration Block */}
      {hasCondition && (
        <div className="mt-1 space-y-2 rounded-md border border-amber-200 bg-amber-50/60 p-2.5">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
              <Calculator className="h-3.5 w-3.5 text-amber-700" />
              Percentage Calculation (% of source value):
            </Label>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-amber-600 hover:bg-amber-100 hover:text-amber-900"
              onClick={() => onRemoveCondition(index)}
              title="Remove condition"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Percentage Input */}
            <div className="flex flex-1 items-center gap-1.5">
              <span className="text-[11px] font-medium text-amber-800">
                Percentage (%):
              </span>
              <Input
                type="number"
                min="0"
                max="100"
                step="any"
                className="h-7 w-24 bg-white text-xs"
                placeholder="10"
                value={mapping.percentage ?? ''}
                onChange={(e) =>
                  onPercentageChange(
                    index,
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
              />
              <span className="text-xs text-amber-700">% of source value</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
