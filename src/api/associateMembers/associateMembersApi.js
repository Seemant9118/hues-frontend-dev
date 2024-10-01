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
};
