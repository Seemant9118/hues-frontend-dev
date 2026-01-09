import { EyeOff, FileText, Mail, Pencil, User } from 'lucide-react';
import React from 'react';

/* Reusable row item */
const Item = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-gray-500" />
    <span className="font-medium">{label}:</span>
    <span className="truncate">{value || '-'}</span>
  </div>
);

const EwbConfigDetails = ({
  config,
  setIsEWBConfigAdded,
  setEditedEWBConfig,
}) => {
  if (!config) return null;

  return (
    <div className="w-full rounded-sm border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary">
          E-Way Bill Configuration
        </h2>

        <button
          onClick={() => {
            setIsEWBConfigAdded(true);
            setEditedEWBConfig(config);
          }}
          className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-black hover:bg-black hover:text-white hover:underline"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm text-gray-600">
        {/* <Item icon={KeyRound} label="Client ID" value={config.clientId} />

        <Item icon={EyeOff} label="Client Secret" value="••••••••••" /> */}

        <Item icon={User} label="Username" value={config.username} />

        <Item icon={EyeOff} label="Password" value="••••••••••" />

        <Item icon={FileText} label="GSTIN" value={config.gstin} />

        <Item icon={Mail} label="Registered Email" value={config.email} />
      </div>
    </div>
  );
};

export default EwbConfigDetails;
