'use client';

import React from 'react';
import SubHeader from '@/components/ui/Sub-header';

export default function StudioPageHeader() {
  return (
    <>
      <SubHeader name="Studio (Workflows)" />
      <p className="mb-4 text-xs text-neutral-500">
        Manage system form configurations and custom dynamic forms for your
        workspace.
      </p>
    </>
  );
}
