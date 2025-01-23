import React from 'react';

const AuthProgress = ({ AuthProgressData }) => {
  return (
    <div className="flex w-full justify-center gap-6">
      {AuthProgressData?.map((data) => (
        <div key={data.id} className="flex flex-col items-center gap-2 text-xs">
          <span
            className={
              data.isDone
                ? 'rounded-full bg-primary p-2 text-white'
                : 'rounded-full bg-gray-300 p-2'
            }
          >
            {data.icon}
          </span>
          <span className="font-bold">{data.title}</span>
          <span className="text-gray-600">{data.time}</span>
        </div>
      ))}
    </div>
  );
};

export default AuthProgress;
