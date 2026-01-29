export const validateDynamicForm = (schema, data) => {
  const errors = {};

  schema.forEach((field) => {
    if (field.required && !data[field.name]) {
      errors[field.name] = `${field.label} is required`;
    }
  });

  return errors;
};

export const validateBookingPreview = (isFirstDeliveryChallanCreated, data) => {
  const errors = {};

  if (!isFirstDeliveryChallanCreated && !data?.legFrom) {
    errors.legFrom = 'Leg from is required';
  }

  if (!data?.legTo) {
    errors.legTo = 'Leg To is required';
  }

  if (!data?.modeOfTransport) {
    errors.modeOfTransport = 'Mode of transport is required';
  }

  if (!data?.bookingType) {
    errors.bookingType = 'Booking type is required';
  }

  if (!data?.bookingNumber) {
    errors.bookingNumber = 'Booking number is required';
  }

  if (!data?.bookingDate) {
    errors.bookingDate = 'Booking date is required';
  }

  // transporterId required only if transporter selected (not self)
  if (data?.transporterEnterpriseId && !data?.transporterId) {
    errors.transporterId = 'Transporter ID is required';
  }

  return errors;
};

export const validateBookingRow = (formData) => {
  const requiredFields = ['bookingType', 'bookingNumber', 'bookingDate'];

  const errors = {};

  requiredFields.forEach((field) => {
    if (!formData[field] || String(formData[field]).trim() === '') {
      errors[field] = 'This field is required';
    }
  });

  return errors;
};
