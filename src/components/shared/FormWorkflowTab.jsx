'use client';

import React, { useState } from 'react';
import { GitBranch, Plus } from 'lucide-react';

import { convertSnakeToTitleCase } from '@/appUtils/helperFunctions';
import CreateWorkflowModal from '@/components/admin/rules-engine/CreateWorkflowModal';
import WorkflowDefinitionsList from '@/components/admin/rules-engine/WorkflowDefinitionsList';
import WorkflowEditorCanvas from '@/components/admin/rules-engine/WorkflowEditorCanvas';
import WorkflowVersionHistoryDrawer from '@/components/admin/rules-engine/WorkflowVersionHistoryDrawer';
import { Button } from '@/components/ui/button';
import {
  useWorkflowDefinitions,
  useWorkflowModules,
  useWorkflowMutations,
} from '@/hooks/workflows/useWorkflowBuilder';

export function mapSystemModuleToWorkflowModule(moduleName = '') {
  const upper = String(moduleName || '').toUpperCase();
  if (upper.includes('ORDER')) return 'ORDER';
  if (upper.includes('INVOICE') || upper.includes('B2C')) return 'INVOICE';
  if (upper.includes('PAYMENT')) return 'PAYMENT';
  return 'ORDER';
}

export default function FormWorkflowTab({ moduleName }) {
  const targetModule = mapSystemModuleToWorkflowModule(moduleName);

  // Workflow Builder States
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVersionsDrawerOpen, setIsVersionsDrawerOpen] = useState(false);
  const [versionsTargetDefinition, setVersionsTargetDefinition] =
    useState(null);

  // Queries & Mutations
  const { data: workflowModules = [] } = useWorkflowModules();
  const { data: definitions = [], isLoading: isDefinitionsLoading } =
    useWorkflowDefinitions(targetModule);

  const workflowMutations = useWorkflowMutations({
    onDraftSaved: () => {},
    onPublished: () => {
      setIsCanvasOpen(false);
    },
    onActivated: () => {
      setIsVersionsDrawerOpen(false);
    },
  });

  // Handlers
  const handleCreateWorkflowSubmit = async (payload) => {
    const res = await workflowMutations.createDefinition({
      data: {
        ...payload,
        module: targetModule,
      },
    });
    if (res?.data?.data) {
      setSelectedDefinition(res.data.data);
      setIsCreateModalOpen(false);
      setIsCanvasOpen(true);
    }
  };

  const handleSelectDefinition = (def) => {
    setSelectedDefinition(def);
    setIsCanvasOpen(true);
  };

  const handleOpenVersions = (def) => {
    setVersionsTargetDefinition(def);
    setIsVersionsDrawerOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Visual Canvas Mode */}
      {isCanvasOpen && selectedDefinition ? (
        <WorkflowEditorCanvas
          definitionId={selectedDefinition.id}
          onBack={() => setIsCanvasOpen(false)}
          onSaveDraft={workflowMutations.saveDraft}
          onValidateDraft={workflowMutations.validateDraft}
          onPublishDraft={workflowMutations.publishDefinition}
          isSaving={workflowMutations.isSavingDraft}
          isValidating={workflowMutations.isValidating}
          isPublishing={workflowMutations.isPublishing}
        />
      ) : (
        /* Definitions List Mode */
        <div className="space-y-4">
          {/* Form Workflow Banner */}
          <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
                <GitBranch className="h-4 w-4 text-primary" />
                System Workflows for{' '}
                {convertSnakeToTitleCase(moduleName || targetModule)} (
                {targetModule})
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                Build, update, and publish approval or execution workflows
                associated with the <strong>{targetModule}</strong> engine.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="shrink-0 gap-1.5"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Build New Workflow
            </Button>
          </div>

          {/* Workflow List Table / Grid */}
          <WorkflowDefinitionsList
            definitions={definitions}
            isLoading={isDefinitionsLoading}
            onSelectDefinition={handleSelectDefinition}
            onOpenVersions={handleOpenVersions}
            onArchive={(id) => workflowMutations.archiveDefinition({ id })}
            onUnarchive={(id) => workflowMutations.unarchiveDefinition({ id })}
            onCreateWorkflow={() => setIsCreateModalOpen(true)}
          />
        </div>
      )}

      {/* Modals & Drawers */}
      <CreateWorkflowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateWorkflowSubmit}
        isSubmitting={workflowMutations.isCreating}
        modules={workflowModules}
        defaultModule={targetModule}
        disableUserToSelectModule={true}
      />

      <WorkflowVersionHistoryDrawer
        isOpen={isVersionsDrawerOpen}
        onClose={() => setIsVersionsDrawerOpen(false)}
        definition={versionsTargetDefinition}
        onActivateVersion={workflowMutations.activateVersion}
        isActivating={workflowMutations.isActivating}
      />
    </div>
  );
}
