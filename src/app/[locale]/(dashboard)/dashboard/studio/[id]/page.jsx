'use client';

import React from 'react';
import StudioWorkflowOverviewPane from '@/components/studio/StudioWorkflowOverviewPane';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import BuildNewWorkflowModal from './components/BuildNewWorkflowModal';
import StudioActionHeaderControls from './components/StudioActionHeaderControls';
import StudioDetailsHeader from './components/StudioDetailsHeader';
import StudioEmptyWorkflowState from './components/StudioEmptyWorkflowState';
import { useStudioDetails } from './hooks/useStudioDetails';

export default function StudioDetailsPage() {
  const {
    moduleId,
    config,
    isLoading,
    titleName,
    targetModule,
    activeTab,
    setActiveTab,
    combinedDefinitions,
    isDefinitionsLoading,
    hasNoDefinitions,
    selectedDefinitionId,
    setSelectedDefinitionId,
    setHasUserManuallySelected,
    isEditMode,
    setIsEditMode,
    isCreatingNewFlow,
    setIsCreatingNewFlow,
    isNewWorkflowModalOpen,
    setIsNewWorkflowModalOpen,
    newWorkflowName,
    setNewWorkflowName,
    handleOpenNewWorkflowModal,
    handleCreateWorkflowSubmit,
    handleCancelNewWorkflow,
  } = useStudioDetails();

  if (isLoading) {
    return (
      <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
        <ProtectedWrapper
          permissionCode="permission:form-config-manage"
          redirectTo="/dashboard"
        >
          <Wrapper>
            <SubHeader name="Studio(Workflow) Details" />
            <Loading />
          </Wrapper>
        </ProtectedWrapper>
      </FeatureFlagWrapper>
    );
  }

  return (
    <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
      <ProtectedWrapper
        permissionCode="permission:form-config-manage"
        redirectTo="/dashboard"
      >
        <Wrapper>
          {/* Header & Back Action */}
          <StudioDetailsHeader titleName={titleName} />

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <section className="mb-4 flex w-full flex-wrap items-center justify-between gap-2">
              <TabsList className="border border-neutral-200 bg-neutral-50 p-1">
                <TabsTrigger value="overview">Workflow</TabsTrigger>
              </TabsList>

              {/* Action Header Controls */}
              {activeTab === 'overview' && !hasNoDefinitions && (
                <StudioActionHeaderControls
                  selectedDefinitionId={selectedDefinitionId}
                  onSelectDefinition={(val) => {
                    if (val === 'LOCAL_TEMP_DRAFT') return;
                    setHasUserManuallySelected(true);
                    setIsCreatingNewFlow(false);
                    setSelectedDefinitionId(val);
                  }}
                  isDefinitionsLoading={isDefinitionsLoading}
                  definitions={combinedDefinitions}
                  onOpenNewWorkflowModal={handleOpenNewWorkflowModal}
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                />
              )}
            </section>

            {/* Tab: Overview */}
            <TabsContent value="overview" className="space-y-4">
              {hasNoDefinitions ? (
                <StudioEmptyWorkflowState
                  targetModule={targetModule}
                  onOpenNewWorkflowModal={handleOpenNewWorkflowModal}
                />
              ) : (
                <StudioWorkflowOverviewPane
                  moduleName={config?.module || moduleId}
                  selectedDefinitionId={selectedDefinitionId}
                  setSelectedDefinitionId={setSelectedDefinitionId}
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  isCreatingNewFlow={isCreatingNewFlow}
                  setIsCreatingNewFlow={setIsCreatingNewFlow}
                  newWorkflowName={newWorkflowName}
                  onCancelNewWorkflow={handleCancelNewWorkflow}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Build New Workflow Modal */}
          <BuildNewWorkflowModal
            isOpen={isNewWorkflowModalOpen}
            onOpenChange={setIsNewWorkflowModalOpen}
            newWorkflowName={newWorkflowName}
            setNewWorkflowName={setNewWorkflowName}
            targetModule={targetModule}
            onSubmit={handleCreateWorkflowSubmit}
          />
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
