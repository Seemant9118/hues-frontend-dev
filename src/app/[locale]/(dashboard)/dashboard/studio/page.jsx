'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import StudioPageHeader from './components/StudioPageHeader';
import StudioTabHeaderControls from './components/StudioTabHeaderControls';
import StudioWorkflowGrid from './components/StudioWorkflowGrid';
import { useStudioSystemWorkflows } from './hooks/useStudioSystemWorkflows';

export default function StudioPage() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('system');

  const { systemForms, isLoadingSystem } = useStudioSystemWorkflows(activeTab);

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
            onValueChange={setActiveTab}
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
          </Tabs>
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
