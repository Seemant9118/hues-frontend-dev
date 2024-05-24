import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import { APIinstance } from "@/services";

// 1. post enterprise user data
export function CreateEnterpriseUser(data) {
  return APIinstance.post(enterprise_user.createEnterpriseUser.endpoint, data);
}

// 2. get all enterprise users as a list
export function GetEnterpriseUsers(data) {
  return APIinstance.post(enterprise_user.getEnterpriseUsers.endpoint, data);
}

// 3. get specific enterprise user through id
export function GetEnterpriseUser(enterprise_id) {
  return APIinstance.get(
    enterprise_user.getEnterpriseUser.endpoint + `${enterprise_id}`
  );
}

// 4. edit specific enterprises user through id
export function UpdateEnterpriseUser(data, enterprise_id) {
  return APIinstance.put(
    enterprise_user.updateEnterpriseUser.endpoint + `${enterprise_id}`,
    data
  );
}

// 5. delete specific enterprises user through id
export function DeleteEnterpriseUser(enterprise_id) {
  return APIinstance.delete(
    enterprise_user.deleteEnterpriseUser.endpoint + `${enterprise_id}`
  );
}
