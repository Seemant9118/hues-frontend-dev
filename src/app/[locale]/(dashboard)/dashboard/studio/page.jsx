'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import BuildNewWorkflowModal from './[id]/components/BuildNewWorkflowModal';
import StudioPageHeader from './components/StudioPageHeader';
import StudioTabHeaderControls from './components/StudioTabHeaderControls';
import StudioWorkflowGrid from './components/StudioWorkflowGrid';
import { useStudioSystemWorkflows } from './hooks/useStudioSystemWorkflows';

export default function StudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab');
  const activeTab = tabFromQuery === 'custom' ? 'custom' : 'system';

  const [activeMenu, setActiveMenu] = useState(null);

  // Modal State for Listing Page Custom Workflow Creation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const { systemForms, customWorkflows, isLoadingSystem, isLoadingCustom } =
    useStudioSystemWorkflows(activeTab);

  const handleTabChange = (val) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', val);
    router.replace(`/dashboard/studio?${params.toString()}`);
  };

  const handleOpenCreateModal = () => {
    setNewWorkflowName('');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e?.preventDefault();
    const trimmedName = newWorkflowName.trim();
    if (!trimmedName) {
      toast.error('Please enter a workflow name.');
      return;
    }

    setIsModalOpen(false);
    setNewWorkflowName('');
    router.push(
      `/dashboard/studio/CUSTOM_WORKFLOW?create=true&type=CUSTOM&name=${encodeURIComponent(trimmedName)}&tab=custom`,
    );
  };

  return (
    <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
      <ProtectedWrapper
        permissionCode="permission:form-config-manage"
        redirectTo="/dashboard"
      >
        <Wrapper>
          <StudioPageHeader />

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <StudioTabHeaderControls />

            <TabsContent value="system" className="mt-3">
              <StudioWorkflowGrid
                forms={systemForms}
                isLoading={isLoadingSystem}
                emptyMessage="No system forms found"
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            </TabsContent>

            <TabsContent value="custom" className="mt-3">
              <StudioWorkflowGrid
                forms={customWorkflows}
                isLoading={isLoadingCustom}
                emptyMessage="No custom workflows found"
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                isCustomTab={true}
                onCreateNew={handleOpenCreateModal}
              />
            </TabsContent>
          </Tabs>

          {/* Build New Custom Workflow Modal */}
          <BuildNewWorkflowModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            newWorkflowName={newWorkflowName}
            setNewWorkflowName={setNewWorkflowName}
            targetModule="CUSTOM_WORKFLOW"
            onSubmit={handleCreateSubmit}
            isSubmitting={false}
          />
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
