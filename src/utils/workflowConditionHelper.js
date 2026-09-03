/**
 * Helper to extract condition paths from workflow graph transitions & prefillMappings
 */
export function getConditionPathsFromTransitions(
  transitions = [],
  stepKey = null,
  runtimeSteps = [],
) {
  const paths = new Set();
  (transitions || []).forEach((tr) => {
    if (!stepKey || tr.from === stepKey) {
      if (tr.condition?.path) {
        paths.add(tr.condition.path);
      }
    }
  });

  (runtimeSteps || []).forEach((st) => {
    const mappings = st.config?.prefillMappings || st.prefillMappings || [];
    mappings.forEach((m) => {
      if (m.sourcePath) {
        const key = m.sourcePath.split('.').pop();
        if (key) paths.add(key);
      }
    });
  });

  return Array.from(paths);
}

/**
 * Extract record data for system start form payload
 */
export function extractConditionRecordData(formData = {}, conditionPaths = []) {
  const record = {};
  const orderItems = formData?.orderItems || [];
  const calculatedAmount = orderItems.reduce(
    (acc, curr) => acc + (Number(curr.totalAmount) || 0),
    0,
  );

  const standardSystemKeys = [
    'amount',
    'gstAmount',
    'buyerId',
    'sellerEnterpriseId',
    'orderType',
    'invoiceType',
    'clientType',
    'paymentTerms',
    'offerValidity',
    'billingAddressId',
    'shippingAddressId',
    'orderItems',
    'notesToCustomer',
    'buyerType',
  ];

  standardSystemKeys.forEach((key) => {
    let val;
    if (key === 'amount') {
      val =
        formData?.amount ??
        (calculatedAmount > 0
          ? Number(calculatedAmount.toFixed(2))
          : undefined);
    } else {
      val = formData?.[key];
    }
    if (val !== undefined && val !== null && val !== '') {
      record[key] = val;
    }
  });

  (conditionPaths || []).forEach((path) => {
    const key = path.includes('.') ? path.split('.').pop() : path;
    if (key === 'selectedValue') return;
    if (record[key] !== undefined) return;

    const val =
      formData?.[key] ??
      formData?.[path] ??
      formData?.customFields?.[key] ??
      formData?.extraInfo?.[key];

    if (val !== undefined && val !== null && val !== '') {
      record[key] = val;
    }
  });

  // Always include all system form fields present in formData (except selectedValue and internal flags)
  Object.keys(formData || {}).forEach((k) => {
    if (
      !k.startsWith('_') &&
      ![
        'workflowStepValues',
        'isEditing',
        'isCreatingSales',
        'isCreatingPurchase',
        'isPurchasePage',
        'selectedValue',
      ].includes(k)
    ) {
      if (
        record[k] === undefined &&
        formData[k] !== undefined &&
        formData[k] !== null &&
        formData[k] !== ''
      ) {
        record[k] = formData[k];
      }
    }
  });

  if (record.amount === undefined && calculatedAmount > 0) {
    record.amount = Number(calculatedAmount.toFixed(2));
  }

  delete record.selectedValue;

  return record;
}

/**
 * Extract condition-referenced fields from form state for custom forms payload
 */
export function extractConditionFormData(
  formData = {},
  stepKey = '',
  conditionPaths = [],
) {
  const formValues = {};
  const stepValues = formData?.workflowStepValues?.[stepKey] || {};

  (conditionPaths || []).forEach((path) => {
    const key = path.includes('.') ? path.split('.').pop() : path;
    const val =
      stepValues[key] ??
      stepValues[path] ??
      formData?.[key] ??
      formData?.customFields?.[key];

    if (val !== undefined && val !== null && val !== '') {
      formValues[key] = val;
    }
  });

  // Fallback: include all values from stepValues if conditionPaths didn't match
  if (Object.keys(formValues).length === 0 && stepValues) {
    Object.assign(formValues, stepValues);
  }

  return formValues;
}
