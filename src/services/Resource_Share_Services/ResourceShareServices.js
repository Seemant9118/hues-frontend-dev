import { resourceShareApi } from '@/api/resource-shares/resourceShareApi';
import { APIinstance } from '@/services';

// ── Sender Services ───────────────────────────────────────────
export const createResourceShare = async (payload) => {
  try {
    const response = await APIinstance.post(
      resourceShareApi.createShare.endpoint,
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
    console.error('Failed to create resource share:', error);
    return {
      status: false,
      message:
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message[0]
          : 'Failed to create share link.'),
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};

export const getShareDetails = async (shareId) => {
  try {
    const response = await APIinstance.get(
      `${resourceShareApi.getShareDetails.endpoint}/${shareId}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
    return response.data?.data || response.data || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch share details for ${shareId}:`, error);
    return null;
  }
};

export const revokeResourceShare = async (shareId) => {
  try {
    const response = await APIinstance.patch(
      `${resourceShareApi.revokeShare.endpoint}/${shareId}/revoke`,
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to revoke share ${shareId}:`, error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to revoke share.',
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};

export const listResourceShares = async (
  resourceType,
  resourceId,
  page = 1,
  limit = 10,
) => {
  try {
    const response = await APIinstance.get(
      resourceShareApi.listShares.endpoint,
      {
        params: {
          resourceType,
          resourceId,
          page,
          limit,
        },
      },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Failed to list resource shares for ${resourceType} ${resourceId}:`,
      error,
    );
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to fetch shares.',
      error: error.response?.data?.error || error,
      data: { items: [], count: 0 },
    };
  }
};

export const getShareResponses = async (shareId, page = 1, limit = 10) => {
  try {
    const response = await APIinstance.get(
      `${resourceShareApi.getShareResponses.endpoint}/${shareId}/responses`,
      { params: { page, limit } },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to fetch share responses for ${shareId}:`, error);
    return {
      status: false,
      message:
        error.response?.data?.message || 'Failed to fetch share responses.',
      error: error.response?.data?.error || error,
      data: { responses: [], count: 0, stats: {} },
    };
  }
};

// ── Recipient Services ─────────────────────────────────────────
export const getSharedResource = async (token) => {
  try {
    const response = await APIinstance.get(
      `${resourceShareApi.getSharedResource.endpoint}/${token}`,
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to get shared resource for token ${token}:`, error);
    return {
      status: false,
      message:
        error.response?.data?.message || 'This shared link is unavailable.',
      error: error.response?.data?.error || 'RESOURCE_SHARE_NOT_FOUND',
      statusCode: error.response?.status,
    };
  }
};

export const getSharedResourceData = async (
  token,
  shareSessionToken = null,
) => {
  try {
    const headers = {
      'Cache-Control': 'no-cache',
    };
    if (shareSessionToken) {
      headers['x-share-session'] = shareSessionToken;
    }

    const response = await APIinstance.get(
      `${resourceShareApi.getSharedResourceDetails.endpoint}/${token}/resource`,
      { headers },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to get resource content for token ${token}:`, error);
    return {
      status: false,
      message:
        error.response?.data?.message || 'Failed to load shared content.',
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};

export const submitSharedForm = async (
  token,
  payload,
  shareSessionToken = null,
) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (shareSessionToken) {
      headers['x-share-session'] = shareSessionToken;
    }

    const response = await APIinstance.post(
      `${resourceShareApi.submitSharedForm.endpoint}/${token}/form-submissions`,
      payload,
      { headers },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to submit shared form for token ${token}:`, error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to submit form.',
      error: error.response?.data?.error || error,
      data: error.response?.data?.data || null,
      statusCode: error.response?.status,
    };
  }
};

export const validateSharedPrivateIdentity = async (token, payload) => {
  try {
    const response = await APIinstance.post(
      `${resourceShareApi.validatePrivateIdentity.endpoint}/${token}/private/identity`,
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
    console.error(`Failed to validate identity for token ${token}:`, error);
    return {
      status: false,
      message:
        error.response?.data?.message ||
        'Unable to verify the provided details.',
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};

export const requestSharedPrivateOtp = async (token, challengeToken) => {
  try {
    const response = await APIinstance.post(
      `${resourceShareApi.requestPrivateOtp.endpoint}/${token}/private/otp/request`,
      { challengeToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to request OTP for token ${token}:`, error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to request OTP.',
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};

export const verifySharedPrivateOtp = async (token, payload) => {
  try {
    const response = await APIinstance.post(
      `${resourceShareApi.verifyPrivateOtp.endpoint}/${token}/private/otp/verify`,
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
    console.error(`Failed to verify OTP for token ${token}:`, error);
    return {
      status: false,
      message: error.response?.data?.message || 'Invalid or expired OTP.',
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};

export const signSharedAgreement = async (
  token,
  payload,
  shareSessionToken = null,
) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (shareSessionToken) {
      headers['x-share-session'] = shareSessionToken;
    }

    try {
      const response = await APIinstance.post(
        `${resourceShareApi.signSharedAgreement.endpoint}/${token}/agreement/sign`,
        payload,
        { headers },
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const fallbackRes = await APIinstance.post(
          `${resourceShareApi.signSharedAgreement.endpoint}/${token}/agreements/sign`,
          payload,
          { headers },
        );
        return fallbackRes.data;
      }
      throw err;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to sign shared agreement for token ${token}:`, error);
    return {
      status: false,
      message:
        error.response?.data?.message ||
        'Failed to submit agreement signature.',
      error: error.response?.data?.error || error,
      statusCode: error.response?.status,
    };
  }
};
