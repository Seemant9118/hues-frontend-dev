'use client';

import Gstr3bForm from '@/components/statutory/gstr3b/Gstr3bForm';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { useSearchParams } from 'next/navigation';

const GSTR3B = () => {
  const searchParams = useSearchParams();
  const period = searchParams.get('period');

  return (
    <ProtectedWrapper permissionCode="permission:gst-view">
      <Wrapper className="h-screen bg-white">
        <Gstr3bForm period={period} />
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default GSTR3B;
