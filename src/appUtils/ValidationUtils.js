const validationPatterns = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, // PAN format: ABCDE1234F
  aadhaar: /^[2-9]{1}[0-9]{11}$/, // Aadhaar: 12-digit number not starting with 0 or 1
};

export const validatePhoneNumber = (mobileNumber) => {
  if (mobileNumber?.length === 0) {
    return '*Phone Number is required to proceed';
  } else if (mobileNumber?.length !== 10) {
    return '*Please enter a 10 - digit phone number';
  }
  return '';
};

export const validatePan = (panNumber) => {
  if (!panNumber || panNumber.trim() === '') {
    return '*Required PAN Number';
  } else if (!validationPatterns.pan.test(panNumber)) {
    return '*Please provide a valid PAN Number';
  }
  return '';
};

export const validateAadhaar = (aadhaarNumber) => {
  if (!aadhaarNumber || aadhaarNumber.trim() === '') {
    return '*Required Aadhaar Number';
  } else if (!validationPatterns.aadhaar.test(aadhaarNumber)) {
    return '*Please provide a valid Aadhaar Number';
  }
  return '';
};

export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return '*Required Full Name';
  }
  return '';
};

export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth || dateOfBirth.trim() === '') {
    return '*Required Date of Birth';
  }
  return '';
};

export const validateTermsAndConditions = (isTermsAndConditionApplied) => {
  return isTermsAndConditionApplied
    ? ''
    : '*Please accept the terms and conditions';
};

export const validateEnterpriseType = (enterpriseType) => {
  if (!enterpriseType || enterpriseType.trim() === '') {
    return '*Required Enterprise Type';
  }
  return '';
};

export const validateEnterpriseName = (enterpriseName) => {
  if (!enterpriseName || enterpriseName.trim() === '') {
    return '*Required Enterprise Name';
  }
  return '';
};

export const validateEnterpriseAddress = (enterpriseAddress) => {
  if (!enterpriseAddress || enterpriseAddress.trim() === '') {
    return '*Required Enterprise Address';
  }
  return '';
};

export const validateDateOfIncorporation = (dateOfIncorporation) => {
  if (!dateOfIncorporation || dateOfIncorporation.trim() === '') {
    return '*Required Date of Incorporation';
  }
  return '';
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return '*Required Email';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
    return '*Please provide a valid email';
  }
  return '';
};
