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
    <Card className="space-y-4 border-2 border-amber-300 bg-amber-50/60 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-amber-600" />
          <span className="font-bold text-amber-950">
            Step Field Value Mappings (
            <code className="font-mono text-xs text-amber-800">
              prefillMappings
            </code>
            )
          </span>
        </div>
        <Badge className="bg-amber-500 font-mono text-[11px] text-white">
          {prefillMappings.length}{' '}
          {prefillMappings.length === 1 ? 'Mapping' : 'Mappings'}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-xs font-medium text-amber-900/90">
        Map field values from preceding form steps into this step&apos;s inputs
        when the form opens.
        <span className="ml-1 text-[11px] italic text-amber-700">
          (Independent from Transition Branch Routing Conditions).
        </span>
      </p>

      {/* Mapping Rows */}
      <div className="space-y-3">
        {prefillMappings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-amber-300 bg-amber-100/40 p-4 text-center">
            <p className="text-xs font-medium text-amber-800">
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
          className="h-8 border-amber-400 bg-amber-100 text-xs font-semibold text-amber-900 hover:bg-amber-200 hover:text-amber-950"
          onClick={handleAddRow}
        >
          <Plus className="mr-1 h-3.5 w-3.5 text-amber-700" />
          Add Prefill Mapping Rule
        </Button>
      </div>
    </Card>
  );
}
