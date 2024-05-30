import { Invitation } from "@/api/invitation/Invitation";
import { APIinstance } from "@/services";

export const getSentInvitation = () => {
  return APIinstance.get(Invitation.getSentInvitation.endpoint);
};

export const getReceivedInvitation = () => {
  return APIinstance.get(Invitation.getReceivedInvitation.endpoint);
};

export const acceptInvitation = (data) => {
  return APIinstance.post(Invitation.acceptInvitation.endpoint, data);
};

export const rejectInvitation = (data) => {
  return APIinstance.post(Invitation.rejectInvitation.endpoint, data);
};

export const generateLink = (id) => {
  return APIinstance.get(Invitation.generateLink.endpoint + `${id}`);
};

export const validationBase64 = (token) => {
  return APIinstance.get(Invitation.validationBase64.endpoint + `${token}`);
};

export const sendInvitation = (data) => {
  return APIinstance.post(Invitation.sendInvitation.endpoint, data);
};
