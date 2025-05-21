import { attachementsAPI } from '@/api/attachmentApi/attachementAPI';
import { APIinstance } from '..';

export const createAttachements = (data) => {
  return APIinstance.post(attachementsAPI.createAttachement.endpoint, data);
};
