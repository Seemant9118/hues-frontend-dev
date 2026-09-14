/**
 * Helper to clean and format field value, converting numeric values if appropriate
 */
function cleanFieldValue(key, val, fieldDef = null) {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const isNumberType =
      fieldDef?.type === 'NUMBER' ||
      fieldDef?.dataType === 'NUMBER' ||
      fieldDef?.inputType === 'number';

    const isPureDigits =
      /^\d+$/.test(trimmed) && (trimmed === '0' || !trimmed.startsWith('0'));

    const isDecimalNumber = /^\d+\.\d+$/.test(trimmed);

    if ((isNumberType || isDecimalNumber) && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    if (
      isPureDigits &&
      (isNumberType ||
        /amount|number|contact|qty|quantity|count|price|rate|tds/i.test(key))
    ) {
      return Number(trimmed);
    }

    return trimmed;
  }
  return val;
}

/**
 * Extract condition paths from workflow graph transitions
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
 * Extract step form data from global form state for a given step
 */
export function extractStepFormData(formData = {}, stepKey = '') {
  const stepValues = formData?.workflowStepValues?.[stepKey] || {};
  const rootCustomFields = formData?.customFields || {};

  return {
    ...rootCustomFields,
    ...stepValues,
  };
}

/**
 * Build next-step-preview payload for custom workflows
 */
export function buildNextStepPreviewPayload({
  definitionId,
  stepKey,
  formData = {},
}) {
  const currentStepValues = extractStepFormData(formData, stepKey);
  const allForms = {
    ...(formData?.workflowStepValues || {}),
    [stepKey]: currentStepValues,
  };

  const formattedForms = {};
  const combinedWorkflowData = {};
  const allAttachments = [];

  const internalKeys = new Set([
    'attachments',
    'attachmentIds',
    'documentIds',
    'documents',
    'formConfig',
    'formConfiguration',
    'formConfigurationId',
    'stepKey',
    'stepType',
    'status',
    'remarks',
    'values',
    'errors',
    '_formFields',
  ]);

  Object.entries(allForms).forEach(([k, stepObj]) => {
    if (
      k === 'DOCUMENT_UPLOAD' ||
      k.startsWith('DOCUMENT_UPLOAD') ||
      stepObj?.type === 'DOCUMENT_UPLOAD'
    ) {
      if (Array.isArray(stepObj?.attachments)) {
        stepObj.attachments.forEach((att) => {
          if (att && (att.id || att.attachmentId)) {
            allAttachments.push({
              id: Number(att.id || att.attachmentId),
              attachmentId: Number(att.attachmentId || att.id),
              documentId: Number(att.documentId || att.id),
              name: att.name || '',
              size: Number(att.size) || 0,
              type: att.type || '',
              uploadedAt: att.uploadedAt || new Date().toISOString(),
            });
          }
        });
      }
      return;
    }

    const cleanVals = {};
    if (stepObj && typeof stepObj === 'object') {
      Object.entries(stepObj).forEach(([fieldKey, val]) => {
        if (!internalKeys.has(fieldKey)) {
          const cleaned = cleanFieldValue(fieldKey, val);
          if (cleaned !== undefined) {
            cleanVals[fieldKey] = cleaned;
            combinedWorkflowData[fieldKey] = cleaned;
          }
        }
      });
    }

    if (Object.keys(cleanVals).length > 0) {
      formattedForms[k] = {
        values: cleanVals,
      };
    }
  });

  if (allAttachments.length > 0) {
    combinedWorkflowData.attachments = allAttachments;
  }

  const cleanCurrentStepValues = formattedForms[stepKey]?.values || {};

  return {
    module: 'CUSTOM_WORKFLOW',
    definitionId: Number(definitionId),
    stepKey,
    event: 'SUBMITTED',
    context: {
      record: {},
      forms: formattedForms,
      workflowData: combinedWorkflowData,
    },
    values: cleanCurrentStepValues,
    forms: formattedForms,
  };
}

/**
 * Build instance start payload for custom workflows
 */
