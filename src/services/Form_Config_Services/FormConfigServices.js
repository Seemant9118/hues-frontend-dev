import { formConfigApi } from '@/api/form-config/formConfigApi';
import { LocalStorageService } from '@/lib/utils';
import { APIinstance } from '@/services';
import { toast } from 'sonner';

const activeRequests = {};

export const getFormConfig = async (moduleName) => {
  if (!moduleName) return { fields: [] };
  const cacheKey = `${moduleName}_system`;
  if (activeRequests[cacheKey]) {
    return activeRequests[cacheKey];
  }

  const requestPromise = (async () => {
    try {
      const response = await APIinstance.get(
        `${formConfigApi.getFormConfig.endpoint}/${moduleName}`,
        {
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      );
      if (response.data && response.data.status && response.data.data) {
        LocalStorageService.set(
          `form_config_${moduleName}`,
          response.data.data,
        );
        return response.data.data;
      }
    } catch (error) {
      // Fallback to localStorage if API request fails
      try {
        const cachedConfig = LocalStorageService.get(
          `form_config_${moduleName}`,
        );
        if (cachedConfig) {
          const parsed =
            typeof cachedConfig === 'string'
              ? JSON.parse(cachedConfig)
              : cachedConfig;
          if (parsed && parsed.fields) {
            return parsed;
          }
        }
      } catch (cacheError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to load form config from localStorage:',
          cacheError,
        );
      }

      toast.info(
        `Failed to fetch form configuration for ${moduleName} from API.`,
      );
    } finally {
      delete activeRequests[cacheKey];
    }

    return {
      module: moduleName,
      fields: [],
      baseVersion: 1,
      revision: 0,
    };
  })();

  activeRequests[cacheKey] = requestPromise;
  return requestPromise;
};

export const saveFormConfig = async (
  moduleName,
  fields,
  baseVersion,
  etag,
  originalCustomFields = [],
  originalSystemFields = [],
) => {
  try {
    const fieldOverrides = [];
    fields
      .filter((f) => f.kind === 'SYSTEM')
      .forEach((f) => {
        const orig = (originalSystemFields || []).find((o) => o.key === f.key);
        if (!orig) return;

        const labelChanged = f.label !== orig.label;
        const requiredChanged = f.required !== orig.required;
        const visibleChanged = f.visible !== orig.visible;
        const orderChanged = f.order !== orig.order;
        const validationChanged =
          JSON.stringify(f.validation) !== JSON.stringify(orig.validation);

        if (
          labelChanged ||
          requiredChanged ||
          visibleChanged ||
          orderChanged ||
          validationChanged
        ) {
          const overrideObj = { key: f.key };
          if (labelChanged) overrideObj.label = f.label;
          if (requiredChanged) overrideObj.required = f.required;
          if (visibleChanged) overrideObj.visible = f.visible;
          if (orderChanged) overrideObj.order = f.order;
          if (validationChanged) overrideObj.validation = f.validation || null;

          fieldOverrides.push(overrideObj);
        }
      });

    const activeCustomFields = fields
      .filter((f) => f.kind === 'CUSTOM')
      .map((f) => {
        const mapped = {
          key: f.key,
          label: f.label,
          type: f.type || 'TEXT',
          required: f.required || false,
          visible: f.visible !== false,
          order: f.order || 999,
          validation: f.validation || null,
          state: 'ACTIVE',
        };
        if (f.id) mapped.id = f.id;
        if (f.placeholder) mapped.placeholder = f.placeholder;
        if (f.options && f.options.length > 0) mapped.options = f.options;
        return mapped;
      });

    const activeKeys = new Set(activeCustomFields.map((f) => f.key));

    const deletedCustomFields = (originalCustomFields || [])
      .filter((orig) => !activeKeys.has(orig.key))
      .map((orig) => ({
        id: orig.id,
        key: orig.key,
        label: orig.label,
        type: orig.type || 'TEXT',
        required: orig.required || false,
        visible: false,
        order: orig.order || 999,
        validation: orig.validation || null,
        state: 'ARCHIVED',
      }));

    const customFieldsPayload = [...activeCustomFields, ...deletedCustomFields];

    const payload = {
      baseVersion: baseVersion || 1,
      fieldOverrides,
      customFields: customFieldsPayload,
    };

    delete activeRequests[`${moduleName}_system`];
    const response = await APIinstance.put(
      `${formConfigApi.saveFormConfig.endpoint}/${moduleName}`,
      payload,
      {
        headers: {
          'If-Match': etag || '',
        },
      },
    );

    if (response.data && response.data.status && response.data.data) {
      LocalStorageService.set(`form_config_${moduleName}`, response.data.data);
    }

    return {
      ...response.data,
      isFallback: false,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `API call failed to save form configuration for ${moduleName}:`,
      error,
    );
    return {
      status: false,
      message: 'Failed to save configuration.',
      error,
    };
  }
};

export const resetFormConfig = async (moduleName, etag) => {
  const cacheKey = `${moduleName}_system`;
  delete activeRequests[cacheKey];
  try {
    const headers = {};
    if (etag) headers['If-Match'] = etag;
    const response = await APIinstance.post(
      `${formConfigApi.getFormConfig.endpoint}/${moduleName}/reset`,
      {},
      { headers },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to reset form config for ${moduleName}:`, error);
    return {
      status: false,
      message: 'Failed to reset form configuration.',
      error,
    };
  }
};

export const getAllSystemFormConfigs = async () => {
  try {
    const response = await APIinstance.get(
      formConfigApi.getFormConfig.endpoint,
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
    console.error('Failed to fetch system form configurations:', error);
    return [];
  }
};

export const getFormVersions = async (moduleName) => {
  try {
    const response = await APIinstance.get(
      `${formConfigApi.getFormConfig.endpoint}/${moduleName}/versions`,
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
    console.error(`Failed to fetch versions for ${moduleName}:`, error);
    return [];
  }
};

export const getFormVersionDetails = async (moduleName, version) => {
  try {
    const response = await APIinstance.get(
      `${formConfigApi.getFormConfig.endpoint}/${moduleName}/versions/${version}`,
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
      `Failed to fetch version ${version} details for ${moduleName}:`,
      error,
    );
    return {};
  }
};

export const activateFormVersion = async (moduleName, version) => {
  try {
    const response = await APIinstance.post(
      `${formConfigApi.getFormConfig.endpoint}/${moduleName}/versions/${version}/activate`,
      {},
    );
    if (response.data && response.data.status && response.data.data) {
      LocalStorageService.set(`form_config_${moduleName}`, response.data.data);
    }
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to activate version ${version} for ${moduleName}:`,
      error,
    );
    return {
      status: false,
      message: 'Failed to activate version.',
      error,
    };
  }
};
