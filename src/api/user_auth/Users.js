export const userAuth = {
  // 1. generate OTP
  loginGenerateOtp: {
    endpoint: `/iam/auth/login/mobile/generate_otp`,
    endpointKey: 'login_generate_otp',
  },
  // 2. verify OTP
  loginVerifyOtp: {
    endpoint: `/iam/auth/login/mobile/verify_otp`,
    endpointKey: 'login_verify_otp',
  },
  //  3. Update User
  updateUser: {
    endpoint: `/iam/user/update`,
    endpointKey: 'update_user_data',
  },
  // 4. create KYC
  createKYC: {
    endpoint: `/iam/kyc/createrequest`,
    endpointKey: 'create_user_kyc',
  },
  // 5. CheckStatus isKyc
  statucKYC: {
    endpoint: `/iam/kyc/checkstatus`,
    endpointKey: 'status_kyc',
  },
  // 6. update KYC
  updateKYC: {
    endpoint: `/iam/kyc/updateKyc`,
    endpointKey: 'update_kyc',
  },
  // 7. Update Enterprise Onboarding
  updateEnterpriseOnboarding: {
    endpoint: `/enterprise/update/`,
    endpointKey: 'update_enterpriseOnboarding',
  },
  // 8.login With Invitation
  loginWithInvitation: {
    endpoint: `/iam/auth/login/invitation/generate_otp`,
    endpointKey: 'login_with_Invitation_generateOTP',
  },
  // 9. get user by ID
  getUserById: {
    endpoint: `/iam/user/get/`,
    endpointKey: 'get_User_by_id',
  },
  // 10. getProfileDetails
  getProfileDetails: {
    endpoint: `/iam/user/userdetails/`,
    endpointKey: 'get_profile_details',
  },
  // 11. generateVerifySignOTP
  generateVerifySignOTP: {
    endpoint: `/iam/auth/verifysignature/generateotp`,
    endpointKey: 'generate_verify_sign_otp',
  },
  // 12. logout
  logout: {
    endpoint: `/iam/auth/logout`,
    endpointKey: 'logging_out',
  },
};
