'use client';

import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BuildNewWorkflowModal from '../_details/components/BuildNewWorkflowModal';
import StudioPageHeader from '../components/StudioPageHeader';
import StudioWorkflowGrid from '../components/StudioWorkflowGrid';
import { useStudioSystemWorkflows } from '../hooks/useStudioSystemWorkflows';

export default function CustomWorkflowsPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');

  const { customWorkflows, isLoadingCustom } =
    useStudioSystemWorkflows('custom');

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
      `/dashboard/studio/custom-workflows/CUSTOM_WORKFLOW?create=true&name=${encodeURIComponent(trimmedName)}`,
    );
  };

  return (
    <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
      <ProtectedWrapper
        permissionCode="permission:form-config-manage"
        redirectTo="/dashboard"
      >
        <Wrapper>
          <div className="flex items-center justify-between">
            <StudioPageHeader
              name="Custom Workflows"
              description="Manage custom workflows"
            />
            <Button onClick={handleOpenCreateModal} size="sm">
              <Plus size={16} className="mr-2" />
              Create New Workflow
            </Button>
          </div>

          {/* <StudioTabHeaderControls /> */}

          <StudioWorkflowGrid
            forms={customWorkflows}
            isLoading={isLoadingCustom}
            emptyMessage="No custom workflows found"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isCustomTab={true}
            onCreateNew={handleOpenCreateModal}
          />

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
