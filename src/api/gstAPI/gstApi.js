export const gstAPIs = {
  checkAuth: {
    endpoint: '/gst-auth/check-authentication',
    endpointKey: 'CHECK_GST_AUTH',
  },
  requestOTPForGSTAuth: {
    endpoint: '/gst-auth/request-otp',
    endpointKey: 'REQUEST_OTP_GST_AUTH',
  },
  verifyOTPForGSTAuth: {
    endpoint: '/gst-auth/authenticate',
    endpointKey: 'VERIFY_OTP_GST_AUTH',
  },

  // filed gsts
  filedGsts: {
    endpoint: `/gstr1/filing-status`,
    endpointKey: 'GET_FILED_GSTS',
  },

  // gstr1
  getInvoicesByPeriod: {
    endpoint: `/order/invoice/return-period/`,
    endpointKey: 'GET_GSTR1_INVOICES_BY_PERIOD',
  },
  saveDraftGSTR1: {
    endpoint: '/gstr1/save-return',
    endpointKey: 'SAVE_DRAFT_GSTR1',
  },

  finalizeGSTR1: {
    endpoint: '/gstr1/return-summary',
    endpointKey: 'FINALIZE_GSTR1',
  },

  filingGSTR1: {
    endpoint: '/gstr1/file-return',
    endpointKey: 'FILING_GSTR1',
  },
};
