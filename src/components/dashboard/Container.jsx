import React from 'react';
import { ProtectedWrapper } from '../wrappers/ProtectedWrapper';

const Container = ({ title = 'title', children }) => {
  return (
    <ProtectedWrapper permissionCode={'permission:view-dashboard'}>
      <div className="h-fit w-full rounded-md border p-2">
        <p className="text-lg font-semibold">{title}</p>
        <div className="flex h-full w-full flex-col items-center justify-center gap-2">
          {children}
        </div>
      </div>
    </ProtectedWrapper>
  );
};

export default Container;
