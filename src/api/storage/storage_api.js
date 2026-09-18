export const storageApi = {
  uploadToGoogleDrive: {
    endpoint: `/storage/uploads`,
    endpointKey: 'upload_google_drive',
  },
  bulkUploadToDrive: {
    endpoint: `/storage/uploads/bulk`,
    endpointKey: 'bulk_upload_drive',
  },
  googleDriveAuthorize: {
    endpoint: `/storage-integrations/google_drive/authorize`,
    endpointKey: 'google_drive_authorize',
  },
  listStorageIntegrations: {
    endpoint: `/storage-integrations`,
    endpointKey: 'list_storage_integrations',
  },
  validateGoogleDrive: {
    endpoint: `/storage-integrations/google_drive/validate`,
    endpointKey: 'validate_google_drive',
  },
  updateGoogleDriveConfig: {
    endpoint: `/storage-integrations/google_drive`,
    endpointKey: 'update_google_drive_config',
  },
  disconnectGoogleDrive: {
    endpoint: `/storage-integrations/google_drive`,
    endpointKey: 'disconnect_google_drive',
  },
};
