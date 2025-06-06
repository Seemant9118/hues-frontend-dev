import { userAuth } from '@/api/user_auth/Users';
import { APIinstance } from '@/services';

export function userUpdateFields(data) {
  return APIinstance.patch(userAuth.userUpdateFields.endpoint, data);
}

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

// 19. create user session
export function createUserSession({ data }) {
  return APIinstance.post(userAuth.createUserSession.endpoint, data);
}

// 20. switch accounts
export function switchAccount(data) {
  return APIinstance.post(userAuth.switchAccount.endpoint, data);
}

// 21. getUserAccounts
export function getUserAccounts() {
  return APIinstance.get(userAuth.getUserAccounts.endpoint);
}

// 22. getPanDetails
export function getPanDetails(data) {
  return APIinstance.post(userAuth.getPanDetails.endpoint, data);
}

// 23. sent Aadhar OTP
export function sentAadharOTP(data) {
  return APIinstance.post(userAuth.sendAadharVerificationOTP.endpoint, data);
}

// 24. verify Aadhar OTP
export function verifyAadharOTP(data) {
  return APIinstance.post(userAuth.verifyAadharOTP.endpoint, data);
}
// [NEW]
// 25. getEnterpriseDetailsForPanVerify
export function getEnterpriseDetailsForPanVerify(data) {
  return APIinstance.post(
    userAuth.getEnterpriseDetailsForPanVerify.endpoint,
    data,
  );
}

// 26. gstVerify
export function gstVerify(data) {
  return APIinstance.post(userAuth.gstVerify.endpoint, data);
}

// 27. cinVerify
export function cinVerify(data) {
  return APIinstance.post(userAuth.cinVerify.endpoint, data);
}

// 28. udyamVerify
export function udyamVerify(data) {
  return APIinstance.post(userAuth.udyamVerify.endpoint, data);
}

// 29. getEnterpriseDetailsFromEnterpriseId
export function getEnterpriseDetailsFromEnterpriseId(id) {
  return APIinstance.post(
    userAuth.getEnterpriseDetailsFromEnterpriseId.endpoint,
    id,
  );
}

// 30. getOnboardingStatus
export function getOnboardingStatus(data) {
  return APIinstance.post(userAuth.getOnboardingStatus.endpoint, data);
}

// 31. addAnotherEnterprise
export function addAnotherEnterprise() {
  return APIinstance.post(userAuth.addAnotherEnterprise.endpoint);
}
