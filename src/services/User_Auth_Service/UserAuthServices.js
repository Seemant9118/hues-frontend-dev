import { user_Auth } from "@/api/user_auth/Users";
import { APIinstance } from "@/services";

// 1. generate otp
export function userGenerateOtp(data) {
  return APIinstance.post(user_Auth.loginGenerateOtp.endpoint, data);
}

// 2. verify otp
export function userVerifyOtp(data) {
  return APIinstance.post(user_Auth.loginVerifyOtp.endpoint, data);
}

// 3. Update User
export function userUpdate(data) {
  return APIinstance.put(user_Auth.updateUser.endpoint, data);
}

// 4. Create KYC Request
export function createKYCRequest(id) {
  return APIinstance.post(user_Auth.createKYC.endpoint, {
    user_id: id,
  });
}

// 5. check KYC status
export function checkKYCstatus(data) {
  return APIinstance.post(user_Auth.statucKYC.endpoint, data);
}

// 7. update enterprise Onboarding
export function updateEnterpriseOnboarding(id, data) {
  return APIinstance.put(
    user_Auth.updateEnterpriseOnboarding.endpoint + `${id}`,
    data
  );
}
// 8.login With Invitation
export function loginWithInvitation(data) {
  return APIinstance.post(user_Auth.loginWithInvitation.endpoint, data);
}
