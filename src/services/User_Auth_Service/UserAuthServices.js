import { userAuth } from '@/api/user_auth/Users';
import { APIinstance } from '@/services';

// 1. generate otp
export function userGenerateOtp(data) {
  return APIinstance.post(userAuth.loginGenerateOtp.endpoint, data);
}

// 2. verify otp
export function userVerifyOtp(data) {
  return APIinstance.post(userAuth.loginVerifyOtp.endpoint, data);
}

// 3. Update User
export function userUpdate(data) {
  return APIinstance.put(userAuth.updateUser.endpoint, data);
}

// 4. Create KYC Request
export function createKYCRequest(id) {
  return APIinstance.post(userAuth.createKYC.endpoint, {
    user_id: id,
  });
}

// 5. check KYC status
export function checkKYCstatus(data) {
  return APIinstance.post(userAuth.statucKYC.endpoint, data);
}

// 7. update enterprise Onboarding
export function updateEnterpriseOnboarding(id, data) {
  return APIinstance.put(
    `${userAuth.updateEnterpriseOnboarding.endpoint}${id}`,
    data,
  );
}
// 8.login With Invitation
export function loginWithInvitation(data) {
  return APIinstance.post(userAuth.loginWithInvitation.endpoint, data);
}

// 9. get User By Id
export function getUserById(id) {
  return APIinstance.get(`${userAuth.getUserById.endpoint}${id}`);
}

// 10. get Profile Details
export function getProfileDetails(id) {
  return APIinstance.get(`${userAuth.getProfileDetails.endpoint}${id}`);
}

// 11. generate Verify Sign OTP
export function generateSignOTP() {
  return APIinstance.post(userAuth.generateVerifySignOTP.endpoint);
}

// 12 . logging out
export function LoggingOut() {
  return APIinstance.post(userAuth.logout.endpoint);
}

// 13. verify DIN
export function VerifyDIN(data) {
  return APIinstance.post(userAuth.verifyDIN.endpoint, data);
}

// 14. generate Mail OTP
export function generateMailOTP(data) {
  return APIinstance.post(userAuth.generateMailOTP.endpoint, data);
}

// 15. verify Mail OTP
export function verifyMailOTP(data) {
  return APIinstance.post(userAuth.verifyMailOTP.endpoint, data);
}

// 16. request exist
export function requestExist(data) {
  return APIinstance.post(userAuth.requestExist.endpoint, data);
}

// 17. create request to access
export function createRequestAccess(data) {
  return APIinstance.post(userAuth.createRequestAccess.endpoint, data);
}

// 18 .verifyKYCstatusandUpdate
export function verifyKYCstatusandUpdate() {
  return APIinstance.post(userAuth.verifykycstatusandupdate.endpoint);
}
