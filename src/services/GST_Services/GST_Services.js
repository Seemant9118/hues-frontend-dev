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

export const filedGsts = ({ page, limit }) => {
  return APIinstance.get(
    `${gstAPIs.filedGsts.endpoint}?page=${page}&limit=${limit}`,
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

export const finalizeGSTR1 = ({ period }) => {
  return APIinstance.get(
    `${gstAPIs.finalizeGSTR1.endpoint}?retPeriod=${period}`,
  );
};

export const filingGSTR1 = ({ period, data }) => {
  return APIinstance.post(
    `${gstAPIs.filingGSTR1.endpoint}?retPeriod=${period}`,
    data,
  );
};
