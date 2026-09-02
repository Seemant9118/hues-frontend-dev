/**
 * Helper to extract condition paths from workflow graph transitions
 */
export function getConditionPathsFromTransitions(
  transitions = [],
  stepKey = null,
) {
  const paths = new Set();
  (transitions || []).forEach((tr) => {
    if (!stepKey || tr.from === stepKey) {
      if (tr.condition?.path) {
        paths.add(tr.condition.path);
      }
    }
  });
  return Array.from(paths);
}

/**
 * Extract only condition-referenced fields from form state for record payload (System Form)
 */
export function extractConditionRecordData(formData = {}, conditionPaths = []) {
  const record = {};
  const orderItems = formData?.orderItems || [];
  const calculatedAmount = orderItems.reduce(
    (acc, curr) => acc + (Number(curr.totalAmount) || 0),
    0,
  );

  (conditionPaths || []).forEach((path) => {
    const key = path.includes('.') ? path.split('.').pop() : path;
    let val;
    if (key === 'amount') {
      val =
        formData?.amount ??
        (calculatedAmount > 0
          ? Number(calculatedAmount.toFixed(2))
          : undefined);
    } else {
      val =
        formData?.[key] ??
        formData?.[path] ??
        formData?.customFields?.[key] ??
        formData?.extraInfo?.[key];
    }

    if (val !== undefined && val !== null && val !== '') {
      record[key] = val;
    }
  });

  // Fallback: if no specific condition path matched, include amount if available
  if (Object.keys(record).length === 0 && calculatedAmount > 0) {
    record.amount = Number(calculatedAmount.toFixed(2));
  } else if (Object.keys(record).length === 0 && formData?.amount) {
    record.amount = Number(formData.amount);
  }

  return record;
}

/**
 * Extract only condition-referenced fields from form state for forms payload (Custom Form)
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