export function buildInstanceStartPayload({
  definitionId,
  formData = {},
  definition = null,
}) {
  const steps = definition?.graph?.steps || definition?.steps || [];
  const allStepValues = formData?.workflowStepValues || {};
  const rootCustomFields = formData?.customFields || {};

  const forms = {};
  const workflowData = {};
  const allAttachments = [];

  const internalKeys = new Set([
    'attachments',
    'attachmentIds',
    'documentIds',
    'documents',
    'formConfig',
    'formConfiguration',
    'formConfigurationId',
    'stepKey',
    'stepType',
    'status',
    'remarks',
    'values',
    'errors',
    '_formFields',
  ]);

  const stepMap = new Map();
  steps.forEach((st) => {
    if (st.key) stepMap.set(st.key, st);
  });

  const stepKeys = new Set([
    ...steps.map((s) => s.key),
    ...Object.keys(allStepValues),
  ]);

  stepKeys.forEach((sKey) => {
    const stepDef = stepMap.get(sKey);
    const stepData = allStepValues[sKey] || {};

    // Collect attachments
    if (Array.isArray(stepData.attachments)) {
      stepData.attachments.forEach((att) => {
        if (att && (att.id || att.attachmentId)) {
          allAttachments.push({
            id: Number(att.id || att.attachmentId),
            attachmentId: Number(att.attachmentId || att.id),
            documentId: Number(att.documentId || att.id),
            name: att.name || '',
            size: Number(att.size) || 0,
            type: att.type || '',
            uploadedAt: att.uploadedAt || new Date().toISOString(),
          });
        }
      });
    }

    // Skip non-form steps from forms object
    if (
      stepDef?.type === 'DOCUMENT_UPLOAD' ||
      stepDef?.type === 'SYSTEM' ||
      stepDef?.type === 'END' ||
      sKey === 'DOCUMENT_UPLOAD' ||
      sKey.startsWith('DOCUMENT_UPLOAD')
    ) {
      return;
    }

    const valuesObj = {};
    const formFields =
      stepDef?.formConfiguration?.fields ||
      stepDef?.formConfig?.fields ||
      stepDef?.fields ||
      [];

    if (Array.isArray(formFields) && formFields.length > 0) {
      formFields.forEach((f) => {
        const fieldKey = f.key || f.name;
        if (!fieldKey || internalKeys.has(fieldKey)) return;

        const rawVal =
          stepData[fieldKey] ??
          (f.mappingKey ? stepData[f.mappingKey] : undefined) ??
          rootCustomFields[fieldKey] ??
          (f.mappingKey ? rootCustomFields[f.mappingKey] : undefined) ??
          formData[fieldKey];

        const cleaned = cleanFieldValue(fieldKey, rawVal, f);
        if (cleaned !== undefined) {
          valuesObj[fieldKey] = cleaned;
          workflowData[fieldKey] = cleaned;
        }
      });
    } else if (typeof stepData === 'object' && stepData !== null) {
      Object.entries(stepData).forEach(([k, rawVal]) => {
        if (internalKeys.has(k)) return;
        const cleaned = cleanFieldValue(k, rawVal);
        if (cleaned !== undefined) {
          valuesObj[k] = cleaned;
          workflowData[k] = cleaned;
        }
      });
    }

    if (Object.keys(valuesObj).length > 0) {
      forms[sKey] = {
        values: valuesObj,
      };
    }
  });

  // Include any remaining customFields on root
  Object.entries(rootCustomFields).forEach(([k, rawVal]) => {
    if (!internalKeys.has(k) && workflowData[k] === undefined) {
      const cleaned = cleanFieldValue(k, rawVal);
      if (cleaned !== undefined) {
        workflowData[k] = cleaned;
      }
    }
  });

  // Collect any attachments directly on formData
  if (Array.isArray(formData.attachments)) {
    formData.attachments.forEach((att) => {
      if (
        att &&
        (att.id || att.attachmentId) &&
        !allAttachments.some((x) => x.id === (att.id || att.attachmentId))
      ) {
        allAttachments.push({
          id: Number(att.id || att.attachmentId),
          attachmentId: Number(att.attachmentId || att.id),
          documentId: Number(att.documentId || att.id),
          name: att.name || '',
          size: Number(att.size) || 0,
          type: att.type || '',
          uploadedAt: att.uploadedAt || new Date().toISOString(),
        });
      }
    });
  }

  if (allAttachments.length > 0) {
    workflowData.attachments = allAttachments;
  }

  return {
    module: 'CUSTOM_WORKFLOW',
    definitionId: Number(definitionId),
    context: {
      record: {},
      forms,
      workflowData,
    },
  };
}
