export const userAuth = {
  userUpdateFields: {
    endpoint: `/iam/user/update-fields`,
    endpointKey: 'user_update',
  },
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

  // 13. verify din
  verifyDIN: {
    endpoint: `/iam/kyc/verify-din`,
    endpointKey: 'verify_din',
  },

  // 14. generateVerifyMailOTP
  generateMailOTP: {
    endpoint: `/iam/auth/email/generate_otp`,
    endpointKey: 'generate_Verify_Mail_otp',
  },

  // 15. verifyMailOTP
  verifyMailOTP: {
    endpoint: `/iam/auth/email/verify_otp`,
    endpointKey: 'verify_mail_OTP',
  },

  // 16. request exist or not
  requestExist: {
    endpoint: `/enterprise/invitation/requestexists`,
    endpointKey: 'request_exist',
  },

  // 17. create request
  createRequestAccess: {
    endpoint: `/enterprise/invitation/request`,
    endpointKey: 'create_request_access',
  },

  // 18. verifykycstatusandupdate
  verifykycstatusandupdate: {
    endpoint: '/iam/kyc/verifykycstatusandupdate',
    endpointKey: 'verify_kyc_status_update',
  },
  // 19. create user session
  createUserSession: {
    endpoint: `/iam/user/createusersession`,
    endpointKey: 'create_user_session',
  },
  // 20. swicthAccount
  switchAccount: {
    endpoint: `/iam/user/switchaccount`,
    endpointKey: 'switch_account',
  },
  // 21. getUserAccounts
  getUserAccounts: {
    endpoint: `/iam/user/getuseraccounts`,
    endpointKey: 'get_user_accounts',
  },
  // 22. getPanDetails
  getPanDetails: {
    endpoint: `/iam/user/pandetails`,
    endpointKey: 'get_pan_details',
  },
  // 23. sent aadhar verification otp
  sendAadharVerificationOTP: {
    endpoint: `/iam/kyc/send-aadhaar-otp`,
    endpointKey: 'aadhar_verification_otp',
  },
  // 24 verify aadhar otp
  verifyAadharOTP: {
    endpoint: `/iam/kyc/verify-aadhaar-otp`,
    endpointKey: 'verify_aadhar_otp',
  },

  // [NEW]
  // 25. getEnterpriseDetailsForPanVerify
  getEnterpriseDetailsForPanVerify: {
    endpoint: `/enterprise/getenterprisedetails`,
    endpointKey: 'get_enterprise_details_for_pan',
  },

  // 26. gstVerify
  gstVerify: {
    endpoint: `/enterprise/verifygst`,
    endpointKey: 'verify_gst',
  },

  // 27. cin verify
  cinVerify: {
    endpoint: `/enterprise/verify-cin-or-llpin`,
    endpointKey: 'verify_cin',
  },

  // 28. udyam verify
  udyamVerify: {
    endpoint: `/enterprise/verifyudyam`,
    endpointKey: 'verify_udyam',
  },

  // 29. getEnterpriseDetailsFromEnterpriseId
  getEnterpriseDetailsFromEnterpriseId: {
    endpoint: `/enterprise/getenterprisedetails`,
    endpointKey: 'get_enterprise_details_from_Id',
  },

  // 30. getOnboardingStatus
  getOnboardingStatus: {
    endpoint: `/enterprise/getonboardingstatus`,
    endpointKey: 'get_onboarding_status',
  },

  // 31. addAnotherEnterprise
  addAnotherEnterprise: {
    endpoint: `/enterprise/addanotherenterprise`,
    endpointKey: 'get_add_another_enterprises',
  },
};
