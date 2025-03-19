export const pinSettings = {
  createPIN: {
    endpoint: `/iam/user/createpin`,
    endpointKey: 'createPIN',
  },
  updatePIN: {
    endpoint: `/iam/user/updatepin`,
    endpointKey: 'updatePIN',
  },
  generateOTP: {
    endpoint: `/iam/auth/forgotpin/mobile/generate_otp`,
    endpointKey: 'generate_OTP',
  },
  verifyOTP: {
    endpoint: `/iam/auth/forgotpin/verify_otp`,
    endpointKey: 'verify_OTP',
  },
  checkPINStatus: {
    endpoint: `/iam/user/pin/status`,
    endpointKey: 'check_pin_status',
  },
  resetPIN: {
    endpoint: `/iam/user/resetpin`,
    endpointKey: 'reset_pin',
  },
};
