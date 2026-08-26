'use client';

import CreateWorkflowModal from '@/components/admin/rules-engine/CreateWorkflowModal';
import WorkflowDefinitionsList from '@/components/admin/rules-engine/WorkflowDefinitionsList';
import WorkflowEditorCanvas from '@/components/admin/rules-engine/WorkflowEditorCanvas';
import WorkflowEngineHeader from '@/components/admin/rules-engine/WorkflowEngineHeader';
import WorkflowVersionHistoryDrawer from '@/components/admin/rules-engine/WorkflowVersionHistoryDrawer';
import { DeveloperModeWrapper } from '@/components/wrappers/DeveloperModeWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  useWorkflowDefinitions,
  useWorkflowModules,
  useWorkflowMutations,
} from '@/hooks/workflows/useWorkflowBuilder';
import { useState } from 'react';

export default function WorkflowEnginePage() {
  // Workflow Builder State
  const [selectedDefinition, setSelectedDefinition] = useState(null);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isVersionsDrawerOpen, setIsVersionsDrawerOpen] = useState(false);
  const [versionsTargetDefinition, setVersionsTargetDefinition] =
    useState(null);

  // Queries & Mutations
  const { data: workflowModules = [] } = useWorkflowModules();
  const { data: definitions = [], isLoading: isDefinitionsLoading } =
    useWorkflowDefinitions();

  const workflowMutations = useWorkflowMutations({
    onDraftSaved: () => {},
    onPublished: () => {
      setIsCanvasOpen(false);
    },
    onActivated: () => {
      setIsVersionsDrawerOpen(false);
    },
  });

  // Handlers for Workflow Builder
  const handleCreateWorkflowSubmit = async (payload) => {
    const res = await workflowMutations.createDefinition({ data: payload });
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
    <DeveloperModeWrapper redirectTo="/dashboard">
      <Wrapper>
        <WorkflowEngineHeader
          isEditorOpen={isCanvasOpen}
          onCreateWorkflow={() => setIsCreateModalOpen(true)}
        />

        {/* No-Code Workflow Canvas Editor Mode */}
        {isCanvasOpen && selectedDefinition && (
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
        )}

        {/* No-Code Workflow Definitions List Mode */}
        {!isCanvasOpen && (
          <WorkflowDefinitionsList
            definitions={definitions}
            isLoading={isDefinitionsLoading}
            onSelectDefinition={handleSelectDefinition}
            onOpenVersions={handleOpenVersions}
            onArchive={(id) => workflowMutations.archiveDefinition({ id })}
            onUnarchive={(id) => workflowMutations.unarchiveDefinition({ id })}
            onCreateWorkflow={() => setIsCreateModalOpen(true)}
          />
        )}

        {/* Modals & Drawers */}
        <CreateWorkflowModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateWorkflowSubmit}
          isSubmitting={workflowMutations.isCreating}
          modules={workflowModules}
        />

        <WorkflowVersionHistoryDrawer
          isOpen={isVersionsDrawerOpen}
          onClose={() => setIsVersionsDrawerOpen(false)}
          definition={versionsTargetDefinition}
          onActivateVersion={workflowMutations.activateVersion}
          isActivating={workflowMutations.isActivating}
        />
      </Wrapper>
    </DeveloperModeWrapper>
  );
}
