import { readTrackerApi } from '@/api/readTracker/readTrackerApi';
import { APIinstance } from '@/services';

export const updateReadTracker = (id) => {
  return APIinstance.put(`${readTrackerApi.updateTrackerState.endpoint}${id}`);
};
