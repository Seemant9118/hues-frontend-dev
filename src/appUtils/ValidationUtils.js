const validationPatterns = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format: ABCDE1234F
  aadhaar: /^[2-9]{1}[0-9]{11}$/, // Aadhaar: 12-digit number not starting with 0 or 1
};

export const validatePhoneNumber = (mobileNumber) => {
  if (mobileNumber?.length === 0) {
    return 'components.validationUtils.phone.required';
  } else if (mobileNumber?.length !== 10) {
    return 'components.validationUtils.phone.invalid';
  }
  return '';
};

export const validatePan = (panNumber) => {
  if (!panNumber || panNumber.trim() === '') {
    return 'components.validationUtils.pan.required';
  } else if (!validationPatterns.pan.test(panNumber)) {
    return 'components.validationUtils.pan.invalid';
  }
  return '';
};

export const validateAadhaar = (aadhaarNumber) => {
  if (!aadhaarNumber || aadhaarNumber.trim() === '') {
    return 'components.validationUtils.aadhaar.required';
  } else if (!validationPatterns.aadhaar.test(aadhaarNumber)) {
    return 'components.validationUtils.aadhaar.invalid';
  }
  return '';
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return 'components.validationUtils.name.required';
  }
  return '';
};

export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth || dateOfBirth.trim() === '') {
    return 'components.validationUtils.dob.required';
  }
  return '';
};

export const validateTermsAndConditions = (isTermsAndConditionApplied) => {
  return isTermsAndConditionApplied
    ? ''
    : 'components.validationUtils.terms.required';
};

export const validateEnterpriseType = (enterpriseType) => {
  if (!enterpriseType || enterpriseType.trim() === '') {
    return 'components.validationUtils.enterprise.type.required';
  }
  return '';
};

export const validateEnterpriseName = (enterpriseName) => {
  if (!enterpriseName || enterpriseName.trim() === '') {
    return 'components.validationUtils.enterprise.name.required';
  }
  return '';
};

export const validatePinCode = (pinCode) => {
  if (!pinCode || pinCode.trim() === '') {
    return 'components.validationUtils.enterprise.pincode.required';
  } else if (pinCode.length !== 6) {
    return 'components.validationUtils.enterprise.pincode.invalid';
  }
  return '';
};

export const validateEnterpriseAddress = (enterpriseAddress) => {
  if (!enterpriseAddress || enterpriseAddress.trim() === '') {
    return 'components.validationUtils.enterprise.address.required';
  }
  return '';
};

export const validateDateOfIncorporation = (dateOfIncorporation) => {
  if (!dateOfIncorporation || dateOfIncorporation.trim() === '') {
    return 'components.validationUtils.enterprise.dateOfIncorporation.required';
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return 'components.validationUtils.email.required';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return 'components.validationUtils.email.invalid';
  }
  return '';
};
