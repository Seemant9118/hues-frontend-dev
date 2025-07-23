import { associateMemberApi } from '@/api/associateMembers/associateMembersApi';
import { APIinstance } from '@/services';

export const createAssociateMembers = (data) => {
  return APIinstance.post(
    associateMemberApi.createAssociateMembers.endpoint,
    data,
  );
};

export const getAllAssociateMembers = (id) => {
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
