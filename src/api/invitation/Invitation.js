export const invitation = {
  // 1.get sent invitation
  getSentInvitation: {
    endpoint: `/enterprise/invitation/invitations/sent`,
    endpointKey: 'get_sent_invitation',
  },
  // 2. get received invitation
  getReceivedInvitation: {
    endpoint: `/enterprise/invitation/invitations/recieved`,
    endpointKey: 'get_received_invitation',
  },
  //   3. accept action Invitation
  acceptInvitation: {
    endpoint: `/enterprise/invitation/accept`,
    endpointKey: 'accept_invitation',
  },
  // 4. reject action Invitation
  rejectInvitation: {
    endpoint: `/enterprise/invitation/reject`,
    endpointKey: 'reject_invitation',
  },
  //   5. generate Link
  generateLink: {
    endpoint: `/enterprise/invitation/generatelink/`,
    endpointKey: 'generate_link',
  },
  //   6. validate base64
  validationBase64: {
    endpoint: `/enterprise/invitation/validatelink/`,
    endpointKey: 'validate_base64',
  },
  // 7. send invitation
  sendInvitation: {
    endpoint: `/enterprise/invitation/send`,
    endpointKey: 'send_Invitation',
  },
  // 8. send director invitation
  sendDirectorInvitation: {
    endpoint: `/enterprise/invitation/senddirectorinvite`,
    endpointKey: 'send_director_invitation',
  },
  // 9. resend invitation
  resendInvitation: {
    endpoint: `/enterprise/invitation/resendinvite/`,
    endpointKey: 'resend_invitation',
  },
  // 10. remind invitation
  remindInvitation: {
    endpoint: `/enterprise/invitation/remindinvite/`,
    endpointKey: 'remind_invitation',
  },

  // 11. get invitation status
  getInvitationStatus: {
    endpoint: `/enterprise/client/invitationstatus`,
    endpointKey: 'get_invitation_status',
  },
};
