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

  // 4. Send invitation
  sendInviteToExternalMember: {
    endpoint: `/enterprise/invitation/external-member-invite/send`,
    endpointKey: 'send_invitation_member',
  },

  // 5. accept invite
  acceptInvite: {
    endpoint: `/enterprise/invitation/external-member-invite/accept`,
    endpointKey: 'accept_invite',
  },

  // 6.reject invite
  rejectInvite: {
    endpoint: `/enterprise/invitation/reject`,
    endpointKey: 'reject_invite',
  },

  // 7. get details member
  getMember: {
    endpoint: `/enterprise/user/get/`,
    endpointKey: 'get_member',
  },

  // 8. add member / assign user
  addMember: {
    endpoint: `/enterprise/user/add-member`,
    endpointKey: 'add_member',
  },

  // 9. update roles of assigned external member
  updateExternalMemberRoles: {
    endpoint: `/enterprise/user/update-external-member-roles`,
    endpointKey: 'update_external_member_roles',
  },

  // 10. remove assigned user from external member
  removeExternalMember: {
    endpoint: `/enterprise/user/remove-external-member/`,
    endpointKey: 'remove_external_member',
  },
};
