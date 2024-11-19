import Image from 'next/image';
import React from 'react';
import RestrictedImage from '../../../public/RestrictedEmtpy.png';
import Wrapper from '../wrappers/Wrapper';
import { Button } from './button';
import Tooltips from '../auth/Tooltips';

const RestrictedComponent = () => {
  return (
    <Wrapper className="h-full py-2">
      <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-md border">
        <Image src={RestrictedImage} height={30} width={100} alt="empty-icon" />
        <h1 className="text-xl font-bold">You don’t have the access</h1>
        <p className="text-[#A0A0A0]">
          Your request for access has not been approved yet
        </p>
        <div className="flex gap-2">
          <Tooltips
            trigger={
              <Button size="sm" disabled variant="blue_outline">
                Switch Enterprise
              </Button>
            }
            content={'This feature is Coming Soon...'}
          />

          <Tooltips
            trigger={
              <Button size="sm" disabled variant="blue_outline">
                Resend Request
              </Button>
            }
            content={'This feature is Coming Soon...'}
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default RestrictedComponent;
