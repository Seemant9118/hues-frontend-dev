'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import FormPlayground from '@/components/templates/FormPlayground';
import SubHeader from '@/components/ui/Sub-header';
import { DeveloperModeWrapper } from '@/components/wrappers/DeveloperModeWrapper';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';

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
