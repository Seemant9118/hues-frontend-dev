import { gstAPIs } from '@/api/gstAPI/gstApi';
import { APIinstance } from '@/services';

export const checkGSTAuth = () => {
  return APIinstance.get(gstAPIs.checkAuth.endpoint);
};

export const requestGSTOTP = () => {
  return APIinstance.post(gstAPIs.requestOTPForGSTAuth.endpoint);
};

export const verifyGSTOTP = (data) => {
  return APIinstance.post(gstAPIs.verifyOTPForGSTAuth.endpoint, data);
};

export const filedGsts = ({ page, limit, retPeriod, isFiled }) => {
  return APIinstance.get(
    `${gstAPIs.filedGsts.endpoint}?page=${page}&limit=${limit}&retPeriod=${retPeriod}&isFiled=${isFiled}`,
  );
};

export const getInvoicesByPeriod = ({ period, page, limit }) => {
  return APIinstance.get(
    `${gstAPIs.getInvoicesByPeriod.endpoint}${period}?page=${page}&limit=${limit}`,
  );
};

export const saveDraftGSTR1 = (data) => {
  return APIinstance.post(gstAPIs.saveDraftGSTR1.endpoint, data);
};

export const finalizedGSTR1 = ({ period }) => {
  return APIinstance.get(
    `${gstAPIs.finalizedGSTR1.endpoint}?retPeriod=${period}`,
  );
};

export const filingOTPGenrate = ({ period }) => {
  return APIinstance.get(
    `${gstAPIs.filingOTPGenrate.endpoint}?retPeriod=${period}`,
  );
};

export const getSummaryBeforeFiling = ({ period }) => {
  return APIinstance.get(
    `${gstAPIs.getSummaryBeforeFiling.endpoint}?retPeriod=${period}`,
  );
};

export const filingGSTR1 = ({ period, data }) => {
  return APIinstance.post(
    `${gstAPIs.filingGSTR1.endpoint}?retPeriod=${period}`,
    data,
  );
};

export const getStatusOfFiling = ({ period }) => {
  return APIinstance.get(
    `${gstAPIs.getStatusOfFiling.endpoint}?retPeriod=${period}`,
  );
};

export const syncInvoicesWithGSTR1 = (period) => {
  return APIinstance.get(
    `${gstAPIs.syncInvoicesWithGSTR1.endpoint}?retPeriod=${period}`,
  );
};

export const syncInvoicesWithGSTR2A = (period) => {
  return APIinstance.get(
    `${gstAPIs.syncInvoicesWithGSTR2A.endpoint}?retPeriod=${period}`,
  );
};

export const getGSTR2Avs2BMissing = (period) => {
  return APIinstance.get(
    `${gstAPIs.getGSTR2Avs2BMissing.endpoint}?retPeriod=${period}`,
  );
};

export const getSystemSummary = (period) => {
  return APIinstance.get(
    `${gstAPIs.getSystemSummary.endpoint}?retPeriod=${period}`,
  );
};

export const getPortalAutoLiab = (period) => {
  return APIinstance.get(
    `${gstAPIs.getPortalAutoLiab.endpoint}?retPeriod=${period}`,
  );
};

export const getGSTR3BReturnSummary = (period) => {
  return APIinstance.get(
    `${gstAPIs.getGSTR3BReturnSummary.endpoint}?retPeriod=${period}`,
  );
};

export const fileGSTR3B = (period, data = {}) => {
  return APIinstance.post(
    `${gstAPIs.fileGSTR3B.endpoint}?retPeriod=${period}`,
    data,
  );
};

export const getGstr3bOffsetPayload = (period) => {
  return APIinstance.get(
    `${gstAPIs.getGstr3bOffsetPayload.endpoint}?retPeriod=${period}`,
  );
};

export const retOffsetGstr3b = (period) => {
  return APIinstance.post(
    `${gstAPIs.retOffsetGstr3b.endpoint}?retPeriod=${period}`,
  );
};
