export const ChatApi = {
  getOrCreateChatRoom: {
    endpoint: `/chat/room`,
    endpointKey: 'get_or_create_chat_room',
  },
  getChatComments: {
    endpoint: `/chat/get`,
    endpointKey: 'get_chat_comments',
  },
  createChat: {
    endpoint: `/chat/create`,
    endpointKey: 'create_chat',
  },
  updateChat: {
    endpoint: `/chat/update`,
    endpointKey: 'update_chat',
  },
};
