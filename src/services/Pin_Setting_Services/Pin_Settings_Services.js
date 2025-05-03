import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import { APIinstance } from '@/services';

export const createPIN = (data) => {
  return APIinstance.post(pinSettings.createPIN.endpoint, data);
};

export const updatePIN = (data) => {
  return APIinstance.post(pinSettings.updatePIN.endpoint, data);
};

export const generateOTP = () => {
  return APIinstance.post(pinSettings.generateOTP.endpoint);
};

export const verifyOTP = (data) => {
  return APIinstance.post(pinSettings.verifyOTP.endpoint, data);
};

export const checkPINStatus = () => {
  return APIinstance.get(pinSettings.checkPINStatus.endpoint);
};

export const resetPIN = (data) => {
  return APIinstance.post(pinSettings.resetPIN.endpoint, data);
};

export const getPINLogs = () => {
  return APIinstance.post(pinSettings.getPINLogs.endpoint);
};
