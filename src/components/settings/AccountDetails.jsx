import React from 'react';

const AccountDetails = ({ account }) => {
  return (
    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-md">
      <h2 className="mb-2 text-lg font-semibold text-gray-800">
        {account.accountHolderName}
      </h2>
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-medium">Bank:</span> {account.bankName}
        </p>
        <p>
          <span className="font-medium">Account No:</span>{' '}
          {account.maskedAccountNumber}
        </p>
        <p>
          <span className="font-medium">IFSC:</span> {account.ifscCode}
        </p>
        <p>
          <span className="font-medium">Branch:</span> {account.branchName}
        </p>
      </div>
    </div>
  );
};

export default AccountDetails;
