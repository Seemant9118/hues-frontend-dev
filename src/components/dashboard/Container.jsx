import React from 'react';
import { ProtectedWrapper } from '../wrappers/ProtectedWrapper';

const Container = ({ title = 'title', dateRangeComp, children }) => {
  return (
    <ProtectedWrapper permissionCode={'permission:view-dashboard'}>
      <section className="w-full rounded-md border p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-semibold sm:text-lg">{title}</p>
          <div className="w-full sm:w-auto">{dateRangeComp}</div>
        </div>

        <div className="mt-4 flex w-full flex-col gap-4">
          <div className="h-full w-full">{children}</div>
        </div>
      </section>
    </ProtectedWrapper>
  );
};

export default Container;
