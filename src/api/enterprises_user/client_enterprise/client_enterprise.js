export const clientEnterprise = {
  // 0.  searched clients
  searchClients: {
    endpoint: `/enterprise/client/searchclient`,
    endpointKey: 'searched_clients',
  },
  // 1. create client_enterprise
  createClientEnterprise: {
    endpoint: `/enterprise/client/create`,
    endpointKey: 'create_client',
  },
  //   2. update client_enterprise
  updateClientEnterprise: {
    endpoint: `/enterprise/client/update/`,
    endpointKey: 'update_client',
  },
  //   3. delete client_enterprise
  deleteClientEnterprise: {
    endpoint: `/enterprise/client/delete/`,
    endpointKey: 'delete_client',
  },
  //   4. get client by id
  getClient: {
    endpoint: `/enterprise/client/`,
    endpointKey: 'get_client',
  },
  //   5. get client list
  getClients: {
    endpoint: `/enterprise/client/`,
    endpointKey: 'get_clients',
  },
  // 6. bulk upload clients
  bulkUploadClients: {
    endpoint: `/enterprise/client/create/bulk`,
    endpointKey: 'upload_bulk_clients',
  },
  // 7. getClientSampleFile
  getClientSample: {
    endpoint: `/enterprise/client/downloadsamplefile`,
    endpointKey: 'get_client_sample_file',
  },
};
