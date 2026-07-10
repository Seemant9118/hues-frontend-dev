import { APIinstance } from '@/services';
import { ChatApi } from '@/api/chat/ChatApi';

export const getOrCreateChatRoom = (data) => {
  return APIinstance.post(ChatApi.getOrCreateChatRoom.endpoint, data);
};

export const getChatComments = (chatRoomId) => {
  return APIinstance.get(
    `${ChatApi.getChatComments.endpoint}?chatRoomId=${chatRoomId}`,
  );
};

export const createChat = (data) => {
  return APIinstance.post(ChatApi.createChat.endpoint, data);
};

export const updateChat = (data) => {
  return APIinstance.put(ChatApi.updateChat.endpoint, data);
};
