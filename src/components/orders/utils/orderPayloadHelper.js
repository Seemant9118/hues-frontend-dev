export const filterSubmitPayload = (orderData, formConfig = []) => {
  // Clone orderData so we do not mutate state
  const payload = { ...orderData };

  // Remove internal configuration keys
  delete payload._formFields;
  delete payload.workflowStepValues;
  delete payload.workflowNotes;
  delete payload.workflowClientClass;
  delete payload.formConfig;
  delete payload.customFields;
  delete payload.documents;

  // 1. Populate extraInfo object preserving all non-workflow custom fields
  const extraInfoObj = {
    ...(payload.extraInfo || {}),
  };

  const customConfig = Array.isArray(formConfig)
    ? formConfig.filter((f) => f.kind === 'CUSTOM')
    : [];

  customConfig.forEach((f) => {
    const fieldName = f.name || f.key;
    const val =
      payload[fieldName] !== undefined
        ? payload[fieldName]
        : payload.customFields?.[fieldName] !== undefined
          ? payload.customFields?.[fieldName]
          : payload.extraInfo?.[fieldName];
    if (val !== undefined && val !== null && val !== '') {
      extraInfoObj[fieldName] = val;
    }
  });

  if (Object.keys(extraInfoObj).length > 0) {
    payload.extraInfo = extraInfoObj;
  } else {
    delete payload.extraInfo;
  }

  return payload;
};

/**
 * Builds exact payload matching new-service-payload.js structure for Goods & Services orders.
 * Includes:
 * 1. Cleaned root level order attributes
 * 2. "workflowInitialData": { actions: [...] } (when no-code workflow exists with interactive steps)
 * 3. Strips transient customFields, workflowStepValues, and step keys from root
 */
export const buildEnhancedOrderPayload = (
  orderData,
  activeWorkflowData = null,
  formFieldsConfig = [],
) => {
  // 1. Run standard cleaning
  const payload = filterSubmitPayload(orderData, formFieldsConfig);

  const hasActiveWorkflow =
    activeWorkflowData?.source === 'NO_CODE_WORKFLOW' &&
    activeWorkflowData?.runtime;

  const runtimeSteps = activeWorkflowData?.runtime?.steps || [];
  const stepValues = orderData?.workflowStepValues || {};

  const actions = [];
  const workflowFieldKeys = new Set();

  if (hasActiveWorkflow && Array.isArray(runtimeSteps)) {
    runtimeSteps.forEach((st) => {
      if (st.start || st.type === 'SYSTEM' || st.type === 'END') return;

      if (st.type === 'FORM') {
        const configId = Number(
          st.formConfigurationId || st.formConfiguration?.id || 8,
        );

        const valuesObj = {};

        // 1. Check formConfiguration.fields
        if (Array.isArray(st.formConfiguration?.fields)) {
          st.formConfiguration.fields.forEach((f) => {
            if (f.key) workflowFieldKeys.add(f.key);
            const val =
              stepValues[st.key]?.[f.key] ??
              orderData?.[f.key] ??
              orderData?.customFields?.[f.key];

            if (val !== undefined && val !== null && val !== '') {
              valuesObj[f.key] = val;
            }
          });
        }

        // 2. Check any remaining values in stepValues[st.key]
        if (stepValues[st.key]) {
          Object.keys(stepValues[st.key]).forEach((k) => {
            workflowFieldKeys.add(k);
            const val = stepValues[st.key][k];
            if (val !== undefined && val !== null && val !== '') {
              valuesObj[k] = val;
            }
          });
        }

        if (Object.keys(valuesObj).length > 0) {
          actions.push({
            stepKey: st.key,
            action: 'SUBMIT_FORM',
            formConfigurationId: configId,
            values: valuesObj,
          });
        }
      } else if (st.type === 'DOCUMENT_UPLOAD') {
        const docObj = Array.isArray(orderData?.documents)
          ? orderData.documents.find((d) => d.stepKey === st.key)
          : null;

        const rawAttIds =
          stepValues[st.key]?.attachmentIds ||
          docObj?.attachmentIds ||
          orderData?.attachmentIds;
        const rawDocIds =
          stepValues[st.key]?.documentIds ||
          docObj?.documentIds ||
          orderData?.documentIds;

        const parseIds = (v) => {
          if (Array.isArray(v))
            return v.map(Number).filter((n) => !Number.isNaN(n));
          if (typeof v === 'string' && v.trim() !== '') {
            return v
              .split(',')
              .map((s) => Number(s.trim()))
              .filter((n) => !Number.isNaN(n));
          }
          return [];
        };

        const attIds = parseIds(rawAttIds);
        const docIds = parseIds(rawDocIds);

        actions.push({
          stepKey: st.key,
          action: 'UPLOAD_DOCUMENT',
          attachmentIds: attIds,
          documentIds: docIds,
        });
      }
    });
  }

  // Remove all workflow step field keys from root of payload
  workflowFieldKeys.forEach((wfKey) => {
    delete payload[wfKey];
  });

  // Also remove keys that came from workflowStepValues
  Object.keys(stepValues).forEach((sKey) => {
    if (stepValues[sKey]) {
      Object.keys(stepValues[sKey]).forEach((fKey) => {
        delete payload[fKey];
      });
    }
  });

  // Attach workflowInitialData if actions exist
  if (actions.length > 0) {
    payload.workflowInitialData = { actions };
  } else {
    delete payload.workflowInitialData;
  }

  return payload;
};
