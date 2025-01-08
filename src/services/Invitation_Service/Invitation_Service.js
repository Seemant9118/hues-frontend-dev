import { invitation } from '@/api/invitation/Invitation';
import { APIinstance } from '@/services';

export const getSentInvitation = () => {
  return APIinstance.get(invitation.getSentInvitation.endpoint);
};

export const getReceivedInvitation = () => {
  return APIinstance.get(invitation.getReceivedInvitation.endpoint);
};

export const acceptInvitation = (data) => {
  return APIinstance.post(invitation.acceptInvitation.endpoint, data);
};

export const rejectInvitation = (data) => {
  return APIinstance.post(invitation.rejectInvitation.endpoint, data);
};

export const generateLink = (id) => {
  return APIinstance.get(`${invitation.generateLink.endpoint}${id}`);
};

export const validationBase64 = (token) => {
  return APIinstance.get(`${invitation.validationBase64.endpoint}${token}`);
};

export const sendInvitation = (data) => {
  return APIinstance.post(invitation.sendInvitation.endpoint, data);
};

export const sendDirectorInvitation = (data) => {
  return APIinstance.post(invitation.sendDirectorInvitation.endpoint, data);
};

export const resendInvitation = (id) => {
  return APIinstance.post(`${invitation.resendInvitation.endpoint}${id}`);
};
