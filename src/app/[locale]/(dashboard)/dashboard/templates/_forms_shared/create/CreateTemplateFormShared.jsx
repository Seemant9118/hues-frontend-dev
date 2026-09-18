'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { FeatureFlagWrapper } from '@/components/wrappers/FeatureFlagWrapper';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import FormPlayground from '@/components/templates/FormPlayground';

export default function CreateTemplateFormShared({ backUrl }) {
  const searchParams = useSearchParams();
  const formType = searchParams.get('type') || 'CUSTOM';

  return (
    <FeatureFlagWrapper flag="BUILDER_FORMS" redirectTo="/dashboard">
      <ProtectedWrapper permissionCode="permission:form-config-manage">
        <Wrapper>
          <SubHeader name="Create New Form" />
          <div className="mt-4">
            <FormPlayground formType={formType} backUrl={backUrl} />
          </div>
        </Wrapper>
      </ProtectedWrapper>
    </FeatureFlagWrapper>
  );
}
