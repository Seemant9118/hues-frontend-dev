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

  (conditionPaths || []).forEach((path) => {
    const key = path.includes('.') ? path.split('.').pop() : path;
    if (key === 'selectedValue') return;
    if (record[key] !== undefined) return;

    let val =
      formData?.[key] ??
      formData?.[path] ??
      formData?.customFields?.[key] ??
      formData?.extraInfo?.[key];

    if (key === 'amount' && val === undefined && calculatedAmount > 0) {
      val = Number(calculatedAmount.toFixed(2));
    }

    if (val !== undefined && val !== null && val !== '') {
      record[key] = val;
    }
  });

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

  return formValues;
}
