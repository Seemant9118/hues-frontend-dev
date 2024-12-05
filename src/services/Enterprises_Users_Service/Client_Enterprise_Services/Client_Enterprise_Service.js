import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { APIinstance } from '@/services';

export function createClient(data) {
  return APIinstance.post(
    clientEnterprise.createClientEnterprise.endpoint,
    data,
  );
}

export function updateClient(id, data) {
  return APIinstance.put(
    `${clientEnterprise.updateClientEnterprise.endpoint}${id}`,
    data,
  );
}

export function deleteClient({ id }) {
  return APIinstance.delete(
    `${clientEnterprise.deleteClientEnterprise.endpoint}${id}`,
  );
}

export function getClient(id) {
  return APIinstance.get(`${clientEnterprise.getClient.endpoint}${id}`);
}

export function getClients(id) {
  return APIinstance.get(`${clientEnterprise.getClients.endpoint}${id}`);
}

export function bulkUploadClients(data) {
  return APIinstance.post(clientEnterprise.bulkUploadClients.endpoint, data);
}

export function getClientSampleFile() {
  return APIinstance.get(clientEnterprise.getClientSample.endpoint);
}
