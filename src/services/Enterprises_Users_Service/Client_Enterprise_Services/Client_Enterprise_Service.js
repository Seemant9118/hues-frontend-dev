import { client_enterprise } from "@/api/enterprises_user/client_enterprise/client_enterprise";
import { APIinstance } from "@/services";

export function createClient(data) {
  return APIinstance.post(
    client_enterprise.createClientEnterprise.endpoint,
    data
  );
}

export function updateClient(id, data) {
  return APIinstance.put(
    client_enterprise.updateClientEnterprise.endpoint + `${id}`,
    data
  );
}

export function deleteClient(id) {
  return APIinstance.delete(
    client_enterprise.deleteClientEnterprise.endpoint + `${id}`
  );
}

export function getClient(id) {
  return APIinstance.get(client_enterprise.getClient.endpoint + `${id}`);
}

export function getClients(id) {
  return APIinstance.get(client_enterprise.getClients.endpoint + `${id}`);
}
