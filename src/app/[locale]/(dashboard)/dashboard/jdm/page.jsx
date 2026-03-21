'use client';

import { Button } from '@/components/ui/button';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { GitGraph } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const JdmEditor = dynamic(() => import('@/components/jdm/JdmEditorClient'), {
  ssr: false,
});

export default function Page() {
  const [isJDMEditorOpen, setIsJDMEditorOpen] = useState(false);
  return (
    <Wrapper>
      <SubHeader name="JDM Editor">
        <div className="flex items-center gap-2">
          {!isJDMEditorOpen && (
            <Button size="sm" onClick={() => setIsJDMEditorOpen(true)}>
              <GitGraph size={16} />
              Create JDM
            </Button>
          )}
        </div>
      </SubHeader>
      {isJDMEditorOpen && (
        <JdmEditor onCancel={() => setIsJDMEditorOpen(false)} />
      )}
      {!isJDMEditorOpen && (
        <div style={{ height: 'calc(100vh - 80px)', width: '100%' }}>
          <EmptyStageComponent
            heading="No JDM available"
            subHeading="Click the button below to create a new JDM"
            actionBtn={
              <Button size="sm" onClick={() => setIsJDMEditorOpen(true)}>
                <GitGraph size={16} />
                Create JDM
              </Button>
            }
          />
        </div>
      )}
    </Wrapper>
  );
}
