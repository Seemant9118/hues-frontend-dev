export const associateMemberApi = {
  // 1. create associate members
  createAssociateMembers: {
    endpoint: `/enterprise/user/create`,
    endpointKey: 'create_associate_member',
  },

  //   2. get all associate members
  getAllAssociateMembers: {
    endpoint: `/enterprise/user/`,
    endpointKey: 'get_all_associate_members',
  },

  // 3. update associate member
  updateAssociateMember: {
    endpoint: `/enterprise/user/update/`,
    endpointKey: 'update_associate_member',
  },
};
