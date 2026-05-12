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
  const rules = {
    contactPerson: required,
    email: required,
    mobile: required,
    billingAddressText: required,
    serviceLocation: required,
  };

  if (formData.cta === 'offer') {
    rules.buyerId = required;
  } else {
    rules.sellerEnterpriseId = required;
  }

  return validateObject(formData, rules);
};

export const validateServices = (formData) => {
  const errors = {};
  const orderItems = formData.orderItems || [];

  if (orderItems.length === 0) {
    return { _error: 'At least one service is required' };
  }

  orderItems.forEach((item, index) => {
    const itemErrors = {};

    if (!item.productId) itemErrors.productId = 'Required';
    if (!item.quantity) itemErrors.quantity = 'Required';
    if (!item.unitPrice) itemErrors.unitPrice = 'Required';

    if (Object.keys(itemErrors).length) {
      errors[index] = itemErrors;
    }
  });

  return errors;
};

export const validateOfferTerms = (formData) => {
  return validateObject(formData, {
    paymentTerms: required,
    offerValidity: required,
  });
};
