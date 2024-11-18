import { directorApi } from '@/api/director/directorApi';
import { APIinstance } from '@/services';

export const directorInviteList = () => {
  return APIinstance.get(directorApi.getDirectorInviteList.endpoint);
};
