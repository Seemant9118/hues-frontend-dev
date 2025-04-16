import { Banknote, Building2, Hash, MapPin } from 'lucide-react';
import React from 'react';

const AccountDetails = ({ account }) => {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {account.accountHolderName}
        </h2>

        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
          Verified
        </span>
      </div>
      <div className="space-y-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <span className="font-medium">Bank:</span>
          <span>{account.bankName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-medium">Account No:</span>
          <span>{account.maskedAccountNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-gray-500" />
          <span className="font-medium">IFSC:</span>
          <span>{account.ifscCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="font-medium">Branch:</span>
          <span>{account.branchName}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
