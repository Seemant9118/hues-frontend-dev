import { customFormApi } from '@/api/custom-forms/customFormApi';
import { LocalStorageService } from '@/lib/utils';
import { APIinstance } from '@/services';

export const getAllCustomForms = async () => {
  try {
    const response = await APIinstance.get(
      customFormApi.listCustomForms.endpoint,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch custom forms:', error);
    return [];
  }
};

export const createCustomForm = async (payload) => {
  try {
    const response = await APIinstance.post(
      customFormApi.createCustomForm.endpoint,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create custom form:', error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to create custom form.',
      error,
    };
  }
};

export const getCustomForm = async (formId) => {
  try {
    const response = await APIinstance.get(
      `${customFormApi.getCustomForm.endpoint}/${formId}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
    const etagHeader = response.headers?.etag;
    const dataObj = response.data?.data || response.data || null;

    if (dataObj && typeof dataObj === 'object') {
      const etagVal =
        etagHeader ||
        dataObj.etag ||
        (dataObj.revision !== undefined
          ? `W/"${dataObj.revision}"`
          : undefined);

      const merged = {
        ...dataObj,
        etag: etagVal,
      };

      LocalStorageService.set(`custom_form_${formId}`, merged);
      if (dataObj.id) {
        LocalStorageService.set(`custom_form_${dataObj.id}`, merged);
      }
      if (dataObj.formKey) {
        LocalStorageService.set(`custom_form_${dataObj.formKey}`, merged);
      }
      return merged;
    }
    return dataObj;
  } catch (error) {
    try {
      const cached = LocalStorageService.get(`custom_form_${formId}`);
      if (cached) {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      }
    } catch (cacheError) {
      // eslint-disable-next-line no-console
      console.error(
        `Failed to load custom form ${formId} from cache:`,
        cacheError,
      );
    }
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch custom form ${formId}:`, error);
    return null;
  }
};

export const updateCustomForm = async (formId, payload, etag) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (etag) {
      headers['If-Match'] = etag;
    }
    const response = await APIinstance.put(
      `${customFormApi.updateCustomForm.endpoint}/${formId}`,
      payload,
      { headers },
    );

    const etagHeader = response.headers?.etag;
    const resData = response.data?.data || response.data;

    if (resData && typeof resData === 'object') {
      const etagVal =
        etagHeader ||
        resData.etag ||
        (resData.revision !== undefined ? `W/"${resData.revision}"` : etag);

      const updatedObj = {
        ...resData,
        etag: etagVal,
      };

      LocalStorageService.set(`custom_form_${formId}`, updatedObj);
      if (resData.id) {
        LocalStorageService.set(`custom_form_${resData.id}`, updatedObj);
      }
      if (resData.formKey) {
        LocalStorageService.set(`custom_form_${resData.formKey}`, updatedObj);
      }

      return {
        status: true,
        data: updatedObj,
        etag: etagVal,
        ...(typeof response.data === 'object' && response.data !== null
          ? response.data
          : {}),
      };
    }

    return {
      status: true,
      data: resData,
      ...(typeof response.data === 'object' && response.data !== null
        ? response.data
        : {}),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to update custom form ${formId}:`, error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to update custom form.',
      error: error.response?.data?.error || error,
    };
  }
};

const toLowerCamelCase = (str) => {
  if (!str) return '';
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (m) => m.toLowerCase());
};

export const saveCustomForm = async (
  formId,
  fields = [],
  etag = '',
  customFormMeta = {},
  originalCustomFields = [],
) => {
  const customFields = fields
    .filter((f) => f.kind === 'CUSTOM' || f.key)
    .map((f, idx) => {
      const orig = (originalCustomFields || []).find(
        (o) => toLowerCamelCase(o.key) === toLowerCamelCase(f.key),
      );
      const mapped = {
        key: toLowerCamelCase(f.key),
        label: f.label,
        type: (f.type || 'TEXT').toUpperCase(),
        required: f.required || false,
        visible: f.visible !== false,
        order: f.order || (idx + 1) * 10,
        state: f.state || 'ACTIVE',
      };
      if (orig?.id || f.id) {
        mapped.id = orig?.id || f.id;
      }
      if (f.placeholder) mapped.placeholder = f.placeholder;
      if (f.helpText) mapped.helpText = f.helpText;
      if (f.validation) mapped.validation = f.validation;
      if (f.options && Array.isArray(f.options) && f.options.length > 0) {
        mapped.options = f.options;
      }
      return mapped;
    });

  const formName = customFormMeta.name || customFormMeta.module || formId;

  const payload = {
    name: formName,
    description: customFormMeta.description || `${formName} custom form`,
    usageMode: customFormMeta.usageMode || 'BOTH',
    customFields,
  };

  const targetId = customFormMeta.id || formId;
  return updateCustomForm(targetId, payload, etag || customFormMeta.etag || '');
};

export const resetCustomForm = async (formId, etag) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (etag) {
      headers['If-Match'] = etag;
    }
    const response = await APIinstance.post(
      `${customFormApi.resetCustomForm.endpoint}/${formId}/reset`,
      {},
      { headers },
    );

    const etagHeader = response.headers?.etag;
    const resData = response.data?.data || response.data;

    if (resData && typeof resData === 'object') {
      const etagVal =
        etagHeader ||
        resData.etag ||
        (resData.revision !== undefined ? `W/"${resData.revision}"` : etag);

      const updatedObj = {
        ...resData,
        etag: etagVal,
      };

      LocalStorageService.set(`custom_form_${formId}`, updatedObj);
      if (resData.id) {
        LocalStorageService.set(`custom_form_${resData.id}`, updatedObj);
      }
      if (resData.formKey) {
        LocalStorageService.set(`custom_form_${resData.formKey}`, updatedObj);
      }

      return {
        status: true,
        data: updatedObj,
        etag: etagVal,
        ...(typeof response.data === 'object' && response.data !== null
          ? response.data
          : {}),
      };
    }

    return {
      status: true,
      data: resData,
      ...(typeof response.data === 'object' && response.data !== null
        ? response.data
        : {}),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to reset custom form ${formId}:`, error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to reset custom form.',
      error: error.response?.data?.error || error,
    };
  }
};

export const getCustomFormVersions = async (formId) => {
  try {
    const response = await APIinstance.get(
      `${customFormApi.getCustomFormVersions.endpoint}/${formId}/versions`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch versions for custom form ${formId}:`, error);
    return [];
  }
};

export const getCustomFormVersionDetails = async (formId, version) => {
  try {
    const response = await APIinstance.get(
      `${customFormApi.getCustomFormVersionDetails.endpoint}/${formId}/versions/${version}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
    return response.data?.data || response.data || {};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to fetch version ${version} for custom form ${formId}:`,
      error,
    );
    return {};
  }
};

export const activateCustomFormVersion = async (formId, version) => {
  try {
    const response = await APIinstance.post(
      `${customFormApi.activateCustomFormVersion.endpoint}/${formId}/versions/${version}/activate`,
      {},
    );
    if (response.data && response.data.status && response.data.data) {
      LocalStorageService.set(`custom_form_${formId}`, response.data.data);
    }
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to activate version ${version} for custom form ${formId}:`,
      error,
    );
    return {
      status: false,
      message:
        error.response?.data?.message ||
        'Failed to activate custom form version.',
      error,
    };
  }
};
