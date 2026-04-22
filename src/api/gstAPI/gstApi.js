export const gstAPIs = {
  // auth for gst
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

  finalizedGSTR1: {
    endpoint: `/gstr1/proceedfile`,
    endpointKey: 'FINALIZED_GSTR1',
  },

  filingOTPGenrate: {
    endpoint: `/gstr1/otpforevc`,
    endpointKey: 'FILING_OTP_GENRATE',
  },

  getSummaryBeforeFiling: {
    endpoint: `/gstr1/return-summary`,
    endpointKey: 'GET_SUMMARY_BEFORE_FILING',
  },

  filingGSTR1: {
    endpoint: '/gstr1/file-return',
    endpointKey: 'FILING_GSTR1',
  },

  getStatusOfFiling: {
    endpoint: `/gstr1/retstatus`,
    endpointKey: 'GET_STATUS_OF_FILING',
  },

  syncInvoicesWithGSTR1: {
    endpoint: '/gstr1/b2b',
    endpointKey: 'SYNC_INVOICES_GSTR1',
  },
  syncInvoicesWithGSTR2A: {
    endpoint: '/gstr2a/b2b',
    endpointKey: 'SYNC_INVOICES_GSTR2A',
  },
};
