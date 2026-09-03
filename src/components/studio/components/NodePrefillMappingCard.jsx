'use client';

import React from 'react';
import { Link2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import NodePrefillMappingRow from '@/components/studio/components/NodePrefillMappingRow';
import { useNodePrefillMappings } from '@/components/studio/hooks/useNodePrefillMappings';

export default function NodePrefillMappingCard({
  node,
  nodes = [],
  edges = [],
  moduleName = 'ORDER',
  activeFields = [],
  onUpdateNodeDataConfig,
}) {
  const {
    prefillMappings,
    sourceOptions,
    shouldHideCard,
    handleAddRow,
    handleRemoveRow,
    handleSourceChange,
    handleTargetChange,
    handleEnableCondition,
    handleRemoveCondition,
    handlePercentageChange,
  } = useNodePrefillMappings({
    node,
    nodes,
    edges,
    moduleName,
    activeFields,
    onUpdateNodeDataConfig,
  });

  if (shouldHideCard) {
    return null;
  }

  return (
    <Card className="space-y-4 border border-emerald-200/80 bg-emerald-50/20 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-emerald-900">
            Prefill Data Key Mappings (
            <code className="font-mono text-xs">prefillMappings</code>)
          </span>
        </div>
        <Badge className="bg-emerald-600 font-mono text-[11px] text-white">
          {prefillMappings.length}{' '}
          {prefillMappings.length === 1 ? 'Rule' : 'Rules'}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-neutral-600">
        Automatically prefill field values from preceding form steps into this
        step.
      </p>

      {/* Mapping Rows */}
      <div className="space-y-3">
        {prefillMappings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-emerald-300 bg-white/60 p-4 text-center">
            <p className="text-xs text-neutral-500">
              No prefill mappings defined yet. Click below to add your first
              prefill rule.
            </p>
          </div>
        ) : (
          prefillMappings.map((mapping, idx) => {
            const ruleKey =
              mapping.id ||
              `${mapping.sourcePath || 'src'}_${mapping.targetFieldKey || 'tgt'}_${mapping.operation || 'dir'}`;
            return (
              <NodePrefillMappingRow
                key={ruleKey}
                mapping={mapping}
                index={idx}
                sourceOptions={sourceOptions}
                activeFields={activeFields}
                onSourceChange={handleSourceChange}
                onTargetChange={handleTargetChange}
                onRemoveRow={handleRemoveRow}
                onEnableCondition={handleEnableCondition}
                onRemoveCondition={handleRemoveCondition}
                onPercentageChange={handlePercentageChange}
              />
            );
          })
        )}
      </div>

      {/* Footer / Add Action */}
      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 border-emerald-300 bg-white text-xs font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          onClick={handleAddRow}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Prefill Mapping Rule
        </Button>
      </div>
    </Card>
  );
}
