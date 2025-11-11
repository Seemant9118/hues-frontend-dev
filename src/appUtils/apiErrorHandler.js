export const apiErrorHandler = (error) => {
  const errorStatus = error.response.data.error;

  const errorMapping = {
    OTP_NOT_SENT: 'otpNotSent',
    INVALID_OTP: 'invalidOtp',
    PAN_VERIFICATION_REQUEST_FAILED: 'panVerificationRequestFailed',
    AADHAR_VERIFICATION_REQUEST_FAILED: 'aadhaarVerificationRequestFailed',
    RPACPC_SERVER_UNRESPONSIVE_ERROR: 'rpacpcServerUnresponsiveError',
    SUREPASS_SERVER_UNRESPONSIVE_ERROR: 'surepassServerUnresponsiveError',
    INVALID_USER_PAN: 'invalidUserPan',
    INVALID_ENTERPRISE_PAN: 'invalidEnterprisePan',
    INVALID_GST: 'invalidGst',
    RPACAC_GST_VERIFICATION_REQUEST_FAILED:
      'rpacacGstVerificationRequestFailed',
    GST_DETAILS_NOT_MATCHING: 'gstDetailsNotMatching',
    CIN_OR_LLPIN_DETAILS_NOT_MATCHING: 'cinOrLlpInDetailsNotMatching',
    UDYAM_DETAILS_NOT_MATCHING: 'udyamDetailsNotMatching',
    INVALID_CIN_OR_LLP: 'invalidCinOrLlp',
    INVALID_UDYAM: 'invalidUdyam',
    INVALID_AADHAR: 'invalidAadhaar',
    INVALID_AADHAR_OTP: 'invalidAadhaarOtp',
    AADHAAR_MOBILE_MISMATCH: 'aadhaarMobileMismatch',
    INVALID_PIN: 'invalidPin',
    PINCODE_NOT_FOUND: 'pincodeNotFound',
    USER_ALREADY_EXISTS: 'userAlreadyExists',
    GENERIC_ERROR: 'genericError',
  };

  return errorMapping[errorStatus] || errorMapping.GENERIC_ERROR;
};
