'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  CheckSquare,
  FileText,
  GitCommit,
  Package,
  PanelRightOpen,
  SlidersHorizontal,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import NodeFormPreviewSheet from './components/NodeFormPreviewSheet';
import NodeFormSchemaSummaryCard from './components/NodeFormSchemaSummaryCard';
import NodePrefillMappingCard from './components/NodePrefillMappingCard';
import NodeStepSummaryCard from './components/NodeStepSummaryCard';
import { useNodeDetailsQueries } from './hooks/useNodeDetailsQueries';

export default function NodeDetailsModal({
  isOpen,
  onClose,
  node,
  nodes = [],
  edges = [],
  moduleName = 'ORDER',
  onUpdateNodeForm,
  onUpdateNodeDataConfig,
}) {
  const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);

  const nodeContent = node?.content || {};
  const nodeType = node?.type || nodeContent.type || 'SYSTEM';
  const isSystemStart = nodeType === 'SYSTEM' || nodeContent.start;
  const formConfigId = nodeContent.formConfigurationId;

  const {
    systemFormConfig,
    isSysFormLoading,
    customFormDetails,
    isCustomFormLoading,
    availableCustomForms,
    roles,
  } = useNodeDetailsQueries({
    isOpen,
    node,
    moduleName,
    nodeType,
    isSystemStart,
    formConfigId,
  });

  if (!node) return null;

  const getIcon = () => {
    switch (nodeType) {
      case 'SYSTEM':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'APPROVAL':
        return <CheckSquare className="h-5 w-5 text-blue-500" />;
      case 'FORM':
        return <FileText className="h-5 w-5 text-emerald-500" />;
      case 'DATA_UPDATE':
        return <SlidersHorizontal className="h-5 w-5 text-purple-600" />;
      case 'DOCUMENT_UPLOAD':
        return <UploadCloud className="h-5 w-5 text-purple-500" />;
      case 'STATUS_UPDATE':
        return <GitCommit className="h-5 w-5 text-indigo-500" />;
      case 'END':
        return <CheckCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const sysFields = systemFormConfig?.fields || [];
  const customFields = customFormDetails?.fields || [];
  const activeFields = isSystemStart
    ? sysFields
    : formConfigId
      ? customFields
      : sysFields;

  const selectedFormName = formConfigId
    ? customFormDetails?.name ||
      customFormDetails?.title ||
      `Custom Form ID #${formConfigId}`
    : `System Default Form (${moduleName})`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex h-[85vh] max-h-[85vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl border bg-white p-6 shadow-2xl sm:max-w-2xl">
          {/* Fixed Dialog Header */}
          <DialogHeader className="shrink-0 border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                {getIcon()}
              </div>
              <div className="overflow-hidden">
                <DialogTitle className="flex items-center gap-2 truncate text-base font-bold text-gray-900 sm:text-lg">
                  {node.name || nodeContent.label || node.id}
                </DialogTitle>
                <DialogDescription className="flex flex-wrap items-center gap-2 text-xs">
                  <span>
                    Step Key:{' '}
                    <strong className="font-mono text-gray-800">
                      {node.id}
                    </strong>
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase"
                  >
                    {nodeType}
                  </Badge>
                  {isSystemStart && (
                    <Badge className="bg-amber-500 text-[10px] text-white">
                      System Start Form
                    </Badge>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Main Content Body */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-3 pr-1 text-xs">
            {/* Step Configuration Summary & Form Selector */}
            <NodeStepSummaryCard
              nodeType={nodeType}
              moduleName={moduleName}
              isSystemStart={isSystemStart}
              nodeContent={nodeContent}
              formConfigId={formConfigId}
              availableCustomForms={availableCustomForms}
              selectedFormName={selectedFormName}
              nodeId={node.id}
              onUpdateNodeForm={onUpdateNodeForm}
              onUpdateNodeDataConfig={onUpdateNodeDataConfig}
            />

            {/* Prefill Key Mapping Configuration Card */}
            <NodePrefillMappingCard
              node={node}
              nodes={nodes}
              edges={edges}
              moduleName={moduleName}
              activeFields={activeFields}
              onUpdateNodeDataConfig={onUpdateNodeDataConfig}
            />

            {/* Schema Summary Card */}
            <NodeFormSchemaSummaryCard
              nodeType={nodeType}
              isSystemStart={isSystemStart}
              formConfigId={formConfigId}
              moduleName={moduleName}
              sysFields={sysFields}
              isSysFormLoading={isSysFormLoading}
              customFields={customFields}
              isCustomFormLoading={isCustomFormLoading}
              roles={roles}
              nodeContent={nodeContent}
            />
          </div>

          {/* Fixed Footer Action Bar */}
          <div className="mt-auto flex shrink-0 items-center justify-between border-t bg-white pt-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Overview
            </Button>

            {(['SYSTEM', 'FORM'].includes(nodeType) || isSystemStart) && (
              <Button size="sm" onClick={() => setIsSidePaneOpen(true)}>
                <PanelRightOpen className="h-4 w-4" />
                View Detailed Form Preview (Side Pane)
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Right Slide-Over Side Pane for Read-Only Form Preview */}
      <NodeFormPreviewSheet
        isOpen={isSidePaneOpen}
        onClose={() => setIsSidePaneOpen(false)}
        getIcon={getIcon}
        selectedFormName={selectedFormName}
        nodeName={node.name || node.id}
        activeFields={activeFields}
        formConfigId={formConfigId}
      />
    </>
  );
}
