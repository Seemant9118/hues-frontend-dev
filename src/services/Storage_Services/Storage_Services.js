import { storageApi } from '@/api/storage/storage_api';
import { APIinstance } from '@/services';

export const uploadS3FileToDrive = (s3Url) => {
  return APIinstance.post(storageApi.uploadToGoogleDrive.endpoint, {
    s3_url: s3Url,
    provider: 'google_drive',
  });
};

export const uploadBulkFilesToDrive = (payload) => {
  return APIinstance.post(storageApi.bulkUploadToDrive.endpoint, payload);
};

export const startGoogleDriveConnect = () => {
  return APIinstance.post(storageApi.googleDriveAuthorize.endpoint);
};

export const listStorageIntegrations = () => {
  return APIinstance.get(storageApi.listStorageIntegrations.endpoint);
};

export const validateGoogleDriveConnection = () => {
  return APIinstance.post(storageApi.validateGoogleDrive.endpoint);
};

export const updateGoogleDriveConfig = (data) => {
  // data can be { enabled: true/false } or { isDefault: true }
  return APIinstance.patch(storageApi.updateGoogleDriveConfig.endpoint, data);
};

export const disconnectGoogleDrive = () => {
  return APIinstance.delete(storageApi.disconnectGoogleDrive.endpoint);
};
