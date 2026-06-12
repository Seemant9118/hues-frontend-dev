import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { APIinstance } from '@/services';

export const createAssociateMembers = (data) => {
  return APIinstance.post(
    associateMemberApi.createAssociateMembers.endpoint,
    data,
  );
};

export const getAllAssociateMembers = (id, membershipType, status) => {
  if (membershipType && status) {
    return APIinstance.get(
      `${associateMemberApi.getAllAssociateMembers.endpoint}${id}?membershipType=${membershipType}&status=${status}`,
    );
  }
  return APIinstance.get(
    `${associateMemberApi.getAllAssociateMembers.endpoint}${id}`,
  );
};

export const updateAssociateMember = ({ id, data }) => {
  return APIinstance.put(
    `${associateMemberApi.updateAssociateMember.endpoint}${id}`,
    data,
  );
};

export const sendInviteToExternalMember = (data) => {
  return APIinstance.post(
    associateMemberApi.sendInviteToExternalMember.endpoint,
    data,
  );
};

export const acceptInvite = (data) => {
  return APIinstance.post(associateMemberApi.acceptInvite.endpoint, data);
};

export const rejectInvite = (data) => {
  return APIinstance.post(associateMemberApi.rejectInvite.endpoint, data);
};

export const getMember = (id) => {
  return APIinstance.get(`${associateMemberApi.getMember.endpoint}${id}`);
};

export const addMember = (data) => {
  return APIinstance.post(associateMemberApi.addMember.endpoint, data);
};

export const updateExternalMemberRoles = (data) => {
  return APIinstance.put(
    associateMemberApi.updateExternalMemberRoles.endpoint,
    data,
  );
};

export const removeExternalMember = ({ id, accEnterpriseUserId }) => {
  return APIinstance.delete(
    `${associateMemberApi.removeExternalMember.endpoint}${id}?accEnterpriseUserId=${accEnterpriseUserId}`,
  );
};
