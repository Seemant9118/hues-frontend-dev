import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import {
  validateGoogleDriveConnection,
  updateGoogleDriveConfig,
  disconnectGoogleDrive,
} from '@/services/Storage_Services/Storage_Services';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Loading from '@/components/ui/Loading';

export default function StorageSettings() {
  const {
    hasManagePermission,
    googleDriveIntegration,
    isIntegrationsLoading,
    isConnected,
    authorize,
    isConnecting,
    refetchIntegrations,
  } = useGoogleDrive();

  const validateMutation = useMutation({
    mutationFn: validateGoogleDriveConnection,
    onSuccess: () => {
      toast.success('Connection validated successfully!');
      refetchIntegrations();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Validation failed. Please reconnect.',
      );
      refetchIntegrations();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateGoogleDriveConfig,
    onSuccess: () => {
      toast.success('Configuration updated!');
      refetchIntegrations();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to update configuration.',
      );
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogleDrive,
    onSuccess: () => {
      toast.success('Disconnected from Google Drive.');
      refetchIntegrations();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to disconnect.');
    },
  });

  if (!hasManagePermission) {
    return (
      <div className="rounded-md border p-4">
        <p className="font-bold text-red-500">
          You do not have permission to manage storage integrations.
        </p>
      </div>
    );
  }

  if (isIntegrationsLoading) {
    return <Loading />;
  }

  const handleToggleEnable = (checked) => {
    updateMutation.mutate({ enabled: checked });
  };

  const handleValidate = () => {
    validateMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex w-full items-center justify-between gap-2 rounded-md border p-4">
        <div className="flex flex-col items-start gap-1 text-sm">
          <p className="font-bold">Google Drive Integration</p>
          <p className="text-gray-400">
            Connect your Google Drive to directly upload and store generated
            PDFs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {!googleDriveIntegration ||
          googleDriveIntegration.status === 'disabled' ? (
            <Button
              onClick={authorize}
              disabled={isConnecting}
              className="font-bold"
            >
              {isConnecting ? 'Connecting...' : 'Connect Google Drive'}
            </Button>
          ) : null}
        </div>
      </div>

      {googleDriveIntegration &&
        googleDriveIntegration.status !== 'disabled' && (
          <div className="flex flex-col gap-4 rounded-md border p-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-lg font-bold">Google Drive Configuration</p>
                <p className="text-sm text-gray-500">
                  Manage your active connection settings.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span>Enable Integration</span>
                <Switch
                  checked={googleDriveIntegration.enabled}
                  onCheckedChange={handleToggleEnable}
                  disabled={updateMutation.isPending}
                />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 text-gray-500">Status</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold ${
                    isConnected
                      ? 'bg-green-100 text-green-700'
                      : googleDriveIntegration.status === 'error'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {googleDriveIntegration.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Connected Email</p>
                <p className="font-medium">
                  {googleDriveIntegration.config?.connectedEmail || 'N/A'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Folder</p>
                <p className="font-medium">
                  {googleDriveIntegration.config?.folderName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Last Validated</p>
                <p className="font-medium">
                  {googleDriveIntegration.lastValidatedAt
                    ? new Date(
                        googleDriveIntegration.lastValidatedAt,
                      ).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>

            {googleDriveIntegration.status === 'error' && (
              <div className="mt-2 rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">
                Error:{' '}
                {googleDriveIntegration.lastErrorMessage || 'Unknown Error'}
              </div>
            )}

            <div className="mt-4 flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending
                  ? 'Validating...'
                  : 'Validate Connection'}
              </Button>

              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending
                  ? 'Disconnecting...'
                  : 'Disconnect'}
              </Button>

              {googleDriveIntegration.status === 'error' && (
                <Button
                  variant="default"
                  onClick={authorize}
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Reconnecting...' : 'Reconnect'}
                </Button>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
