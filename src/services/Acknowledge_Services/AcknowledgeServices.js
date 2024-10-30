import { APIinstance } from '@/services';
import { acknowledgeApi } from '@/api/acknowledgements/acknowledgeApi';

export const updateAcknowledgeStatus = ({ id, data }) => {
  return APIinstance.put(
    `${acknowledgeApi.updateAcknowledgeStatus.endpoint}${id}`,
    data,
  );
};

export const undoAcknowledgeStatus = ({ id, data }) => {
  return APIinstance.put(
    `${acknowledgeApi.undoAcknowledgeStatus.endpoint}${id}`,
    data,
  );
};
