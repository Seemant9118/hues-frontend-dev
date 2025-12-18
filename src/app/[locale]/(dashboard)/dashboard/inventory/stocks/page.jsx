import ComingSoon from '@/components/ui/ComingSoon';
import Wrapper from '@/components/wrappers/Wrapper';
import React from 'react';

const page = () => {
  return (
    <Wrapper className="flex h-full flex-col py-2">
      <ComingSoon />
    </Wrapper>
  );
};

export default page;
