'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import FormPlayground from '@/components/templates/FormPlayground';

import { DeveloperModeWrapper } from '@/components/wrappers/DeveloperModeWrapper';

export default function CreateStudioFormPage() {
  const searchParams = useSearchParams();
  const formType = searchParams.get('type') || 'CUSTOM';

  return (
    <DeveloperModeWrapper redirectTo="/dashboard">
      <FeatureFlagWrapper flag="BUILDER_STUDIO" redirectTo="/dashboard">
        <ProtectedWrapper permissionCode="permission:form-config-manage">
          <Wrapper>
            <SubHeader name="Create New Studio Form" />
            <div className="mt-4">
              <FormPlayground formType={formType} backUrl="/dashboard/studio" />
            </div>
          </Wrapper>
        </ProtectedWrapper>
      </FeatureFlagWrapper>
    </DeveloperModeWrapper>
  );
}
