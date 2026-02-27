export const required = (value) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)
    ? 'This field is required'
    : null;

export const validateObject = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((key) => {
    const error = rules[key](data?.[key]);
    if (error) errors[key] = error;
  });

  return errors;
};

export const validateBuyerContext = (formData) => {
  return validateObject(formData.buyerContext, {
    buyerId: required,
    contactPerson: required,
    email: required,
    mobile: required,
    billingAddress: required,
    serviceLocation: required,
  });
};

export const validateServices = (formData) => {
  const errors = {};
  const services = formData.services || [];

  if (services.length === 0) {
    return { _error: 'At least one service is required' };
  }

  services.forEach((item, index) => {
    const itemErrors = {};

    if (!item.serviceType) itemErrors.serviceType = 'Required';
    if (!item.quantity) itemErrors.quantity = 'Required';

    if (Object.keys(itemErrors).length) {
      errors[index] = itemErrors;
    }
  });

  return errors;
};

export const validateOfferTerms = (formData) => {
  return validateObject(formData.offerTerms, {
    paymentTerms: required,
    offerValidity: required,
    notes: required,
    customerNotes: required,
    governingLaw: required,
    disputeResolution: required,
    deliveryAcceptance: required,
  });
};
