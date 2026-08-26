'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import {
  getCustomForm,
  getAllCustomForms,
} from '@/services/Custom_Form_Services/CustomFormServices';
import { getRoles } from '@/services/Roles_Services/Roles_Services';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import {
  FileText,
  Zap,
  CheckSquare,
  UploadCloud,
  GitCommit,
  CheckCircle,
  Package,
  ArrowRight,
  PanelRightOpen,
} from 'lucide-react';
import NodeStepSummaryCard from './components/NodeStepSummaryCard';
import NodeFormSchemaSummaryCard from './components/NodeFormSchemaSummaryCard';

export default function NodeDetailsModal({
  isOpen,
  onClose,
  node,
  moduleName = 'ORDER',
  onUpdateNodeForm,
}) {
  const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);

  const nodeContent = node?.content || {};
  const nodeType = node?.type || nodeContent.type || 'SYSTEM';
  const isSystemStart = nodeType === 'SYSTEM' || nodeContent.start;
  const formConfigId = nodeContent.formConfigurationId;

  // Queries
  const { data: systemFormConfig, isLoading: isSysFormLoading } = useQuery({
    queryKey: ['get_form_config_node_modal', moduleName],
    queryFn: () => getFormConfig(moduleName),
    enabled: Boolean(isOpen && node && (isSystemStart || !formConfigId)),
    select: (res) => res?.data?.data || res || null,
  });

  const { data: customFormDetails, isLoading: isCustomFormLoading } = useQuery({
    queryKey: ['get_custom_form_node_modal', formConfigId],
    queryFn: () => getCustomForm(formConfigId),
    enabled: Boolean(isOpen && node && nodeType === 'FORM' && formConfigId),
    select: (res) => res?.data?.data || res || null,
  });

  const { data: availableCustomForms = [] } = useQuery({
    queryKey: ['get_all_custom_forms_node_modal'],
    queryFn: getAllCustomForms,
    enabled: Boolean(isOpen && node && nodeType === 'FORM'),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['get_all_roles_node_modal'],
    queryFn: getRoles,
    enabled: Boolean(isOpen && node && nodeType === 'APPROVAL'),
    select: (res) => res.data?.data || [],
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
      <Sheet open={isSidePaneOpen} onOpenChange={setIsSidePaneOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 bg-white p-6 shadow-2xl sm:max-w-3xl"
        >
          {/* Fixed Sheet Header */}
          <SheetHeader className="shrink-0 border-b pb-3">
            <div className="flex items-center gap-2">
              {getIcon()}
              <SheetTitle className="truncate text-base font-bold text-gray-900">
                Read-Only Form Preview: {selectedFormName}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs">
              View-only form layout preview for step node{' '}
              <strong>{node.name || node.id}</strong>.
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable Preview Body */}
          <div className="scrollBarStyles min-h-0 flex-1 space-y-4 overflow-y-auto py-3 pr-1">
            <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-bold text-gray-800">
                  Form Fields View ({activeFields.length} Fields)
                </h4>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {formConfigId
                    ? `Custom Form #${formConfigId}`
                    : 'System Default Form'}
                </Badge>
              </div>

              {/* View-Only Container Disables Input Events and renders all fields disabled */}
              {activeFields.length > 0 ? (
                <fieldset
                  disabled
                  className="pointer-events-none select-none space-y-4 opacity-90"
                >
                  <DynamicFormRenderer
                    fields={activeFields}
                    formData={{}}
                    setFormData={() => {}}
                    onChange={() => {}}
                    disabled={true}
                    allowAddField={false}
                    showSaveControls={false}
                    isConfigurable={false}
                  />
                </fieldset>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <p className="font-medium">
                    No form fields configured for this step.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Sheet Footer */}
          <div className="mt-auto flex shrink-0 items-center justify-end border-t bg-white pt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsSidePaneOpen(false)}
              className="text-xs"
            >
              Close Side Pane
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
