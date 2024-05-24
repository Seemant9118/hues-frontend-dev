export const Invitation = {
  // 1.get sent invitation
  getSentInvitation: {
    endpoint: `/enterprise/invitation/invitations/sent`,
    endpointKey: "get_sent_invitation",
  },
  // 2. get received invitation
  getReceivedInvitation: {
    endpoint: `/enterprise/invitation/invitations/recieved`,
    endpointKey: "get_received_invitation",
  },
  //   3. approved/reect action Invitation
  actionInvitation: {
    endpoint: `/enterprise/invitation/update`,
    endpointKey: "action_invitation",
  },
  //   4. generate Link
  generateLink: {
    endpoint: `/enterprise/invitation/generatelink/`,
    endpointKey: "generate_link",
  },
  //   5. validate base64
  validationBase64: {
    endpoint: `/enterprise/invitation/validatelink/`,
    endpointKey: "validate_base64",
  },
};
