import React from 'react';
import { ProtectedWrapper } from '../wrappers/ProtectedWrapper';

const Container = ({
  title = 'title',
  granularityComp,
  dateRangeComp,
  children,
}) => {
  return (
    <ProtectedWrapper permissionCode={'permission:view-dashboard'}>
      <section className="w-full rounded-md border p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base font-semibold sm:text-lg">{title}</p>
          <div className="flex gap-2">
            <div className="w-full sm:w-auto">{dateRangeComp}</div>
            <div className="w-full sm:w-auto">{granularityComp}</div>
          </div>
        </div>

        <div className="mt-4 flex w-full flex-col gap-4">
          <div className="h-full w-full">{children}</div>
        </div>
      </section>
    </ProtectedWrapper>
  );
};

export default Container;
