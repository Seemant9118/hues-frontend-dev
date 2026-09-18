'use client';

import React from 'react';
import SubHeader from '@/components/ui/Sub-header';

export default function StudioPageHeader({ name, description }) {
  return (
    <div className="mb-4 flex flex-col gap-1">
      <SubHeader name={name} />
      {description && <p className="text-xs text-neutral-500">{description}</p>}
    </div>
  );
}
