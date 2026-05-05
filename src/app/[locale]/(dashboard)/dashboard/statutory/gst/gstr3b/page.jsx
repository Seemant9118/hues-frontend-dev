'use client';

import Wrapper from '@/components/wrappers/Wrapper';
import Gstr3bForm from '@/components/statutory/gstr3b/Gstr3bForm';
import { useSearchParams } from 'next/navigation';

const GSTR3B = () => {
  const searchParams = useSearchParams();
  const period = searchParams.get('period');

  return (
    <Wrapper className="h-screen bg-white">
      <Gstr3bForm period={period} />
    </Wrapper>
  );
};

export default GSTR3B;
