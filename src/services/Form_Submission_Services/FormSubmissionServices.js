import { formSubmissionApi } from '@/api/form-submissions/formSubmissionApi';
import { APIinstance } from '@/services';

export const submitStandaloneCustomForm = async (payload) => {
  try {
    const response = await APIinstance.post(
      formSubmissionApi.submitFormSubmission.endpoint,
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
    console.error('Failed to submit custom form:', error);
    return {
      status: false,
      message: error.response?.data?.message || 'Failed to submit custom form.',
      error: error.response?.data?.error || error,
    };
  }
};

export const listFormSubmissions = async (params = {}) => {
  try {
    const response = await APIinstance.get(
      formSubmissionApi.listFormSubmissions.endpoint,
      {
        params,
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
    console.error('Failed to list form submissions:', error);
    return [];
  }
};

export const getFormSubmissionById = async (submissionId) => {
  try {
    const response = await APIinstance.get(
      `${formSubmissionApi.getFormSubmissionById.endpoint}/${submissionId}`,
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
    console.error(`Failed to fetch form submission ${submissionId}:`, error);
    return null;
  }
};
