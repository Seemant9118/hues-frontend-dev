export const validateDynamicForm = (schema, data) => {
  const errors = {};

  schema.forEach((field) => {
    if (field.required && !data[field.name]) {
      errors[field.name] = `${field.label} is required`;
    }
  });

  return errors;
};

export const validateBookingRow = (formData) => {
  const requiredFields = [
    'bookingType',
    'bookingNumber',
    'bookingDate',
    'sourceAddress',
    'destinationAddress',
  ];

  const errors = {};

  requiredFields.forEach((field) => {
    if (!formData[field] || String(formData[field]).trim() === '') {
      errors[field] = 'This field is required';
    }
  });

  return errors;
};
