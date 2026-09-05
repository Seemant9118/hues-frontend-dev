'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Wand2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CanvasOverlayCards({
  hasUnconnectedNodes,
  unconnectedNodes,
  hasUnselectedFormNodes = false,
  formNodesWithoutSelection = [],
  isWarningDismissed,
  onDismissWarning,
  onAutoConnectUnconnected,
  isValidated,
  isSuccessDismissed,
  onDismissSuccess,
  isDraftSaved,
  hasUnsavedChanges,
}) {
  return (
    <div className="absolute bottom-4 right-4 z-30 max-w-sm space-y-2">
      {hasUnselectedFormNodes && (
        <Card className="flex items-start justify-between gap-3 border-amber-300 bg-white/95 p-3 text-xs text-amber-950 shadow-md backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <h4 className="font-bold text-amber-900">
                Form Selection Required
              </h4>
              <p className="mt-0.5 text-[11px] text-amber-800">
                The following custom form step(s) require an associated form:
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {formNodesWithoutSelection.map((n) => (
                  <Badge
                    key={n.id}
                    className="bg-amber-500 font-mono text-[10px] text-white"
                  >
                    {n.name || n.id}
                  </Badge>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-neutral-600">
                Click on step node &gt; Open details modal &gt; Select
                Associated Form.
              </p>
            </div>
          </div>
        </Card>
      )}

      {hasUnconnectedNodes && !isWarningDismissed && (
        <Card className="flex items-start justify-between gap-3 border-red-300 bg-white/95 p-3 text-xs text-red-950 shadow-md backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <h4 className="font-bold">Disconnected Nodes Warning</h4>
              <p className="mt-0.5 text-[11px] text-red-800">
                The following step node(s) are disconnected:
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {unconnectedNodes.map((n) => (
                  <Badge
                    key={n.id}
                    variant="destructive"
                    className="font-mono text-[10px]"
                  >
                    {n.name}
                  </Badge>
                ))}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={onAutoConnectUnconnected}
                className="mt-2.5 h-6 gap-1 border-red-300 text-[10px] text-red-700 hover:bg-red-50"
              >
                <Wand2 className="h-3 w-3" />
                Auto-Link Disconnected Steps
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissWarning}
            className="text-neutral-400 hover:text-neutral-700"
            title="Dismiss warning message"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}

      {!hasUnconnectedNodes && isValidated && !isSuccessDismissed && (
        <Card className="flex items-center justify-between gap-3 border-emerald-300 bg-white/95 p-3 text-xs text-emerald-950 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <h4 className="font-bold">Workflow Topology Validated!</h4>
              <p className="text-[11px] text-emerald-800">
                {isDraftSaved && !hasUnsavedChanges
                  ? 'Draft is saved and ready to publish & activate.'
                  : 'Save Draft to persist changes before publishing.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismissSuccess}
            className="text-neutral-400 hover:text-neutral-700"
            title="Dismiss success message"
          >
            <X className="h-4 w-4" />
          </button>
        </Card>
      )}
    </div>
  );
}
