export const filterSubmitPayload = (orderData, formConfig = []) => {
  // Clone orderData so we do not mutate state
  const payload = { ...orderData };

  // Remove internal configuration, UI state, and transient keys
  const transientKeys = [
    '_formFields',
    'workflowStepValues',
    'workflowNotes',
    'workflowClientClass',
    'formConfig',
    'customFields',
    'documents',
    'attachments',
    'attachmentIds',
    'documentIds',
    'name',
    'cta',
    'isOrder',
    'isCreatingSales',
    'isCreatingPurchase',
    'isPurchasePage',
    'referenceOrderId',
  ];

  transientKeys.forEach((key) => {
    delete payload[key];
  });

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
          st.formConfigurationId ||
            st.formConfiguration?.id ||
            st.formConfig?.id ||
            stepValues[st.key]?.formConfigurationId ||
            9,
        );

        const valuesObj = {};
        const formFields =
          st.formConfiguration?.fields ||
          st.formConfig?.fields ||
          st.fields ||
          [];

        if (Array.isArray(formFields) && formFields.length > 0) {
          formFields.forEach((f) => {
            const fieldKey = f.key || f.name;
            if (!fieldKey) return;
            workflowFieldKeys.add(fieldKey);

            let rawVal =
              stepValues[st.key]?.[fieldKey] ??
              (f.mappingKey ? stepValues[st.key]?.[f.mappingKey] : undefined) ??
              orderData?.[fieldKey] ??
              (f.mappingKey ? orderData?.[f.mappingKey] : undefined) ??
              orderData?.customFields?.[fieldKey] ??
              (f.mappingKey
                ? orderData?.customFields?.[f.mappingKey]
                : undefined);

            if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
              const isNumericField =
                f.type === 'NUMBER' ||
                f.inputType === 'number' ||
                f.dataType === 'NUMBER';

              if (isNumericField && !Number.isNaN(Number(rawVal))) {
                rawVal = Number(rawVal);
              } else if (
                typeof rawVal === 'string' &&
                /^\d+$/.test(rawVal.trim()) &&
                (fieldKey.toLowerCase().includes('number') ||
                  fieldKey.toLowerCase().includes('amount') ||
                  fieldKey.toLowerCase().includes('qty') ||
                  fieldKey.toLowerCase().includes('quantity') ||
                  fieldKey.toLowerCase().includes('phone') ||
                  fieldKey.toLowerCase().includes('mobile') ||
                  fieldKey.toLowerCase().includes('pincode') ||
                  fieldKey.toLowerCase().includes('postalcode'))
              ) {
                rawVal = Number(rawVal.trim());
              }

              valuesObj[fieldKey] = rawVal;
            }
          });
        } else if (
          stepValues[st.key] &&
          typeof stepValues[st.key] === 'object'
        ) {
          const internalKeys = new Set([
            'attachments',
            'attachmentIds',
            'documentIds',
            'formConfig',
            'formConfiguration',
            'formConfigurationId',
            'stepKey',
            'stepType',
            'status',
            'notes',
            'id',
            '_formFields',
            'errors',
          ]);

          Object.entries(stepValues[st.key]).forEach(([k, val]) => {
            if (
              !internalKeys.has(k) &&
              val !== undefined &&
              val !== null &&
              val !== ''
            ) {
              workflowFieldKeys.add(k);
              let cleanVal = val;
              if (
                typeof cleanVal === 'string' &&
                /^\d+$/.test(cleanVal.trim()) &&
                (k.toLowerCase().includes('number') ||
                  k.toLowerCase().includes('amount') ||
                  k.toLowerCase().includes('qty') ||
                  k.toLowerCase().includes('quantity') ||
                  k.toLowerCase().includes('phone') ||
                  k.toLowerCase().includes('mobile'))
              ) {
                cleanVal = Number(cleanVal.trim());
              }
              valuesObj[k] = cleanVal;
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
          (stepValues[st.key]?.attachments
            ? stepValues[st.key].attachments.map((a) => a.id)
            : null);

        const rawDocIds =
          stepValues[st.key]?.documentIds ||
          docObj?.documentIds ||
          (stepValues[st.key]?.attachments
            ? stepValues[st.key].attachments.map((a) => a.documentId)
            : null);

        const parseIds = (v) => {
          if (Array.isArray(v)) {
            return v
              .map((item) =>
                typeof item === 'object' && item !== null && item.id
                  ? item.id
                  : item,
              )
              .map(Number)
              .filter((n) => !Number.isNaN(n));
          }
          if (typeof v === 'string' && v.trim() !== '') {
            return v
              .split(',')
              .map((s) => Number(s.trim()))
              .filter((n) => !Number.isNaN(n));
          }
          if (typeof v === 'number' && !Number.isNaN(v)) {
            return [v];
          }
          return [];
        };

        const attIds = parseIds(rawAttIds);
        const docIds = parseIds(rawDocIds);

        if (attIds.length > 0 || docIds.length > 0) {
          actions.push({
            stepKey: st.key,
            action: 'UPLOAD_DOCUMENT',
            attachmentIds: attIds,
            documentIds: docIds,
          });
        }
      }
    });
  }

  // Remove all workflow step keys (e.g. FORM_2, DOCUMENT_UPLOAD_3, workflow-FORM_2)
  if (Array.isArray(runtimeSteps)) {
    runtimeSteps.forEach((st) => {
      if (st.key) {
        delete payload[st.key];
        delete payload[`workflow-${st.key}`];
      }
    });
  }

  // Remove all workflow step field keys from root of payload and extraInfo
  workflowFieldKeys.forEach((wfKey) => {
    delete payload[wfKey];
    if (payload.extraInfo) {
      delete payload.extraInfo[wfKey];
    }
  });

  // Also remove keys that came from workflowStepValues
  Object.keys(stepValues).forEach((sKey) => {
    delete payload[sKey];
    delete payload[`workflow-${sKey}`];
    if (stepValues[sKey] && typeof stepValues[sKey] === 'object') {
      Object.keys(stepValues[sKey]).forEach((fKey) => {
        delete payload[fKey];
        if (payload.extraInfo) {
          delete payload.extraInfo[fKey];
        }
      });
    }
  });

  if (payload.extraInfo && Object.keys(payload.extraInfo).length === 0) {
    delete payload.extraInfo;
  }

  // Attach workflowInitialData if actions exist
  if (actions.length > 0) {
    payload.workflowInitialData = { actions };
  } else {
    delete payload.workflowInitialData;
  }

  return payload;
};
