'use client';

import StudioWorkflowOverviewPane from '@/components/studio/StudioWorkflowOverviewPane';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import React from 'react';
import ConfirmLeaveModal from './components/ConfirmLeaveModal';
import StudioDetailsHeader from './components/StudioDetailsHeader';
import { useStudioDetails } from './hooks/useStudioDetails';

export default function StudioDetailsPage({ isCustomRoute }) {
  const {
    moduleId,
    config,
    isLoading,
    titleName,
    selectedDefinitionId,
    setSelectedDefinitionId,
    isEditMode,
    setIsEditMode,
    isCreatingNewFlow,
    setIsCreatingNewFlow,
    newWorkflowName,
    isConfirmLeaveModalOpen,
    setIsConfirmLeaveModalOpen,
    handleBackClick,
    handleCancelNewWorkflow,
    handleConfirmLeave,
  } = useStudioDetails(isCustomRoute);

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
          <StudioDetailsHeader
            titleName={titleName}
            onBackClick={handleBackClick}
          />

          {/* Tabs Section */}
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

          {/* Confirm Leave Without Saving Modal */}
          <ConfirmLeaveModal
            isOpen={isConfirmLeaveModalOpen}
            onOpenChange={setIsConfirmLeaveModalOpen}
            onConfirmLeave={handleConfirmLeave}
          />
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
