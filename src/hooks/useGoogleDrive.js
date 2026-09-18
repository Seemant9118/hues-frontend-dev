import { usePermission } from '@/hooks/usePermissions';
import {
  listStorageIntegrations,
  startGoogleDriveConnect,
  uploadS3FileToDrive,
  uploadBulkFilesToDrive,
} from '@/services/Storage_Services/Storage_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useGoogleDrive = () => {
  const { hasPermission } = usePermission();
  const router = useRouter();

  const hasUploadPermission = hasPermission('permission:storage-upload');
  const hasManagePermission = hasPermission(
    'permission:storage-integration-manage',
  );

  const [popupWindow, setPopupWindow] = useState(null);

  // Fetch all storage integrations
  const {
    data: storageIntegrations,
    isLoading: isIntegrationsLoading,
    refetch: refetchIntegrations,
  } = useQuery({
    queryKey: ['list_storage_integrations'],
    queryFn: listStorageIntegrations,
    select: (data) => data?.data?.data || [],
  });

  const googleDriveIntegration = storageIntegrations?.find(
    (integration) => integration.provider === 'google_drive',
  );

  const isConnected =
    googleDriveIntegration?.status === 'connected' &&
    googleDriveIntegration?.enabled === true;

  // Polling logic when connecting via popup
  useEffect(() => {
    let interval;
    if (popupWindow && !popupWindow.closed) {
      interval = setInterval(() => {
        if (popupWindow.closed) {
          clearInterval(interval);
          setPopupWindow(null);
          refetchIntegrations();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [popupWindow, refetchIntegrations]);

  const authorizeMutation = useMutation({
    mutationFn: startGoogleDriveConnect,
    onSuccess: (res) => {
      const authUrl = res?.data?.data?.authorizationUrl;
      if (authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          authUrl,
          'Google Drive Connect',
          `width=${width},height=${height},left=${left},top=${top}`,
        );
        setPopupWindow(popup);
      }
    },
    onError: (error) => {
      if (error?.response?.data?.error === 'STORAGE_PROVIDER_UNAVAILABLE') {
        toast.error('Storage provider missing. Redirecting to settings...');
        router.push(
          '/dashboard/enterprise-profile/settings?tab=storageIntegrations',
        );
        return;
      }
      toast.error(
        error?.response?.data?.message ||
          'Failed to initiate Google Drive connection',
      );
    },
  });

  const authorize = useCallback(() => {
    if (!hasManagePermission) {
      toast.error('You do not have permission to manage storage integrations.');
      return;
    }
    authorizeMutation.mutate();
  }, [hasManagePermission, authorizeMutation]);

  const connect = useCallback(() => {
    router.push(
      '/dashboard/enterprise-profile/settings?tab=storageIntegrations',
    );
  }, [router]);

  const uploadMutation = useMutation({
    mutationFn: uploadS3FileToDrive,
    onSuccess: (res) => {
      toast.success('Uploaded to Google Drive');
      if (res?.data?.data?.webLink) {
        window.open(res.data.data.webLink, '_blank');
      }
    },
    onError: (error) => {
      if (error?.response?.data?.error === 'STORAGE_PROVIDER_UNAVAILABLE') {
        toast.error('Storage provider missing. Redirecting to settings...');
        router.push(
          '/dashboard/enterprise-profile/settings?tab=storageIntegrations',
        );
        return;
      }
      if (error?.response?.data?.error === 'STORAGE_INVALID_CREDENTIALS') {
        toast.error(
          'Google Drive session expired. Please reconnect in settings.',
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
            'Upload failed. Try again or contact support.',
        );
      }
    },
  });

  const upload = useCallback(
    (s3Url) => {
      if (!hasUploadPermission) {
        toast.error('You do not have permission to upload files.');
        return;
      }
      if (!s3Url) {
        toast.error(
          'File not found. Ensure the document is generated and attached.',
        );
        return;
      }
      uploadMutation.mutate(s3Url);
    },
    [hasUploadPermission, uploadMutation],
  );

  const bulkUploadMutation = useMutation({
    mutationFn: uploadBulkFilesToDrive,
    onSuccess: (res) => {
      const data = res?.data?.data;
      if (data?.failed === 0) {
        toast.success(
          `Successfully uploaded ${data.succeeded} file(s) to Google Drive`,
        );
      } else if (data?.succeeded > 0 && data?.failed > 0) {
        toast.warning(
          `Uploaded ${data.succeeded} file(s), but ${data.failed} failed.`,
        );
      } else {
        toast.error('Failed to upload files.');
      }
    },
    onError: (error) => {
      if (error?.response?.data?.error === 'STORAGE_PROVIDER_UNAVAILABLE') {
        toast.error('Storage provider missing. Redirecting to settings...');
        router.push(
          '/dashboard/enterprise-profile/settings?tab=storageIntegrations',
        );
        return;
      }
      if (error?.response?.data?.error === 'STORAGE_INVALID_CREDENTIALS') {
        toast.error(
          'Google Drive session expired. Please reconnect in settings.',
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
            'Bulk upload failed. Try again or contact support.',
        );
      }
    },
  });

  const bulkUpload = useCallback(
    (payload) => {
      if (!hasUploadPermission) {
        toast.error('You do not have permission to upload files.');
        return Promise.reject(new Error('Permission denied'));
      }
      if (!payload?.s3_urls?.length && !payload?.documents?.length) {
        toast.error('No valid files or documents selected for upload.');
        return Promise.reject(new Error('No files selected'));
      }
      return bulkUploadMutation.mutateAsync(payload);
    },
    [hasUploadPermission, bulkUploadMutation],
  );

  return {
    hasUploadPermission,
    hasManagePermission,
    googleDriveIntegration,
    isIntegrationsLoading,
    isConnected,
    connect,
    authorize,
    isConnecting: authorizeMutation.isPending || !!popupWindow,
    upload,
    isUploading: uploadMutation.isPending,
    bulkUpload,
    isBulkUploading: bulkUploadMutation.isPending,
    refetchIntegrations,
  };
};
