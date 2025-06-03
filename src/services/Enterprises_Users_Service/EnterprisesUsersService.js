import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { APIinstance } from '@/services';

// 1. post enterprise user data
export function CreateEnterpriseUser(data) {
  return APIinstance.post(enterpriseUser.createEnterpriseUser.endpoint, data);
}

// 2. get all enterprise users as a list
export function GetEnterpriseUsers(data) {
  return APIinstance.post(enterpriseUser.getEnterpriseUsers.endpoint, data);
}

// 3. get specific enterprise user through id
export function GetEnterpriseUser(enterpriseId) {
  return APIinstance.get(
    `${enterpriseUser.getEnterpriseUser.endpoint}${enterpriseId}`,
  );
}

// 4. edit specific enterprises user through id
export function UpdateEnterpriseUser(data, enterpriseId) {
  return APIinstance.put(
    `${enterpriseUser.updateEnterpriseUser.endpoint}${enterpriseId}`,
    data,
  );
}

// 5. delete specific enterprises user through id
export function DeleteEnterpriseUser({ enterpriseId }) {
  return APIinstance.delete(
    `${enterpriseUser.deleteEnterpriseUser.endpoint}${enterpriseId}`,
  );
}

// search enterprise
export function SearchEnterprise(identifier, identifierType) {
  return APIinstance.get(
    `${enterpriseUser.searchEnterprise.endpoint}?identifier=${identifier}&identifier_type=${identifierType}`,
  );
}

// create enterprise
export function CreateEnterprise(data) {
  return APIinstance.post(enterpriseUser.createEnterprise.endpoint, data);
}

// update enterprise after DIN verification
export function UpdateEnterpriseAfterDINVerification(id) {
  return APIinstance.put(
    `${enterpriseUser.updateEnterpriseAfterDINVerify.endpoint}${id}`,
  );
}

export function UpdateEnterprise({ id, data }) {
  return APIinstance.put(
    `${enterpriseUser.updateEnterprise.endpoint}${id}`,
    data,
  );
}

export function getEnterpriseById(id) {
  return APIinstance.get(`${enterpriseUser.getEnterprise.endpoint}${id}`);
}

export function updateEnterpriseIdentificationDetails(
  id,
  identifierType,
  identifierNum,
) {
  return APIinstance.post(
    `${enterpriseUser.updateEnterpriseIdentificationDetails.endpoint}${id}?identifierType=${identifierType}&identifier=${identifierNum}`,
  );
}

export function updateEnterpriseFields(data) {
  return APIinstance.patch(
    enterpriseUser.updateEnterpriseFields.endpoint,
    data,
  );
}
