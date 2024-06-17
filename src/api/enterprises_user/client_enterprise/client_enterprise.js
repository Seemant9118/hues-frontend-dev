export const clientEnterprise = {
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
};
