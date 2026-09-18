'use client';

import React, { useState } from 'react';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import StudioPageHeader from '../components/StudioPageHeader';
import StudioWorkflowGrid from '../components/StudioWorkflowGrid';
import { useStudioSystemWorkflows } from '../hooks/useStudioSystemWorkflows';

export default function SystemWorkflowsPage() {
  const [activeMenu, setActiveMenu] = useState(null);

  const { systemForms, isLoadingSystem } = useStudioSystemWorkflows('system');

  return (
    <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
      <ProtectedWrapper
        permissionCode="permission:form-config-manage"
        redirectTo="/dashboard"
      >
        <Wrapper>
          <StudioPageHeader
            name="System Workflows"
            description="Manage system form configurations"
          />

          {/* <StudioTabHeaderControls /> */}

          <StudioWorkflowGrid
            forms={systemForms}
            isLoading={isLoadingSystem}
            emptyMessage="No system forms found"
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
