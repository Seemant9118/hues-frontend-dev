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
