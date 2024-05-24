import { Invitation } from "@/api/invitation/Invitation";
import { APIinstance } from "@/services";

export const getSentInvitation = () => {
  return APIinstance.get(Invitation.getSentInvitation.endpoint);
};

export const getReceivedInvitation = () => {
  return APIinstance.get(Invitation.getReceivedInvitation.endpoint);
};

export const actionInvitation = (data) => {
  return APIinstance.post(Invitation.actionInvitation.endpoint, data);
};

export const generateLink = (id) => {
  return APIinstance.get(Invitation.generateLink.endpoint + `${id}`);
};

export const validationBase64 = (token) => {
  return APIinstance.get(Invitation.validationBase64.endpoint + `${token}`);
};
